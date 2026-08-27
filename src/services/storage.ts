import { AppSettings } from '../types/index.js';

const SETTINGS_KEY = 'mediaflow_settings_v1';
const RECENT_URLS_KEY = 'mediaflow_recent_urls';

export const defaultSettings: AppSettings = {
  theme: 'system',
  storagePath: '/storage/emulated/0/Download/MediaFlow',
  autoDownloadThumbnails: true,
  notifyOnComplete: true,
  wifiOnly: false,
  maxConcurrentDownloads: 3,
  preferredQuality: '720p',
  language: 'fr',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage', err);
  }
}

export function getRecentUrls(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_URLS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentUrl(url: string): void {
  try {
    const recents = getRecentUrls().filter((u) => u !== url);
    recents.unshift(url);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(recents.slice(0, 5)));
  } catch (err) {
    console.error('Failed to update recent URLs', err);
  }
}
