import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { validateNickname, saveUserProfile } from '../utils/storage';

export default function NicknameScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const validation = validateNickname(nickname);
    if (!validation.valid) {
      setError(validation.error || 'エラーが発生しました');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await saveUserProfile(nickname);
      router.replace('/');
    } catch (e) {
      setError('保存に失敗しました。もう一度試してね');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    // スキップ時はランダムなニックネームを生成
    const randomNames = [
      'クイズ好き',
      'がくまるファン',
      'チャレンジャー',
      '勉強中',
      'クイズマスター',
    ];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomSuffix = Math.floor(Math.random() * 1000);

    setIsLoading(true);
    try {
      await saveUserProfile(`${randomName}${randomSuffix}`);
      router.replace('/');
    } catch (e) {
      setError('保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.mascotContainer}>
          <Image
            source={require('../assets/gakumaru.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>ニックネームを決めよう!</Text>
          <Text style={styles.subtitle}>
            ランキングやシェアで使うよ
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder="2〜12文字で入力"
            placeholderTextColor="#AAAAAA"
            value={nickname}
            onChangeText={(text) => {
              setNickname(text);
              setError(null);
            }}
            maxLength={12}
            autoFocus
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.hintText}>
            あとから変更できるよ
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? '保存中...' : 'はじめる'}
            onPress={handleSubmit}
            variant="primary"
            size="large"
            disabled={isLoading}
          />
          <Button
            title="あとで決める"
            onPress={handleSkip}
            variant="secondary"
            size="medium"
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  mascotContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },
  inputContainer: {
    marginTop: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  hintText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 40,
    gap: 16,
  },
});
