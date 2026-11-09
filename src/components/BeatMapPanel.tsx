import React, { useEffect, useRef } from "react";

export type MapDispatch = {
  id: string;
  title: string;
  location: string;
  coordinates?: [number, number];
  isAnonymous?: boolean;
  callsign?: string;
  bureau?: string;
  decoupleLocationPin?: boolean;
  author?: string;
};

type Props = {
  dispatches: MapDispatch[];
  mapSignalFilter: "ALL" | "ANON_DECOUPLED" | "NAMED";
  mapRegionPreset: "NATIONAL" | "MIDWEST" | "GLOBAL";
  isDispatchAnonOrDecoupled: (d: MapDispatch) => boolean;
  onSelectDispatch: (d: MapDispatch) => void;
  isDark: boolean;
};

export const BeatMapPanel: React.FC<Props> = ({
  dispatches,
  mapSignalFilter,
  mapRegionPreset,
  isDispatchAnonOrDecoupled,
  onSelectDispatch,
  isDark
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let cancelled = false;

    const init = async () => {
      const maplibregl = await import("maplibre-gl");
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const presetView =
        mapRegionPreset === "MIDWEST"
          ? { center: [-87.63, 40.12] as [number, number], zoom: 6.5 }
          : mapRegionPreset === "GLOBAL"
          ? { center: [-40.0, 32.0] as [number, number], zoom: 2.2 }
          : { center: [-96.5, 38.5] as [number, number], zoom: 3.7 };

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors"
            }
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: presetView.center,
        zoom: presetView.zoom
      });

      const visibleMapDispatches = dispatches.filter((d) => {
        if (!d.coordinates) return false;
        const isAnonOrDec = isDispatchAnonOrDecoupled(d);
        if (mapSignalFilter === "ANON_DECOUPLED") return isAnonOrDec;
        if (mapSignalFilter === "NAMED") return !isAnonOrDec;
        return true;
      });

      map.on("load", () => {
        const features = visibleMapDispatches.map((d) => {
          const isAnonOrDec = isDispatchAnonOrDecoupled(d);
          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: d.coordinates! as [number, number]
            },
            properties: {
              id: d.id,
              color: isAnonOrDec ? "#10b981" : "#f59e0b"
            }
          };
        });

        map.addSource("vicinity-zones", {
          type: "geojson",
          data: { type: "FeatureCollection", features }
        });

        map.addLayer({
          id: "vicinity-outer-halo",
          type: "circle",
          source: "vicinity-zones",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 14, 5, 24, 10, 42],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.22,
            "circle-stroke-width": 2,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-opacity": 0.75
          }
        });
      });

      visibleMapDispatches.forEach((d) => {
        if (!d.coordinates) return;
        const fuzzyCoords: [number, number] = d.coordinates;
        const isAnon = Boolean(d.isAnonymous || d.callsign === "anon-signal" || d.bureau?.includes("Metadata Stripped"));
        const isDecoupled = isDispatchAnonOrDecoupled(d);
        const markerColor = isDecoupled ? "#10b981" : "#f59e0b";
        const signalBadge = isAnon
          ? "🕵️ ANONYMOUS VICINITY SIGNAL"
          : isDecoupled
          ? "🔀 VICINITY SIGNAL (IDENTITY DECOUPLED)"
          : "📡 CORRESPONDENT VICINITY SIGNAL";

        const marker = new maplibregl.Marker({ color: markerColor })
          .setLngLat(fuzzyCoords)
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(
              `<div style="font-family: monospace; font-size: 11px; color: #09090b; padding: 6px; max-width: 240px;">
                <div style="font-weight: 900; color: ${isDecoupled ? "#059669" : "#d97706"}; font-size: 9px; margin-bottom: 3px;">${signalBadge}</div>
                <strong style="font-size: 12px;">${d.title}</strong><br/>
                <span style="color:#0284c7; font-weight: bold;">📍 ${d.location}</span>
              </div>`
            )
          )
          .addTo(map);

        marker.getElement().addEventListener("click", () => onSelectDispatch(d));
      });

      mapInstanceRef.current = map;
    };

    init().catch((err) => console.warn("MapLibre load:", err));

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [dispatches, mapSignalFilter, mapRegionPreset, isDispatchAnonOrDecoupled, onSelectDispatch]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full h-[min(70vh,520px)] rounded-xl border overflow-hidden ${
        isDark ? "border-zinc-800" : "border-zinc-300"
      }`}
    />
  );
};
