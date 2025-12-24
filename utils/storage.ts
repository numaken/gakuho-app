import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, QuestionStats, Question } from '../types';
import { questions as defaultQuestions } from '../data/questions';
import { supabase } from './supabase';

const USER_DATA_KEY = '@gakuho_quiz_user_data';
const CUSTOM_QUESTIONS_KEY = '@gakuho_quiz_custom_questions';

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

// ハイスコアを更新
export const updateHighScore = async (
  key: string,
  score: number
): Promise<boolean> => {
  const userData = await getUserData();
  const currentHigh = userData.highScores[key] || 0;

  if (score > currentHigh) {
    userData.highScores[key] = score;
    await saveUserData(userData);
    return true;
  }
  return false;
};

// 問題の統計を更新
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
};

// 複数問題の統計を一括更新
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
      .from('quiz_questions')
      .select('*')
      .eq('is_active', true);

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
