import React from 'react';
import {
  Pause,
  Play,
  X,
  CheckCircle2,
  AlertCircle,
  Share2,
  ExternalLink,
  Film,
  Music,
} from 'lucide-react';
import { DownloadItem } from '../types/index.js';
import { shareMediaContent, triggerHapticFeedback } from '../services/native.js';

interface DownloadCardProps {
  item: DownloadItem;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onOpenPreview: (item: DownloadItem) => void;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  item,
  onPause,
  onResume,
  onCancel,
  onOpenPreview,
}) => {
  const isCompleted = item.status === 'completed';
  const isPaused = item.status === 'paused';
  const isDownloading = item.status === 'downloading';
  const isFailed = item.status === 'failed';

  const handleShare = async () => {
    triggerHapticFeedback();
    await shareMediaContent(item.title, `Téléchargé avec MediaFlow : ${item.title}`, item.url);
  };

  const formattedDownloaded = (item.downloadedBytes / (1024 * 1024)).toFixed(1);
  const formattedTotal = (item.totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="download-card" id={`download-card-${item.id}`}>
      <div className="download-card-header">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="download-card-thumb"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="download-card-meta">
          <h3 className="download-card-title" title={item.title}>
            {item.title}
          </h3>
          <div className="download-card-tags">
            <span className="download-tag">
              {item.type === 'video' ? <Film size={11} style={{ display: 'inline', marginRight: '3px' }} /> : <Music size={11} style={{ display: 'inline', marginRight: '3px' }} />}
              {item.format.toUpperCase()}
            </span>
            <span className="download-tag">{item.quality}</span>
            {isCompleted && (
              <span className="badge badge-success">
                <CheckCircle2 size={11} />
                Terminé
              </span>
            )}
            {isPaused && (
              <span className="badge badge-warning">
                <Pause size={11} />
                En pause
              </span>
            )}
            {isFailed && (
              <span className="badge badge-danger">
                <AlertCircle size={11} />
                Erreur
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress-container">
        <div className="progress-bar-track">
          <div
            className={`progress-bar-fill ${isCompleted ? 'completed' : ''} ${isFailed ? 'error' : ''}`}
            style={{ width: `${item.progress}%` }}
          />
        </div>

        <div className="progress-info-row">
          <span className="progress-percentage">
            {item.progress}% • {formattedDownloaded} / {formattedTotal} MB
          </span>
          <span className="progress-speed">
            {isDownloading ? item.speed : isCompleted ? 'Terminé' : isPaused ? 'Suspendu' : ''}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="download-actions-row">
        {isDownloading && (
          <>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                triggerHapticFeedback();
                onPause(item.id);
              }}
              title="Mettre en pause"
              id={`btn-pause-${item.id}`}
            >
              <Pause size={14} />
              <span>Pause</span>
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                triggerHapticFeedback();
                onCancel(item.id);
              }}
              title="Annuler"
              id={`btn-cancel-${item.id}`}
            >
              <X size={14} />
              <span>Annuler</span>
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                triggerHapticFeedback();
                onResume(item.id);
              }}
              title="Reprendre"
              id={`btn-resume-${item.id}`}
            >
              <Play size={14} />
              <span>Reprendre</span>
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                triggerHapticFeedback();
                onCancel(item.id);
              }}
              title="Annuler"
              id={`btn-cancel-${item.id}`}
            >
              <X size={14} />
              <span>Annuler</span>
            </button>
          </>
        )}

        {isCompleted && (
          <>
            <button
              className="btn btn-sm btn-secondary"
              onClick={handleShare}
              title="Partager le fichier"
              id={`btn-share-${item.id}`}
            >
              <Share2 size={14} />
              <span>Partager</span>
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                triggerHapticFeedback();
                onOpenPreview(item);
              }}
              title="Ouvrir le lecteur"
              id={`btn-open-${item.id}`}
            >
              <ExternalLink size={14} />
              <span>Ouvrir</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
