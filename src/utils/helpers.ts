import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const getDeviceId = async (): Promise<string> => {
  if (Platform.OS === 'android') {
    return Application.androidId || Device.modelName || 'unknown_device';
  }
  return Device.modelName || 'unknown_device';
};

export const formatPhoneNumber = (input: string): string | null => {
  const cleaned = input.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+') || cleaned.length < 8) return null;
  return cleaned;
};

export const generateDeviceId = (length: number): string => {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};