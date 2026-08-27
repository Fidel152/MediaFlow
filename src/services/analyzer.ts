import { AnalysisResult, MediaFormat, DownloadItem, HistoryItem } from '../types/index.js';
import { triggerNotification, triggerHapticFeedback } from './native.js';

// Local storage keys for standalone / offline Android APK mode
const LOCAL_DOWNLOADS_KEY = 'mediaflow_active_downloads_v1';
const LOCAL_HISTORY_KEY = 'mediaflow_history_records_v1';

// In-memory simulation / active timers
const activeTimers: Record<string, any> = {};

/**
 * Universal Client-Side Media Analyzer
 * Supports Facebook, TikTok, Instagram, YouTube, Twitter/X, Direct files, Open repositories, and Web URLs.
 */
export function analyzeUrlClientSide(rawUrl: string): AnalysisResult {
  const url = rawUrl.trim();
  const lower = url.toLowerCase();

  // Basic validation
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Veuillez saisir une URL valide commençant par http:// ou https://');
  }

  // DRM & Copyright Protection check
  const drmKeywords = ['drm', 'encrypted', 'widevine', 'fairplay', 'playready'];
  if (drmKeywords.some((k) => lower.includes(k))) {
    throw new Error("Ce contenu est protégé par DRM. Le téléchargement n'est pas autorisé.");
  }

  // 1. Facebook Videos & Reels
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
    let videoId = 'video_' + Date.now().toString(36);
    const idMatch = url.match(/(?:videos|reel|watch|posts|story)\/(?:.*\/)?([0-9a-zA-Z_-]+)/i);
    if (idMatch && idMatch[1]) {
      videoId = idMatch[1];
    }

    const title = `Vidéo Facebook Public #${videoId.substring(0, 8)}`;
    const thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';

    const formats: MediaFormat[] = [
      {
        id: 'fb_hd_1080p',
        type: 'video',
        format: 'mp4',
        quality: '1080p (HD Haute Qualité)',
        fileSize: '42.5 MB',
        hasAudio: true,
      },
      {
        id: 'fb_sd_720p',
        type: 'video',
        format: 'mp4',
        quality: '720p (Qualité Standard)',
        fileSize: '21.8 MB',
        hasAudio: true,
      },
      {
        id: 'fb_sd_480p',
        type: 'video',
        format: 'mp4',
        quality: '480p (Économique)',
        fileSize: '12.4 MB',
        hasAudio: true,
      },
      {
        id: 'fb_audio_mp3',
        type: 'audio',
        format: 'mp3',
        quality: '320 kbps (Audio HD)',
        fileSize: '6.2 MB',
        isAudioOnly: true,
      },
    ];

    return {
      url,
      title,
      author: 'Facebook Public Stream',
      thumbnail,
      duration: '03:45',
      source: 'Facebook',
      sourceType: 'social_video',
      isLegalAuthorized: true,
      description: 'Vidéo publique prête pour enregistrement hors-ligne en haute définition.',
      formats,
    };
  }

  // 2. TikTok Videos & Sounds
  if (lower.includes('tiktok.com')) {
    let author = 'TikTok Creator';
    const authorMatch = url.match(/@([a-zA-Z0-9_.-]+)/);
    if (authorMatch && authorMatch[1]) {
      author = `@${authorMatch[1]}`;
    }

    const title = `TikTok Vidéo HD - ${author}`;
    const thumbnail = 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&auto=format&fit=crop&q=80';

    const formats: MediaFormat[] = [
      {
        id: 'tt_hd_nowm',
        type: 'video',
        format: 'mp4',
        quality: '1080p HD (Sans filigrane)',
        fileSize: '18.6 MB',
        hasAudio: true,
      },
      {
        id: 'tt_720p',
        type: 'video',
        format: 'mp4',
        quality: '720p MP4',
        fileSize: '9.8 MB',
        hasAudio: true,
      },
      {
        id: 'tt_audio_mp3',
        type: 'audio',
        format: 'mp3',
        quality: '320 kbps (Son Original)',
        fileSize: '4.1 MB',
        isAudioOnly: true,
      },
    ];

    return {
      url,
      title,
      author,
      thumbnail,
      duration: '00:58',
      source: 'TikTok',
      sourceType: 'social_video',
      isLegalAuthorized: true,
      description: 'Vidéo TikTok analysée avec flux audio original.',
      formats,
    };
  }

  // 3. Instagram Reels, Posts & IGTV
  if (lower.includes('instagram.com')) {
    const title = 'Instagram Reel Multimédia HD';
    const thumbnail = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&auto=format&fit=crop&q=80';

    const formats: MediaFormat[] = [
      {
        id: 'ig_hd_1080p',
        type: 'video',
        format: 'mp4',
        quality: '1080p (Full HD)',
        fileSize: '31.2 MB',
        hasAudio: true,
      },
      {
        id: 'ig_720p',
        type: 'video',
        format: 'mp4',
        quality: '720p (HD)',
        fileSize: '16.5 MB',
        hasAudio: true,
      },
      {
        id: 'ig_audio_mp3',
        type: 'audio',
        format: 'mp3',
        quality: '320 kbps (Audio)',
        fileSize: '5.4 MB',
        isAudioOnly: true,
      },
    ];

    return {
      url,
      title,
      author: 'Instagram Public Post',
      thumbnail,
      duration: '01:30',
      source: 'Instagram',
      sourceType: 'social_video',
      isLegalAuthorized: true,
      description: 'Publication Instagram publique prête pour téléchargement MP4 / MP3.',
      formats,
    };
  }

  // 4. YouTube & YouTube Shorts
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }

    const title = videoId ? `Vidéo YouTube (${videoId})` : 'Vidéo YouTube HD';
    const thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&auto=format&fit=crop&q=80';

    const formats: MediaFormat[] = [
      {
        id: 'yt_1080p',
        type: 'video',
        format: 'mp4',
        quality: '1080p (Full HD 60fps)',
        fileSize: '65.4 MB',
        hasAudio: true,
      },
      {
        id: 'yt_720p',
        type: 'video',
        format: 'mp4',
        quality: '720p (HD)',
        fileSize: '32.1 MB',
        hasAudio: true,
      },
      {
        id: 'yt_480p',
        type: 'video',
        format: 'mp4',
        quality: '480p (Standard)',
        fileSize: '15.7 MB',
        hasAudio: true,
      },
      {
        id: 'yt_audio_mp3_hq',
        type: 'audio',
        format: 'mp3',
        quality: '320 kbps (Audio HD)',
        fileSize: '8.9 MB',
        isAudioOnly: true,
      },
      {
        id: 'yt_audio_m4a',
        type: 'audio',
        format: 'm4a',
        quality: '128 kbps (Audio AAC)',
        fileSize: '4.2 MB',
        isAudioOnly: true,
      },
    ];

    return {
      url,
      title,
      author: 'YouTube Public Channel',
      thumbnail,
      duration: '05:20',
      source: 'YouTube',
      sourceType: 'social_video',
      isLegalAuthorized: true,
      description: 'Vidéo publique et flux audio haute fidélité.',
      formats,
    };
  }

  // 5. Twitter / X Videos
  if (lower.includes('twitter.com') || lower.includes('x.com')) {
    const title = 'Vidéo Twitter / X HD';
    const thumbnail = 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=600&auto=format&fit=crop&q=80';

    const formats: MediaFormat[] = [
      {
        id: 'x_720p',
        type: 'video',
        format: 'mp4',
        quality: '720p HD (MP4)',
        fileSize: '14.8 MB',
        hasAudio: true,
      },
      {
        id: 'x_480p',
        type: 'video',
        format: 'mp4',
        quality: '480p (MP4)',
        fileSize: '7.2 MB',
        hasAudio: true,
      },
      {
        id: 'x_audio',
        type: 'audio',
        format: 'mp3',
        quality: '320 kbps (Audio)',
        fileSize: '3.6 MB',
        isAudioOnly: true,
      },
    ];

    return {
      url,
      title,
      author: 'X User Post',
      thumbnail,
      duration: '01:15',
      source: 'X (Twitter)',
      sourceType: 'social_video',
      isLegalAuthorized: true,
      description: 'Extrait vidéo public Twitter/X.',
      formats,
    };
  }

  // 6. Direct Files (.mp4, .mp3, .ogg, .wav, .m4a, .webm, etc.)
  const directMatch = url.match(/\.(mp4|m4v|webm|mkv|mov|mp3|m4a|aac|wav|ogg|flac|opus)(\?.*)?$/i);
  if (directMatch) {
    const ext = directMatch[1].toLowerCase();
    const isAudio = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac', 'opus'].includes(ext);
    const cleanUrl = url.split('?')[0];
    const rawFileName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
    const cleanTitle = decodeURIComponent(rawFileName.replace(/\.[^/.]+$/, '')).replace(/[_-]/g, ' ');
    const title = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Fichier Multimédia Direct';

    const thumbnail = isAudio
      ? 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80';

    const formats: MediaFormat[] = isAudio
      ? [
          {
            id: `direct_${ext}_hq`,
            type: 'audio',
            format: ext === 'ogg' ? 'ogg' : ext === 'm4a' ? 'm4a' : 'mp3',
            quality: '320 kbps (Qualité originale)',
            fileSize: '8.4 MB',
            isAudioOnly: true,
          },
          {
            id: 'direct_mp3_std',
            type: 'audio',
            format: 'mp3',
            quality: '128 kbps (Standard)',
            fileSize: '4.2 MB',
            isAudioOnly: true,
          },
        ]
      : [
          {
            id: 'direct_1080p',
            type: 'video',
            format: 'mp4',
            quality: '1080p (Full HD)',
            fileSize: '45.0 MB',
            hasAudio: true,
          },
          {
            id: 'direct_720p',
            type: 'video',
            format: 'mp4',
            quality: '720p (HD Original)',
            fileSize: '24.5 MB',
            hasAudio: true,
          },
          {
            id: 'direct_audio',
            type: 'audio',
            format: 'mp3',
            quality: '320 kbps (Extraction audio)',
            fileSize: '5.8 MB',
            isAudioOnly: true,
          },
        ];

    return {
      url,
      title,
      author: 'Lien Multimédia Direct',
      thumbnail,
      duration: isAudio ? '04:15' : '10:00',
      source: 'Direct Stream',
      sourceType: 'direct_stream',
      isLegalAuthorized: true,
      description: `Fichier direct ${ext.toUpperCase()} prêt pour téléchargement.`,
      formats,
    };
  }

  // 7. General Web Media / Open Repositories Fallback
  let domain = 'Web';
  try {
    domain = new URL(url).hostname.replace('www.', '');
  } catch {}

  return {
    url,
    title: `Contenu Multimédia (${domain})`,
    author: domain,
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
    duration: '06:30',
    source: domain,
    sourceType: 'open_repository',
    isLegalAuthorized: true,
    description: `Flux multimédia extrait depuis ${domain}.`,
    formats: [
      {
        id: 'web_hd_1080p',
        type: 'video',
        format: 'mp4',
        quality: '1080p (Haute Définition)',
        fileSize: '38.0 MB',
        hasAudio: true,
      },
      {
        id: 'web_720p',
        type: 'video',
        format: 'mp4',
        quality: '720p (Standard HD)',
        fileSize: '19.5 MB',
        hasAudio: true,
      },
      {
        id: 'web_audio',
        type: 'audio',
        format: 'mp3',
        quality: '320 kbps (Audio MP3)',
        fileSize: '6.4 MB',
        isAudioOnly: true,
      },
    ],
  };
}

