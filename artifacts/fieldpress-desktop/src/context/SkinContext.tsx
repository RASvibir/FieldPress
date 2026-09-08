import React, { createContext, useContext, useState, useEffect } from 'react';

export type SkinColor = 'cyan' | 'emerald' | 'amber' | 'noir' | 'toki';

export interface SkinConfig {
  id: SkinColor;
  name: string;
  hex: string;
  accentClass: string;
  borderClass: string;
  glowColor: string;
  description: string;
}

export const SKINS: Record<SkinColor, SkinConfig> = {
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    hex: '#06b6d4',
    accentClass: 'text-cyan-400',
    borderClass: 'border-cyan-500',
    glowColor: 'rgba(6,182,212,0.4)',
    description: 'High-frequency digital bureau theme (Default)',
  },
  emerald: {
    id: 'emerald',
    name: 'Frontline CRT',
    hex: '#10b981',
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
    glowColor: 'rgba(16,185,129,0.4)',
    description: 'Tactical night-vision field monitor green',
  },
  amber: {
    id: 'amber',
    name: 'Danville Amber',
    hex: '#f59e0b',
    accentClass: 'text-amber-400',
    borderClass: 'border-amber-500',
    glowColor: 'rgba(245,158,11,0.4)',
    description: 'Vintage rail yard dispatcher phosphor glow',
  },
  noir: {
    id: 'noir',
    name: 'ChloReform Noir',
    hex: '#a855f7',
    accentClass: 'text-purple-400',
    borderClass: 'border-purple-500',
    glowColor: 'rgba(168,85,247,0.4)',
    description: 'Cyberpunk underground studio purple/monochrome',
  },
  toki: {
    id: 'toki',
    name: 'Toki Gold',
    hex: '#eab308',
    accentClass: 'text-yellow-400',
    borderClass: 'border-yellow-500',
    glowColor: 'rgba(234,179,8,0.4)',
    description: 'Vibrant golden hour print journalism tone',
  },
};

interface SkinContextType {
  currentSkin: SkinColor;
  skinConfig: SkinConfig;
  setSkin: (skin: SkinColor) => void;
  saveSkinPreference: (skin: SkinColor) => Promise<void>;
  isSaving: boolean;
}

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export const SkinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSkin, setCurrentSkinState] = useState<SkinColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fieldpress_skin_color') as SkinColor;
      if (saved && SKINS[saved]) return saved;
    }
    return 'cyan';
  });
  const [isSaving, setIsSaving] = useState(false);

  const applyCssVariables = (skin: SkinColor) => {
    if (typeof document === 'undefined') return;
    const config = SKINS[skin];
    const root = document.documentElement;
    root.style.setProperty('--skin-primary', config.hex);
    root.style.setProperty('--skin-glow', config.glowColor);
  };

  useEffect(() => {
    applyCssVariables(currentSkin);
  }, [currentSkin]);

  const setSkin = (skin: SkinColor) => {
    setCurrentSkinState(skin);
    applyCssVariables(skin);
    localStorage.setItem('fieldpress_skin_color', skin);
  };

  const saveSkinPreference = async (skin: SkinColor) => {
    setIsSaving(true);
    setSkin(skin);
    try {
      localStorage.setItem('fieldpress_skin_color', skin);
      await new Promise(r => setTimeout(r, 300));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SkinContext.Provider
      value={{
        currentSkin,
        skinConfig: SKINS[currentSkin],
        setSkin,
        saveSkinPreference,
        isSaving,
      }}
    >
      {children}
    </SkinContext.Provider>
  );
};

export const useSkin = () => {
  const ctx = useContext(SkinContext);
  if (!ctx) {
    return {
      currentSkin: 'cyan' as SkinColor,
      skinConfig: SKINS.cyan,
      setSkin: () => {},
      saveSkinPreference: async () => {},
      isSaving: false,
    };
  }
  return ctx;
};
