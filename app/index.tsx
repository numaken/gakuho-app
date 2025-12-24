import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { getUserProfile } from '../utils/storage';
import { UserProfile } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const userProfile = await getUserProfile();
    if (!userProfile) {
      router.replace('/nickname');
      return;
    }
    setProfile(userProfile);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90D9" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>学宝社</Text>
        </View>
        <TouchableOpacity
          style={styles.adminButton}
          onPress={() => router.push('/admin')}
        >
          <Text style={styles.adminButtonText}>管理</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.titleSub}>ドキドキ!</Text>
        <Text style={styles.titleMain}>クイズチャレンジ</Text>
      </View>

      <View style={styles.mascotContainer}>
        <Image
          source={require('../assets/gakumaru.png')}
          style={styles.mascotImage}
          resizeMode="contain"
        />
        <Text style={styles.mascotText}>がくまる</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="クイズスタート"
          onPress={() => router.push('/mode-select')}
          variant="primary"
          size="large"
          style={styles.startButton}
        />
        <View style={styles.subButtonRow}>
          <Button
            title="ランキング"
            onPress={() => router.push('/ranking')}
            variant="secondary"
            size="medium"
            style={styles.subButton}
          />
          <Button
            title="マイページ"
            onPress={() => router.push('/mypage')}
            variant="secondary"
            size="medium"
            style={styles.subButton}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>中学生のための学習アプリ</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90D9',
    marginLeft: 8,
  },
  adminButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  adminButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  titleSub: {
    fontSize: 24,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  titleMain: {
    fontSize: 36,
    color: '#333333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  mascotContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 200,
    height: 200,
  },
  mascotText: {
    fontSize: 18,
    color: '#4A90D9',
    fontWeight: 'bold',
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    gap: 16,
    marginBottom: 30,
  },
  startButton: {
    width: '100%',
  },
  subButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subButton: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#999999',
    fontSize: 12,
  },
});
