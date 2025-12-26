import { QuestionStats } from '../../types';
import { supabase } from '../supabase';
import { getDeviceId } from './device';

// Supabase Edge FunctionのURL
const SUPABASE_URL = 'https://sqbuuhgncdnfgoahzlcb.supabase.co';
const SUBMIT_SCORE_URL = `${SUPABASE_URL}/functions/v1/submit_score`;

// 成績をSupabaseに同期
export const syncStatsToCloud = async (
  questionId: string,
  stats: QuestionStats
): Promise<void> => {
  try {
    const deviceId = await getDeviceId();
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        device_id: deviceId,
        question_id: questionId,
        attempts: stats.attempts,
        correct: stats.correct,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id,question_id',
      });

    if (error) {
      console.error('Error syncing stats to cloud:', error);
    }
  } catch (error) {
    console.error('Error syncing stats:', error);
  }
};

// クラウドから成績を取得
export const fetchStatsFromCloud = async (): Promise<Record<string, QuestionStats>> => {
  try {
    const deviceId = await getDeviceId();
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('device_id', deviceId);

    if (error) {
      console.error('Error fetching stats from cloud:', error);
      return {};
    }

    const stats: Record<string, QuestionStats> = {};
    data.forEach((row: any) => {
      stats[row.question_id] = {
        attempts: row.attempts,
        correct: row.correct,
      };
    });
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {};
  }
};

// ハイスコアをEdge Function経由でSupabaseに保存（レート制限・妥当性チェック付き）
export const saveHighScoreToCloud = async (
  mode: string,
  score: number,
  correctCount: number = 0,
  totalQuestions: number = 10,
  timeLimit: number = 30
): Promise<boolean> => {
  try {
    const deviceId = await getDeviceId();

    const response = await fetch(SUBMIT_SCORE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceId,
        mode,
        score,
        correctCount,
        totalQuestions,
        timeLimit,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error saving high score:', errorData);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error saving high score:', error);
    return false;
  }
};

// ハイスコアランキングを取得
export const fetchHighScoreRanking = async (
  mode: string,
  limit: number = 10
): Promise<{ deviceId: string; score: number; createdAt: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('high_scores')
      .select('*')
      .eq('mode', mode)
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching ranking:', error);
      return [];
    }

    return data.map((row: any) => ({
      deviceId: row.device_id,
      score: row.score,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return [];
  }
};
