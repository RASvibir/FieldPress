import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapPin,
  ArrowUpRight,
  Search,
  Plus,
  Crosshair,
  Columns,
  Map as MapIcon,
  List,
  X,
  ChevronRight,
} from "lucide-react";

export interface DispatchItem {
  id: string;
  title: string;
  locationName: string;
  coordinates: [number, number];
  timestamp: string;
  category: "recon" | "logistics" | "relay" | "status";
  summary: string;
  operator: string;
  status: "active" | "archived" | "standby";
}

const CORRIDOR_PRESETS = [
  { name: "Danville, IL", coords: [-87.6306, 40.1245] as [number, number] },
  { name: "Indianapolis, IN", coords: [-86.1581, 39.7684] as [number, number] },
  { name: "Evansville, IN", coords: [-87.5711, 37.9716] as [number, number] },
  { name: "Chicago, IL", coords: [-87.6298, 41.8781] as [number, number] },
];

const INITIAL_DISPATCHES: DispatchItem[] = [
  {
    id: "fp-101",
    title: "Corridor Influx Telemetry Point",
    locationName: "Danville Sector 3",
    coordinates: [-87.6306, 40.1245],
    timestamp: "10m ago",
    category: "relay",
    summary: "Active signal verification across western corridor relay station. Signal stable.",
    operator: "Node-4",
    status: "active",
  },
  {
    id: "fp-102",
    title: "Sub-hub Transit Logistics Log",
    locationName: "Indianapolis Central",
    coordinates: [-86.1581, 39.7684],
    timestamp: "42m ago",
    category: "logistics",
    summary: "Freight and data manifest handoff logged. Clearance confirmed for route 7.",
    operator: "Transit-Alpha",
    status: "standby",
  },
  {
    id: "fp-103",
    title: "Southern River Node Sweep",
    locationName: "Evansville Depot",
    coordinates: [-87.5711, 37.9716],
    timestamp: "1h ago",
    category: "recon",
    summary: "Telemetry check on boundary sensors completed. Zero abnormal spikes detected.",
    operator: "Scout-09",
    status: "active",
  },
];

