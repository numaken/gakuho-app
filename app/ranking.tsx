import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRanking, RankingEntry } from '../utils/storage';

type Period = 'weekly' | 'monthly' | 'all';

const PERIOD_LABELS: Record<Period, string> = {
  weekly: '週間',
  monthly: '月間',
  all: '累計',
};

export default function RankingScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('all');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRanking();
  }, [period]);

  const loadRanking = async () => {
    setIsLoading(true);
    const data = await fetchRanking(period, 50);
    setRanking(data);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRanking();
    setIsRefreshing(false);
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Text style={styles.rankBadgeGold}>🥇</Text>;
    } else if (rank === 2) {
      return <Text style={styles.rankBadgeSilver}>🥈</Text>;
    } else if (rank === 3) {
      return <Text style={styles.rankBadgeBronze}>🥉</Text>;
    }
    return <Text style={styles.rankNumber}>{rank}</Text>;
  };

  const renderItem = ({ item }: { item: RankingEntry }) => (
    <View style={[styles.rankItem, item.isMe && styles.rankItemMe]}>
      <View style={styles.rankBadgeContainer}>
        {renderRankBadge(item.rank)}
      </View>
      <View style={styles.rankInfo}>
        <Text style={[styles.nickname, item.isMe && styles.nicknameMe]}>
          {item.nickname}
          {item.isMe && ' (あなた)'}
        </Text>
      </View>
      <Text style={styles.score}>{item.score.toLocaleString()}点</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ランキング</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.periodTabs}>
        {(['weekly', 'monthly', 'all'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodTab, period === p && styles.periodTabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodTabText,
                period === p && styles.periodTabTextActive,
              ]}
            >
              {PERIOD_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90D9" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      ) : ranking.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>まだランキングがありません</Text>
          <Text style={styles.emptySubtext}>
            クイズに挑戦してランクインしよう!
          </Text>
        </View>
      ) : (
        <FlatList
          data={ranking}
          renderItem={renderItem}
          keyExtractor={(item) => item.deviceId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#4A90D9']}
            />
          }
        />
      )}
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
  periodTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  periodTabActive: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  periodTabTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankItemMe: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#4A90D9',
  },
  rankBadgeContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankBadgeGold: {
    fontSize: 28,
  },
  rankBadgeSilver: {
    fontSize: 28,
  },
  rankBadgeBronze: {
    fontSize: 28,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  rankInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  nicknameMe: {
    color: '#4A90D9',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
});
