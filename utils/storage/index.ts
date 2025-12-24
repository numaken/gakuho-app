// ストレージモジュール - 統合エクスポート

// デバイス
export { getDeviceId } from './device';

// ユーザーデータ
export {
  getUserData,
  saveUserData,
  updateHighScore,
  updateQuestionStats,
  updateMultipleQuestionStats,
  getQuestionStats,
  getHighScores,
  resetUserData,
} from './userData';

// クラウド同期
export {
  syncStatsToCloud,
  fetchStatsFromCloud,
  saveHighScoreToCloud,
  fetchHighScoreRanking,
} from './cloud';

// 問題管理
export {
  fetchQuestionsFromSupabase,
  getCustomQuestions,
  getAllQuestions,
  saveCustomQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  isCustomQuestion,
  generateQuestionId,
} from './questions';

// クイズ結果
export {
  saveLastQuizResult,
  getLastQuizResult,
  clearLastQuizResult,
} from './quizResult';
export type { LastQuizResult } from './quizResult';

// プロファイル
export {
  validateNickname,
  getUserProfile,
  saveUserProfile,
  updateNickname,
} from './profile';

// ランキング
export { fetchRanking, getMyRank } from './ranking';
export type { RankingEntry } from './ranking';

// 分析
export {
  analyzeBySubject,
  getRecommendedQuestions,
  getWeakQuestionsForSubject,
  getQuizHistory,
} from './analysis';
export type { SubjectAnalysis, WeakPointAnalysis } from './analysis';
