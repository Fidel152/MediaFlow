import { AnalysisResult, DownloadItem, HistoryItem, LicenseStatus } from '../types/index.js';

const API_BASE = '/api';

export async function analyzeMediaUrl(url: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Erreur lors de l\'analyse du lien.');
  }

  return data;
}

export async function startDownloadJob(params: {
  url: string;
  format: string;
  quality: string;
  title: string;
  thumbnail: string;
  type: 'video' | 'audio';
}): Promise<string> {
  const response = await fetch(`${API_BASE}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Impossible de lancer le téléchargement.');
  }

  return data.downloadId;
}

export async function fetchActiveDownloads(): Promise<DownloadItem[]> {
  try {
    const response = await fetch(`${API_BASE}/downloads/active`);
    const data = await response.json();
    return data.downloads || [];
  } catch {
    return [];
  }
}

export async function fetchDownloadStatus(downloadId: string): Promise<DownloadItem | null> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/status`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

export async function cancelDownloadJob(downloadId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/cancel`, { method: 'POST' });
    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function pauseDownloadJob(downloadId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/pause`, { method: 'POST' });
    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function resumeDownloadJob(downloadId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/download/${downloadId}/resume`, { method: 'POST' });
    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE}/history`);
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error('Impossible de charger l\'historique.');
  }
  return data.history || [];
}

export async function deleteHistoryRecord(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  const data = await response.json();
  return data.success;
}

export async function clearEntireHistory(): Promise<boolean> {
  const response = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  const data = await response.json();
  return data.success;
}

export async function verifyLicenseKeyApi(licenseKey: string): Promise<LicenseStatus> {
  const response = await fetch(`${API_BASE}/license/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey }),
  });

  const data = await response.json();
  return data;
}