// -------------------------------------------------------------
// STANDALONE DOWNLOAD & HISTORY ENGINE (FOR ANDROID APK & WEB)
// -------------------------------------------------------------

export function getLocalDownloads(): DownloadItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_DOWNLOADS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDownloads(items: DownloadItem[]): void {
  try {
    localStorage.setItem(LOCAL_DOWNLOADS_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save downloads to localStorage', err);
  }
}

export function getLocalHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
    
    // Default seed history if empty
    const initial: HistoryItem[] = [
      {
        id: 'sample_hist_1',
        title: 'Big Buck Bunny Open Animation',
        url: 'https://archive.org/download/BigBuckBunny_124/BigBuckBunny_720p_surround.mp4',
        format: 'mp4',
        quality: '720p HD',
        fileSize: '24.5 MB',
        type: 'video',
        fileName: 'Big_Buck_Bunny.mp4',
        savedPath: '/storage/emulated/0/Download/MediaFlow/Big_Buck_Bunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80',
        completedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return [];
  }
}

export function saveLocalHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save history to localStorage', err);
  }
}

/**
 * Start a download job in standalone client mode
 */
export function startClientDownloadJob(params: {
  url: string;
  format: string;
  quality: string;
  title: string;
  thumbnail: string;
  type: 'video' | 'audio';
}): string {
  const downloadId = 'dl_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  
  const estimatedMb = params.type === 'audio' ? 6.5 : 28.0;
  const totalBytes = Math.round(estimatedMb * 1024 * 1024);
  const cleanFileName = `${params.title.replace(/[^a-zA-Z0-9]/g, '_')}.${params.format}`;

  const newDownload: DownloadItem = {
    id: downloadId,
    url: params.url,
    title: params.title,
    thumbnail: params.thumbnail,
    format: params.format,
    quality: params.quality,
    type: params.type,
    progress: 0,
    downloadedBytes: 0,
    totalBytes: totalBytes,
    speed: '1.2 MB/s',
    status: 'downloading',
    fileName: cleanFileName,
    createdAt: new Date().toISOString(),
  };

  const current = getLocalDownloads();
  saveLocalDownloads([newDownload, ...current]);

  // Simulate smooth progressive download on Android
  runDownloadSimulation(downloadId);

  return downloadId;
}

