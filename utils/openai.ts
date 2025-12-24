import { AnsweredQuestion } from '../types';
import { SUBJECT_NAMES } from '../types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

interface DiagnosisResult {
  comment: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

interface SubjectScore {
  subject: string;
  subjectName: string;
  correct: number;
  total: number;
  rate: number;
}

// 教科別のスコアを集計
const aggregateBySubject = (answers: AnsweredQuestion[]): SubjectScore[] => {
  const subjectMap: Record<string, { correct: number; total: number }> = {};

  answers.forEach((answer) => {
    const subject = answer.question.subject;
    if (!subjectMap[subject]) {
      subjectMap[subject] = { correct: 0, total: 0 };
    }
    subjectMap[subject].total += 1;
    if (answer.isCorrect) {
      subjectMap[subject].correct += 1;
    }
  });

  return Object.entries(subjectMap).map(([subject, scores]) => ({
    subject,
    subjectName: SUBJECT_NAMES[subject as keyof typeof SUBJECT_NAMES] || subject,
    correct: scores.correct,
    total: scores.total,
    rate: Math.round((scores.correct / scores.total) * 100),
  }));
};

// AI成績診断を取得
export const getDiagnosis = async (
  answers: AnsweredQuestion[],
  totalScore: number
): Promise<DiagnosisResult> => {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, using fallback');
    return getFallbackDiagnosis(answers, totalScore);
  }

  const subjectScores = aggregateBySubject(answers);
  const totalRate = Math.round(
    (answers.filter((a) => a.isCorrect).length / answers.length) * 100
  );

  const prompt = buildPrompt(subjectScores, totalRate, totalScore);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `あなたは中学生向けの学習アプリ「ドキドキ!クイズチャレンジ」のAI講師です。
親しみやすく、励ましながらも具体的なアドバイスができる先生として振る舞ってください。
口調は「〜だね」「〜だよ」など、中学生に親しみやすいカジュアルな敬語を使ってください。
マスコットキャラクター「がくまる」の友達という設定です。`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from API');
    }

    return parseAIResponse(content, subjectScores);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackDiagnosis(answers, totalScore);
  }
};

// プロンプトを構築
const buildPrompt = (
  subjectScores: SubjectScore[],
  totalRate: number,
  totalScore: number
): string => {
  const subjectSummary = subjectScores
    .map((s) => `${s.subjectName}: ${s.correct}/${s.total}問正解 (${s.rate}%)`)
    .join('\n');

  return `以下のクイズ結果について、中学生向けの講評をお願いします。

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
};

// AIレスポンスをパース
const parseAIResponse = (
  content: string,
  subjectScores: SubjectScore[]
): DiagnosisResult => {
  try {
    // JSON部分を抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        comment: parsed.comment || '',
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        advice: parsed.advice || '',
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response:', e);
  }

  // パース失敗時はコンテンツをそのままコメントとして使用
  return {
    comment: content.slice(0, 300),
    strengths: subjectScores.filter((s) => s.rate >= 70).map((s) => `${s.subjectName}が得意`),
    weaknesses: subjectScores.filter((s) => s.rate < 50).map((s) => `${s.subjectName}をもう少し`),
    advice: '苦手な教科を中心に復習してみよう!',
  };
};

// フォールバック用の定型講評
const getFallbackDiagnosis = (
  answers: AnsweredQuestion[],
  totalScore: number
): DiagnosisResult => {
  const subjectScores = aggregateBySubject(answers);
  const totalRate = Math.round(
    (answers.filter((a) => a.isCorrect).length / answers.length) * 100
  );

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
};

// 苦手教科を取得
export const getWeakSubjects = (answers: AnsweredQuestion[]): string[] => {
  const subjectScores = aggregateBySubject(answers);
  return subjectScores
    .filter((s) => s.rate < 60)
    .sort((a, b) => a.rate - b.rate)
    .map((s) => s.subject);
};
