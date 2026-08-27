import React from 'react';
import { X, Film, Music, Download, Share2 } from 'lucide-react';
import { DownloadItem, HistoryItem } from '../types/index.js';
import { shareMediaContent } from '../services/native.js';

interface MediaPlayerModalProps {
  item: DownloadItem | HistoryItem | null;
  onClose: () => void;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const handleShare = () => {
    shareMediaContent(item.title, `Lecture : ${item.title}`, item.url);
  };

  const isVideo = item.type === 'video';
  // Fallback demo video or audio URL if original was simulated
  const mediaStreamUrl = item.fileUrl || (isVideo
    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    : 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Moonlight_Sonata_-_Beethoven.ogg');

  return (
    <div className="modal-backdrop" onClick={onClose} id="media-player-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} id="media-player-card">
        <div className="modal-header">
          <div className="modal-title">
            {isVideo ? <Film size={18} color="var(--primary)" /> : <Music size={18} color="var(--primary)" />}
            <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.title}
            </span>
          </div>
          <button className="icon-btn" onClick={onClose} title="Fermer" id="btn-close-modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="media-player-container">
            {isVideo ? (
              <video
                controls
                autoPlay
                playsInline
                src={mediaStreamUrl}
                poster={item.thumbnail}
                id="native-video-element"
              >
                Votre navigateur ne prend pas en charge la balise vidéo.
              </video>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0' }}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  style={{ width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <audio controls autoPlay src={mediaStreamUrl} id="native-audio-element" style={{ width: '100%' }}>
                  Votre navigateur ne prend pas en charge la balise audio.
                </audio>
              </div>
            )}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Format :</strong> {item.format.toUpperCase()} ({item.quality})</div>
            <div><strong>Nom du fichier :</strong> {item.fileName}</div>
            <div><strong>Emplacement :</strong> {(item as any).savedPath || '/storage/emulated/0/Download/MediaFlow/'}</div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={handleShare} id="btn-modal-share">
            <Share2 size={14} />
            <span>Partager</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onClose} id="btn-modal-done">
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
