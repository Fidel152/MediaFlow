import React, { useEffect, useState } from 'react';
import { HistoryItemCard } from '../components/HistoryItemCard.js';
import { ConfirmModal } from '../components/ConfirmModal.js';
import { HistoryItem, MediaType } from '../types/index.js';
import { fetchHistory, deleteHistoryRecord, clearEntireHistory } from '../services/api.js';
import { Search, Clock, Trash2, ArrowDownToLine, Film, Music } from 'lucide-react';

interface HistoryProps {
  onOpenPreview: (item: HistoryItem) => void;
  onNavigateHome: () => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const History: React.FC<HistoryProps> = ({
  onOpenPreview,
  onNavigateHome,
  showToast,
}) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const items = await fetchHistory();
      setHistoryItems(items);
    } catch {
      showToast('error', 'Impossible de charger l\'historique.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      const ok = await deleteHistoryRecord(itemToDelete);
      if (ok) {
        setHistoryItems((prev) => prev.filter((i) => i.id !== itemToDelete));
        showToast('info', 'Fichier retiré de l\'historique.');
      }
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearEntireHistory();
      setHistoryItems([]);
      showToast('info', 'Historique entièrement effacé.');
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    } finally {
      setIsClearAllModalOpen(false);
    }
  };

  // Filter and search items
  const filteredItems = historyItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.format.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="history-page" id="history-page-view">
      <div className="page-header-row">
        <h2 className="page-title">Historique des fichiers</h2>
        {historyItems.length > 0 && (
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setIsClearAllModalOpen(true)}
            title="Effacer tout l'historique"
            id="btn-clear-all-history"
            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
          >
            <Trash2 size={13} color="var(--danger)" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {historyItems.length > 0 && (
        <div className="history-controls">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher par titre ou format..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="history-search-input"
            />
          </div>

          <div className="filter-chips-row">
            <button
              className={`filter-chip ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('all')}
              id="filter-chip-all"
            >
              Tous ({historyItems.length})
            </button>
            <button
              className={`filter-chip ${selectedFilter === 'video' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('video')}
              id="filter-chip-video"
            >
              <Film size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Vidéos ({historyItems.filter((i) => i.type === 'video').length})
            </button>
            <button
              className={`filter-chip ${selectedFilter === 'audio' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('audio')}
              id="filter-chip-audio"
            >
              <Music size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Audios ({historyItems.filter((i) => i.type === 'audio').length})
            </button>
          </div>
        </div>
      )}

      {filteredItems.length > 0 ? (
        <div className="history-list">
          {filteredItems.map((item) => (
            <HistoryItemCard
              key={item.id}
              item={item}
              onOpen={onOpenPreview}
              onDelete={(id) => setItemToDelete(id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" id="history-empty-state">
          <div className="empty-icon-wrapper">
            <Clock size={32} />
          </div>
          <h3 className="empty-title">
            {historyItems.length === 0 ? 'Historique vide' : 'Aucun résultat trouvé'}
          </h3>
          <p className="empty-desc">
            {historyItems.length === 0
              ? 'Vos téléchargements complétés apparaîtront ici avec leurs métadonnées.'
              : 'Essayez un autre mot-clé ou modifiez les filtres de recherche.'}
          </p>
          {historyItems.length === 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={onNavigateHome}
              id="btn-history-go-home"
              style={{ marginTop: '8px' }}
            >
              <ArrowDownToLine size={15} />
              <span>Démarrer un téléchargement</span>
            </button>
          )}
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Supprimer de l'historique"
        message="Voulez-vous vraiment retirer cet enregistrement de votre historique de téléchargements ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        isDangerous={true}
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Effacer tout l'historique"
        message="Cette action supprimera tous les enregistrements de votre historique. Les fichiers sur votre appareil ne seront pas affectés."
        confirmLabel="Tout effacer"
        cancelLabel="Annuler"
        isDangerous={true}
        onConfirm={handleClearAll}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </div>
  );
};
