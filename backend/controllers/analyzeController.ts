import { Request, Response } from 'express';
import { sourceManager } from '../services/sources/sourceManager.js';

export async function analyzeUrl(req: Request, res: Response) {
  try {
    const { url } = req.body;
    
    // Process URL with source manager
    const result = await sourceManager.analyze(url);

    return res.json({
      success: true,
      title: result.title,
      author: result.author,
      thumbnail: result.thumbnail,
      duration: result.duration,
      source: result.source,
      sourceType: result.sourceType,
      isLegalAuthorized: result.isLegalAuthorized,
      description: result.description,
      formats: result.formats.map((f) => ({
        id: f.id,
        type: f.type,
        format: f.format,
        quality: f.quality,
        fileSize: f.fileSize,
        isAudioOnly: f.isAudioOnly,
        hasAudio: f.hasAudio,
      })),
    });
  } catch (error: any) {
    console.error('[AnalyzeController Error]:', error);
    
    // User-friendly French error message
    const clientMessage = error.message && error.message.includes('DRM')
      ? error.message
      : 'Impossible d\'analyser ce lien. Vérifiez que l\'URL est accessible et que le contenu autorise la récupération multimédia.';

    return res.status(400).json({
      success: false,
      error: clientMessage,
    });
  }
}
