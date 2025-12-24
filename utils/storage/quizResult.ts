import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnsweredQuestion } from '../../types';
import { STORAGE_KEYS } from './constants';

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
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_QUIZ_RESULT, JSON.stringify(result));
  } catch (error) {
    console.error('Error saving last quiz result:', error);
  }
};

// 最後のクイズ結果を取得
export const getLastQuizResult = async (): Promise<LastQuizResult | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_QUIZ_RESULT);
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
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_QUIZ_RESULT);
  } catch (error) {
    console.error('Error clearing last quiz result:', error);
  }
};
