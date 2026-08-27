export interface MediaFormatInfo {
  id: string;
  type: 'video' | 'audio';
  format: string; // 'mp4', 'mp3', 'm4a', 'webm', 'ogg'
  quality: string; // '1080p', '720p', '480p', '320kbps', '128kbps'
  fileSize?: string;
  isAudioOnly?: boolean;
  hasAudio?: boolean;
  downloadUrl?: string;
}

export interface MediaAnalysisData {
  url: string;
  title: string;
  author?: string;
  thumbnail: string;
  duration?: string;
  source: string;
  sourceType: string;
  isLegalAuthorized: boolean;
  description?: string;
  formats: MediaFormatInfo[];
}

export interface PlatformAdapter {
  name: string;
  canHandle(url: string): boolean;
  analyze(url: string): Promise<MediaAnalysisData>;
}
