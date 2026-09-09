/**
 * Privacy-Preserving Corridor Geo-Snapping
 * Snaps exact latitude/longitude to designated regional newsroom sectors.
 */

export interface CorridorSector {
  name: string;
  lat: number;
  lon: number;
  radiusKm: number;
}

export const REGIONAL_CORRIDORS: CorridorSector[] = [
  { name: 'Danville Junction Spur', lat: 40.1245, lon: -87.6300, radiusKm: 25 },
  { name: 'Vermilion Rail Corridor', lat: 40.1450, lon: -87.5800, radiusKm: 30 },
  { name: 'Champaign-Urbana Transit Line', lat: 40.1164, lon: -88.2434, radiusKm: 35 },
  { name: 'Chicago Loop Core', lat: 41.8781, lon: -87.6298, radiusKm: 20 },
  { name: 'Chicago South 63rd Corridor', lat: 41.7798, lon: -87.6000, radiusKm: 15 },
  { name: 'Evansville Crossing', lat: 37.9716, lon: -87.5711, radiusKm: 30 },
  { name: 'Indianapolis Beltway', lat: 39.7684, lon: -86.1581, radiusKm: 40 },
];

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function snapCoordinatesToCorridor(lat: number, lon: number): string {
  let closest: CorridorSector | null = null;
  let minDistance = Infinity;

  for (const c of REGIONAL_CORRIDORS) {
    const d = distanceKm(lat, lon, c.lat, c.lon);
    if (d < minDistance) {
      minDistance = d;
      closest = c;
    }
  }

  if (closest && minDistance <= closest.radiusKm) {
    return closest.name;
  }
  return 'Regional Midwest Field Corridor';
}

export async function detectCurrentCorridor(): Promise<string> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'Danville Junction Spur';
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve(snapCoordinatesToCorridor(pos.coords.latitude, pos.coords.longitude));
      },
      () => {
        resolve('Danville Junction Spur');
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  });
}
