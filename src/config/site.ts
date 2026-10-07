/** Single source for external product links and bureau defaults. */
export const IMBRGR_URL = "https://imbrgr.vercel.app";

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
