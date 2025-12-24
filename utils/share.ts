import { RefObject } from 'react';
import { View, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface ShareOptions {
  score: number;
  correctCount: number;
  totalQuestions: number;
}

// シェアカードをキャプチャして共有
export const captureAndShare = async (
  cardRef: RefObject<View | null>,
  options: ShareOptions
): Promise<boolean> => {
  try {
    if (!cardRef.current) {
      console.error('Share card ref is not available');
      return false;
    }

    // カードをキャプチャ
    const uri = await captureRef(cardRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    // 共有可能かチェック
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn('Sharing is not available on this device');
      return false;
    }

    // シェアダイアログを表示
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'クイズ結果をシェア',
    });

    return true;
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
};

// テキストのみでシェア (フォールバック)
export const shareText = async (options: ShareOptions): Promise<boolean> => {
  try {
    const rate = Math.round((options.correctCount / options.totalQuestions) * 100);
    const message = `ドキドキ!クイズチャレンジで${options.score}点取ったよ! (${options.correctCount}/${options.totalQuestions}問正解 ${rate}%) #学宝社 #クイズチャレンジ`;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    // テキストファイルとして共有
    const textUri = `data:text/plain;base64,${btoa(unescape(encodeURIComponent(message)))}`;

    await Sharing.shareAsync(textUri, {
      mimeType: 'text/plain',
      dialogTitle: 'クイズ結果をシェア',
    });

    return true;
  } catch (error) {
    console.error('Error sharing text:', error);
    return false;
  }
};

// 招待リンクを生成
export const generateInviteLink = (inviteCode: string): string => {
  // 実際のアプリではディープリンクやダイナミックリンクを使用
  return `https://gakuho.co.jp/quiz?invite=${inviteCode}`;
};

// 招待メッセージを生成
export const generateInviteMessage = (inviteCode: string, nickname: string): string => {
  const link = generateInviteLink(inviteCode);
  return `${nickname}さんから招待されました!\n\n「ドキドキ!クイズチャレンジ」で一緒に学ぼう!\n\n招待コード: ${inviteCode}\n${link}\n\n#学宝社 #クイズチャレンジ`;
};
