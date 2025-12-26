import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, QuestionStats } from '../../types';
import { STORAGE_KEYS } from './constants';
import { syncStatsToCloud, saveHighScoreToCloud } from './cloud';

const defaultUserData: UserData = {
  highScores: {},
  questionStats: {},
};

// ユーザーデータを取得
export const getUserData = async (): Promise<UserData> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
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
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// ハイスコアを更新 (クラウド同期付き)
export const updateHighScore = async (
  key: string,
  score: number,
  correctCount: number = 0,
  totalQuestions: number = 10,
  timeLimit: number = 30
): Promise<boolean> => {
  const userData = await getUserData();
  const currentHigh = userData.highScores[key] || 0;

  if (score > currentHigh) {
    userData.highScores[key] = score;
    await saveUserData(userData);
    saveHighScoreToCloud(key, score, correctCount, totalQuestions, timeLimit).catch(() => {});
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
