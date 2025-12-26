import { AnsweredQuestion } from '../types';
import { SUBJECT_NAMES } from '../types';
import { getDeviceId } from './storage/device';

// Supabase Edge FunctionのURL
const SUPABASE_URL = 'https://sqbuuhgncdnfgoahzlcb.supabase.co';
const AI_FEEDBACK_URL = `${SUPABASE_URL}/functions/v1/ai_feedback`;

interface DiagnosisResult {
  comment: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

interface SubjectScore {
  subject: string;
  subjectName: string;
  correct: number;
  total: number;
  rate: number;
}

// 教科別のスコアを集計
const aggregateBySubject = (answers: AnsweredQuestion[]): SubjectScore[] => {
  const subjectMap: Record<string, { correct: number; total: number }> = {};

  answers.forEach((answer) => {
    const subject = answer.question.subject;
    if (!subjectMap[subject]) {
      subjectMap[subject] = { correct: 0, total: 0 };
    }
    subjectMap[subject].total += 1;
    if (answer.isCorrect) {
      subjectMap[subject].correct += 1;
    }
  });

  return Object.entries(subjectMap).map(([subject, scores]) => ({
    subject,
    subjectName: SUBJECT_NAMES[subject as keyof typeof SUBJECT_NAMES] || subject,
    correct: scores.correct,
    total: scores.total,
    rate: Math.round((scores.correct / scores.total) * 100),
  }));
};

// AI成績診断を取得（Edge Function経由）
export const getDiagnosis = async (
  answers: AnsweredQuestion[],
  totalScore: number
): Promise<DiagnosisResult> => {
  const subjectScores = aggregateBySubject(answers);
  const totalRate = Math.round(
    (answers.filter((a) => a.isCorrect).length / answers.length) * 100
  );

  try {
    const deviceId = await getDeviceId();

    // Edge Functionを呼び出し（タイムアウト15秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(AI_FEEDBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subjectScores,
        totalRate,
        totalScore,
        deviceId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.status}`);
    }

    const result: DiagnosisResult = await response.json();
    return result;
  } catch (error) {
    console.error('AI diagnosis error:', error);
    return getFallbackDiagnosis(answers, totalScore);
  }
};

// フォールバック用の定型講評
const getFallbackDiagnosis = (
  answers: AnsweredQuestion[],
  totalScore: number
): DiagnosisResult => {
  const subjectScores = aggregateBySubject(answers);
  const totalRate = Math.round(
    (answers.filter((a) => a.isCorrect).length / answers.length) * 100
  );

  const strengths = subjectScores
    .filter((s) => s.rate >= 70)
    .map((s) => `${s.subjectName}が得意`);

  const weaknesses = subjectScores
    .filter((s) => s.rate < 50)
    .map((s) => `${s.subjectName}をもう少し頑張ろう`);

  let comment: string;
  let advice: string;

  if (totalRate >= 80) {
    comment = `すごい! ${totalRate}%の正答率だね! がくまるもびっくりの好成績だよ。この調子で続けていこう!`;
    advice = '得意を伸ばしながら、さらに上を目指してみよう!';
  } else if (totalRate >= 60) {
    comment = `なかなかいい感じ! ${totalRate}%正解できたね。もう少しで高得点だよ。がくまると一緒にがんばろう!`;
    advice = '間違えた問題を復習すると、もっと伸びるよ!';
  } else if (totalRate >= 40) {
    comment = `${totalRate}%の正答率だったね。まだまだ伸びしろがあるよ! がくまると一緒にコツコツ頑張ろう!`;
    advice = '基礎から見直してみると、ぐんと伸びるかも!';
  } else {
    comment = `今回は${totalRate}%だったけど、大丈夫! 誰でも最初はこんなものだよ。がくまると一緒に少しずつ頑張ろう!`;
    advice = 'まずは教科書の基本をしっかり確認してみよう!';
  }

  return {
    comment,
    strengths: strengths.length > 0 ? strengths : ['チャレンジする姿勢が素晴らしい!'],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
    advice,
  };
};

// 苦手教科を取得
export const getWeakSubjects = (answers: AnsweredQuestion[]): string[] => {
  const subjectScores = aggregateBySubject(answers);
  return subjectScores
    .filter((s) => s.rate < 60)
    .sort((a, b) => a.rate - b.rate)
    .map((s) => s.subject);
};
