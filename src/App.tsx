import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { BottomNav, NavTab } from './components/BottomNav.js';
import { MediaPlayerModal } from './components/MediaPlayerModal.js';
import { Toast, ToastMessage } from './components/Toast.js';
import { Home } from './pages/Home.js';
import { Downloads } from './pages/Downloads.js';
import { History } from './pages/History.js';
import { Settings } from './pages/Settings.js';
import { DownloadItem, HistoryItem, AppSettings } from './types/index.js';
import { loadSettings } from './services/storage.js';
import { fetchActiveDownloads } from './services/api.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [activeDownloads, setActiveDownloads] = useState<DownloadItem[]>([]);
  const [previewMedia, setPreviewMedia] = useState<DownloadItem | HistoryItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Theme application
  useEffect(() => {
    let effectiveTheme = settings.theme;
    if (effectiveTheme === 'system') {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = isDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', effectiveTheme);
  }, [settings.theme]);

  // Periodic active downloads count update
  useEffect(() => {
    const checkActive = async () => {
      const items = await fetchActiveDownloads();
      setActiveDownloads(items);
    };

    checkActive();
    const interval = setInterval(checkActive, 1500);
    return () => clearInterval(interval);
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const newToast: ToastMessage = { id, type, text };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: newTheme };
    setSettings(updated);
    localStorage.setItem('mediaflow_settings_v1', JSON.stringify(updated));
  };

  const handleDownloadStarted = (downloadId: string) => {
    setCurrentTab('downloads');
  };

  const activeCount = activeDownloads.filter(
    (d) => d.status === 'downloading' || d.status === 'pending'
  ).length;

  return (
    <div className="app-container" id="app-root-container">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} />

      {/* Header */}
      <Header
        currentTheme={settings.theme}
        onToggleTheme={handleToggleTheme}
        activeCount={activeCount}
        onNavigateToDownloads={() => setCurrentTab('downloads')}
      />

      {/* Main Scrollable View */}
      <main className="app-content" id="app-main-content">
        {currentTab === 'home' && (
          <Home
            onDownloadStarted={handleDownloadStarted}
            showToast={showToast}
          />
        )}

        {currentTab === 'downloads' && (
          <Downloads
            onOpenPreview={(item) => setPreviewMedia(item)}
            onNavigateHome={() => setCurrentTab('home')}
            showToast={showToast}
          />
        )}

        {currentTab === 'history' && (
          <History
            onOpenPreview={(item) => setPreviewMedia(item)}
            onNavigateHome={() => setCurrentTab('home')}
            showToast={showToast}
          />
        )}

        {currentTab === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={setSettings}
            showToast={showToast}
          />
        )}
      </main>

      {/* In-App Media Player Preview Modal */}
      <MediaPlayerModal
        item={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />

      {/* Bottom Mobile Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeDownloadsCount={activeCount}
      />
    </div>
  );
}
