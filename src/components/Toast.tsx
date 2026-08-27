import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-notifications-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`} id={`toast-${toast.id}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} color="var(--accent)" />}
          {toast.type === 'error' && <AlertCircle size={18} color="var(--danger)" />}
          {toast.type === 'info' && <Info size={18} color="var(--primary)" />}
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
