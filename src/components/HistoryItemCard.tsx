import React from 'react';
import {
  Film,
  Music,
  Share2,
  Trash2,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { HistoryItem } from '../types/index.js';
import { shareMediaContent, triggerHapticFeedback } from '../services/native.js';

interface HistoryItemCardProps {
  item: HistoryItem;
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const HistoryItemCard: React.FC<HistoryItemCardProps> = ({
  item,
  onOpen,
  onDelete,
}) => {
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback();
    await shareMediaContent(item.title, `Fichier téléchargé : ${item.title}`, item.url);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHapticFeedback();
    onDelete(item.id);
  };

  const formattedDate = new Date(item.completedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="history-item-card"
      onClick={() => onOpen(item)}
      id={`history-item-${item.id}`}
      style={{ cursor: 'pointer' }}
    >
      <div className="history-thumb-wrap">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="history-thumb"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <span className="history-media-type-badge">
          {item.type === 'video' ? <Film size={10} /> : <Music size={10} />}
        </span>
      </div>

      <div className="history-content">
        <div>
          <h4 className="history-title" title={item.title}>
            {item.title}
          </h4>
          <div className="history-meta-line">
            <span>{item.format.toUpperCase()} • {item.quality}</span>
            <span>•</span>
            <span>{item.fileSize}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="history-bottom-row">
          <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
            <CheckCircle2 size={10} />
            Terminé
          </span>

          <div className="history-actions">
            <button
              className="action-icon-btn primary"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(item);
              }}
              title="Lire / Ouvrir"
              id={`btn-open-history-${item.id}`}
            >
              <Play size={14} />
            </button>

            <button
              className="action-icon-btn"
              onClick={handleShare}
              title="Partager"
              id={`btn-share-history-${item.id}`}
            >
              <Share2 size={14} />
            </button>

            <button
              className="action-icon-btn danger"
              onClick={handleDelete}
              title="Supprimer"
              id={`btn-delete-history-${item.id}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
