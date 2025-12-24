import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { ShareCard } from '../components/ShareCard';
import {
  getHighScores,
  getQuestionStats,
  getLastQuizResult,
  clearLastQuizResult,
  getUserProfile,
} from '../utils/storage';
import { getWeakQuestionIds } from '../utils/scoring';
import { SUBJECT_NAMES, Subject, AnsweredQuestion, UserProfile } from '../types';
import { getDiagnosis, getWeakSubjects } from '../utils/openai';
import { getRecommendedMaterials, Material } from '../data/materials';
import { captureAndShare } from '../utils/share';

interface DiagnosisResult {
  comment: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const isHistory = params.mode === 'history';
  const score = parseInt(params.score as string, 10) || 0;
  const correct = parseInt(params.correct as string, 10) || 0;
  const total = parseInt(params.total as string, 10) || 0;
  const subjects = (params.subjects as string)?.split(',') as Subject[];
  const timeLimit = parseInt(params.timeLimit as string, 10) || 30;

  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const [weakQuestionCount, setWeakQuestionCount] = useState(0);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState(false);
  const [recommendedMaterials, setRecommendedMaterials] = useState<Material[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const shareCardRef = useRef<View>(null);

  useEffect(() => {
    loadData();
    if (!isHistory) {
      loadDiagnosis();
    }
  }, []);

  const loadData = async () => {
    const scores = await getHighScores();
    setHighScores(scores);

    const stats = await getQuestionStats();
    const weakIds = getWeakQuestionIds(stats);
    setWeakQuestionCount(weakIds.length);

    const userProfile = await getUserProfile();
    setProfile(userProfile);
  };

  const loadDiagnosis = async () => {
    setIsLoadingDiagnosis(true);
    try {
      const lastResult = await getLastQuizResult();
      if (lastResult && lastResult.answeredQuestions.length > 0) {
        // AI診断を取得
        const diagnosisResult = await getDiagnosis(
          lastResult.answeredQuestions,
          lastResult.totalScore
        );
        setDiagnosis(diagnosisResult);

        // 苦手教科に基づいて副教材をレコメンド
        const weakSubjects = getWeakSubjects(lastResult.answeredQuestions);
        const materials = getRecommendedMaterials(weakSubjects, 3);
        setRecommendedMaterials(materials);

        // 一時データをクリア
        await clearLastQuizResult();
      }
    } catch (error) {
      console.error('Error loading diagnosis:', error);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const getGrade = (acc: number) => {
    if (acc >= 90) return { grade: 'S', color: '#FFD700', message: 'すばらしい!' };
    if (acc >= 80) return { grade: 'A', color: '#4CAF50', message: 'よくできました!' };
    if (acc >= 70) return { grade: 'B', color: '#2196F3', message: 'いい調子!' };
    if (acc >= 60) return { grade: 'C', color: '#FF9800', message: 'もう少し!' };
    return { grade: 'D', color: '#F44336', message: 'がんばろう!' };
  };

  const gradeInfo = getGrade(accuracy);

  const handleRetry = () => {
    if (subjects && subjects.length > 0) {
      const retryParams = new URLSearchParams({
        mode: params.mode as string,
        subjects: subjects.join(','),
        timeLimit: timeLimit.toString(),
      });
      router.replace(`/quiz?${retryParams.toString()}`);
    } else {
      router.push('/mode-select');
    }
  };

  const handleHome = () => {
    router.replace('/');
  };

  const handleMaterialPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleShareCapture = async () => {
    setIsSharing(true);
    try {
      const success = await captureAndShare(shareCardRef, {
        score,
        correctCount: correct,
        totalQuestions: total,
      });
      if (success) {
        setShowShareModal(false);
      } else {
        Alert.alert('エラー', 'シェアできませんでした');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('エラー', 'シェアに失敗しました');
    } finally {
      setIsSharing(false);
    }
  };

  if (isHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>記録チェック</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>苦手問題</Text>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{weakQuestionCount}</Text>
              <Text style={styles.statLabel}>問</Text>
            </View>
            {weakQuestionCount > 0 && (
              <Text style={styles.hintText}>
                苦手克服モードで練習しよう!
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ハイスコア</Text>
            {Object.keys(highScores).length === 0 ? (
              <Text style={styles.noDataText}>まだ記録がありません</Text>
            ) : (
              Object.entries(highScores).map(([key, score]) => (
                <View key={key} style={styles.scoreRow}>
                  <Text style={styles.scoreKey}>{formatScoreKey(key)}</Text>
                  <Text style={styles.scoreValueSmall}>{score}点</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="トップへ"
              onPress={handleHome}
              variant="primary"
              size="large"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.mascotContainer}>
          <Image
            source={require('../assets/gakumaru.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.gradeContainer}>
          <Text style={[styles.grade, { color: gradeInfo.color }]}>
            {gradeInfo.grade}
          </Text>
          <Text style={styles.gradeMessage}>{gradeInfo.message}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>スコア</Text>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreUnit}>点</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>正解数</Text>
            <Text style={styles.statItemValue}>
              {correct} / {total}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>正答率</Text>
            <Text style={styles.statItemValue}>{accuracy}%</Text>
          </View>
        </View>

        {/* AI診断セクション */}
        <View style={styles.diagnosisSection}>
          <Text style={styles.sectionTitle}>がくまるからのアドバイス</Text>
          {isLoadingDiagnosis ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4A90D9" />
              <Text style={styles.loadingText}>診断中...</Text>
            </View>
          ) : diagnosis ? (
            <View style={styles.diagnosisCard}>
              <Text style={styles.diagnosisComment}>{diagnosis.comment}</Text>

              {diagnosis.strengths.length > 0 && (
                <View style={styles.diagnosisItem}>
                  <Text style={styles.diagnosisItemTitle}>得意なところ</Text>
                  {diagnosis.strengths.map((s, i) => (
                    <Text key={i} style={styles.diagnosisItemText}>・{s}</Text>
                  ))}
                </View>
              )}

              {diagnosis.weaknesses.length > 0 && (
                <View style={styles.diagnosisItem}>
                  <Text style={styles.diagnosisItemTitle}>もう少しがんばろう</Text>
                  {diagnosis.weaknesses.map((w, i) => (
                    <Text key={i} style={styles.diagnosisItemText}>・{w}</Text>
                  ))}
                </View>
              )}

              <View style={styles.adviceBox}>
                <Text style={styles.adviceText}>{diagnosis.advice}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* 副教材レコメンドセクション */}
        {recommendedMaterials.length > 0 && (
          <View style={styles.materialsSection}>
            <Text style={styles.sectionTitle}>おすすめの教材</Text>
            {recommendedMaterials.map((material) => (
              <TouchableOpacity
                key={material.id}
                style={styles.materialCard}
                onPress={() => handleMaterialPress(material.url)}
                activeOpacity={0.7}
              >
                <View style={styles.materialContent}>
                  <Text style={styles.materialName}>{material.name}</Text>
                  <Text style={styles.materialDescription}>
                    {material.description}
                  </Text>
                  <View style={styles.materialFooter}>
                    <Text style={styles.materialSubject}>
                      {SUBJECT_NAMES[material.subject as Subject]}
                    </Text>
                    <Text style={styles.materialPrice}>
                      {material.price.toLocaleString()}円
                    </Text>
                  </View>
                </View>
                <Text style={styles.materialArrow}>→</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.materialHint}>
              タップで学宝社オンラインストアへ
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="結果をシェア"
            onPress={handleShare}
            variant="primary"
            size="large"
            style={styles.button}
          />
          <View style={styles.buttonRow}>
            <Button
              title="もう一度"
              onPress={handleRetry}
              variant="secondary"
              size="medium"
              style={styles.halfButton}
            />
            <Button
              title="トップへ"
              onPress={handleHome}
              variant="secondary"
              size="medium"
              style={styles.halfButton}
            />
          </View>
        </View>
      </ScrollView>

      {/* シェアモーダル */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>結果をシェアしよう!</Text>

            <View style={styles.shareCardContainer}>
              <ShareCard
                ref={shareCardRef}
                nickname={profile?.nickname || 'ゲスト'}
                score={score}
                correctCount={correct}
                totalQuestions={total}
                mode={params.mode as string}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareCapture}
                disabled={isSharing}
              >
                <Text style={styles.shareButtonText}>
                  {isSharing ? 'シェア中...' : 'シェアする'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowShareModal(false)}
                disabled={isSharing}
              >
                <Text style={styles.cancelModalButtonText}>キャンセル</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const formatScoreKey = (key: string): string => {
  const parts = key.split('_');
  if (parts.length < 3) return key;

  const mode = parts[0] === 'normal' ? '通常' : '苦手克服';
  const subjectKeys = parts[1].split('-');
  const subjects = subjectKeys
    .map((s) => SUBJECT_NAMES[s as Subject] || s)
    .join('・');
  const time = parts[2];

  return `${mode} / ${subjects} / ${time}秒`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  mascotImage: {
    width: 100,
    height: 100,
  },
  gradeContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  grade: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  gradeMessage: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: 12,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  scoreUnit: {
    fontSize: 18,
    color: '#666666',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  statItemValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    marginTop: 8,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  statValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 20,
    color: '#666666',
    marginLeft: 8,
  },
  hintText: {
    textAlign: 'center',
    color: '#4A90D9',
    marginTop: 12,
    fontSize: 14,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999999',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  scoreKey: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  scoreValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  button: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  // 診断セクション
  diagnosisSection: {
    marginTop: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  loadingText: {
    marginLeft: 12,
    color: '#666666',
    fontSize: 14,
  },
  diagnosisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  diagnosisComment: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  diagnosisItem: {
    marginBottom: 12,
  },
  diagnosisItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90D9',
    marginBottom: 4,
  },
  diagnosisItemText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  adviceBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  adviceText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
  // 副教材セクション
  materialsSection: {
    marginTop: 24,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  materialContent: {
    flex: 1,
  },
  materialName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialSubject: {
    fontSize: 12,
    color: '#4A90D9',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  materialPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  materialArrow: {
    fontSize: 20,
    color: '#4A90D9',
    marginLeft: 12,
  },
  materialHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  // シェアモーダル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 360,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  shareCardContainer: {
    marginBottom: 20,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#4A90D9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelModalButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 14,
    color: '#666666',
  },
});
