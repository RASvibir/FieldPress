/** Safe env read for Vite + Node tests (import.meta.env may be undefined under node:test). */
function viteEnv(name: string): string | undefined {
  try {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    const v = env?.[name];
    return typeof v === "string" ? v.trim() || undefined : undefined;
  } catch {
    return undefined;
  }
}

/** Single source for external product links and bureau defaults. */
export const IMBRGR_URL = viteEnv("VITE_IMBRGR_URL") || "https://imbrgr.website";

/** Public site URL (compose return links, cross-product docs). */
export const FIELDPRESS_PUBLIC_URL = viteEnv("VITE_FIELDPRESS_PUBLIC_URL") || "https://fieldpress.studio";

/** FieldPress home / masthead bureau (site identity). */
export const HOME_BUREAU = {
  label: "Danville, IL",
  name: "Danville Home Bureau",
  coordinates: [-87.6298, 40.1245] as [number, number],
};

/**
 * Default "filing from" stamp for **new** dispatches only (not site branding).
 * Update this single object when the desk moves — masthead stays {@link HOME_BUREAU}.
 */
export const AUTHOR_DEFAULT_FILING = {
  label: "Bakersfield, CA",
  coordinates: [-119.0187, 35.3733] as [number, number],
};

export function formatCoordinatesPair(coords: [number, number]): string {
  return `${coords[0]}, ${coords[1]}`;
}
