import { PlatformAdapter, MediaAnalysisData } from './platformAdapter.js';
import { DirectMediaAdapter } from './directMediaAdapter.js';
import { OpenMediaAdapter } from './openMediaAdapter.js';

export class SourceManager {
  private adapters: PlatformAdapter[] = [];

  constructor() {
    // Register modular adapters
    this.adapters.push(new DirectMediaAdapter());
    this.adapters.push(new OpenMediaAdapter());
  }

  registerAdapter(adapter: PlatformAdapter) {
    this.adapters.unshift(adapter); // Priority to newest
  }

  async analyze(url: string): Promise<MediaAnalysisData> {
    // Security & DRM check: Strictly enforce legal download policy
    const lower = url.toLowerCase();
    
    // Check if the URL tries to bypass private / protected DRM content
    const drmKeywords = ['drm', 'encrypted', 'widevine', 'fairplay', 'playready'];
    if (drmKeywords.some((keyword) => lower.includes(keyword))) {
      throw new Error("Ce contenu est protégé par DRM ou des restrictions d'accès. Le téléchargement n'est pas autorisé.");
    }

    // Match with adapter
    for (const adapter of this.adapters) {
      if (adapter.canHandle(url)) {
        return await adapter.analyze(url);
      }
    }

    // Fallback adapter for general web media / URLs
    const fallbackAdapter = new DirectMediaAdapter();
    return await fallbackAdapter.analyze(url);
  }
}

export const sourceManager = new SourceManager();
