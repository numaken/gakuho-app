import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { getUserProfile } from '../utils/storage';
import { generateInviteLink, generateInviteMessage } from '../utils/share';
import { UserProfile } from '../types';

export default function InviteScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    setIsLoading(false);
  };

  const handleShareInvite = async () => {
    if (!profile) return;

    const message = generateInviteMessage(profile.inviteCode, profile.nickname);

    try {
      await Share.share({
        message,
        title: '友達を招待しよう!',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const inviteLink = profile ? generateInviteLink(profile.inviteCode) : '';

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>友達を招待</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          <Image
            source={require('../assets/gakumaru.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.inviteText}>
            友達と一緒にクイズに挑戦しよう!
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={inviteLink}
              size={180}
              color="#333333"
              backgroundColor="#FFFFFF"
            />
          </View>
          <Text style={styles.qrHint}>
            QRコードをスキャンして招待
          </Text>
        </View>

        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>招待コード</Text>
          <Text style={styles.codeValue}>{profile?.inviteCode}</Text>
        </View>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareInvite}
        >
          <Text style={styles.shareButtonText}>招待リンクを送る</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          招待された友達がアプリを始めると{'\n'}
          友達ランキングで競えるよ!
        </Text>
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mascot: {
    width: 80,
    height: 80,
  },
  inviteText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 12,
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrHint: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  codeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  codeLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A90D9',
    letterSpacing: 4,
  },
  shareButton: {
    backgroundColor: '#4A90D9',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 24,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
