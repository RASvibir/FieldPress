import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  Settings,
  User,
  Send,
  FolderLock,
  Sun,
  Moon,
  ShieldCheck,
  Radio,
  MapPin,
  RefreshCw,
  Save,
  Check,
  Share2,
  Bookmark,
  Sliders,
  Trash2
} from "lucide-react";
import * as maplibregl from "maplibre-gl";

interface PressPassData {
  name: string;
  callsign: string;
  role: string;
  bureau: string;
  badgeId: string;
  issueDate: string;
  accentColor: string;
  bio: string;
  pgpKey: string;
  contactSignal: string;
}

const DEFAULT_PRESS_PASS: PressPassData = {
  name: "Victor Birkle",
  callsign: "ras.ip",
  role: "Bureau Chief & Field Lead",
  bureau: "Midwest Corridor Dispatch",
  badgeId: "FP-8492-X",
  issueDate: "2026-2027",
  accentColor: "amber",
  bio: "Independent field journalist covering regional infrastructure, autonomous tech, and community affairs along the IL/IN corridor.",
  pgpKey: "4A8F 90B2 31CD E840 92F1",
  contactSignal: "@rasip.01"
};

interface Dispatch {
  id: string;
  title: string;
  category: string;
  author: string;
  callsign: string;
  bureau: string;
  timestamp: string;
  location: string;
  coordinates?: [number, number];
  content: string;
  isLead?: boolean;
  isPressRoll?: boolean;
}

const INITIAL_DISPATCHES: Dispatch[] = [
  {
    id: "d-1",
    title: "Regional Grid Resiliency: Autonomous Micro-Substations Go Live Across Wabash Valley",
    category: "Infrastructure",
    author: "Victor Birkle",
    callsign: "ras.ip",
    bureau: "Midwest Corridor",
    timestamp: "12m ago",
    location: "Danville, IL",
    coordinates: [-87.6298, 40.1245],
    content: "Local cooperative power authorities today commissioned three self-healing modular distribution nodes along the central rail corridor, securing redundant municipal telemetry against severe autumn weather fronts.",
    isLead: true
  },
  {
    id: "d-2",
    title: "County Open Data Initiative Publishes Full Historical Drainage & Watershed Maps",
    category: "Civic Wire",
    author: "Elena Rostova",
    callsign: "elena.wire",
    bureau: "Tippecanoe Desk",
    timestamp: "48m ago",
    location: "Lafayette, IN",
    coordinates: [-86.8753, 40.4173],
    content: "Over 80 years of high-resolution watershed topographical surveys were digitized and released under public domain archives this morning, opening critical environmental data to citizen hydrologists."
  },
  {
    id: "d-3",
    title: "Independent Transit Co-op Tests Battery-Electric Shuttles on State Route 63",
    category: "Transit",
    author: "Marcus Vance",
    callsign: "mvance",
    bureau: "Wabash Valley",
    timestamp: "2h ago",
    location: "Covington, IN",
    coordinates: [-87.3928, 40.1406],
    content: "Early metrics from the 100-day freight and commuter corridor pilot show a 68% drop in fleet operating expenses, paving the way for expanded multi-county commuter routes next spring."
  },
  {
    id: "d-4",
    title: "Community Fiber Exchange Deploys Optical Splice Ring Across Vermilion County",
    category: "Telecom",
    author: "Victor Birkle",
    callsign: "ras.ip",
    bureau: "Midwest Corridor",
    timestamp: "4h ago",
    location: "Catlin, IL",
    coordinates: [-87.7056, 40.0664],
    content: "A volunteer-backed telecommunications collective has completed the final segment of a 40-mile dark fiber loop connecting municipal emergency shelters and public library networks."
  }
];

