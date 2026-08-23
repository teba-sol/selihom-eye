import { create } from 'zustand';

interface ToastState {
  toast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export const useToast = create<ToastState>(() => ({
  toast: (message, type = 'success') => {
    console.log(`[${type.toUpperCase()}]`, message);
    // Simple alert for now
    if (type === 'error') alert(`Error: ${message}`);
  },
}));
