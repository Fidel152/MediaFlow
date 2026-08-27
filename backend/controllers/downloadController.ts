import { Request, Response } from 'express';
import { downloadManager } from '../services/downloader/downloadManager.js';

export async function createDownload(req: Request, res: Response) {
  try {
    const { url, format, quality, title, thumbnail, type } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL manquante pour lancer le téléchargement.',
      });
    }

    const result = await downloadManager.startDownload({
      url,
      format,
      quality,
      title,
      thumbnail,
      type,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('[CreateDownload Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue lors de l\'initialisation du téléchargement.',
    });
  }
}

export function getDownloadStatus(req: Request, res: Response) {
  const { id } = req.params;
  const status = downloadManager.getStatus(id);

  if (!status) {
    return res.status(404).json({
      success: false,
      error: 'Téléchargement introuvable ou expiré.',
    });
  }

  return res.json({
    success: true,
    ...status,
  });
}

export function getActiveDownloads(req: Request, res: Response) {
  const active = downloadManager.getAllActive();
  return res.json({
    success: true,
    downloads: active,
  });
}

export function cancelDownload(req: Request, res: Response) {
  const { id } = req.params;
  const cancelled = downloadManager.cancelDownload(id);

  return res.json({
    success: cancelled,
    message: cancelled ? 'Téléchargement annulé.' : 'Téléchargement introuvable.',
  });
}

export function pauseDownload(req: Request, res: Response) {
  const { id } = req.params;
  const paused = downloadManager.pauseDownload(id);

  return res.json({
    success: paused,
    message: paused ? 'Téléchargement mis en pause.' : 'Impossible de mettre en pause.',
  });
}

export function resumeDownload(req: Request, res: Response) {
  const { id } = req.params;
  const resumed = downloadManager.resumeDownload(id);

  return res.json({
    success: resumed,
    message: resumed ? 'Téléchargement repris.' : 'Impossible de reprendre.',
  });
}
