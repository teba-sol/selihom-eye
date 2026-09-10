type SessionListener = () => void;

let expiredListeners: SessionListener[] = [];
let restoredListeners: SessionListener[] = [];
let expired = false;

export function notifySessionExpired() {
  if (expired) return;
  expired = true;
  expiredListeners.forEach((cb) => cb());
}

export function notifySessionRestored() {
  expired = false;
  restoredListeners.forEach((cb) => cb());
}

export function onSessionExpired(cb: SessionListener): () => void {
  expiredListeners.push(cb);
  return () => {
    expiredListeners = expiredListeners.filter((l) => l !== cb);
  };
}

export function onSessionRestored(cb: SessionListener): () => void {
  restoredListeners.push(cb);
  return () => {
    restoredListeners = restoredListeners.filter((l) => l !== cb);
  };
}

export function isSessionExpired(): boolean {
  return expired;
}
