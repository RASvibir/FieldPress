/**
 * Offline-First Dispatch Queue
 * Caches in-flight dispatches and wire tips in browser storage when cellular signal drops.
 */

export interface QueuedDispatch {
  id: string;
  title: string;
  content: string;
  corridor: string;
  photoDataUrl?: string;
  voiceAudioUrl?: string;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

const STORAGE_KEY = 'fieldpress_offline_outbox_v1';

export function getOfflineOutbox(): QueuedDispatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineDispatch(item: Omit<QueuedDispatch, 'id' | 'status' | 'timestamp'>): QueuedDispatch {
  const queued: QueuedDispatch = {
    ...item,
    id: `outbox_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
  };

  const current = getOfflineOutbox();
  current.unshift(queued);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('fieldpress:outbox_updated'));
  return queued;
}

export function removeQueuedDispatch(id: string): void {
  const current = getOfflineOutbox().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent('fieldpress:outbox_updated'));
}

export async function syncOfflineOutbox(
  onItemSynced: (item: QueuedDispatch) => Promise<void>
): Promise<number> {
  const outbox = getOfflineOutbox().filter((i) => i.status === 'pending');
  if (outbox.length === 0) return 0;

  let syncedCount = 0;
  for (const item of outbox) {
    try {
      await onItemSynced(item);
      removeQueuedDispatch(item.id);
      syncedCount++;
    } catch (err) {
      console.warn('[FieldPress Outbox]: Sync failed for item', item.id, err);
    }
  }
  return syncedCount;
}
