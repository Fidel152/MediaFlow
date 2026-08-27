import React, { useEffect, useState } from 'react';
import { DownloadCard } from '../components/DownloadCard.js';
import { DownloadItem } from '../types/index.js';
import {
  fetchActiveDownloads,
  pauseDownloadJob,
  resumeDownloadJob,
  cancelDownloadJob,
} from '../services/api.js';
import { ArrowDownToLine, Inbox } from 'lucide-react';

interface DownloadsProps {
  onOpenPreview: (item: DownloadItem) => void;
  onNavigateHome: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const Downloads: React.FC<DownloadsProps> = ({
  onOpenPreview,
  onNavigateHome,
  showToast,
}) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDownloads = async () => {
    const active = await fetchActiveDownloads();
    setDownloads(active);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDownloads();
    const interval = setInterval(loadDownloads, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePause = async (id: string) => {
    const ok = await pauseDownloadJob(id);
    if (ok) {
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'paused', speed: '0 MB/s' } : d))
      );
      showToast('info', 'Téléchargement mis en pause');
    }
  };

  const handleResume = async (id: string) => {
    const ok = await resumeDownloadJob(id);
    if (ok) {
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'downloading' } : d))
      );
      showToast('success', 'Téléchargement repris');
    }
  };

  const handleCancel = async (id: string) => {
    const ok = await cancelDownloadJob(id);
    if (ok) {
      setDownloads((prev) => prev.filter((d) => d.id !== id));
      showToast('info', 'Téléchargement annulé');
    }
  };

  const activeCount = downloads.filter((d) => d.status === 'downloading' || d.status === 'pending').length;

  return (
    <div className="downloads-page" id="downloads-page-view">
      <div className="page-header-row">
        <h2 className="page-title">Téléchargements en cours</h2>
        {downloads.length > 0 && (
          <span className="page-count-badge">
            {activeCount} actif{activeCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {downloads.length > 0 ? (
        <div className="downloads-list">
          {downloads.map((item) => (
            <DownloadCard
              key={item.id}
              item={item}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onOpenPreview={onOpenPreview}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" id="downloads-empty-state">
          <div className="empty-icon-wrapper">
            <Inbox size={32} />
          </div>
          <h3 className="empty-title">Aucun téléchargement actif</h3>
          <p className="empty-desc">
            Collez un lien sur l'accueil pour lancer votre premier téléchargement multimédia.
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={onNavigateHome}
            id="btn-empty-go-home"
            style={{ marginTop: '8px' }}
          >
            <ArrowDownToLine size={15} />
            <span>Coller un nouveau lien</span>
          </button>
        </div>
      )}
    </div>
  );
};
