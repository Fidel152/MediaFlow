import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isDangerous = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} id="confirm-modal-backdrop">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} id="confirm-modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <AlertTriangle size={18} color={isDangerous ? 'var(--danger)' : 'var(--warning)'} />
            <span>{title}</span>
          </div>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onCancel} id="btn-confirm-cancel">
            {cancelLabel}
          </button>
          <button
            className={`btn btn-sm ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            id="btn-confirm-proceed"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
