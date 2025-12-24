import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

// デバイスIDを取得または生成
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `temp-${Date.now()}`;
  }
};