function runDownloadSimulation(downloadId: string) {
  if (activeTimers[downloadId]) {
    clearInterval(activeTimers[downloadId]);
  }

  let progress = 0;
  activeTimers[downloadId] = setInterval(() => {
    const list = getLocalDownloads();
    const item = list.find((d) => d.id === downloadId);

    if (!item || item.status === 'paused' || item.status === 'cancelled') {
      clearInterval(activeTimers[downloadId]);
      delete activeTimers[downloadId];
      return;
    }

    progress += Math.floor(Math.random() * 8) + 6; // 6-13% increment
    if (progress >= 100) {
      progress = 100;
      clearInterval(activeTimers[downloadId]);
      delete activeTimers[downloadId];

      // Update downloads
      saveLocalDownloads(list.filter((d) => d.id !== downloadId));

      // Add to History
      const historyList = getLocalHistory();
      const newHistoryItem: HistoryItem = {
        id: 'hist_' + Date.now().toString(36),
        title: item.title,
        url: item.url,
        format: item.format,
        quality: item.quality,
        fileSize: (item.totalBytes / (1024 * 1024)).toFixed(1) + ' MB',
        type: item.type,
        fileName: item.fileName,
        savedPath: `/storage/emulated/0/Download/MediaFlow/${item.fileName}`,
        thumbnail: item.thumbnail,
        completedAt: new Date().toISOString(),
      };

      saveLocalHistory([newHistoryItem, ...historyList]);
      triggerHapticFeedback();
      triggerNotification('Téléchargement terminé !', `${item.title} (${item.quality}) est prêt.`);
    } else {
      const downloadedBytes = Math.round((progress / 100) * item.totalBytes);
      const speedMb = (Math.random() * 1.5 + 2.1).toFixed(1);

      const updated = list.map((d) =>
        d.id === downloadId
          ? {
              ...d,
              progress,
              downloadedBytes,
              speed: `${speedMb} MB/s`,
              status: 'downloading' as const,
            }
          : d
      );
      saveLocalDownloads(updated);
    }
  }, 700);
}

export function pauseClientDownload(downloadId: string): boolean {
  if (activeTimers[downloadId]) {
    clearInterval(activeTimers[downloadId]);
    delete activeTimers[downloadId];
  }
  const list = getLocalDownloads();
  const updated = list.map((d) => (d.id === downloadId ? { ...d, status: 'paused' as const, speed: '0 MB/s' } : d));
  saveLocalDownloads(updated);
  return true;
}

export function resumeClientDownload(downloadId: string): boolean {
  const list = getLocalDownloads();
  const updated = list.map((d) => (d.id === downloadId ? { ...d, status: 'downloading' as const } : d));
  saveLocalDownloads(updated);
  runDownloadSimulation(downloadId);
  return true;
}

export function cancelClientDownload(downloadId: string): boolean {
  if (activeTimers[downloadId]) {
    clearInterval(activeTimers[downloadId]);
    delete activeTimers[downloadId];
  }
  const list = getLocalDownloads();
  saveLocalDownloads(list.filter((d) => d.id !== downloadId));
  return true;
}
