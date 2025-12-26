// Supabase Edge Function: submit_score
// スコア登録をサーバーサイドで実行（レート制限・異常値遮断）

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  deviceId: string;
  mode: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeLimit: number;
}

// レート制限用の簡易キャッシュ（device_id単位で1分間に5回まで）
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1分
const RATE_LIMIT_MAX = 5;

// ブラックリスト（連続不正を検知したdevice_id）
const blacklist = new Set<string>();

function checkRateLimit(deviceId: string): boolean {
  if (blacklist.has(deviceId)) {
    return false;
  }

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

// スコアの妥当性チェック
function validateScore(score: number, correctCount: number, totalQuestions: number, timeLimit: number): boolean {
  // 基本的な範囲チェック
  if (score < 0 || score > 100000) return false;
  if (correctCount < 0 || correctCount > totalQuestions) return false;
  if (totalQuestions < 1 || totalQuestions > 100) return false;
  if (![5, 10, 30, 60].includes(timeLimit)) return false;

  // スコア計算の妥当性チェック
  // 最大スコア = 全問正解 × 最大timeBonus(2) × 最大difficulty(3) × BASE_POINT(100)
  const maxPossibleScore = totalQuestions * 2 * 3 * 100;
  if (score > maxPossibleScore) {
    console.log(`Score exceeds maximum possible: ${score} > ${maxPossibleScore}`);
    return false;
  }

  // 正解数が0なのにスコアがある場合は不正
  if (correctCount === 0 && score > 0) {
    console.log(`Invalid: score > 0 but correctCount = 0`);
    return false;
  }

  return true;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { deviceId, mode, score, correctCount, totalQuestions, timeLimit } = body;

    // 入力バリデーション
    if (!deviceId || typeof deviceId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid deviceId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!mode || typeof mode !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // レート制限チェック
    if (!checkRateLimit(deviceId)) {
      console.log(`Rate limit exceeded for device: ${deviceId}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', success: false }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // スコア妥当性チェック
    if (!validateScore(score, correctCount, totalQuestions, timeLimit)) {
      console.log(`Invalid score detected: device=${deviceId}, score=${score}`);
      // 不正なスコアは記録するが、ブラックリストには追加しない（誤検知の可能性）
      return new Response(
        JSON.stringify({ error: 'Invalid score', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Supabaseクライアントを作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not found');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // スコアを登録
    const { error } = await supabase
      .from('high_scores')
      .insert({
        device_id: deviceId,
        mode: mode,
        score: score,
      });

    if (error) {
      console.error('Error inserting score:', error);
      return new Response(
        JSON.stringify({ error: 'Database error', success: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
