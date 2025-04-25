import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Settings keys
export const APP_SETTINGS_KEY = 'aether_app_settings';

// Default settings
const DEFAULT_SETTINGS = {
  enableNotifications: true,
  enableDarkMode: null, // null means "use system setting"
  enableOfflineMode: true,
  syncOnCellular: true,
  lastSyncTimestamp: null,
};

// Type for app settings
export type AppSettings = typeof DEFAULT_SETTINGS;

/**
 * Get app settings from secure storage
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const storedSettings = await SecureStore.getItemAsync(APP_SETTINGS_KEY);
    if (!storedSettings) return DEFAULT_SETTINGS;
    
    return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings to secure storage
 */
export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    
    await SecureStore.setItemAsync(
      APP_SETTINGS_KEY, 
      JSON.stringify(newSettings)
    );
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Update a single setting
 */
export async function updateSetting<K extends keyof AppSettings>(
  key: K, 
  value: AppSettings[K]
): Promise<void> {
  await saveSettings({ [key]: value } as Partial<AppSettings>);
}

/**
 * Get app version
 */
export function getAppVersion(): string {
  // In a real app, you would use expo-constants to get the app version
  // import Constants from 'expo-constants';
  // return Constants.expoConfig.version;
  return '1.0.0';
}

/**
 * Get platform information
 */
export function getPlatformInfo(): string {
  return `${Platform.OS} ${Platform.Version}`;
} 