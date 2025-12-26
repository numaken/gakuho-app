// Supabase Edge Function: ai_feedback
// AI成績診断をOpenAI経由で実行（APIキーはサーバーサイドで保持）

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubjectScore {
  subject: string;
  subjectName: string;
  correct: number;
  total: number;
  rate: number;
}

interface RequestBody {
  subjectScores: SubjectScore[];
  totalRate: number;
  totalScore: number;
  deviceId?: string;
}

interface DiagnosisResult {
  comment: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

// レート制限用の簡易キャッシュ（device_id単位で1分間に3回まで）
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1分
const RATE_LIMIT_MAX = 3;

function checkRateLimit(deviceId: string): boolean {
  const now = Date.now();
  const entry = rateLimitCache.get(deviceId);

  if (!entry || now > entry.resetAt) {
    rateLimitCache.set(deviceId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// フォールバック用の定型講評
function getFallbackDiagnosis(subjectScores: SubjectScore[], totalRate: number): DiagnosisResult {
  const strengths = subjectScores
    .filter((s) => s.rate >= 70)
    .map((s) => `${s.subjectName}が得意`);

  const weaknesses = subjectScores
    .filter((s) => s.rate < 50)
    .map((s) => `${s.subjectName}をもう少し頑張ろう`);

  let comment: string;
  let advice: string;

  if (totalRate >= 80) {
    comment = `すごい! ${totalRate}%の正答率だね! がくまるもびっくりの好成績だよ。この調子で続けていこう!`;
    advice = '得意を伸ばしながら、さらに上を目指してみよう!';
  } else if (totalRate >= 60) {
    comment = `なかなかいい感じ! ${totalRate}%正解できたね。もう少しで高得点だよ。がくまると一緒にがんばろう!`;
    advice = '間違えた問題を復習すると、もっと伸びるよ!';
  } else if (totalRate >= 40) {
    comment = `${totalRate}%の正答率だったね。まだまだ伸びしろがあるよ! がくまると一緒にコツコツ頑張ろう!`;
    advice = '基礎から見直してみると、ぐんと伸びるかも!';
  } else {
    comment = `今回は${totalRate}%だったけど、大丈夫! 誰でも最初はこんなものだよ。がくまると一緒に少しずつ頑張ろう!`;
    advice = 'まずは教科書の基本をしっかり確認してみよう!';
  }

  return {
    comment,
    strengths: strengths.length > 0 ? strengths : ['チャレンジする姿勢が素晴らしい!'],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
    advice,
  };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { subjectScores, totalRate, totalScore, deviceId } = body;

    // 入力バリデーション
    if (!subjectScores || !Array.isArray(subjectScores)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: subjectScores is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // レート制限チェック
    if (deviceId && !checkRateLimit(deviceId)) {
      console.log(`Rate limit exceeded for device: ${deviceId}`);
      // レート制限時はフォールバックを返す
      const fallback = getFallbackDiagnosis(subjectScores, totalRate || 0);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // OpenAI APIキーをSecretsから取得
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not found in secrets');
      const fallback = getFallbackDiagnosis(subjectScores, totalRate || 0);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // プロンプト構築
    const subjectSummary = subjectScores
      .map((s) => `${s.subjectName}: ${s.correct}/${s.total}問正解 (${s.rate}%)`)
      .join('\n');

    const prompt = `以下のクイズ結果について、中学生向けの講評をお願いします。

【成績】
総合正答率: ${totalRate}%
スコア: ${totalScore}点

【教科別成績】
${subjectSummary}

以下の形式でJSON形式で回答してください:
{
  "comment": "全体的な講評（150〜200文字程度、励ましを含む）",
  "strengths": ["得意な点1", "得意な点2"],
  "weaknesses": ["苦手な点1", "苦手な点2"],
  "advice": "具体的な学習アドバイス（100文字程度）"
}`;

    // OpenAI API呼び出し（タイムアウト10秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `あなたは中学生向けの学習アプリ「ドキドキ!クイズチャレンジ」のAI講師です。
親しみやすく、励ましながらも具体的なアドバイスができる先生として振る舞ってください。
口調は「〜だね」「〜だよ」など、中学生に親しみやすいカジュアルな敬語を使ってください。
マスコットキャラクター「がくまる」の友達という設定です。
回答はJSON形式のみで、余計なテキストを付与しないでください。`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // JSONをパース
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const result: DiagnosisResult = {
          comment: parsed.comment || '',
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          advice: parsed.advice || '',
        };
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error('Failed to parse OpenAI response');
    } catch (apiError) {
      clearTimeout(timeoutId);
      console.error('OpenAI API call failed:', apiError);
      const fallback = getFallbackDiagnosis(subjectScores, totalRate || 0);
      return new Response(JSON.stringify(fallback), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
