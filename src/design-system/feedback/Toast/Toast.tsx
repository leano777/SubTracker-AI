import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../theme/theme-utils';
import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body
  );
}

const toastVariants = {
  default: {
    container: 'bg-[var(--color-card-background)] border-[var(--color-border-primary)]',
    icon: null,
    iconColor: '',
  },
  success: {
    container: 'bg-[var(--color-card-background)] border-[var(--color-feedback-success)]',
    icon: CheckCircle,
    iconColor: 'text-[var(--color-feedback-success)]',
  },
  warning: {
    container: 'bg-[var(--color-card-background)] border-[var(--color-feedback-warning)]',
    icon: AlertCircle,
    iconColor: 'text-[var(--color-feedback-warning)]',
  },
  error: {
    container: 'bg-[var(--color-card-background)] border-[var(--color-feedback-error)]',
    icon: XCircle,
    iconColor: 'text-[var(--color-feedback-error)]',
  },
  info: {
    container: 'bg-[var(--color-card-background)] border-[var(--color-feedback-info)]',
    icon: Info,
    iconColor: 'text-[var(--color-feedback-info)]',
  },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const variant = toastVariants[toast.variant || 'default'];
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-[slideIn_300ms_ease-out]',
        variant.container
      )}
    >
      {Icon && (
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', variant.iconColor)} />
      )}
      
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {toast.title}
        </h3>
        {toast.description && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-hover)]"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-[var(--color-background-secondary)] transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
      </button>
    </div>
  );
}