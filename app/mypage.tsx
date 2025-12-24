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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import {
  getUserProfile,
  updateNickname,
  validateNickname,
  getHighScores,
  getMyRank,
} from '../utils/storage';
import { UserProfile } from '../types';

export default function MyPageScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [highScore, setHighScore] = useState<number>(0);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
          </View>
        </View>

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
    fontSize: 28,
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
