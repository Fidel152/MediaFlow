import { Request, Response } from 'express';
import { db } from '../database/db.js';

export async function verifyLicense(req: Request, res: Response) {
  try {
    const { licenseKey } = req.body;

    if (!licenseKey || typeof licenseKey !== 'string') {
      return res.status(400).json({
        valid: false,
        message: 'Veuillez saisir une clé de licence valide.',
      });
    }

    const license = await db.verifyLicenseKey(licenseKey);

    if (!license || !license.valid) {
      return res.json({
        valid: false,
        message: 'Clé de licence invalide ou expirée.',
      });
    }

    return res.json({
      valid: true,
      licenseKey: license.license_key,
      tier: license.tier,
      expiresAt: license.expires_at.split('T')[0],
      maxConcurrent: license.max_concurrent,
      message: `Licence ${license.tier.toUpperCase()} activée avec succès.`,
    });
  } catch (error: any) {
    console.error('[VerifyLicense Error]:', error);
    return res.status(500).json({
      valid: false,
      message: 'Erreur lors de la vérification de la licence.',
    });
  }
}
