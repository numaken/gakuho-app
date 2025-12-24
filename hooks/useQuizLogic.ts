import { useState, useCallback, useMemo } from 'react';
import {
  Question,
  QuizSettings,
  AnsweredQuestion,
  QuizResult,
  Subject,
} from '../types';
import { getQuestionStats, updateMultipleQuestionStats, getAllQuestions } from '../utils/storage';
import { calculateScore, getWeakQuestionIds } from '../utils/scoring';

interface UseQuizLogicReturn {
  questions: Question[];
  currentIndex: number;
  currentQuestion: Question | null;
  isFinished: boolean;
  answeredQuestions: AnsweredQuestion[];
  answer: (selectedIndex: number, timeSpent: number) => boolean;
  nextQuestion: () => void;
  initQuiz: (settings: QuizSettings) => Promise<void>;
  getResult: () => QuizResult;
  reset: () => void;
}

const DEFAULT_QUESTION_COUNT = 10;

export const useQuizLogic = (): UseQuizLogicReturn => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [settings, setSettings] = useState<QuizSettings | null>(null);

  const currentQuestion = useMemo(() => {
    if (currentIndex >= questions.length) return null;
    return questions[currentIndex];
  }, [questions, currentIndex]);

  const isFinished = useMemo(() => {
    return questions.length > 0 && currentIndex >= questions.length;
  }, [questions, currentIndex]);

  const initQuiz = useCallback(async (newSettings: QuizSettings) => {
    setSettings(newSettings);
    setCurrentIndex(0);
    setAnsweredQuestions([]);

    const count = newSettings.questionCount || DEFAULT_QUESTION_COUNT;

    // 全問題を取得（デフォルト + カスタム）
    const allQuestions = await getAllQuestions();

    // 教科でフィルター
    const filtered = allQuestions.filter((q) =>
      newSettings.subjects.includes(q.subject)
    );

    let selectedQuestions: Question[];

    if (newSettings.mode === 'weak') {
      // 苦手モード: 苦手問題を優先
      const stats = await getQuestionStats();
      const weakIds = getWeakQuestionIds(stats);

      const weakQuestions = filtered.filter((q) => weakIds.includes(q.id));
      const shuffledWeak = [...weakQuestions].sort(() => Math.random() - 0.5);

      if (shuffledWeak.length >= count) {
        selectedQuestions = shuffledWeak.slice(0, count);
      } else {
        // 苦手問題が足りない場合は通常問題で補完
        const normalQuestions = filtered.filter((q) => !weakIds.includes(q.id));
        const shuffledNormal = [...normalQuestions].sort(() => Math.random() - 0.5);
        selectedQuestions = [
          ...shuffledWeak,
          ...shuffledNormal.slice(0, count - shuffledWeak.length),
        ];
      }
    } else {
      // 通常モード: ランダム選択
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      selectedQuestions = shuffled.slice(0, count);
    }

    setQuestions(selectedQuestions);
  }, []);

  const answer = useCallback(
    (selectedIndex: number, timeSpent: number): boolean => {
      if (!currentQuestion) return false;

      const isCorrect = selectedIndex === currentQuestion.correctIndex;

      const answered: AnsweredQuestion = {
        question: currentQuestion,
        selectedIndex,
        isCorrect,
        timeSpent,
      };

      setAnsweredQuestions((prev) => [...prev, answered]);

      return isCorrect;
    },
    [currentQuestion]
  );

  const nextQuestion = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const getResult = useCallback((): QuizResult => {
    const correctCount = answeredQuestions.filter((q) => q.isCorrect).length;
    const timeLimit = settings?.timeLimit || 30;
    const score = calculateScore(answeredQuestions, timeLimit);

    return {
      totalQuestions: answeredQuestions.length,
      correctCount,
      score,
      answeredQuestions,
    };
  }, [answeredQuestions, settings]);

  const reset = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnsweredQuestions([]);
    setSettings(null);
  }, []);

  // 結果を保存
  const saveResults = useCallback(async () => {
    if (answeredQuestions.length === 0) return;

    const results = answeredQuestions.map((q) => ({
      questionId: q.question.id,
      isCorrect: q.isCorrect,
    }));

    await updateMultipleQuestionStats(results);
  }, [answeredQuestions]);

  return {
    questions,
    currentIndex,
    currentQuestion,
    isFinished,
    answeredQuestions,
    answer,
    nextQuestion,
    initQuiz,
    getResult,
    reset,
  };
};
