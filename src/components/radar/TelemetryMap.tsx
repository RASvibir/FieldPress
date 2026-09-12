import React, { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import * as maplibregl from "maplibre-gl";
import { Dispatch } from "../../types/dispatch";

interface TelemetryMapProps {
  dispatches: Dispatch[];
  setSelectedStory: (disp: Dispatch) => void;
  isDark: boolean;
  cardThemeClass: string;
  subTextThemeClass: string;
}

export const TelemetryMap: React.FC<TelemetryMapProps> = ({
  dispatches,
  setSelectedStory,
  isDark,
  cardThemeClass,
  subTextThemeClass
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      try {
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
          center: [-87.6298, 40.1245],
          zoom: 7.5
        });

        dispatches.forEach((d) => {
          if (d.coordinates) {
            const marker = new maplibregl.Marker({ color: "#f59e0b" })
              .setLngLat(d.coordinates)
              .setPopup(
                new maplibregl.Popup({ offset: 25 }).setHTML(
                  `<div style="font-family: monospace; font-size: 12px; color: #09090b; padding: 4px;">
                    <strong>${d.title}</strong><br/>
                    <span style="color:#d97706;">[${d.location}]</span> - ${d.author}
                  </div>`
                )
              )
              .addTo(map);

            marker.getElement().addEventListener("click", () => {
              setSelectedStory(d);
            });
          }
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.error("MapLibre init error", err);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, [dispatches, setSelectedStory]);

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${cardThemeClass}`}>
        <div className="flex items-center justify-between mb-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span className="font-bold">Active Telemetry Grid: Wabash Valley & Midwest Corridor</span>
          </div>
          <span className={subTextThemeClass}>MapLibre Vector Radar • Click markers to read dispatch</span>
        </div>
        <div
          ref={mapContainerRef}
          className={`w-full h-[540px] rounded-lg border overflow-hidden relative shadow-inner ${
            isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-300 bg-zinc-100"
          }`}
        />
      </div>
    </div>
  );
};
