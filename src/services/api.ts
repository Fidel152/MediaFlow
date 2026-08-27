import { AnalysisResult, DownloadItem, HistoryItem, LicenseStatus } from '../types/index.js';
import {
  analyzeUrlClientSide,
  startClientDownloadJob,
  getLocalDownloads,
  getLocalHistory,
  saveLocalHistory,
  pauseClientDownload,
  resumeClientDownload,
  cancelClientDownload,
} from './analyzer.js';

const API_BASE = '/api';

/**
 * Robust URL analyzer:
 * 1. Tries the backend `/api/analyze` if reachable and responding with JSON.
 * 2. If running standalone in Android APK (where /api returns 404/HTML) or offline,
 *    seamlessly processes the URL via the built-in Client-Side Analyzer.
 */
export async function analyzeMediaUrl(url: string): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.success) {
        return data;
      }
    }
  } catch (err) {
    // Network or standalone environment, proceed to client-side engine
  }

  // Standalone Android APK & Fallback Engine
  return analyzeUrlClientSide(url);
}

/**
 * Start a download job (supports both full-stack API and standalone Android APK mode)
 */
export async function startDownloadJob(params: {
  url: string;
  format: string;
  quality: string;
  title: string;
  thumbnail: string;
  type: 'video' | 'audio';
}): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.success && data.downloadId) {
        return data.downloadId;
      }
    }
  } catch (err) {
    // Standalone mode
  }

  // Standalone Android Engine
  return startClientDownloadJob(params);
}

export async function fetchActiveDownloads(): Promise<DownloadItem[]> {
  try {
    const response = await fetch(`${API_BASE}/downloads/active`);
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.downloads) return data.downloads;
    }
  } catch {
    // Standalone mode fallback
  }

  return getLocalDownloads();
}

export async function fetchDownloadStatus(downloadId: string): Promise<DownloadItem | null> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/status`);
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch {}

  const list = getLocalDownloads();
  return list.find((d) => d.id === downloadId) || null;
}

export async function cancelDownloadJob(downloadId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/cancel`, { method: 'POST' });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success) return true;
    }
  } catch {}

  return cancelClientDownload(downloadId);
}

export async function pauseDownloadJob(downloadId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/pause`, { method: 'POST' });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success) return true;
    }
  } catch {}

  return pauseClientDownload(downloadId);
}

export async function resumeDownloadJob(downloadId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/resume`, { method: 'POST' });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success) return true;
    }
  } catch {}

  return resumeClientDownload(downloadId);
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const response = await fetch(`${API_BASE}/history`);
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data && data.success && data.history) return data.history;
    }
  } catch {}

  return getLocalHistory();
}

export async function deleteHistoryRecord(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success) return true;
    }
  } catch {}

  const list = getLocalHistory().filter((h) => h.id !== id);
  saveLocalHistory(list);
  return true;
}

export async function clearEntireHistory(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.success) return true;
    }
  } catch {}

  saveLocalHistory([]);
  return true;
}

export async function verifyLicenseKeyApi(licenseKey: string): Promise<LicenseStatus> {
  try {
    const response = await fetch(`${API_BASE}/license/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey }),
    });
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      return await response.json();
    }
  } catch {}

  // Fallback standalone license validation
  const isValid = licenseKey.trim().toUpperCase().startsWith('MFPRO-') && licenseKey.trim().length >= 10;
  return {
    valid: isValid,
    tier: isValid ? 'pro' : 'free',
    licenseKey: isValid ? licenseKey : undefined,
    expiresAt: isValid ? '2030-12-31T23:59:59Z' : undefined,
    maxConcurrent: isValid ? 10 : 3,
    message: isValid ? 'Licence Pro activée avec succès.' : 'Clé de licence non valide.',
  };
}
