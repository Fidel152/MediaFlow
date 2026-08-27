import React, { useState } from 'react';
import { Video, Music, ArrowDownToLine, CheckCircle2 } from 'lucide-react';
import { MediaFormat, MediaType } from '../types/index.js';

interface FormatSelectorProps {
  formats: MediaFormat[];
  onStartDownload: (format: MediaFormat) => void;
  isLoading: boolean;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  formats,
  onStartDownload,
  isLoading,
}) => {
  const [activeTypeTab, setActiveTypeTab] = useState<MediaType>('video');
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    formats[0]?.id || ''
  );

  const videoFormats = formats.filter((f) => f.type === 'video');
  const audioFormats = formats.filter((f) => f.type === 'audio');

  const currentFormats = activeTypeTab === 'video' ? videoFormats : audioFormats;

  const selectedFormat = formats.find((f) => f.id === selectedFormatId) || currentFormats[0] || formats[0];

  return (
    <div className="formats-section" id="media-formats-section">
      <div className="formats-header">
        <span className="formats-title">Formats autorisés</span>
        <div className="format-type-tabs">
          <button
            className={`format-tab-btn ${activeTypeTab === 'video' ? 'active' : ''}`}
            onClick={() => {
              setActiveTypeTab('video');
              if (videoFormats.length > 0) setSelectedFormatId(videoFormats[0].id);
            }}
            id="format-tab-video"
          >
            <Video size={14} />
            <span>Vidéo ({videoFormats.length})</span>
          </button>
          <button
            className={`format-tab-btn ${activeTypeTab === 'audio' ? 'active' : ''}`}
            onClick={() => {
              setActiveTypeTab('audio');
              if (audioFormats.length > 0) setSelectedFormatId(audioFormats[0].id);
            }}
            id="format-tab-audio"
          >
            <Music size={14} />
            <span>Audio ({audioFormats.length})</span>
          </button>
        </div>
      </div>

      <div className="format-list">
        {currentFormats.map((format) => {
          const isSelected = selectedFormat?.id === format.id;
          return (
            <div
              key={format.id}
              className={`format-option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedFormatId(format.id)}
              id={`format-option-${format.id}`}
            >
              <div className="format-option-left">
                <div className="format-badge-icon">
                  {format.type === 'video' ? 'MP4' : format.format.toUpperCase()}
                </div>
                <div className="format-details">
                  <span className="format-name">
                    {format.type === 'video' ? 'Vidéo MP4' : 'Piste Audio'} • {format.quality}
                  </span>
                  <span className="format-specs">
                    Format autorisé {format.fileSize ? `• ~${format.fileSize}` : ''}
                  </span>
                </div>
              </div>

              <div className="format-download-action">
                <button
                  className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartDownload(format);
                  }}
                  disabled={isLoading}
                  id={`btn-download-format-${format.id}`}
                >
                  <ArrowDownToLine size={14} />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          );
        })}

        {currentFormats.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Aucun format {activeTypeTab === 'video' ? 'vidéo' : 'audio'} disponible pour ce contenu.
          </div>
        )}
      </div>

      {selectedFormat && (
        <div style={{ marginTop: '6px' }}>
          <button
            className="btn btn-primary btn-full"
            onClick={() => onStartDownload(selectedFormat)}
            disabled={isLoading}
            id="btn-main-download-selected"
          >
            <ArrowDownToLine size={18} />
            <span>Lancer le téléchargement ({selectedFormat.quality})</span>
          </button>
        </div>
      )}
    </div>
  );
};
