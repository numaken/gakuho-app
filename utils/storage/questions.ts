import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question, Subject } from '../../types';
import { questions as defaultQuestions } from '../../data/questions';
import { supabase } from '../supabase';
import { STORAGE_KEYS } from './constants';

// Supabaseの教科名をアプリの教科コードに変換
const SUBJECT_MAP: Record<string, Subject> = {
  // 日本語名からの変換
  '国語': 'japanese',
  '社会': 'social',
  '数学': 'math',
  '理科': 'science',
  '英語': 'english',
  // 英語名からの変換（念のため）
  'japanese': 'japanese',
  'social': 'social',
  'math': 'math',
  'science': 'science',
  'english': 'english',
};

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

    console.log('Supabase raw subjects:', [...new Set(data.map((q: any) => q.subject))]);

    return data
      .filter((q: any) => SUBJECT_MAP[q.subject]) // マッピングできるもののみ
      .map((q: any) => ({
        id: q.id,
        subject: SUBJECT_MAP[q.subject],
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
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
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
  console.log('getAllQuestions: starting, defaultQuestions count:', defaultQuestions.length);

  // まずローカル問題があることを確認
  if (!defaultQuestions || defaultQuestions.length === 0) {
    console.error('getAllQuestions: No default questions available!');
    return [];
  }

  try {
    // タイムアウト付きでSupabaseから取得（3秒）
    const timeoutPromise = new Promise<Question[]>((resolve) => {
      setTimeout(() => {
        console.log('getAllQuestions: Supabase timeout, using local');
        resolve([]);
      }, 3000);
    });

    const supabaseQuestions = await Promise.race([
      fetchQuestionsFromSupabase(),
      timeoutPromise,
    ]);

    if (supabaseQuestions.length > 0) {
      console.log('getAllQuestions: Using Supabase questions:', supabaseQuestions.length);
      console.log('getAllQuestions: Supabase subjects:', [...new Set(supabaseQuestions.map(q => q.subject))]);
      // ローカル問題も追加して返す（Supabaseにない教科もカバー）
      const allQuestions = [...supabaseQuestions, ...defaultQuestions];
      // 重複IDを除去
      const uniqueQuestions = allQuestions.filter((q, index, self) =>
        index === self.findIndex(t => t.id === q.id)
      );
      console.log('getAllQuestions: Total unique questions:', uniqueQuestions.length);
      return uniqueQuestions;
    }
  } catch (error) {
    console.error('getAllQuestions: Error fetching from Supabase:', error);
  }

  console.log('getAllQuestions: Using local fallback, count:', defaultQuestions.length);
  const customQuestions = await getCustomQuestions();
  return [...defaultQuestions, ...customQuestions];
};

// カスタム問題を保存
export const saveCustomQuestions = async (questions: Question[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
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