const DARK_MATTER_STYLE = {
  version: 8 as const,
  sources: {
    "carto-dark": {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap &copy; CARTO",
    },
  },
  layers: [
    {
      id: "carto-dark-layer",
      type: "raster" as const,
      source: "carto-dark",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const FieldPressApp: React.FC = () => {
  const [dispatches, setDispatches] = useState<DispatchItem[]>(INITIAL_DISPATCHES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "feed" | "map">("split");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});

  const activeItem = dispatches.find((d) => d.id === selectedId) || null;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: DARK_MATTER_STYLE,
      center: [-86.9, 39.5],
      zoom: 6.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    dispatches.forEach((item) => {
      const isSelected = item.id === selectedId;
      const el = document.createElement("div");
      el.className = "cursor-pointer flex items-center justify-center p-2";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="h-3 w-3 rounded-full transition-all duration-150 ${
            isSelected
              ? "bg-amber-400 ring-4 ring-amber-500/40 scale-125"
              : "bg-zinc-200 ring-2 ring-zinc-950 hover:bg-amber-400 hover:scale-110"
          }"></div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedId(item.id);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(item.coordinates)
        .addTo(map);

      markersRef.current[item.id] = marker;
    });
  }, [dispatches, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const target = dispatches.find((d) => d.id === selectedId);
    if (target) {
      map.flyTo({
        center: target.coordinates,
        zoom: Math.max(map.getZoom(), 10),
        speed: 1.2,
        essential: true,
      });
    }
  }, [selectedId, dispatches]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsPaletteOpen(false);
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateDispatch = () => {
    const newId = `fp-${Date.now().toString().slice(-4)}`;
    const newItem: DispatchItem = {
      id: newId,
      title: `Field Log #${newId.slice(-3)}`,
      locationName: "Local Grid Sector",
      coordinates: [-86.1581 + (Math.random() - 0.5) * 0.5, 39.7684 + (Math.random() - 0.5) * 0.5],
      timestamp: "Just now",
      category: "status",
      summary: "Manual entry generated via FieldPress action dock.",
      operator: "Field-Op",
      status: "active",
    };
    setDispatches([newItem, ...dispatches]);
    setSelectedId(newItem.id);
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased">
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 px-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span className="font-mono text-xs font-semibold tracking-wider text-amber-500 uppercase">
              FieldPress
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-medium text-zinc-300">Dispatch Canvas</span>
          </div>

          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900/80 p-0.5">
            <button
              onClick={() => setViewMode("feed")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "feed" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Feed</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`hidden md:flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "split" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                viewMode === "map" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </header>

        <main className="relative flex flex-1 overflow-hidden">
          <section
            className={`flex flex-col border-r border-zinc-800/80 bg-zinc-950 transition-all duration-200 ${
              viewMode === "feed"
                ? "w-full"
                : viewMode === "map"
                ? "hidden"
                : "w-full md:w-[420px] lg:w-[480px]"
            }`}
          >
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 pb-24">
              {dispatches.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <article
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`group cursor-pointer rounded-lg border p-3 transition duration-150 ${
                      isSelected
                        ? "border-amber-500/80 bg-zinc-900 shadow-md"
                        : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between font-mono text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate text-zinc-300">{item.locationName}</span>
                      </div>
                      <span className="shrink-0 text-zinc-500">{item.timestamp}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h4>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-zinc-600 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            className={`relative flex-1 bg-zinc-950 overflow-hidden ${
              viewMode === "feed" ? "hidden" : "block"
            }`}
          >
            <div ref={mapContainer} className="h-full w-full" />
            <div className="pointer-events-none absolute top-3 left-3 rounded-md border border-zinc-800/80 bg-zinc-950/70 px-2.5 py-1 backdrop-blur-md">
              <span className="font-mono text-[11px] text-zinc-400">
                ACTIVE NODES: <strong className="text-zinc-100">{dispatches.length}</strong>
              </span>
            </div>
          </section>

          {activeItem && (
            <aside className="absolute inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-900/95 shadow-2xl backdrop-blur-md">
              <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
                <div className="flex items-center gap-2 overflow-hidden font-mono text-xs">
                  <span className="text-amber-500 uppercase">TELEMETRY</span>
                  <ChevronRight className="h-3 w-3 text-zinc-600" />
                  <span className="text-zinc-400 truncate">{activeItem.id}</span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">{activeItem.title}</h2>
                  <div className="mt-1 flex items-center gap-2 font-mono text-xs text-zinc-400">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <span>{activeItem.locationName}</span>
                    <span>·</span>
                    <span className="text-zinc-500">
                      {activeItem.coordinates.toFixed(4)}, {activeItem.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 text-sm text-zinc-300 leading-relaxed">
                  {activeItem.summary}
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="rounded border border-zinc-800/80 bg-zinc-950/40 p-2">
                    <span className="text-zinc-500">OPERATOR</span>
                    <p className="mt-0.5 text-zinc-200">{activeItem.operator}</p>
                  </div>
                  <div className="rounded border border-zinc-800/80 bg-zinc-950/40 p-2">
                    <span className="text-zinc-500">STATUS</span>
                    <p className="mt-0.5 text-amber-400 uppercase">{activeItem.status}</p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>

      <nav className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-zinc-800/90 bg-zinc-950/80 p-1.5 shadow-2xl backdrop-blur-md">
        <button
          onClick={handleCreateDispatch}
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Dispatch</span>
        </button>

        <div className="h-4 w-px bg-zinc-800" />

        <button
          onClick={() => setIsPaletteOpen(true)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition"
        >
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-block rounded border border-zinc-800 bg-zinc-900 px-1 font-mono text-[10px] text-zinc-500">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo({ center: [-86.9, 39.5], zoom: 6.5 });
            }
          }}
          className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition"
          title="Reset Corridor View"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </nav>

      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl">
            <div className="flex items-center border-b border-zinc-800 px-3.5">
              <Search className="h-4 w-4 text-zinc-500" />
              <input
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Jump to corridor or command..."
                className="h-11 w-full bg-transparent px-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-hidden"
              />
              <kbd className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                ESC
              </kbd>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              <div className="px-2 py-1 font-mono text-[10px] font-medium text-zinc-500 uppercase">
                Geographic Presets
              </div>
              {CORRIDOR_PRESETS.filter((c) =>
                c.name.toLowerCase().includes(paletteQuery.toLowerCase())
              ).map((corridor) => (
                <button
                  key={corridor.name}
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.flyTo({ center: corridor.coords, zoom: 11 });
                    }
                    setIsPaletteOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <span>{corridor.name}</span>
                  </div>
                  <span className="font-mono text-zinc-500 text-[10px]">
                    {corridor.coords.toFixed(2)}, {corridor.coords[0].toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldPressApp;
