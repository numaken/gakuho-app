import React, { useRef, useState, RefObject } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ShareCard } from './ShareCard';
import { captureAndShare } from '../utils/share';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  nickname: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  mode: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  nickname,
  score,
  correctCount,
  totalQuestions,
  mode,
}) => {
  const shareCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await captureAndShare(shareCardRef, {
        score,
        correctCount,
        totalQuestions,
      });
      if (success) {
        onClose();
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>結果をシェアしよう!</Text>

          <View style={styles.cardContainer}>
            <ShareCard
              ref={shareCardRef}
              nickname={nickname}
              score={score}
              correctCount={correctCount}
              totalQuestions={totalQuestions}
              mode={mode}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              disabled={isSharing}
            >
              <Text style={styles.shareButtonText}>
                {isSharing ? 'シェア中...' : 'シェアする'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSharing}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    maxWidth: 360,
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 20,
  },
  buttons: {
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
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666666',
  },
});
