import React from 'react';
import { Home, ArrowDownToLine, Clock, Settings } from 'lucide-react';

export type NavTab = 'home' | 'downloads' | 'history' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeDownloadsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  activeDownloadsCount,
}) => {
  return (
    <nav className="bottom-nav" id="app-bottom-navbar">
      <button
        className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
        id="nav-tab-home"
      >
        <div className="nav-icon-container">
          <Home size={22} />
        </div>
        <span className="nav-label">Accueil</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'downloads' ? 'active' : ''}`}
        onClick={() => onSelectTab('downloads')}
        id="nav-tab-downloads"
      >
        <div className="nav-icon-container">
          <ArrowDownToLine size={22} />
          {activeDownloadsCount > 0 && (
            <span className="nav-badge">{activeDownloadsCount}</span>
          )}
        </div>
        <span className="nav-label">Téléch.</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'history' ? 'active' : ''}`}
        onClick={() => onSelectTab('history')}
        id="nav-tab-history"
      >
        <div className="nav-icon-container">
          <Clock size={22} />
        </div>
        <span className="nav-label">Historique</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
        onClick={() => onSelectTab('settings')}
        id="nav-tab-settings"
      >
        <div className="nav-icon-container">
          <Settings size={22} />
        </div>
        <span className="nav-label">Réglages</span>
      </button>
    </nav>
  );
};
