import { db, DownloadRecord } from '../../database/db.js';

export interface ActiveJob {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  type: 'video' | 'audio';
  status: 'pending' | 'analyzing' | 'downloading' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  speed: string;
  downloadedBytes: number;
  totalBytes: number;
  fileName: string;
  fileUrl?: string;
  savedPath: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
  timer?: NodeJS.Timeout;
}

export class DownloadManager {
  private activeJobs: Map<string, ActiveJob> = new Map();

  async startDownload(params: {
    url: string;
    format?: string;
    quality?: string;
    title?: string;
    thumbnail?: string;
    type?: 'video' | 'audio';
  }): Promise<{ success: boolean; downloadId: string }> {
    const downloadId = 'dl_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const format = params.format || 'mp4';
    const quality = params.quality || '720p';
    const type = params.type || (['mp3', 'm4a', 'wav', 'ogg'].includes(format) ? 'audio' : 'video');
    const title = params.title || 'Media Content';
    const thumbnail = params.thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=300&auto=format&fit=crop&q=80';
    
    // Clean filename
    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const fileName = `${safeTitle}_${quality}.${format}`;
    const totalBytes = type === 'audio' ? 7.5 * 1024 * 1024 : 35.8 * 1024 * 1024;
    const savedPath = `/storage/emulated/0/Download/MediaFlow/${fileName}`;

    const job: ActiveJob = {
      id: downloadId,
      url: params.url,
      title,
      thumbnail,
      format,
      quality,
      type,
      status: 'downloading',
      progress: 5,
      speed: '2.4 MB/s',
      downloadedBytes: Math.floor(totalBytes * 0.05),
      totalBytes,
      fileName,
      savedPath,
      createdAt: new Date().toISOString(),
    };

    this.activeJobs.set(downloadId, job);

    // Start progressive download simulation / streaming worker
    this.runDownloadProgress(job);

    return {
      success: true,
      downloadId,
    };
  }

  private runDownloadProgress(job: ActiveJob) {
    const intervalMs = 600;
    
    job.timer = setInterval(async () => {
      if (job.status !== 'downloading') {
        if (job.timer) clearInterval(job.timer);
        return;
      }

      // Increment progress by 8 - 16% per tick
      const step = Math.floor(Math.random() * 9) + 8;
      job.progress = Math.min(100, job.progress + step);
      job.downloadedBytes = Math.floor((job.progress / 100) * job.totalBytes);
      
      const speedMb = (Math.random() * 1.5 + 2.1).toFixed(1);
      job.speed = `${speedMb} MB/s`;

      if (job.progress >= 100) {
        if (job.timer) clearInterval(job.timer);
        job.status = 'completed';
        job.speed = '0 MB/s';
        job.completedAt = new Date().toISOString();
        
        // Sample playable media stream for direct in-app preview
        job.fileUrl = job.type === 'audio'
          ? 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Moonlight_Sonata_-_Beethoven.ogg'
          : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

        // Auto-save to historical storage / database
        const record: DownloadRecord = {
          id: job.id,
          url: job.url,
          title: job.title,
          thumbnail: job.thumbnail,
          format: job.format,
          quality: job.quality,
          media_type: job.type,
          status: 'completed',
          file_name: job.fileName,
          file_size_formatted: `${(job.totalBytes / (1024 * 1024)).toFixed(1)} MB`,
          saved_path: job.savedPath,
          file_url: job.fileUrl,
          created_at: job.createdAt,
          completed_at: job.completedAt,
        };

        await db.saveDownload(record);
      }
    }, intervalMs);
  }

  getStatus(downloadId: string) {
    const job = this.activeJobs.get(downloadId);
    if (!job) return null;

    return {
      id: job.id,
      title: job.title,
      thumbnail: job.thumbnail,
      format: job.format,
      quality: job.quality,
      type: job.type,
      status: job.status,
      progress: job.progress,
      speed: job.speed,
      downloadedBytes: job.downloadedBytes,
      totalBytes: job.totalBytes,
      fileName: job.fileName,
      fileUrl: job.fileUrl,
      savedPath: job.savedPath,
      completedAt: job.completedAt,
    };
  }

  getAllActive() {
    return Array.from(this.activeJobs.values()).map((job) => ({
      id: job.id,
      url: job.url,
      title: job.title,
      thumbnail: job.thumbnail,
      format: job.format,
      quality: job.quality,
      type: job.type,
      status: job.status,
      progress: job.progress,
      speed: job.speed,
      downloadedBytes: job.downloadedBytes,
      totalBytes: job.totalBytes,
      fileName: job.fileName,
      fileUrl: job.fileUrl,
      savedPath: job.savedPath,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    }));
  }

  cancelDownload(downloadId: string): boolean {
    const job = this.activeJobs.get(downloadId);
    if (!job) return false;

    if (job.timer) clearInterval(job.timer);
    job.status = 'cancelled';
    this.activeJobs.delete(downloadId);
    return true;
  }

  pauseDownload(downloadId: string): boolean {
    const job = this.activeJobs.get(downloadId);
    if (!job || job.status !== 'downloading') return false;

    if (job.timer) clearInterval(job.timer);
    job.status = 'paused';
    job.speed = '0 MB/s';
    return true;
  }

  resumeDownload(downloadId: string): boolean {
    const job = this.activeJobs.get(downloadId);
    if (!job || job.status !== 'paused') return false;

    job.status = 'downloading';
    this.runDownloadProgress(job);
    return true;
  }

  removeJob(downloadId: string): boolean {
    const job = this.activeJobs.get(downloadId);
    if (job?.timer) clearInterval(job.timer);
    return this.activeJobs.delete(downloadId);
  }
}

export const downloadManager = new DownloadManager();
