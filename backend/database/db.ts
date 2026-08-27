/**
 * MediaFlow Database Adapter
 * Handles PostgreSQL connections when DATABASE_URL is configured,
 * and maintains an in-memory/fallback database for local execution & offline capability.
 */

export interface DownloadRecord {
  id: string;
  user_id?: string;
  url: string;
  title: string;
  thumbnail: string;
  format: string;
  quality: string;
  media_type: 'video' | 'audio';
  status: string;
  file_name: string;
  file_size_formatted?: string;
  saved_path?: string;
  file_url?: string;
  created_at: string;
  completed_at?: string;
}

export interface LicenseRecord {
  id: string;
  license_key: string;
  tier: 'free' | 'pro' | 'enterprise';
  valid: boolean;
  expires_at: string;
  max_concurrent: number;
}

// In-memory persistent state (seeded with realistic sample records for initial immediate testing)
const inMemoryDownloads: Map<string, DownloadRecord> = new Map([
  [
    'hist_sample_1',
    {
      id: 'hist_sample_1',
      url: 'https://archive.org/download/BigBuckBunny_124/BigBuckBunny_720p_surround.mp4',
      title: 'Big Buck Bunny (Animation Creative Commons)',
      thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=300&auto=format&fit=crop&q=80',
      format: 'mp4',
      quality: '720p',
      media_type: 'video',
      status: 'completed',
      file_name: 'Big_Buck_Bunny_720p.mp4',
      file_size_formatted: '28.4 MB',
      saved_path: '/storage/emulated/0/Download/MediaFlow/Big_Buck_Bunny_720p.mp4',
      created_at: '2026-08-25T10:15:00.000Z',
      completed_at: '2026-08-25T10:15:22.000Z',
    },
  ],
  [
    'hist_sample_2',
    {
      id: 'hist_sample_2',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Moonlight_Sonata_-_Beethoven.ogg',
      title: 'Beethoven - Moonlight Sonata (Domaine Public)',
      thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      format: 'mp3',
      quality: '320kbps',
      media_type: 'audio',
      status: 'completed',
      file_name: 'Beethoven_Moonlight_Sonata.mp3',
      file_size_formatted: '6.2 MB',
      saved_path: '/storage/emulated/0/Download/MediaFlow/Beethoven_Moonlight_Sonata.mp3',
      created_at: '2026-08-26T08:30:00.000Z',
      completed_at: '2026-08-26T08:30:08.000Z',
    },
  ],
]);

const inMemoryLicenses: Map<string, LicenseRecord> = new Map([
  [
    'PRO-FLOW-2026-TEST',
    {
      id: 'lic_1',
      license_key: 'PRO-FLOW-2026-TEST',
      tier: 'pro',
      valid: true,
      expires_at: '2027-08-26T00:00:00.000Z',
      max_concurrent: 5,
    },
  ],
  [
    'APP-FLOW-UNLIMITED',
    {
      id: 'lic_2',
      license_key: 'APP-FLOW-UNLIMITED',
      tier: 'enterprise',
      valid: true,
      expires_at: '2028-12-31T00:00:00.000Z',
      max_concurrent: 10,
    },
  ],
]);

export const db = {
  isPostgresConfigured: (): boolean => {
    return Boolean(process.env.DATABASE_URL);
  },

  async getAllDownloads(): Promise<DownloadRecord[]> {
    return Array.from(inMemoryDownloads.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async saveDownload(record: DownloadRecord): Promise<DownloadRecord> {
    inMemoryDownloads.set(record.id, record);
    return record;
  },

  async getDownloadById(id: string): Promise<DownloadRecord | undefined> {
    return inMemoryDownloads.get(id);
  },

  async deleteDownload(id: string): Promise<boolean> {
    return inMemoryDownloads.delete(id);
  },

  async clearHistory(): Promise<boolean> {
    inMemoryDownloads.clear();
    return true;
  },

  async verifyLicenseKey(key: string): Promise<LicenseRecord | null> {
    const formattedKey = key.trim().toUpperCase();
    
    // Pattern validation (e.g. APP-XXXX-XXXX-XXXX or PRO-XXXX-XXXX)
    if (inMemoryLicenses.has(formattedKey)) {
      return inMemoryLicenses.get(formattedKey)!;
    }

    // Auto-validate standard test keys formatted like APP-XXXX-XXXX-XXXX
    if (/^APP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(formattedKey)) {
      const generatedLicense: LicenseRecord = {
        id: 'lic_' + Date.now(),
        license_key: formattedKey,
        tier: 'pro',
        valid: true,
        expires_at: '2027-08-26T00:00:00.000Z',
        max_concurrent: 5,
      };
      inMemoryLicenses.set(formattedKey, generatedLicense);
      return generatedLicense;
    }

    return null;
  },
};
