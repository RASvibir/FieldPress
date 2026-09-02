const CRT_KEY = "fp-crt";
const GLOW_KEY = "fp-glow";

function readFlag(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (raw === "0") return false;
  if (raw === "1") return true;
  return fallback;
}

export function crtEnabled(): boolean {
  return readFlag(CRT_KEY, true);
}

export function glowEnabled(): boolean {
  return readFlag(GLOW_KEY, true);
}

export function setCrtEnabled(on: boolean): void {
  window.localStorage.setItem(CRT_KEY, on ? "1" : "0");
  applyDisplaySettings();
}

export function setGlowEnabled(on: boolean): void {
  window.localStorage.setItem(GLOW_KEY, on ? "1" : "0");
  applyDisplaySettings();
}

export function applyDisplaySettings(): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("crt-on", crtEnabled());
  document.documentElement.classList.toggle("glow-on", glowEnabled());
}
