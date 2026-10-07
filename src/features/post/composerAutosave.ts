const KEY = "fieldpress_composer_autosave_v1";

export type ComposerAutosavePayload = {
  updatedAt: number;
  title: string;
  content: string;
  category: string;
  location: string;
  coordinates: string;
  sourceUrl: string;
  imageUrl: string;
  imageCaption: string;
  editionStyle: string;
  sharingOption: string;
  isAnonymous: boolean;
  decoupleLocationPin: boolean;
  builderUseThemePhotoFilter: boolean;
  evidenceGallery: Array<{ id: string; url: string; source: string; caption?: string; timestamp: string }>;
};

export function loadComposerAutosave(): ComposerAutosavePayload | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ComposerAutosavePayload;
  } catch {
    return null;
  }
}

export function saveComposerAutosave(payload: Omit<ComposerAutosavePayload, "updatedAt">) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...payload, updatedAt: Date.now() }));
  } catch {}
}

export function clearComposerAutosave() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
