import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, QuestionStats, Question, AnsweredQuestion, UserProfile } from '../types';
import { questions as defaultQuestions } from '../data/questions';
import { supabase } from './supabase';

const USER_DATA_KEY = '@gakuho_quiz_user_data';
const CUSTOM_QUESTIONS_KEY = '@gakuho_quiz_custom_questions';
const DEVICE_ID_KEY = '@gakuho_quiz_device_id';
const LAST_QUIZ_RESULT_KEY = '@gakuho_quiz_last_result';
const USER_PROFILE_KEY = '@gakuho_quiz_user_profile';

// デバイスIDを取得または生成
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `temp-${Date.now()}`;
  }
};

const defaultUserData: UserData = {
  highScores: {},
  questionStats: {},
};

// ユーザーデータを取得
export const getUserData = async (): Promise<UserData> => {
  try {
    const data = await AsyncStorage.getItem(USER_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return defaultUserData;
  } catch (error) {
    console.error('Error loading user data:', error);
    return defaultUserData;
  }
};

// ユーザーデータを保存
export const saveUserData = async (data: UserData): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// ハイスコアを更新 (クラウド同期付き)
export const updateHighScore = async (
  key: string,
  score: number
): Promise<boolean> => {
  const userData = await getUserData();
  const currentHigh = userData.highScores[key] || 0;

  if (score > currentHigh) {
    userData.highScores[key] = score;
    await saveUserData(userData);

    // クラウドに保存 (バックグラウンド)
    saveHighScoreToCloud(key, score).catch(() => {});
    return true;
  }
  return false;
};

// 問題の統計を更新 (クラウド同期付き)
export const updateQuestionStats = async (
  questionId: string,
  isCorrect: boolean
): Promise<void> => {
  const userData = await getUserData();
  const stats = userData.questionStats[questionId] || { attempts: 0, correct: 0 };

  stats.attempts += 1;
  if (isCorrect) {
    stats.correct += 1;
  }

  userData.questionStats[questionId] = stats;
  await saveUserData(userData);

  // クラウドに同期 (バックグラウンド)
  syncStatsToCloud(questionId, stats).catch(() => {});
};

// 複数問題の統計を一括更新 (クラウド同期付き)
export const updateMultipleQuestionStats = async (
  results: { questionId: string; isCorrect: boolean }[]
): Promise<void> => {
  const userData = await getUserData();

  for (const result of results) {
    const stats = userData.questionStats[result.questionId] || {
      attempts: 0,
      correct: 0,
    };
    stats.attempts += 1;
    if (result.isCorrect) {
      stats.correct += 1;
    }
    userData.questionStats[result.questionId] = stats;

    // クラウドに同期 (バックグラウンド)
    syncStatsToCloud(result.questionId, stats).catch(() => {});
  }

  await saveUserData(userData);
};

// 問題統計を取得
export const getQuestionStats = async (): Promise<Record<string, QuestionStats>> => {
  const userData = await getUserData();
  return userData.questionStats;
};

// ハイスコアを取得
export const getHighScores = async (): Promise<Record<string, number>> => {
  const userData = await getUserData();
  return userData.highScores;
};

// データをリセット
export const resetUserData = async (): Promise<void> => {
  await saveUserData(defaultUserData);
};

// === 問題管理関数 ===

// Supabaseから問題を取得
export const fetchQuestionsFromSupabase = async (): Promise<Question[]> => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return [];
    }

    // Supabaseのカラム名をアプリ用に変換
    return data.map((q: any) => ({
      id: q.id,
      subject: q.subject,
      question: q.question,
      choices: q.choices,
      correctIndex: q.correct_index,
      difficulty: q.difficulty,
    }));
  } catch (error) {
    console.error('Error fetching from Supabase:', error);
    return [];
  }
};

// === クラウド同期機能 ===

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

