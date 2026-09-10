import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type ToastType = 'success' | 'error';
type ToastItem = { id: number; message: string; type: ToastType };

let dispatch: ((item: Omit<ToastItem, 'id'>) => void) | null = null;

export function toastSuccess(message: string) {
  dispatch?.({ message, type: 'success' });
}

export function toastError(message: string) {
  dispatch?.({ message, type: 'error' });
}

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { ...item, id }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  useEffect(() => {
    dispatch = push;
    return () => {
      dispatch = null;
    };
  }, [push]);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push({ message, type: 'success' }),
      error: (message) => push({ message, type: 'error' }),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            <span>{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="ml-1 text-lg leading-none text-white/80 hover:text-white"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
