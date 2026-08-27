import React, { useState } from 'react';
import { Link, Clipboard, X, Search, Sparkles, ShieldCheck } from 'lucide-react';
import { copyFromClipboard, triggerHapticFeedback } from '../services/native.js';

interface DownloadFormProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
}

export const DownloadForm: React.FC<DownloadFormProps> = ({
  onAnalyze,
  isAnalyzing,
}) => {
  const [inputUrl, setInputUrl] = useState('');

  const sampleLinks = [
    {
      label: '🎬 Animation CC 720p',
      url: 'https://archive.org/download/BigBuckBunny_124/BigBuckBunny_720p_surround.mp4',
    },
    {
      label: '🎵 Beethoven Classique',
      url: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Moonlight_Sonata_-_Beethoven.ogg',
    },
    {
      label: '📻 Podcast Libre',
      url: 'https://example.com/podcast/tech-talk-episode-42.mp3',
    },
  ];

  const handlePaste = async () => {
    triggerHapticFeedback();
    const clipboardText = await copyFromClipboard();
    if (clipboardText) {
      setInputUrl(clipboardText.trim());
    }
  };

  const handleClear = () => {
    setInputUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    triggerHapticFeedback();
    onAnalyze(inputUrl.trim());
  };

  return (
    <div className="home-container" id="home-download-form-section">
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-logo-wrapper">
          <Sparkles size={28} />
        </div>
        <h1 className="hero-title">Téléchargez vos contenus<br />simplement</h1>
        <p className="hero-subtitle">
          Vidéos et musiques autorisées en haute définition
        </p>
      </div>

      {/* Compliance Banner */}
      <div className="compliance-banner">
        <ShieldCheck size={18} className="compliance-icon" />
        <div>
          <strong>Téléchargement 100% Légal & Conforme :</strong> Uniquement applicable aux contenus dont les droits autorisent l'enregistrement hors-ligne.
        </div>
      </div>

      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="url-form-card" id="url-submit-form">
        <label className="input-label" htmlFor="media-url-input">
          Lien du contenu multimédia
        </label>

        <div className="input-row">
          <Link size={18} className="input-left-icon" />
          <input
            id="media-url-input"
            type="url"
            className="url-input"
            placeholder="Coller un lien ici (ex: https://...)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 200);
            }}
            disabled={isAnalyzing}
            required
            autoComplete="off"
          />

          {inputUrl ? (
            <button
              type="button"
              className="clear-action-btn"
              onClick={handleClear}
              title="Effacer"
              id="btn-clear-url"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="paste-action-btn"
              onClick={handlePaste}
              title="Coller depuis le presse-papier"
              id="btn-paste-url"
            >
              <Clipboard size={12} />
              <span>Coller</span>
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isAnalyzing || !inputUrl.trim()}
          id="btn-analyze-link"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
              <span>Analyse en cours...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Analyser</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Test Samples */}
      <div className="sample-links-bar">
        <span className="sample-links-title">Exemples de liens libres de droits :</span>
        <div className="sample-chips-row">
          {sampleLinks.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              className="sample-chip"
              onClick={() => {
                setInputUrl(sample.url);
                onAnalyze(sample.url);
              }}
              id={`sample-chip-${idx}`}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
