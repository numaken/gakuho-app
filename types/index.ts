// 教科タイプ
export type Subject = 'japanese' | 'social' | 'math' | 'science' | 'english';

// 教科の日本語名マッピング
export const SUBJECT_NAMES: Record<Subject, string> = {
  japanese: '国語',
  social: '社会',
  math: '数学',
  science: '理科',
  english: '英語',
};

// 問題データ構造
export interface Question {
  id: string;
  subject: Subject;
  question: string;
  choices: string[];
  correctIndex: number;
  difficulty: 1 | 2 | 3;
}

// ユーザーの問題回答統計
export interface QuestionStats {
  attempts: number;
  correct: number;
}

// ユーザープロファイル
export interface UserProfile {
  nickname: string;
  deviceId: string;
  inviteCode: string;
  createdAt: number;
}

// ユーザーデータ構造
export interface UserData {
  highScores: Record<string, number>;
  questionStats: Record<string, QuestionStats>;
}

// クイズモード
export type QuizMode = 'normal' | 'weak';

// 制限時間オプション（秒）
export type TimeLimit = 5 | 10 | 30 | 60;

// クイズ設定
export interface QuizSettings {
  mode: QuizMode;
  subjects: Subject[];
  timeLimit: TimeLimit;
  questionCount: number;
}

// クイズ結果
export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  score: number;
  answeredQuestions: AnsweredQuestion[];
}

// 回答済み問題
export interface AnsweredQuestion {
  question: Question;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}