// ハイスコアをSupabaseに保存
export const saveHighScoreToCloud = async (
  mode: string,
  score: number
): Promise<void> => {
  try {
    const deviceId = await getDeviceId();
    const { error } = await supabase
      .from('high_scores')
      .insert({
        device_id: deviceId,
        mode: mode,
        score: score,
      });

    if (error) {
      console.error('Error saving high score to cloud:', error);
    }
  } catch (error) {
    console.error('Error saving high score:', error);
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

// カスタム問題を取得（ローカル）
export const getCustomQuestions = async (): Promise<Question[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_QUESTIONS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading custom questions:', error);
    return [];
  }
};

// 全問題を取得（Supabase優先、フォールバックでローカル）
export const getAllQuestions = async (): Promise<Question[]> => {
  // まずSupabaseから取得を試みる
  const supabaseQuestions = await fetchQuestionsFromSupabase();

  if (supabaseQuestions.length > 0) {
    return supabaseQuestions;
  }

  // Supabaseから取得できなかった場合はローカルデータを使用
  console.log('Using local fallback questions');
  const customQuestions = await getCustomQuestions();
  return [...defaultQuestions, ...customQuestions];
};

// カスタム問題を保存
export const saveCustomQuestions = async (questions: Question[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(CUSTOM_QUESTIONS_KEY, JSON.stringify(questions));
  } catch (error) {
    console.error('Error saving custom questions:', error);
  }
};

// 問題を追加
export const addQuestion = async (question: Question): Promise<void> => {
  const customQuestions = await getCustomQuestions();
  customQuestions.push(question);
  await saveCustomQuestions(customQuestions);
};

// 問題を更新
export const updateQuestion = async (question: Question): Promise<void> => {
  const customQuestions = await getCustomQuestions();
  const index = customQuestions.findIndex((q) => q.id === question.id);

  if (index !== -1) {
    customQuestions[index] = question;
    await saveCustomQuestions(customQuestions);
  }
};

// 問題を削除
export const deleteQuestion = async (questionId: string): Promise<void> => {
  const customQuestions = await getCustomQuestions();
  const filtered = customQuestions.filter((q) => q.id !== questionId);
  await saveCustomQuestions(filtered);
};

// 問題がカスタムかどうか判定
export const isCustomQuestion = (questionId: string): boolean => {
  return !defaultQuestions.some((q) => q.id === questionId);
};

// ユニークなIDを生成
export const generateQuestionId = (subject: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `custom-${subject}-${timestamp}-${random}`;
};

// === クイズ結果の一時保存 ===

export interface LastQuizResult {
  answeredQuestions: AnsweredQuestion[];
  totalScore: number;
  timestamp: number;
}

// 最後のクイズ結果を保存
export const saveLastQuizResult = async (
  answeredQuestions: AnsweredQuestion[],
  totalScore: number
): Promise<void> => {
  try {
    const result: LastQuizResult = {
      answeredQuestions,
      totalScore,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(LAST_QUIZ_RESULT_KEY, JSON.stringify(result));
  } catch (error) {
    console.error('Error saving last quiz result:', error);
  }
};

// 最後のクイズ結果を取得
export const getLastQuizResult = async (): Promise<LastQuizResult | null> => {
  try {
    const data = await AsyncStorage.getItem(LAST_QUIZ_RESULT_KEY);
    if (data) {
      const result = JSON.parse(data) as LastQuizResult;
      // 1時間以内のデータのみ有効
      if (Date.now() - result.timestamp < 60 * 60 * 1000) {
        return result;
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading last quiz result:', error);
    return null;
  }
};

// 最後のクイズ結果をクリア
export const clearLastQuizResult = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LAST_QUIZ_RESULT_KEY);
  } catch (error) {
    console.error('Error clearing last quiz result:', error);
  }
};

// === ユーザープロファイル管理 ===

// 招待コードを生成
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ニックネームのバリデーション
export const validateNickname = (nickname: string): { valid: boolean; error?: string } => {
  const trimmed = nickname.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'ニックネームを入力してね' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: '2文字以上で入力してね' };
  }

  if (trimmed.length > 12) {
    return { valid: false, error: '12文字以内で入力してね' };
  }

  // 不適切な表現のフィルタリング (簡易版)
  const ngWords = ['admin', 'test', 'null', 'undefined'];
  if (ngWords.some(ng => trimmed.toLowerCase().includes(ng))) {
    return { valid: false, error: 'この名前は使えないよ' };
  }

  return { valid: true };
};

// ユーザープロファイルを取得
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

// ユーザープロファイルを保存
export const saveUserProfile = async (nickname: string): Promise<UserProfile> => {
  try {
    const deviceId = await getDeviceId();
    const profile: UserProfile = {
      nickname: nickname.trim(),
      deviceId,
      inviteCode: generateInviteCode(),
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

    // クラウドにも同期
    await syncProfileToCloud(profile);

    return profile;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// ニックネームを更新
export const updateNickname = async (nickname: string): Promise<UserProfile | null> => {
  try {
    const profile = await getUserProfile();
    if (!profile) return null;

    profile.nickname = nickname.trim();
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));

    // クラウドにも同期
    await syncProfileToCloud(profile);

    return profile;
  } catch (error) {
    console.error('Error updating nickname:', error);
    return null;
  }
};

// プロファイルをクラウドに同期
const syncProfileToCloud = async (profile: UserProfile): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        device_id: profile.deviceId,
        nickname: profile.nickname,
        invite_code: profile.inviteCode,
        created_at: new Date(profile.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id',
      });

    if (error) {
      console.error('Error syncing profile to cloud:', error);
    }
  } catch (error) {
    console.error('Error syncing profile:', error);
  }
};

// === ランキング機能 ===

export interface RankingEntry {
  rank: number;
  nickname: string;
  score: number;
  deviceId: string;
  isMe: boolean;
}

// ランキングを取得
export const fetchRanking = async (
  period: 'weekly' | 'monthly' | 'all' = 'all',
  limit: number = 50
): Promise<RankingEntry[]> => {
  try {
    const myDeviceId = await getDeviceId();
    let query = supabase
      .from('high_scores')
      .select(`
        device_id,
        score,
        created_at,
        user_profiles!inner(nickname)
      `)
      .order('score', { ascending: false })
      .limit(limit);

    // 期間フィルター
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ranking:', error);
      return [];
    }

    // デバイスごとに最高スコアのみを抽出
    const bestScores = new Map<string, { score: number; nickname: string }>();
    data.forEach((row: any) => {
      const deviceId = row.device_id;
      const score = row.score;
      const nickname = row.user_profiles?.nickname || '名無し';

      if (!bestScores.has(deviceId) || bestScores.get(deviceId)!.score < score) {
        bestScores.set(deviceId, { score, nickname });
      }
    });

    // ランキング配列に変換
    const ranking: RankingEntry[] = Array.from(bestScores.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([deviceId, { score, nickname }], index) => ({
        rank: index + 1,
        nickname,
        score,
        deviceId,
        isMe: deviceId === myDeviceId,
      }));

    return ranking;
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return [];
  }
};

// 自分のランキング順位を取得
export const getMyRank = async (): Promise<number | null> => {
  try {
    const myDeviceId = await getDeviceId();
    const ranking = await fetchRanking('all', 1000);
    const myEntry = ranking.find(entry => entry.deviceId === myDeviceId);
    return myEntry?.rank || null;
  } catch (error) {
    console.error('Error getting my rank:', error);
    return null;
  }
};
