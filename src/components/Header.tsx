import React from 'react';
import { DownloadCloud, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  currentTheme: string;
  onToggleTheme: () => void;
  activeCount: number;
  onNavigateToDownloads: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onToggleTheme,
  activeCount,
  onNavigateToDownloads,
}) => {
  return (
    <header className="app-header" id="app-main-header">
      <div className="brand-wrapper">
        <div className="brand-logo-icon">
          <DownloadCloud size={20} />
        </div>
        <div>
          <span className="brand-name">MediaFlow</span>
        </div>
        <span className="brand-badge">Android Pro</span>
      </div>

      <div className="header-actions">
        {activeCount > 0 && (
          <button
            className="icon-btn active"
            onClick={onNavigateToDownloads}
            title="Téléchargements en cours"
            id="header-active-downloads-btn"
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{activeCount}</span>
          </button>
        )}

        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title="Changer de thème"
          id="header-theme-toggle-btn"
        >
          {currentTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
};
