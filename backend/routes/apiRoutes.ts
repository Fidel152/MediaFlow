import { Router } from 'express';
import { validateMediaUrl } from '../middleware/validator.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { analyzeUrl } from '../controllers/analyzeController.js';
import {
  createDownload,
  getDownloadStatus,
  getActiveDownloads,
  cancelDownload,
  pauseDownload,
  resumeDownload,
} from '../controllers/downloadController.js';
import {
  getHistory,
  deleteHistoryItem,
  clearAllHistory,
} from '../controllers/historyController.js';
import { verifyLicense } from '../controllers/licenseController.js';

export const apiRouter = Router();

// Apply rate limiter to all API routes
apiRouter.use(rateLimiter);

// 1. Analyze endpoint
apiRouter.post('/analyze', validateMediaUrl, analyzeUrl);

// 2. Download endpoints
apiRouter.post('/download', createDownload);
apiRouter.get('/downloads/active', getActiveDownloads);
apiRouter.get('/download/:id/status', getDownloadStatus);
apiRouter.post('/download/:id/cancel', cancelDownload);
apiRouter.post('/download/:id/pause', pauseDownload);
apiRouter.post('/download/:id/resume', resumeDownload);

// 3. History endpoints
apiRouter.get('/history', getHistory);
apiRouter.delete('/history/:id', deleteHistoryItem);
apiRouter.delete('/history', clearAllHistory);

// 4. License verification
apiRouter.post('/license/verify', verifyLicense);
