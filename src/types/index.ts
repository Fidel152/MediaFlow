export type MediaType = 'video' | 'audio';

export interface MediaFormat {
  id: string;
  type: MediaType;
  format: string; // 'mp4', 'mp3', 'm4a', 'webm'
  quality: string; // '1080p', '720p', '480p', '320kbps', '128kbps'
  fileSize?: string;
  isAudioOnly?: boolean;
  hasAudio?: boolean;
}

export interface AnalysisResult {
  url: string;
  title: string;
  author?: string;
  thumbnail: string;
  duration?: string;
  source: string;
  sourceType: string;
  isLegalAuthorized: boolean;
  description?: string;
  formats: MediaFormat[];
}

export type DownloadStatus = 
  | 'pending' 
  | 'analyzing' 
  | 'downloading' 
  | 'paused' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface DownloadItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  type: MediaType;
  status: DownloadStatus;
  progress: number; // 0 - 100
  speed: string; // e.g. "2.4 MB/s"
  downloadedBytes: number;
  totalBytes: number;
  fileName: string;
  fileUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  type: MediaType;
  fileSize: string;
  fileName: string;
  fileUrl?: string;
  completedAt: string;
  savedPath: string;
}

export interface LicenseStatus {
  valid: boolean;
  licenseKey?: string;
  expiresAt?: string;
  tier?: 'free' | 'pro' | 'enterprise';
  maxConcurrent?: number;
  message?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  storagePath: string;
  autoDownloadThumbnails: boolean;
  notifyOnComplete: boolean;
  wifiOnly: boolean;
  maxConcurrentDownloads: number;
  preferredQuality: string;
  language: string;
}