export const FieldPressMaster: React.FC = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [watermarkVisible, setWatermarkVisible] = useState(true);

  const [activeTab, setActiveTab] = useState<"edition" | "wire" | "map" | "classifieds">("edition");
  const [showPressPassModal, setShowPressPassModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const [pressPass, setPressPass] = useState<PressPassData>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_press_pass");
      return saved ? JSON.parse(saved) : DEFAULT_PRESS_PASS;
    } catch {
      return DEFAULT_PRESS_PASS;
    }
  });

  const [editPassForm, setEditPassForm] = useState<PressPassData>(pressPass);
  const [savedSuccessToast, setSavedSuccessToast] = useState("");

  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_dispatches");
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [pressRoll, setPressRoll] = useState<Dispatch[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_pressroll");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Field Dispatch");
  const [newLocation, setNewLocation] = useState("Midwest Corridor");
  const [newContent, setNewContent] = useState("");

  const [autoRefreshInterval, setAutoRefreshInterval] = useState("30s");
  const [defaultBeat, setDefaultBeat] = useState("Midwest Corridor (IL / IN)");
  const [offlineCacheEnabled, setOfflineCacheEnabled] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  const savePass = (newData: PressPassData) => {
    setPressPass(newData);
    try {
      localStorage.setItem("fieldpress_press_pass", JSON.stringify(newData));
    } catch {}
    setSavedSuccessToast("Press Pass credentials updated.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const handlePublish = (e: React.FormEvent, isPressRollOnly = false) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: Dispatch = {
      id: `disp-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      author: pressPass.name,
      callsign: pressPass.callsign,
      bureau: pressPass.bureau,
      timestamp: "Just now",
      location: newLocation.trim() || "Field Beat",
      content: newContent.trim(),
      isPressRoll: isPressRollOnly
    };

    if (isPressRollOnly) {
      const updated = [item, ...pressRoll];
      setPressRoll(updated);
      try {
        localStorage.setItem("fieldpress_pressroll", JSON.stringify(updated));
      } catch {}
      setSavedSuccessToast("Staged to Press Roll queue.");
    } else {
      const updated = [item, ...dispatches];
      setDispatches(updated);
      try {
        localStorage.setItem("fieldpress_dispatches", JSON.stringify(updated));
      } catch {}
      setSavedSuccessToast("Dispatch published to live feed.");
    }

    setNewTitle("");
    setNewContent("");
    setShowPublishModal(false);
    setTimeout(() => setSavedSuccessToast(""), 3500);
  };

  useEffect(() => {
    if (activeTab === "map" && mapContainerRef.current && !mapInstanceRef.current) {
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
            new maplibregl.Marker({ color: "#f59e0b" })
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
          }
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn("MapLibre initialization fallback:", err);
      }
    }

    return () => {
      if (activeTab !== "map" && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, dispatches]);

  const getAccentColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          bar: "bg-emerald-500",
          text: "text-emerald-400",
          border: "border-emerald-500/50",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        };
      case "cyan":
        return {
          bar: "bg-cyan-500",
          text: "text-cyan-400",
          border: "border-cyan-500/50",
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
        };
      case "rose":
        return {
          bar: "bg-rose-500",
          text: "text-rose-400",
          border: "border-rose-500/50",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/30"
        };
      case "zinc":
        return {
          bar: "bg-zinc-400",
          text: "text-zinc-300",
          border: "border-zinc-500/50",
          badge: "bg-zinc-800 text-zinc-300 border-zinc-600"
        };
      case "amber":
      default:
        return {
          bar: "bg-amber-500",
          text: "text-amber-400",
          border: "border-amber-500/50",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30"
        };
    }
  };

  const currentAccent = getAccentColorClasses(pressPass.accentColor);

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-200 ${
      theme === "dark" ? "bg-zinc-950 text-zinc-100" : "bg-zinc-100 text-zinc-900"
    }`}>

      {/* 1. BACKGROUND WATERMARK */}
      {watermarkVisible && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.035] select-none"
        >
          <div className="transform -rotate-12 flex flex-col items-center">
            <span className={`font-mono text-[14vw] font-black tracking-widest uppercase leading-none ${
              theme === "dark" ? "text-zinc-100" : "text-zinc-900"
            }`}>
              FIELDPRESS
            </span>
            <span className={`font-mono text-sm sm:text-lg md:text-xl tracking-[0.45em] font-bold mt-2 ${
              theme === "dark" ? "text-zinc-300" : "text-zinc-700"
            }`}>
              VERIFIED INDEPENDENT DISPATCH
            </span>
          </div>
        </div>
      )}

      {/* 2. TOAST NOTIFICATION */}
      {savedSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-amber-500 text-zinc-950 font-mono text-xs font-bold px-4 py-2.5 rounded shadow-lg border border-amber-300 animate-bounce">
          <Check className="h-4 w-4" />
          <span>{savedSuccessToast}</span>
        </div>
      )}

      {/* 3. MAIN HEADER BAR */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        theme === "dark" 
          ? "bg-zinc-950/90 border-zinc-800/80" 
          : "bg-zinc-50/90 border-zinc-200/80"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Logo Header Lockup: FP_* FieldPress */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("edition")}
              className="flex items-center gap-1 font-mono text-base font-bold tracking-tight select-none hover:opacity-85 transition group"
            >
              <span className="text-amber-500 font-extrabold text-lg">FP_</span>
              <img
                src="/favicon.ico"
                alt="*"
                className="h-4 w-4 inline-block object-contain group-hover:rotate-12 transition-transform"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fallback = document.getElementById("pressie-fallback-header");
                  if (fallback) fallback.style.display = "inline-flex";
                }}
              />
              <span
                id="pressie-fallback-header"
                style={{ display: "none" }}
                className="text-amber-400 font-black text-sm"
              >
                ★
              </span>
              <span className={`font-sans tracking-wide font-extrabold ml-0.5 text-base ${
                theme === "dark" ? "text-zinc-100" : "text-zinc-900"
              }`}>
                FieldPress
              </span>
            </button>

            <span className={`hidden md:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded border ${
              theme === "dark" ? "bg-zinc-900 text-zinc-400 border-zinc-800" : "bg-zinc-200 text-zinc-600 border-zinc-300"
            }`}>
              Desk Workstation
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden sm:flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab("edition")}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === "edition"
                  ? theme === "dark"
                    ? "bg-zinc-800 text-amber-400 font-semibold shadow-sm"
                    : "bg-zinc-200 text-amber-600 font-semibold shadow-sm"
                  : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Edition
            </button>
            <button
              onClick={() => setActiveTab("wire")}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === "wire"
                  ? theme === "dark"
                    ? "bg-zinc-800 text-amber-400 font-semibold shadow-sm"
                    : "bg-zinc-200 text-amber-600 font-semibold shadow-sm"
                  : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Live Wire
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === "map"
                  ? theme === "dark"
                    ? "bg-zinc-800 text-amber-400 font-semibold shadow-sm"
                    : "bg-zinc-200 text-amber-600 font-semibold shadow-sm"
                  : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Beat Map
            </button>
            <button
              onClick={() => setActiveTab("classifieds")}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === "classifieds"
                  ? theme === "dark"
                    ? "bg-zinc-800 text-amber-400 font-semibold shadow-sm"
                    : "bg-zinc-200 text-amber-600 font-semibold shadow-sm"
                  : theme === "dark" ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Classifieds
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            
            {/* Dispatch Button */}
            <button
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow-sm transition"
              title="Compose Dispatch or Press Roll"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dispatch</span>
            </button>

            {/* Dynamic Press Pass Badge Trigger */}
            <button
              onClick={() => {
                setEditPassForm(pressPass);
                setShowPressPassModal(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono transition ${currentAccent.badge} hover:brightness-110`}
              title="Open Press Pass Customizer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden md:inline font-bold">PASS:</span>
              <span>{pressPass.callsign}</span>
            </button>

            {/* Profile Trigger */}
            <button
              onClick={() => setShowProfileModal(true)}
              className={`p-2 rounded border transition ${
                theme === "dark"
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
              title="User Profile"
            >
              <User className="h-4 w-4" />
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setShowSettingsDrawer(true)}
              className={`p-2 rounded border transition ${
                theme === "dark"
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
              title="Workstation Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded border transition ${
                theme === "dark"
                  ? "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-amber-400"
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-amber-600"
              }`}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 4. MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Edition Subheader */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-zinc-800/60 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-xl sm:text-2xl font-black uppercase tracking-tight">
                {activeTab === "edition" && "Daily Broadsheet Edition"}
                {activeTab === "wire" && "Live Dispatch Wire"}
                {activeTab === "map" && "Geospatial Beat Radar"}
                {activeTab === "classifieds" && "Community Classifieds Wire"}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE
              </span>
            </div>
            <p className={`font-mono text-xs mt-0.5 ${theme === "dark" ? "text-zinc-400" : "text-zinc-600"}`}>
              Bureau: <span className="text-amber-500 font-semibold">{pressPass.bureau}</span> • Verified Feed • Synchronized
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pressRoll.length > 0 && (
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-zinc-800/80 text-amber-400 border border-zinc-700/50 flex items-center gap-1.5">
                <FolderLock className="h-3.5 w-3.5" />
                <span>{pressRoll.length} in Press Roll</span>
              </span>
            )}
            <button
              onClick={() => {
                setSavedSuccessToast("Feeds refreshed from edge gateway.");
                setTimeout(() => setSavedSuccessToast(""), 2500);
              }}
              className={`p-1.5 rounded border font-mono text-xs flex items-center gap-1.5 transition ${
                theme === "dark" 
                  ? "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200" 
                  : "border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* TAB 1: EDITION (BROADSHEET) */}
        {activeTab === "edition" && (
          <div className="space-y-8">
            {dispatches[0] && (
              <div className={`p-6 sm:p-8 rounded-lg border relative overflow-hidden transition ${
                theme === "dark" ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
              }`}>
                <div className="flex items-center gap-2 font-mono text-xs mb-3">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 uppercase tracking-wider text-[10px]">
                    {dispatches[0].category}
                  </span>
                  <span className={theme === "dark" ? "text-zinc-500" : "text-zinc-400"}>•</span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    <MapPin className="h-3 w-3 text-amber-500" /> {dispatches[0].location}
                  </span>
                  <span className={theme === "dark" ? "text-zinc-500" : "text-zinc-400"}>•</span>
                  <span className="text-zinc-500">{dispatches[0].timestamp}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 leading-snug">
                  {dispatches[0].title}
                </h2>

                <p className={`text-sm sm:text-base leading-relaxed max-w-4xl ${
                  theme === "dark" ? "text-zinc-300" : "text-zinc-700"
                }`}>
                  {dispatches[0].content}
                </p>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">By</span>
                    <span className="font-bold text-zinc-200">{dispatches[0].author}</span>
                    <span className="text-amber-500">(@{dispatches[0].callsign})</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-500">
                    <button className="hover:text-amber-400 transition flex items-center gap-1">
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                    <button className="hover:text-amber-400 transition flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5" /> Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dispatches.slice(1).map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-lg border flex flex-col justify-between transition hover:border-zinc-700 ${
                    theme === "dark" ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] mb-2 text-zinc-400">
                      <span className="text-amber-500 font-semibold">{item.category}</span>
                      <span>{item.timestamp}</span>
                    </div>

                    <h3 className="font-bold text-base leading-snug mb-2.5">
                      {item.title}
                    </h3>

                    <p className={`text-xs leading-relaxed line-clamp-4 ${
                      theme === "dark" ? "text-zinc-400" : "text-zinc-600"
                    }`}>
                      {item.content}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-zinc-400" /> {item.location}
                    </span>
                    <span className="text-zinc-400 font-semibold">{item.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE WIRE */}
        {activeTab === "wire" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-zinc-400">
                Streaming live dispatches from field bureaus
              </span>
              <span className="font-mono text-xs text-amber-500 font-bold">
                {dispatches.length} Entries Active
              </span>
            </div>

            {dispatches.map((disp) => (
              <div
                key={disp.id}
                className={`p-5 rounded-lg border flex flex-col gap-2 transition ${
                  theme === "dark" ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-[10px] uppercase">
                      {disp.category}
                    </span>
                    <span className="text-zinc-400">{disp.bureau}</span>
                  </div>
                  <span className="text-zinc-500">{disp.timestamp}</span>
                </div>

                <h3 className="font-bold text-lg">{disp.title}</h3>
                <p className={`text-sm leading-relaxed ${theme === "dark" ? "text-zinc-300" : "text-zinc-700"}`}>
                  {disp.content}
                </p>

                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-800/50 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" /> {disp.location}
                  </span>
                  <span>By {disp.author} (@{disp.callsign})</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BEAT MAP */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
              <span>Interactive MapLibre Vector Beat Radar</span>
              <span className="text-amber-500">Center: Wabash Valley Corridor</span>
            </div>

            <div 
              ref={mapContainerRef} 
              className="w-full h-[600px] rounded-lg border border-zinc-800 overflow-hidden relative shadow-inner bg-zinc-900"
            >
              <div className="absolute top-4 left-4 z-10 bg-zinc-950/90 border border-zinc-800 p-3 rounded font-mono text-xs space-y-1 shadow-lg backdrop-blur">
                <div className="font-bold text-amber-400">FIELDPRESS BEAT RADAR</div>
                <div className="text-zinc-400">Showing active localized dispatches</div>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="text-zinc-200">Verified Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CLASSIFIEDS */}
        {activeTab === "classifieds" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 rounded-lg border ${
              theme === "dark" ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
            }`}>
              <h2 className="font-mono text-lg font-bold mb-2">Community Classifieds & Notices</h2>
              <p className="text-xs text-zinc-400 font-mono mb-4">
                Public bulletin board for regional initiatives, co-op notices, and citizen requests.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded border border-zinc-800 bg-zinc-950/40">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">NOTICE</span>
                  <h4 className="font-bold text-sm mt-2">Municipal Solar Siting Public Hearing</h4>
                  <p className="text-xs text-zinc-400 mt-1">County Board Room B • Sep 18, 6:00 PM</p>
                </div>
                <div className="p-4 rounded border border-zinc-800 bg-zinc-950/40">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">EQUIPMENT</span>
                  <h4 className="font-bold text-sm mt-2">Mobile Broadcast Transceiver Testing</h4>
                  <p className="text-xs text-zinc-400 mt-1">Volunteer field operators wanted for packet radio check-in.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. PRESS PASS CUSTOMIZER MODAL */}
      {showPressPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-xl border p-6 shadow-2xl transition ${
            theme === "dark" ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 font-mono">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-base">Press Pass Credential & Customizer</h3>
              </div>
              <button 
                onClick={() => setShowPressPassModal(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-6 flex flex-col items-center">
              <div 
                className={`w-full max-w-md rounded-xl border-2 p-5 relative overflow-hidden shadow-2xl transition-all duration-300 ${
                  currentAccent.border
                } ${theme === "dark" ? "bg-zinc-950" : "bg-zinc-50"}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-2.5 ${currentAccent.bar}`} />

                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 pt-1">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-tight">
                    <span className="text-amber-500">FP_</span>
                    <span className="font-bold text-zinc-100">FIELDPRESS</span>
                    <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 ml-1">PRESS CORPS</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-zinc-500 tracking-wider">
                    {editPassForm.badgeId}
                  </span>
                </div>

                <div className="flex gap-4 my-4 items-center">
                  <div className={`w-20 h-24 rounded border flex flex-col items-center justify-center relative overflow-hidden ${
                    theme === "dark" ? "bg-zinc-900 border-zinc-700" : "bg-zinc-200 border-zinc-300"
                  }`}>
                    <User className="h-10 w-10 text-zinc-400" />
                    <span className="font-mono text-[9px] text-zinc-500 mt-1 uppercase font-bold">VERIFIED</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                      ISSUED CREDENTIAL
                    </div>
                    <div className="font-extrabold text-lg leading-tight">
                      {editPassForm.name || "Reporter Name"}
                    </div>
                    <div className="font-mono text-xs text-amber-500 font-bold">
                      @{editPassForm.callsign || "callsign"}
                    </div>
                    <div className="font-mono text-xs text-zinc-400 pt-0.5">
                      {editPassForm.role}
                    </div>
                    <div className="font-mono text-[11px] text-zinc-500">
                      {editPassForm.bureau}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-zinc-500">VALID: {editPassForm.issueDate}</span>
                  <span className={`px-2 py-0.5 rounded font-black tracking-widest text-[9px] uppercase ${currentAccent.badge}`}>
                    ACTIVE CREDENTIAL
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              savePass(editPassForm);
              setShowPressPassModal(false);
            }} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Full Byline Name</label>
                  <input
                    type="text"
                    value={editPassForm.name}
                    onChange={(e) => setEditPassForm({ ...editPassForm, name: e.target.value })}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Reporter Callsign (@handle)</label>
                  <input
                    type="text"
                    value={editPassForm.callsign}
                    onChange={(e) => setEditPassForm({ ...editPassForm, callsign: e.target.value })}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Role / Clearance Level</label>
                  <select
                    value={editPassForm.role}
                    onChange={(e) => setEditPassForm({ ...editPassForm, role: e.target.value })}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bureau Chief & Field Lead">Bureau Chief & Field Lead</option>
                    <option value="Senior Investigative Correspondent">Senior Investigative Correspondent</option>
                    <option value="Field Reporter & Photographer">Field Reporter & Photographer</option>
                    <option value="Independent Wire Dispatcher">Independent Wire Dispatcher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Bureau / Outlet Affiliation</label>
                  <input
                    type="text"
                    value={editPassForm.bureau}
                    onChange={(e) => setEditPassForm({ ...editPassForm, bureau: e.target.value })}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-2">Badge Accent Trim</label>
                <div className="flex items-center gap-3">
                  {[
                    { id: "amber", label: "Amber Gold", class: "bg-amber-500" },
                    { id: "emerald", label: "Emerald Press", class: "bg-emerald-500" },
                    { id: "cyan", label: "Cyber Cyan", class: "bg-cyan-500" },
                    { id: "rose", label: "Wire Crimson", class: "bg-rose-500" },
                    { id: "zinc", label: "Monoprint", class: "bg-zinc-400" }
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setEditPassForm({ ...editPassForm, accentColor: col.id })}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] transition ${
                        editPassForm.accentColor === col.id
                          ? "border-white bg-zinc-800 text-white font-bold"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${col.class}`} />
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPressPassModal(false)}
                  className="px-4 py-2 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Save & Update Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. USER PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-xl border p-6 shadow-2xl transition ${
            theme === "dark" ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 font-mono">
                <User className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-base">Reporter Profile & Fingerprint</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-5 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-amber-500 flex items-center justify-center font-bold text-amber-400 text-xl">
                  {pressPass.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-zinc-100">{pressPass.name}</h4>
                  <p className="text-amber-500 font-bold">@{pressPass.callsign}</p>
                  <p className="text-zinc-400 text-[11px]">{pressPass.role} • {pressPass.bureau}</p>
                </div>
              </div>

              <div className="p-3.5 rounded bg-zinc-950/60 border border-zinc-800 space-y-2">
                <div className="text-zinc-500 font-bold uppercase text-[10px]">Contributor Bio</div>
                <p className="text-zinc-300 leading-relaxed">{pressPass.bio}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px] font-bold">PGP FINGERPRINT</div>
                  <div className="text-zinc-300 font-mono text-[11px] mt-1">{pressPass.pgpKey}</div>
                </div>
                <div className="p-3 rounded bg-zinc-950/60 border border-zinc-800">
                  <div className="text-zinc-500 text-[10px] font-bold">SECURE CHANNEL</div>
                  <div className="text-amber-400 font-mono text-[11px] mt-1">{pressPass.contactSignal}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-zinc-950/40 border border-zinc-800 text-[11px]">
                <span className="text-zinc-400">Total Published Dispatches:</span>
                <span className="font-bold text-amber-400">{dispatches.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  setShowPressPassModal(true);
                }}
                className="font-mono text-xs text-amber-500 hover:underline"
              >
                Edit Press Pass Details →
              </button>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SETTINGS DRAWER */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md h-full border-l p-6 shadow-2xl flex flex-col justify-between overflow-y-auto ${
            theme === "dark" ? "bg-zinc-950 border-zinc-800 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 font-mono">
                  <Sliders className="h-5 w-5 text-amber-500" />
                  <h3 className="font-bold text-base">Workstation Settings</h3>
                </div>
                <button 
                  onClick={() => setShowSettingsDrawer(false)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <h4 className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  Appearance & Watermark
                </h4>
                
                <div className="flex items-center justify-between p-3 rounded bg-zinc-900/60 border border-zinc-800">
                  <div>
                    <div className="font-bold">Interface Theme</div>
                    <div className="text-[11px] text-zinc-400">Toggle dark noir vs. light broadsheet</div>
                  </div>
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-amber-400 font-bold"
                  >
                    {theme.toUpperCase()}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-zinc-900/60 border border-zinc-800">
                  <div>
                    <div className="font-bold">Background Watermark</div>
                    <div className="text-[11px] text-zinc-400">FIELDPRESS canvas watermark</div>
                  </div>
                  <button
                    onClick={() => setWatermarkVisible(!watermarkVisible)}
                    className={`px-3 py-1.5 rounded border font-bold ${
                      watermarkVisible 
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                        : "bg-zinc-800 text-zinc-500 border-zinc-700"
                    }`}
                  >
                    {watermarkVisible ? "VISIBLE" : "HIDDEN"}
                  </button>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <h4 className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  Editorial & Beat Radar
                </h4>

                <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="font-bold">Default Beat Region</div>
                  <select
                    value={defaultBeat}
                    onChange={(e) => setDefaultBeat(e.target.value)}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 text-zinc-200 text-xs"
                  >
                    <option value="Midwest Corridor (IL / IN)">Midwest Corridor (IL / IN)</option>
                    <option value="Great Lakes Basin">Great Lakes Basin</option>
                    <option value="Appalachian Dispatch">Appalachian Dispatch</option>
                    <option value="National Wire Network">National Wire Network</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-zinc-900/60 border border-zinc-800">
                  <div>
                    <div className="font-bold">Feed Auto-Sync</div>
                    <div className="text-[11px] text-zinc-400">Polling interval for edge dispatches</div>
                  </div>
                  <select
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(e.target.value)}
                    className="rounded bg-zinc-950 border border-zinc-700 px-2 py-1 text-zinc-200 text-xs"
                  >
                    <option value="15s">15s (Realtime)</option>
                    <option value="30s">30s</option>
                    <option value="1m">1m</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <h4 className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  Field Storage & Cache
                </h4>

                <div className="flex items-center justify-between p-3 rounded bg-zinc-900/60 border border-zinc-800">
                  <div>
                    <div className="font-bold">Offline Staging Queue</div>
                    <div className="text-[11px] text-zinc-400">Cache drafts when network is degraded</div>
                  </div>
                  <button
                    onClick={() => setOfflineCacheEnabled(!offlineCacheEnabled)}
                    className={`px-3 py-1.5 rounded border font-bold ${
                      offlineCacheEnabled 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                        : "bg-zinc-800 text-zinc-500 border-zinc-700"
                    }`}
                  >
                    {offlineCacheEnabled ? "ENABLED" : "OFF"}
                  </button>
                </div>

                <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold">Edge API Gateway</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected: fieldpress.studio
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("fieldpress_dispatches");
                      localStorage.removeItem("fieldpress_pressroll");
                      setSavedSuccessToast("Local cache reset to defaults.");
                      setTimeout(() => setSavedSuccessToast(""), 3000);
                    }}
                    className="p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400"
                    title="Clear Local Cache"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 font-mono text-xs flex justify-between items-center text-zinc-500">
              <span>FP Workstation v2.4.0</span>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="px-4 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. COMPOSE / PUBLISH MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-xl border p-6 shadow-2xl transition ${
            theme === "dark" ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 font-mono">
                <Send className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-base">New Field Dispatch or Press Roll</h3>
              </div>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="my-5 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Headline / Dispatch Title</label>
                <input
                  type="text"
                  placeholder="Enter headline..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Field Dispatch">Field Dispatch</option>
                    <option value="Breaking Wire">Breaking Wire</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Civic Affairs">Civic Affairs</option>
                    <option value="Editorial">Editorial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Location / Beat Anchor</label>
                  <input
                    type="text"
                    placeholder="e.g. Danville, IL"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Dispatch Body</label>
                <textarea
                  rows={5}
                  placeholder="Write dispatch copy..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="w-full rounded bg-zinc-950 border border-zinc-700 p-3 text-zinc-200 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handlePublish(e, true)}
                  className="px-4 py-2 rounded border border-zinc-700 bg-zinc-800 text-amber-400 hover:bg-zinc-700 transition flex items-center gap-1.5"
                >
                  <FolderLock className="h-4 w-4" />
                  <span>Stage to Press Roll</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handlePublish(e, false)}
                    className="px-5 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    <span>Publish to Live Feed</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FieldPressMaster;
