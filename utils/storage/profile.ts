import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../../types';
import { supabase } from '../supabase';
import { STORAGE_KEYS } from './constants';
import { getDeviceId } from './device';

// 招待コードを生成
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ニックネームのバリデーション
export const validateNickname = (nickname: string): { valid: boolean; error?: string } => {
  const trimmed = nickname.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'ニックネームを入力してね' };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: '2文字以上で入力してね' };
  }

  if (trimmed.length > 12) {
    return { valid: false, error: '12文字以内で入力してね' };
  }

  const ngWords = ['admin', 'test', 'null', 'undefined'];
  if (ngWords.some(ng => trimmed.toLowerCase().includes(ng))) {
    return { valid: false, error: 'この名前は使えないよ' };
  }

  return { valid: true };
};

// ユーザープロファイルを取得
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

// プロファイルをクラウドに同期
const syncProfileToCloud = async (profile: UserProfile): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        device_id: profile.deviceId,
        nickname: profile.nickname,
        invite_code: profile.inviteCode,
        created_at: new Date(profile.createdAt).toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'device_id',
      });

    if (error) {
      console.error('Error syncing profile to cloud:', error);
    }
  } catch (error) {
    console.error('Error syncing profile:', error);
  }
};

// ユーザープロファイルを保存
export const saveUserProfile = async (nickname: string): Promise<UserProfile> => {
  try {
    const deviceId = await getDeviceId();
    const profile: UserProfile = {
      nickname: nickname.trim(),
      deviceId,
      inviteCode: generateInviteCode(),
      createdAt: Date.now(),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    await syncProfileToCloud(profile);
    return profile;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// ニックネームを更新
export const updateNickname = async (nickname: string): Promise<UserProfile | null> => {
  try {
    const profile = await getUserProfile();
    if (!profile) return null;

    profile.nickname = nickname.trim();
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    await syncProfileToCloud(profile);
    return profile;
  } catch (error) {
    console.error('Error updating nickname:', error);
    return null;
  }
};
