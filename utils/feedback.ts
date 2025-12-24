import * as Haptics from 'expo-haptics';

// 正解時のフィードバック
export const playCorrectFeedback = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // バイブレーション非対応デバイスでは何もしない
  }
};

// 不正解時のフィードバック
export const playIncorrectFeedback = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // バイブレーション非対応デバイスでは何もしない
  }
};

// タイムアップ時のフィードバック
export const playTimeUpFeedback = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // バイブレーション非対応デバイスでは何もしない
  }
};

// ボタンタップ時の軽いフィードバック
export const playTapFeedback = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // バイブレーション非対応デバイスでは何もしない
  }
};

// クイズ完了時のフィードバック
export const playCompleteFeedback = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // バイブレーション非対応デバイスでは何もしない
  }
};
