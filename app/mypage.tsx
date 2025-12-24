import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getUserProfile,
  updateNickname,
  validateNickname,
  getHighScores,
  getMyRank,
  analyzeBySubject,
  getRecommendedQuestions,
} from '../utils/storage';
import { UserProfile, Question, SUBJECT_NAMES, Subject } from '../types';
import { WeakPointAnalysis, SubjectAnalysis } from '../utils/storage/analysis';

export default function MyPageScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [highScore, setHighScore] = useState<number>(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<WeakPointAnalysis | null>(null);
  const [recommendedQuestions, setRecommendedQuestions] = useState<Question[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsAnalyzing(true);

    const userProfile = await getUserProfile();
    if (userProfile) {
      setProfile(userProfile);
      setEditNickname(userProfile.nickname);
    }

    const scores = await getHighScores();
    const maxScore = Math.max(...Object.values(scores), 0);
    setHighScore(maxScore);

    const rank = await getMyRank();
    setMyRank(rank);

    // 弱点分析
    const analysisResult = await analyzeBySubject();
    setAnalysis(analysisResult);

    // 推薦問題
    const recommended = await getRecommendedQuestions(5);
    setRecommendedQuestions(recommended);

    setIsAnalyzing(false);
  };

  const handleSaveNickname = async () => {
    const validation = validateNickname(editNickname);
    if (!validation.valid) {
      Alert.alert('エラー', validation.error || 'ニックネームが不正です');
      return;
    }

    setIsLoading(true);
    const updatedProfile = await updateNickname(editNickname);
    if (updatedProfile) {
      setProfile(updatedProfile);
      setIsEditing(false);
    } else {
      Alert.alert('エラー', '保存に失敗しました');
    }
    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    setEditNickname(profile?.nickname || '');
    setIsEditing(false);
  };

  const handleStartWeakQuiz = () => {
    if (analysis && analysis.weakSubjects.length > 0) {
      router.push({
        pathname: '/quiz',
        params: {
          mode: 'weak',
          subjects: analysis.weakSubjects.join(','),
        },
      });
    } else {
      Alert.alert('お知らせ', 'まずはいろんな問題に挑戦してみよう！');
    }
  };

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 80) return '#4CAF50';
    if (accuracy >= 60) return '#FF9800';
    return '#F44336';
  };

  const renderSubjectBar = (subjectAnalysis: SubjectAnalysis) => {
    const barWidth = Math.max(subjectAnalysis.accuracy, 5);
    return (
      <View key={subjectAnalysis.subject} style={styles.subjectRow}>
        <Text style={styles.subjectName}>{subjectAnalysis.subjectName}</Text>
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                width: `${barWidth}%`,
                backgroundColor: getAccuracyColor(subjectAnalysis.accuracy),
              },
            ]}
          />
        </View>
        <Text style={[styles.accuracyText, { color: getAccuracyColor(subjectAnalysis.accuracy) }]}>
          {subjectAnalysis.totalAttempts > 0 ? `${subjectAnalysis.accuracy}%` : '-'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>マイページ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* プロファイルカード */}
        <View style={styles.profileCard}>
          <Image
            source={require('../assets/gakumaru.png')}
            style={styles.avatar}
            resizeMode="contain"
          />

          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.nicknameInput}
                value={editNickname}
                onChangeText={setEditNickname}
                maxLength={12}
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveNickname}
                  disabled={isLoading}
                >
                  <Text style={styles.saveButtonText}>
                    {isLoading ? '保存中...' : '保存'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nicknameContainer}>
              <Text style={styles.nickname}>{profile?.nickname}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>編集</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inviteCodeContainer}>
            <Text style={styles.inviteCodeLabel}>招待コード</Text>
            <Text style={styles.inviteCode}>{profile?.inviteCode}</Text>
          </View>
        </View>

        {/* 成績カード */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>あなたの成績</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{highScore.toLocaleString()}</Text>
              <Text style={styles.statLabel}>ハイスコア</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {myRank ? `${myRank}位` : '-'}
              </Text>
              <Text style={styles.statLabel}>ランキング</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {analysis ? `${analysis.overallAccuracy}%` : '-'}
              </Text>
              <Text style={styles.statLabel}>正答率</Text>
            </View>
          </View>
        </View>

        {/* 教科別分析カード */}
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>教科別の正答率</Text>
          {isAnalyzing ? (
            <ActivityIndicator size="small" color="#4A90D9" style={styles.loader} />
          ) : analysis ? (
            <View style={styles.subjectAnalysis}>
              {analysis.subjectAnalysis.map(renderSubjectBar)}
            </View>
          ) : null}
        </View>

        {/* 弱点克服カード */}
        {analysis && analysis.weakSubjects.length > 0 && (
          <View style={styles.weakPointCard}>
            <View style={styles.weakPointHeader}>
              <Text style={styles.weakPointTitle}>苦手を克服しよう!</Text>
              <Text style={styles.weakPointSubtitle}>
                {analysis.weakSubjects.map((s) => SUBJECT_NAMES[s]).join('・')}が苦手みたい
              </Text>
            </View>
            <TouchableOpacity
              style={styles.weakQuizButton}
              onPress={handleStartWeakQuiz}
            >
              <Text style={styles.weakQuizButtonText}>苦手克服クイズに挑戦</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 推薦問題カード */}
        {recommendedQuestions.length > 0 && (
          <View style={styles.recommendCard}>
            <Text style={styles.recommendTitle}>おすすめの問題</Text>
            <Text style={styles.recommendSubtitle}>
              あなたの弱点に基づいて選びました
            </Text>
            {recommendedQuestions.slice(0, 3).map((q, index) => (
              <View key={q.id} style={styles.recommendItem}>
                <View style={styles.recommendBadge}>
                  <Text style={styles.recommendBadgeText}>
                    {SUBJECT_NAMES[q.subject]}
                  </Text>
                </View>
                <Text style={styles.recommendQuestion} numberOfLines={1}>
                  {q.question}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.startRecommendButton}
              onPress={() => router.push('/quiz')}
            >
              <Text style={styles.startRecommendButtonText}>クイズを始める</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* メニューカード */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/invite')}
          >
            <Text style={styles.menuItemText}>友達を招待</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/ranking')}
          >
            <Text style={styles.menuItemText}>ランキングを見る</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin')}
          >
            <Text style={styles.menuItemText}>問題管理</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4A90D9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nickname: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  editButtonText: {
    fontSize: 12,
    color: '#666666',
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nicknameInput: {
    width: '80%',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#4A90D9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4A90D9',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inviteCodeContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#999999',
  },
  inviteCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90D9',
    letterSpacing: 2,
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  subjectAnalysis: {
    gap: 12,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectName: {
    width: 50,
    fontSize: 14,
    color: '#333333',
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  accuracyText: {
    width: 45,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  weakPointCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  weakPointHeader: {
    marginBottom: 16,
  },
  weakPointTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  weakPointSubtitle: {
    fontSize: 14,
    color: '#F57C00',
    marginTop: 4,
  },
  weakQuizButton: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  weakQuizButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recommendCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  recommendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  recommendSubtitle: {
    fontSize: 14,
    color: '#1976D2',
    marginTop: 4,
    marginBottom: 16,
  },
  recommendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendBadge: {
    backgroundColor: '#4A90D9',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  recommendBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  recommendQuestion: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  startRecommendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  startRecommendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  bottomPadding: {
    height: 40,
  },
});
