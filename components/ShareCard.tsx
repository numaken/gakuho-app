import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ShareCardProps {
  nickname: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  mode: string;
}

export const ShareCard = forwardRef<View, ShareCardProps>(
  ({ nickname, score, correctCount, totalQuestions, mode }, ref) => {
    const rate = Math.round((correctCount / totalQuestions) * 100);

    const getScoreComment = () => {
      if (rate >= 90) return 'パーフェクト!';
      if (rate >= 70) return 'すごい!';
      if (rate >= 50) return 'がんばった!';
      return 'もう一回!';
    };

    const getModeLabel = () => {
      switch (mode) {
        case 'normal':
          return '通常モード';
        case 'weak':
          return '苦手克服モード';
        default:
          return 'クイズ';
      }
    };

    return (
      <View ref={ref} style={styles.container} collapsable={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>ドキドキ!がくまるチャレンジ</Text>
          <Text style={styles.modeLabel}>{getModeLabel()}</Text>
        </View>

        <View style={styles.mascotSection}>
          <Image
            source={require('../assets/gakumaru.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.comment}>{getScoreComment()}</Text>
        </View>

        <View style={styles.scoreSection}>
          <Text style={styles.nickname}>{nickname}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
            <Text style={styles.scoreUnit}>点</Text>
          </View>
          <Text style={styles.detail}>
            {correctCount} / {totalQuestions} 問正解 ({rate}%)
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>学宝社</Text>
          <Text style={styles.footerSubtext}>中学生のための学習アプリ</Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: 320,
    backgroundColor: '#F5F9FF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  modeLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mascot: {
    width: 100,
    height: 100,
  },
  comment: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
  },
  scoreSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  nickname: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  scoreUnit: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
});
