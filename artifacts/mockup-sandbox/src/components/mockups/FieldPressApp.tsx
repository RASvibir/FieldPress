import React, { useState, useEffect, useRef } from "react";
import { Map as MapLibreMap, NavigationControl, Marker } from "maplibre-gl";
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
  Sun,
  Moon,
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

const MAP_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/liberty",
};

export const FieldPressApp: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [dispatches, setDispatches] = useState<DispatchItem[]>(INITIAL_DISPATCHES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "feed" | "map">("split");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const isInitialMount = useRef(true);

  const activeItem = dispatches.find((d) => d.id === selectedId) || null;

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: mapContainer.current,
      style: isDark ? MAP_STYLES.dark : MAP_STYLES.light,
      center: [-86.9, 39.5],
      zoom: 6.5,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Safely Update Map Style when Toggling Theme (skip on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(isDark ? MAP_STYLES.dark : MAP_STYLES.light);
  }, [isDark]);

  // 3. Render and Re-render Custom Pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const renderMarkers = () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      dispatches.forEach((item) => {
        const isSelected = item.id === selectedId;
        const el = document.createElement("div");
        el.className = "cursor-pointer flex items-center justify-center p-2 z-20";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <div class="h-3.5 w-3.5 rounded-full transition-all duration-150 ${
              isSelected
                ? "bg-amber-500 ring-4 ring-amber-500/40 scale-125 shadow-lg"
                : isDark
                ? "bg-zinc-100 ring-2 ring-zinc-950 hover:bg-amber-400 hover:scale-110"
                : "bg-zinc-800 ring-2 ring-white hover:bg-amber-500 hover:scale-110 shadow-sm"
            }"></div>
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedId(item.id);
        });

        const marker = new Marker({ element: el })
          .setLngLat(item.coordinates)
          .addTo(map);

        markersRef.current[item.id] = marker;
      });
    };

    if (map.isStyleLoaded()) {
      renderMarkers();
    } else {
      map.once("styledata", renderMarkers);
    }
  }, [dispatches, selectedId, isDark]);

  // 4. Pan to Selected Pin
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

  // 5. Global Keyboard Shortcuts
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
    <div
      className={`relative flex h-screen w-full overflow-hidden font-sans antialiased transition-colors duration-200 ${
        isDark ? "bg-zinc-950 text-zinc-100" : "bg-stone-100 text-zinc-900"
      }`}
    >
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md transition-colors ${
            isDark
              ? "border-zinc-800/80 bg-zinc-900/60"
              : "border-zinc-200/90 bg-white/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20" />
            <span className="font-mono text-xs font-semibold tracking-wider text-amber-500 uppercase">
              FieldPress
            </span>
            <span className={isDark ? "text-zinc-600" : "text-zinc-300"}>/</span>
            <span className={`text-xs font-medium ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
              Dispatch Canvas
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 shadow-xs"
              }`}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-zinc-700" />}
            </button>

            {/* View Mode Switcher */}
            <div
              className={`flex items-center rounded-lg border p-0.5 ${
                isDark ? "border-zinc-800 bg-zinc-900/80" : "border-zinc-200 bg-zinc-100"
              }`}
            >
              <button
                onClick={() => setViewMode("feed")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "feed"
                    ? isDark
                      ? "bg-zinc-800 text-zinc-100"
                      : "bg-white text-zinc-900 shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Feed</span>
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`hidden md:flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "split"
                    ? isDark
                      ? "bg-zinc-800 text-zinc-100"
                      : "bg-white text-zinc-900 shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                  viewMode === "map"
                    ? isDark
                      ? "bg-zinc-800 text-zinc-100"
                      : "bg-white text-zinc-900 shadow-xs"
                    : isDark
                    ? "text-zinc-400 hover:text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="relative flex flex-1 overflow-hidden">
          {/* Feed Column */}
          <section
            className={`flex flex-col border-r transition-all duration-200 ${
              isDark
                ? "border-zinc-800/80 bg-zinc-950"
                : "border-zinc-200/90 bg-stone-50"
            } ${
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
                        ? isDark
                          ? "border-amber-500/80 bg-zinc-900 shadow-md"
                          : "border-amber-500 bg-white shadow-md ring-1 ring-amber-500/30"
                        : isDark
                        ? "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/80"
                        : "border-zinc-200 bg-white/80 hover:border-zinc-300 hover:bg-white shadow-2xs"
                    }`}
                  >
                    <div
                      className={`mb-1 flex items-center justify-between font-mono text-[11px] ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className={isDark ? "text-zinc-300" : "text-zinc-700 font-medium"}>
                          {item.locationName}
                        </span>
                      </div>
                      <span className="shrink-0">{item.timestamp}</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm font-medium transition-colors ${
                          isDark
                            ? "text-zinc-100 group-hover:text-amber-400"
                            : "text-zinc-900 group-hover:text-amber-600"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <ArrowUpRight
                        className={`h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition ${
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Map Column */}
          <section
            className={`relative flex-1 overflow-hidden ${
              isDark ? "bg-zinc-950" : "bg-stone-200"
            } ${viewMode === "feed" ? "hidden" : "block"}`}
          >
            <div ref={mapContainer} className="h-full w-full" />
            <div
              className={`pointer-events-none absolute top-3 left-3 rounded-md border px-2.5 py-1 backdrop-blur-md shadow-xs ${
                isDark
                  ? "border-zinc-800/80 bg-zinc-950/70 text-zinc-400"
                  : "border-zinc-200 bg-white/80 text-zinc-700"
              }`}
            >
              <span className="font-mono text-[11px]">
                ACTIVE NODES:{" "}
                <strong className={isDark ? "text-zinc-100" : "text-zinc-900"}>
                  {dispatches.length}
                </strong>
              </span>
            </div>
          </section>

          {/* Slide-Over Drawer */}
          {activeItem && (
            <aside
              className={`absolute inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l shadow-2xl backdrop-blur-md ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/95"
                  : "border-zinc-200 bg-white/95"
              }`}
            >
              <header
                className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${
                  isDark ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden font-mono text-xs">
                  <span className="text-amber-500 uppercase font-semibold">TELEMETRY</span>
                  <ChevronRight className={`h-3 w-3 ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
                  <span className={isDark ? "text-zinc-400 truncate" : "text-zinc-500 truncate"}>
                    {activeItem.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className={`rounded-md p-1.5 transition ${
                    isDark
                      ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <h2 className={`text-base font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                    {activeItem.title}
                  </h2>
                  <div
                    className={`mt-1 flex items-center gap-2 font-mono text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <span>{activeItem.locationName}</span>
                    <span>·</span>
                    <span>
                      {activeItem.coordinates.toFixed(4)}, {activeItem.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-lg border p-3.5 text-sm leading-relaxed ${
                    isDark
                      ? "border-zinc-800 bg-zinc-950/60 text-zinc-300"
                      : "border-zinc-200 bg-stone-50 text-zinc-700"
                  }`}
                >
                  {activeItem.summary}
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div
                    className={`rounded border p-2 ${
                      isDark
                        ? "border-zinc-800/80 bg-zinc-950/40"
                        : "border-zinc-200 bg-stone-50"
                    }`}
                  >
                    <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>OPERATOR</span>
                    <p className={`mt-0.5 ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                      {activeItem.operator}
                    </p>
                  </div>
                  <div
                    className={`rounded border p-2 ${
                      isDark
                        ? "border-zinc-800/80 bg-zinc-950/40"
                        : "border-zinc-200 bg-stone-50"
                    }`}
                  >
                    <span className={isDark ? "text-zinc-500" : "text-zinc-400"}>STATUS</span>
                    <p className="mt-0.5 text-amber-500 font-semibold uppercase">
                      {activeItem.status}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </main>
      </div>

      {/* Action Dock */}
      <nav
        className={`fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border p-1.5 shadow-2xl backdrop-blur-md transition-colors ${
          isDark
            ? "border-zinc-800/90 bg-zinc-950/80"
            : "border-zinc-300/80 bg-white/90 shadow-md"
        }`}
      >
        <button
          onClick={handleCreateDispatch}
          className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Dispatch</span>
        </button>

        <div className={`h-4 w-px ${isDark ? "bg-zinc-800" : "bg-zinc-200"}`} />

        <button
          onClick={() => setIsPaletteOpen(true)}
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition ${
            isDark
              ? "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Search</span>
          <kbd
            className={`hidden sm:inline-block rounded border px-1 font-mono text-[10px] ${
              isDark
                ? "border-zinc-800 bg-zinc-900 text-zinc-500"
                : "border-zinc-200 bg-zinc-100 text-zinc-600"
            }`}
          >
            ⌘K
          </kbd>
        </button>

        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo({ center: [-86.9, 39.5], zoom: 6.5 });
            }
          }}
          className={`rounded-full p-1.5 transition ${
            isDark
              ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
          title="Reset Corridor View"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </nav>

      {/* Command Palette */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-20 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl ${
              isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center border-b px-3.5 ${
                isDark ? "border-zinc-800" : "border-zinc-200"
              }`}
            >
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                autoFocus
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                placeholder="Jump to corridor, action, or theme..."
                className={`h-11 w-full bg-transparent px-2.5 text-sm focus:outline-hidden ${
                  isDark
                    ? "text-zinc-100 placeholder-zinc-500"
                    : "text-zinc-900 placeholder-zinc-400"
                }`}
              />
              <kbd
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                  isDark
                    ? "border-zinc-800 bg-zinc-950 text-zinc-400"
                    : "border-zinc-200 bg-zinc-100 text-zinc-500"
                }`}
              >
                ESC
              </kbd>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              <div
                className={`px-2 py-1 font-mono text-[10px] font-medium uppercase ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                System Commands
              </div>
              <button
                onClick={() => {
                  setIsDark(!isDark);
                  setIsPaletteOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                  isDark
                    ? "text-zinc-200 hover:bg-zinc-800"
                    : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-zinc-600" />}
                  <span>Toggle Theme ({isDark ? "Switch to Light" : "Switch to Dark"})</span>
                </div>
              </button>

              <div
                className={`px-2 pt-2 py-1 font-mono text-[10px] font-medium uppercase ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
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
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                    isDark
                      ? "text-zinc-200 hover:bg-zinc-800"
                      : "text-zinc-800 hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <span>{corridor.name}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] ${
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
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
