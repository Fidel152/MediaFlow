import { Request, Response, NextFunction } from 'express';

export function validateMediaUrl(req: Request, res: Response, next: NextFunction) {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Veuillez fournir une URL de contenu multimédia valide.',
    });
  }

  const trimmed = url.trim();

  // Basic URL structure check
  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({
        success: false,
        error: 'Seuls les protocoles HTTP et HTTPS sécurisés sont pris en charge.',
      });
    }
  } catch {
    return res.status(400).json({
      success: false,
      error: 'Format d\'adresse URL invalide.',
    });
  }

  req.body.url = trimmed;
  next();
}
