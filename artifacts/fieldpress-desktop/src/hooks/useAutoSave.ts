import { useState, useEffect, useCallback } from 'react';

export function useAutoSaveWork<T>(
  storageKey: string,
  initialData: T,
  debounceMs: number = 800
) {
  const [data, setData] = useState<T>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`fieldpress_autosave_${storageKey}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return initialData;
        }
      }
    }
    return initialData;
  });

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaving(true);
    const handler = setTimeout(() => {
      localStorage.setItem(`fieldpress_autosave_${storageKey}`, JSON.stringify(data));
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsSaving(false);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [data, storageKey, debounceMs]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`fieldpress_autosave_${storageKey}`);
    setData(initialData);
    setLastSavedAt(null);
  }, [storageKey, initialData]);

  return {
    data,
    setData,
    lastSavedAt,
    isSaving,
    clearDraft,
  };
}
