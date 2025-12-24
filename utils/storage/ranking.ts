import { supabase } from '../supabase';
import { getDeviceId } from './device';

export interface RankingEntry {
  rank: number;
  nickname: string;
  score: number;
  deviceId: string;
  isMe: boolean;
}

// ランキングを取得
export const fetchRanking = async (
  period: 'weekly' | 'monthly' | 'all' = 'all',
  limit: number = 50
): Promise<RankingEntry[]> => {
  try {
    const myDeviceId = await getDeviceId();
    let query = supabase
      .from('high_scores')
      .select(`
        device_id,
        score,
        created_at,
        user_profiles!inner(nickname)
      `)
      .order('score', { ascending: false })
      .limit(limit);

    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ranking:', error);
      return [];
    }

    const bestScores = new Map<string, { score: number; nickname: string }>();
    data.forEach((row: any) => {
      const deviceId = row.device_id;
      const score = row.score;
      const nickname = row.user_profiles?.nickname || '名無し';

      if (!bestScores.has(deviceId) || bestScores.get(deviceId)!.score < score) {
        bestScores.set(deviceId, { score, nickname });
      }
    });

    const ranking: RankingEntry[] = Array.from(bestScores.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([deviceId, { score, nickname }], index) => ({
        rank: index + 1,
        nickname,
        score,
        deviceId,
        isMe: deviceId === myDeviceId,
      }));

    return ranking;
  } catch (error) {
    console.error('Error fetching ranking:', error);
    return [];
  }
};

// 自分のランキング順位を取得
export const getMyRank = async (): Promise<number | null> => {
  try {
    const myDeviceId = await getDeviceId();
    const ranking = await fetchRanking('all', 1000);
    const myEntry = ranking.find(entry => entry.deviceId === myDeviceId);
    return myEntry?.rank || null;
  } catch (error) {
    console.error('Error getting my rank:', error);
    return null;
  }
};
