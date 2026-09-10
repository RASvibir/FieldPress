import { Router, type Request, type Response } from "express";

const router = Router();

// Int-display helper for global national tags
const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

export function mapGlobalDistrictName(country?: string, region?: string, city?: string): string {
  const c = (country || "US").toUpperCase();
  const r = (region || "").toUpperCase();

  // 1. UNITED STATES: Dedicated Regional Newsroom Districts
  if (c === "US") {
    // Midwest & Great Lakes (Heartland of FieldPress)
    if (["IL", "IN", "WI", "MI", "IA", "OH", "MO", "MN"].includes(r)) {
      return "Great Lakes Basin & Central Rail District";
    }
    // Mid-Atlantic & Hudson River
    if (["NY", "NJ", "PA"].includes(r)) {
      return "Mid-Atlantic & Hudson River District";
    }
    // New England & Maritime
    if (["MA", "CT", "RI", "NH", "VT", "ME"].includes(r)) {
      return "New England & Atlantic Coast District";
    }
    // Capital & Chesapeake
    if (["DC", "MD", "VA", "DE"].includes(r)) {
      return "Chesapeake & Capital Wire District";
    }
    // Southeast & Piedmont
    if (["NC", "SC", "GA", "FL"].includes(r)) {
      return "Southeast Coast & Piedmont District";
    }
    // Appalachian & Cumberland Plateau
    if (["TN", "KY", "AL", "MS", "WV"].includes(r)) {
      return "Appalachian & Cumberland Plateau District";
    }
    // Heartland & Gulf Plains
    if (["TX", "OK", "AR", "LA"].includes(r)) {
      return "Heartland & Gulf Telegraph District";
    }
    // Northern Plains & Prairie
    if (["ND", "SD", "NE", "KS", "MT", "WY"].includes(r)) {
      return "Northern Plains & Prairie Wire District";
    }
    // Rocky Mountain & Desert Basin
    if (["CO", "UT", "NV", "AZ", "NM"].includes(r)) {
      return "Rocky Mountain & Desert Basin District";
    }
    // Cascadia & Northwest Timber
    if (["WA", "OR", "ID", "AK"].includes(r)) {
      return "Cascadia & Northwest Timber District";
    }
    // Pacific Coast & Golden Gate
    if (["CA", "HI"].includes(r)) {
      return "Pacific Coast & Western Basin District";
    }
  }

  // 2. OUTSIDE THE US: Clean National Tagging
  try {
    const nationName = countryNames.of(c);
    if (nationName) {
      return `${nationName} National Bureau // Overseas Wire`;
    }
  } catch {}

  const fallbackCity = city ? `${city} Relay` : "Global Edge";
  return `Global Field Relay // ${fallbackCity} Station`;
}

router.get("/geo/edge-district", (req: Request, res: Response) => {
  const country = (req.headers["cf-ipcountry"] as string) || "US";
  const region = (req.headers["cf-region-code"] as string) || (req.headers["cf-region"] as string) || "IL";
  const city = (req.headers["cf-ipcity"] as string) || "Chicago";
  const ray = (req.headers["cf-ray"] as string) || "";

  const districtName = mapGlobalDistrictName(country, region, city);

  res.json({
    districtName,
    city,
    region,
    country,
    edgeNode: ray.split("-") || "EDGE",
  });
});

export default router;
