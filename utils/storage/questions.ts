import AsyncStorage from '@react-native-async-storage/async-storage';
import { Question } from '../../types';
import { questions as defaultQuestions } from '../../data/questions';
import { supabase } from '../supabase';
import { STORAGE_KEYS } from './constants';

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
  const supabaseQuestions = await fetchQuestionsFromSupabase();

  if (supabaseQuestions.length > 0) {
    return supabaseQuestions;
  }

  console.log('Using local fallback questions');
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
