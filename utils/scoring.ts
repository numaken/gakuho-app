import { AnsweredQuestion, QuestionStats, Subject } from '../types';

// スコア計算
// 正解数 × 基本点 × 時間ボーナス
export const calculateScore = (
  answeredQuestions: AnsweredQuestion[],
  timeLimit: number
): number => {
  const BASE_POINT = 100;

  let totalScore = 0;

  for (const answered of answeredQuestions) {
    if (answered.isCorrect) {
      // 時間ボーナス: 残り時間の割合に応じてボーナス（最大2倍）
      const timeRatio = 1 - answered.timeSpent / timeLimit;
      const timeBonus = 1 + timeRatio;

      // 難易度ボーナス
      const difficultyBonus = answered.question.difficulty;

      const questionScore = Math.round(
        BASE_POINT * timeBonus * difficultyBonus
      );
      totalScore += questionScore;
    }
  }

  return totalScore;
};

// 正答率計算
export const calculateAccuracy = (
  answeredQuestions: AnsweredQuestion[]
): number => {
  if (answeredQuestions.length === 0) return 0;

  const correctCount = answeredQuestions.filter((q) => q.isCorrect).length;
  return Math.round((correctCount / answeredQuestions.length) * 100);
};

// 教科別正答率計算
export const calculateSubjectAccuracy = (
  answeredQuestions: AnsweredQuestion[]
): Record<Subject, { correct: number; total: number; rate: number }> => {
  const subjects: Subject[] = ['japanese', 'social', 'math', 'science', 'english'];
  const result: Record<Subject, { correct: number; total: number; rate: number }> =
    {} as any;

  for (const subject of subjects) {
    const subjectQuestions = answeredQuestions.filter(
      (q) => q.question.subject === subject
    );
    const correct = subjectQuestions.filter((q) => q.isCorrect).length;
    const total = subjectQuestions.length;
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

    result[subject] = { correct, total, rate };
  }

  return result;
};

// 苦手判定
// 条件: 誤答率50%以上 かつ 回答回数3回以上
export const isWeakQuestion = (stats: QuestionStats): boolean => {
  if (stats.attempts < 3) return false;
  const errorRate = 1 - stats.correct / stats.attempts;
  return errorRate >= 0.5;
};

// 苦手問題のID一覧を取得
export const getWeakQuestionIds = (
  allStats: Record<string, QuestionStats>
): string[] => {
  return Object.entries(allStats)
    .filter(([_, stats]) => isWeakQuestion(stats))
    .map(([id]) => id);
};

// スコアキーを生成（モード・教科・時間の組み合わせ）
export const generateScoreKey = (
  mode: string,
  subjects: string[],
  timeLimit: number
): string => {
  const subjectKey = subjects.sort().join('-');
  return `${mode}_${subjectKey}_${timeLimit}`;
};
