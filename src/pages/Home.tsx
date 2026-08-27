import React, { useState } from 'react';
import { DownloadForm } from '../components/DownloadForm.js';
import { FormatSelector } from '../components/FormatSelector.js';
import { AnalysisResult, MediaFormat } from '../types/index.js';
import { analyzeMediaUrl, startDownloadJob } from '../services/api.js';
import { Clock, ShieldCheck, User, Globe } from 'lucide-react';
import { addRecentUrl } from '../services/storage.js';

interface HomeProps {
  onDownloadStarted: (downloadId: string) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  onDownloadStarted,
  showToast,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isStartingDownload, setIsStartingDownload] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeMediaUrl(url);
      setAnalysisResult(result);
      addRecentUrl(url);
      showToast('success', 'Contenu analysé avec succès !');
    } catch (err: any) {
      showToast('error', err.message || 'Échec de l\'analyse du lien.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartDownload = async (format: MediaFormat) => {
    if (!analysisResult) return;
    setIsStartingDownload(true);
    try {
      const downloadId = await startDownloadJob({
        url: analysisResult.url,
        format: format.format,
        quality: format.quality,
        title: analysisResult.title,
        thumbnail: analysisResult.thumbnail,
        type: format.type,
      });

      showToast('success', `Téléchargement lancé (${format.quality})`);
      onDownloadStarted(downloadId);
    } catch (err: any) {
      showToast('error', err.message || 'Impossible de démarrer le téléchargement.');
    } finally {
      setIsStartingDownload(false);
    }
  };

  return (
    <div className="home-container" id="home-page-view">
      <DownloadForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

      {/* Analysis Result Display */}
      {analysisResult && (
        <div className="analysis-card" id="analysis-result-card">
          <div className="media-preview-header">
            <div className="media-thumbnail-container">
              <img
                src={analysisResult.thumbnail}
                alt={analysisResult.title}
                className="media-thumbnail"
                referrerPolicy="no-referrer"
              />
              {analysisResult.duration && (
                <span className="thumbnail-duration">
                  <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                  {analysisResult.duration}
                </span>
              )}
            </div>

            <div className="media-info">
              <h2 className="media-title" title={analysisResult.title}>
                {analysisResult.title}
              </h2>

              <div className="media-meta-row">
                {analysisResult.author && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <User size={12} />
                    {analysisResult.author}
                  </span>
                )}
                <span className="media-source-tag">
                  <Globe size={11} />
                  {analysisResult.source}
                </span>
              </div>
            </div>
          </div>

          {/* Formats Selection */}
          <FormatSelector
            formats={analysisResult.formats}
            onStartDownload={handleStartDownload}
            isLoading={isStartingDownload}
          />
        </div>
      )}
    </div>
  );
};
