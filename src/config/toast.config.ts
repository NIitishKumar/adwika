export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private recentMessages: Map<string, number> = new Map();

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  show(toast: Omit<ToastItem, 'id'> & { id?: string }): void {
    const key = `${toast.type}:${toast.message}`;
    const now = Date.now();
    const lastShown = this.recentMessages.get(key) || 0;

    // Deduplicate identical messages triggered within 3 seconds
    if (now - lastShown < 3000) {
      return;
    }
    this.recentMessages.set(key, now);

    const item: ToastItem = {
      id: toast.id || `toast-${now}-${Math.random().toString(36).slice(2, 7)}`,
      type: toast.type,
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 4500,
    };

    // Keep at most 4 toasts at a time
    this.toasts = [item, ...this.toasts].slice(0, 4);
    this.notify();
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear(): void {
    this.toasts = [];
    this.notify();
  }

  private notify(): void {
    const copy = [...this.toasts];
    this.listeners.forEach((listener) => listener(copy));
  }
}

export const toastManager = new ToastManager();

export const showToast = (toast: Omit<ToastItem, 'id'> & { id?: string }) => {
  toastManager.show(toast);
};

// Setup global browser online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('offline', () => {
    showToast({
      type: 'error',
      title: 'No Internet Connection',
      message: 'You are currently offline. Please check your internet connection.',
      duration: 5000,
    });
  });

  window.addEventListener('online', () => {
    showToast({
      type: 'success',
      title: 'Back Online',
      message: 'Internet connection has been restored.',
      duration: 3500,
    });
  });
}

