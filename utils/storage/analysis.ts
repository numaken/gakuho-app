import { Subject, SUBJECT_NAMES, QuestionStats, Question } from '../../types';
import { getQuestionStats } from './userData';
import { getAllQuestions } from './questions';

// 教科別の成績分析結果
export interface SubjectAnalysis {
  subject: Subject;
  subjectName: string;
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number; // 0-100
  questionCount: number;
}

// 弱点分析結果
export interface WeakPointAnalysis {
  subjectAnalysis: SubjectAnalysis[];
  weakSubjects: Subject[]; // 正答率が低い教科（60%未満）
  strongSubjects: Subject[]; // 正答率が高い教科（80%以上）
  overallAccuracy: number;
  totalQuestionsSolved: number;
}

// 教科別の成績を分析
export const analyzeBySubject = async (): Promise<WeakPointAnalysis> => {
  const stats = await getQuestionStats();
  const questions = await getAllQuestions();

  // 問題IDから教科を特定するためのマップ
  const questionSubjectMap = new Map<string, Subject>();
  questions.forEach((q) => {
    questionSubjectMap.set(q.id, q.subject);
  });

  // 教科別に集計
  const subjectStats: Record<Subject, { attempts: number; correct: number; questionCount: number }> = {
    japanese: { attempts: 0, correct: 0, questionCount: 0 },
    social: { attempts: 0, correct: 0, questionCount: 0 },
    math: { attempts: 0, correct: 0, questionCount: 0 },
    science: { attempts: 0, correct: 0, questionCount: 0 },
    english: { attempts: 0, correct: 0, questionCount: 0 },
  };

  Object.entries(stats).forEach(([questionId, stat]) => {
    const subject = questionSubjectMap.get(questionId);
    if (subject && subjectStats[subject]) {
      subjectStats[subject].attempts += stat.attempts;
      subjectStats[subject].correct += stat.correct;
      subjectStats[subject].questionCount += 1;
    }
  });

  // 分析結果を作成
  const subjectAnalysis: SubjectAnalysis[] = (Object.keys(subjectStats) as Subject[]).map((subject) => {
    const { attempts, correct, questionCount } = subjectStats[subject];
    return {
      subject,
      subjectName: SUBJECT_NAMES[subject],
      totalAttempts: attempts,
      totalCorrect: correct,
      accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
      questionCount,
    };
  });

  // 弱点・得意教科を特定
  const weakSubjects: Subject[] = [];
  const strongSubjects: Subject[] = [];

  subjectAnalysis.forEach((analysis) => {
    if (analysis.totalAttempts >= 3) { // 最低3回以上解いた教科のみ判定
      if (analysis.accuracy < 60) {
        weakSubjects.push(analysis.subject);
      } else if (analysis.accuracy >= 80) {
        strongSubjects.push(analysis.subject);
      }
    }
  });

  // 全体の正答率
  const totalAttempts = subjectAnalysis.reduce((sum, a) => sum + a.totalAttempts, 0);
  const totalCorrect = subjectAnalysis.reduce((sum, a) => sum + a.totalCorrect, 0);
  const totalQuestionsSolved = subjectAnalysis.reduce((sum, a) => sum + a.questionCount, 0);

  return {
    subjectAnalysis,
    weakSubjects,
    strongSubjects,
    overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
    totalQuestionsSolved,
  };
};

// 弱点に基づいて強化問題を推薦
export const getRecommendedQuestions = async (limit: number = 10): Promise<Question[]> => {
  const analysis = await analyzeBySubject();
  const stats = await getQuestionStats();
  const questions = await getAllQuestions();

  // 優先度でソート: 弱点教科 > 解いていない問題 > 正答率が低い問題
  const scoredQuestions = questions.map((question) => {
    const stat = stats[question.id];
    let score = 0;

    // 弱点教科の問題は優先度高
    if (analysis.weakSubjects.includes(question.subject)) {
      score += 100;
    }

    // 解いていない問題は優先度高
    if (!stat || stat.attempts === 0) {
      score += 50;
    } else {
      // 正答率が低い問題は優先度高
      const accuracy = stat.correct / stat.attempts;
      score += Math.round((1 - accuracy) * 30);
    }

    // 難易度も考慮（やや難しい問題を優先）
    score += question.difficulty * 5;

    return { question, score };
  });

  // スコアでソートして上位を返す
  scoredQuestions.sort((a, b) => b.score - a.score);

  return scoredQuestions.slice(0, limit).map((sq) => sq.question);
};

// 特定教科の弱点問題を取得
export const getWeakQuestionsForSubject = async (
  subject: Subject,
  limit: number = 5
): Promise<Question[]> => {
  const stats = await getQuestionStats();
  const questions = await getAllQuestions();

  const subjectQuestions = questions.filter((q) => q.subject === subject);

  const scoredQuestions = subjectQuestions.map((question) => {
    const stat = stats[question.id];
    let score = 0;

    if (!stat || stat.attempts === 0) {
      score = 100; // 未挑戦
    } else {
      const accuracy = stat.correct / stat.attempts;
      score = Math.round((1 - accuracy) * 100);
    }

    return { question, score };
  });

  scoredQuestions.sort((a, b) => b.score - a.score);

  return scoredQuestions.slice(0, limit).map((sq) => sq.question);
};

// クイズ履歴を取得（Supabaseから）
export const getQuizHistory = async (deviceId: string, limit: number = 20): Promise<{
  score: number;
  mode: string;
  createdAt: string;
}[]> => {
  const { supabase } = await import('../supabase');

  try {
    const { data, error } = await supabase
      .from('high_scores')
      .select('score, mode, created_at')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching quiz history:', error);
      return [];
    }

    return data.map((row: any) => ({
      score: row.score,
      mode: row.mode,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return [];
  }
};
