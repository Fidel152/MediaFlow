import React, { useState } from 'react';
import {
  Palette,
  Folder,
  Bell,
  Wifi,
  Sliders,
  Key,
  Shield,
  Info,
  CheckCircle2,
  Database,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { AppSettings, LicenseStatus } from '../types/index.js';
import { verifyLicenseKeyApi } from '../services/api.js';
import { saveSettings } from '../services/storage.js';
import { triggerHapticFeedback } from '../services/native.js';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  showToast,
}) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    triggerHapticFeedback();
    const updated = { ...settings, theme };
    onUpdateSettings(updated);
    saveSettings(updated);
    showToast('info', `Thème mis à jour : ${theme}`);
  };

  const handleToggleSetting = (key: keyof AppSettings) => {
    triggerHapticFeedback();
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const handleSelectQuality = (quality: string) => {
    triggerHapticFeedback();
    const updated = { ...settings, preferredQuality: quality };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const handleSelectMaxDownloads = (max: number) => {
    triggerHapticFeedback();
    const updated = { ...settings, maxConcurrentDownloads: max };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) return;

    setIsVerifyingLicense(true);
    triggerHapticFeedback();
    try {
      const res = await verifyLicenseKeyApi(licenseKeyInput.trim());
      setLicenseStatus(res);
      if (res.valid) {
        showToast('success', res.message || 'Licence validée avec succès !');
      } else {
        showToast('error', res.message || 'Clé de licence invalide.');
      }
    } catch {
      showToast('error', 'Erreur de connexion avec le serveur de licences.');
    } finally {
      setIsVerifyingLicense(false);
    }
  };

  return (
    <div className="settings-page" id="settings-page-view">
      {/* 1. Appearance Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Palette size={16} />
          <span>Apparence</span>
        </div>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Thème de l'interface</span>
              <span className="settings-item-desc">Choisissez l'apparence visuelle</span>
            </div>
            <div className="theme-selector">
              <button
                className={`theme-pill ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
                id="theme-pill-light"
              >
                Clair
              </button>
              <button
                className={`theme-pill ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
                id="theme-pill-dark"
              >
                Sombre
              </button>
              <button
                className={`theme-pill ${settings.theme === 'system' ? 'active' : ''}`}
                onClick={() => handleThemeChange('system')}
                id="theme-pill-system"
              >
                Système
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Storage & Filesystem Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Folder size={16} />
          <span>Stockage Android</span>
        </div>
        <div className="settings-list">
          <div className="settings-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <div className="settings-item-info">
              <span className="settings-item-title">Répertoire de destination</span>
              <span className="settings-item-desc">Stockage Scoped Storage compatible Android 13/14/15</span>
            </div>
            <div
              style={{
                width: '100%',
                background: 'var(--surface-raised)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                wordBreak: 'break-all',
              }}
            >
              {settings.storagePath}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Download Preferences */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Sliders size={16} />
          <span>Préférences de téléchargement</span>
        </div>
        <div className="settings-list">
          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Notifications Android</span>
              <span className="settings-item-desc">Alerter à la fin d'un téléchargement</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch-input"
                checked={settings.notifyOnComplete}
                onChange={() => handleToggleSetting('notifyOnComplete')}
                id="toggle-notifications"
              />
              <span className="switch-slider" />
            </label>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Télécharger en Wi-Fi uniquement</span>
              <span className="settings-item-desc">Économiser vos données mobiles</span>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                className="switch-input"
                checked={settings.wifiOnly}
                onChange={() => handleToggleSetting('wifiOnly')}
                id="toggle-wifi-only"
              />
              <span className="switch-slider" />
            </label>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Qualité vidéo par défaut</span>
              <span className="settings-item-desc">Pré-sélectionner le format</span>
            </div>
            <select
              value={settings.preferredQuality}
              onChange={(e) => handleSelectQuality(e.target.value)}
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
              id="select-preferred-quality"
            >
              <option value="1080p">1080p (Full HD)</option>
              <option value="720p">720p (HD)</option>
              <option value="480p">480p (SD)</option>
              <option value="audio_mp3">Audio MP3</option>
            </select>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <span className="settings-item-title">Téléchargements simultanés</span>
              <span className="settings-item-desc">Limite de tâches en parallèle</span>
            </div>
            <select
              value={settings.maxConcurrentDownloads}
              onChange={(e) => handleSelectMaxDownloads(Number(e.target.value))}
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '6px 10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
              }}
              id="select-max-concurrent"
            >
              <option value={1}>1 fichier</option>
              <option value={2}>2 fichiers</option>
              <option value={3}>3 fichiers</option>
              <option value={5}>5 fichiers</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. License Management Section */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Key size={16} />
          <span>Gestion de la Licence</span>
        </div>
        <div className="license-box">
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Activez une clé de licence pour débloquer les fonctionnalités Pro et les téléchargements multi-flux illimités.
          </p>

          <form onSubmit={handleVerifyLicense} className="license-input-row">
            <input
              type="text"
              className="license-input"
              placeholder="Ex: APP-XXXX-XXXX-XXXX"
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              id="license-key-input"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isVerifyingLicense || !licenseKeyInput.trim()}
              id="btn-verify-license"
            >
              {isVerifyingLicense ? 'Vérification...' : 'Activer'}
            </button>
          </form>

          {licenseStatus ? (
            <div className={`license-status-badge ${licenseStatus.valid ? 'valid' : ''}`}>
              {licenseStatus.valid ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>
                    Licence {licenseStatus.tier?.toUpperCase()} active jusqu'au {licenseStatus.expiresAt}
                  </span>
                </>
              ) : (
                <span>❌ {licenseStatus.message || 'Licence invalide'}</span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Clé de test rapide :</span>
              <button
                type="button"
                className="sample-chip"
                onClick={() => setLicenseKeyInput('PRO-FLOW-2026-TEST')}
                style={{ fontSize: '0.7rem', padding: '2px 6px' }}
              >
                PRO-FLOW-2026-TEST
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. About & Architecture Info */}
      <section className="settings-section">
        <div className="settings-section-header">
          <Info size={16} />
          <span>Informations & Conformité</span>
        </div>
        <div className="about-box">
          <div className="about-version-row">
            <span>MediaFlow pour Android</span>
            <span className="badge badge-primary">v1.2.0 Release</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={13} color="var(--primary)" />
              <span>Capacitor Android APK Target SDK: 35</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={13} color="var(--accent)" />
              <span>Base de données : PostgreSQL Ready (schema.sql)</span>
            </div>
          </div>

          <div className="about-legal-notice">
            <strong>Respect des droits et conditions :</strong> Cette application est strictement conçue pour les téléchargements autorisés par les créateurs de contenu et les plateformes. Aucune mesure technique de protection (DRM) n'est contournée.
          </div>
        </div>
      </section>
    </div>
  );
};
