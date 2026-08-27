import { Request, Response } from 'express';
import { db } from '../database/db.js';

export async function getHistory(req: Request, res: Response) {
  try {
    const records = await db.getAllDownloads();
    return res.json({
      success: true,
      history: records,
    });
  } catch (error: any) {
    console.error('[GetHistory Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'historique.',
    });
  }
}

export async function deleteHistoryItem(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await db.deleteDownload(id);
    return res.json({
      success: deleted,
      message: deleted ? 'Élément supprimé de l\'historique.' : 'Élément introuvable.',
    });
  } catch (error: any) {
    console.error('[DeleteHistoryItem Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression.',
    });
  }
}

export async function clearAllHistory(req: Request, res: Response) {
  try {
    await db.clearHistory();
    return res.json({
      success: true,
      message: 'Historique entièrement effacé.',
    });
  } catch (error: any) {
    console.error('[ClearAllHistory Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du nettoyage de l\'historique.',
    });
  }
}
