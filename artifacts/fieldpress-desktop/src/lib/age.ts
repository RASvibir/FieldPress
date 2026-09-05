const KEY = "fp_age_band";

export type AgeBand = "kids" | "teen" | "adult";

export function localAgeBand(): AgeBand {
  if (typeof window === "undefined") return "teen";
  const stored = window.localStorage.getItem(KEY);
  if (stored === "kids" || stored === "teen" || stored === "adult") return stored;
  return "teen";
}

export function setLocalAgeBand(band: AgeBand): void {
  window.localStorage.setItem(KEY, band);
}
