import React, { useState, useEffect, useRef } from "react";
import { Map as MapLibreMap, NavigationControl, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Menu,
  X,
  Sun,
  Moon,
  Flame,
  MessageSquare,
  MapPin,
  Map as MapIcon,
  BookOpen,
  User,
  Radio,
  ExternalLink,
  ShieldCheck,
  Send,
  Camera,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle2,
  ChevronDown,
  Award,
  Compass,
  Clock,
  Tag,
  Bot,
  Sparkles,
  Bookmark,
  FolderLock,
  Layers,
} from "lucide-react";

type Tab = "front-page" | "back-page" | "radar-map" | "press-pass";

interface Scoop {
  id: string;
  author: string;
  avatar: string;
  anchorLevel: string;
  location: string;
  time: string;
  headline: string;
  body: string;
  stamp: "BREAKING" | "SCOOP" | "SPOTTED" | "LOCAL VIBE";
  imageUrl?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface Classified {
  id: string;
  category: "Gear & Tools" | "Gigs & Collabs" | "Community & Trades";
  title: string;
  priceOrTrade: string;
  location: string;
  author: string;
  body: string;
}

interface ArchivedMedia {
  id: string;
  url: string;
  label: string;
  style: string;
}

const EDITIONS = [
  { id: "morning", name: "The Morning Courier", curator: "Danville Desk", vol: "Vol. 48", time: "Daily 7 AM" },
  { id: "night", name: "The Night Wire", curator: "ChloReform Audio", vol: "Late Issue", time: "Nightly 9 PM" },
  { id: "corridor", name: "Corridor Dispatch", curator: "Tri-City Press", vol: "Special Beat", time: "Weekly" },
];

const INITIAL_SCOOPS: Scoop[] = [
  {
    id: "sc-1",
    author: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    anchorLevel: "Senior Correspondent",
    location: "Downtown Danville",
    time: "14m",
    headline: "Downtown Bakery Queue Stretches Across 3rd Street",
    body: "Morning crowd gathering early as the first fresh cinnamon batches pull out of the brick ovens. Local transit line 4 running right on time.",
    stamp: "SPOTTED",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
    likes: 42,
    comments: 6,
  },
  {
    id: "sc-2",
    author: "Victor Birkle",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    anchorLevel: "Press Editor",
    location: "Broad Ripple, Indy",
    time: "48m",
    headline: "Underground Acoustic Pop-up Setting Up Under Canal Bridge",
    body: "Independent sound collective setting up an analog tape playback rig with low-frequency acoustic baffles. Live broadcast session starts tonight at 8 PM.",
    stamp: "SCOOP",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
    likes: 89,
    comments: 15,
  },
  {
    id: "sc-3",
    author: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    anchorLevel: "Street Anchor",
    location: "Evansville Waterfront",
    time: "2h",
    headline: "Riverfront Fog Lifting Over South Terminal Barges",
    body: "Cargo manifest handoffs underway along the south dock. Clean water monitors online with steady signals across the river boundary.",
    stamp: "LOCAL VIBE",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    likes: 31,
    comments: 4,
  },
];

const INITIAL_CLASSIFIEDS: Classified[] = [
  {
    id: "cl-1",
    category: "Gear & Tools",
    title: "Vintage Fender Bass Amplifier",
    priceOrTrade: "$220 / Trade for Synth",
    location: "Danville, IL",
    author: "DanvilleAudio",
    body: "Tested last night at the rehearsal hall. Clean channels, solid state vintage tone. Local pickup downtown.",
  },
  {
    id: "cl-2",
    category: "Gigs & Collabs",
    title: "Field Audio Tech Seeking Podcast Partner",
    priceOrTrade: "Collaboration / Rev-Share",
    location: "Indianapolis, IN",
    author: "IndySoundGuy",
    body: "Documenting grassroots rail corridor oral history. Looking for an energetic local co-interviewer.",
  },
];

const USER_PRIVATE_ARCHIVE: ArchivedMedia[] = [
  {
    id: "m-1",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    label: "Bakery Street Queue",
    style: "35mm Documentary",
  },
  {
    id: "m-2",
    url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    label: "Canal Sound Rig",
    style: "Neon Noir",
  },
];

const IMAGE_STYLES = [
  { id: "35mm", name: "🎞️ 35mm Street", sampleUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80" },
  { id: "halftone", name: "📰 Newsprint", sampleUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80" },
  { id: "noir", name: "🌆 Neon Noir", sampleUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80" },
];

const MAP_STYLES = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/liberty",
};

export const FieldPressMaster: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("front-page");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditionMenuOpen, setIsEditionMenuOpen] = useState(false);
  const [activeEdition, setActiveEdition] = useState(EDITIONS[0]);

  const [scoops, setScoops] = useState<Scoop[]>(INITIAL_SCOOPS);
  const [classifieds] = useState<Classified[]>(INITIAL_CLASSIFIEDS);
  const [myArchive, setMyArchive] = useState<ArchivedMedia[]>(USER_PRIVATE_ARCHIVE);

  // Pressy'O State
  const [pressyMode, setPressyMode] = useState(false);

  // Compose State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [selectedStamp, setSelectedStamp] = useState<"SCOOP" | "SPOTTED" | "BREAKING" | "LOCAL VIBE">("SCOOP");
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);

  // Media Drawer in Composer
  const [mediaDrawer, setMediaDrawer] = useState<"none" | "gen" | "archive">("none");
  const [isGenerating, setIsGenerating] = useState(false);

  // Map Ref
  const mapDesktopContainer = useRef<HTMLDivElement>(null);
  const desktopMapRef = useRef<MapLibreMap | null>(null);

  const toggleLike = (id: string) => {
    setScoops((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, likes: s.isLiked ? s.likes - 1 : s.likes + 1, isLiked: !s.isLiked } : s
      )
    );
  };

  const toggleBookmark = (id: string) => {
    setScoops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isBookmarked: !s.isBookmarked } : s))
    );
  };

  const handleGenerateImage = (styleSample: string, styleName: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setAttachedImageUrl(styleSample);
      const newMedia: ArchivedMedia = {
        id: `m-${Date.now()}`,
        url: styleSample,
        label: headline.trim() ? headline.slice(0, 20) : "Street Dispatch",
        style: styleName,
      };
      setMyArchive([newMedia, ...myArchive]);
      setIsGenerating(false);
      setMediaDrawer("none");
    }, 1000);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) return;

    const newScoop: Scoop = {
      id: `sc-${Date.now()}`,
      author: "Victor Birkle",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      anchorLevel: "Press Editor",
      location: "Danville, IL",
      time: "1m",
      headline,
      body: bodyText,
      stamp: selectedStamp,
      imageUrl: attachedImageUrl || undefined,
      likes: 0,
      comments: 0,
    };

    setScoops([newScoop, ...scoops]);
    setHeadline("");
    setBodyText("");
    setAttachedImageUrl(null);
    setMediaDrawer("none");
    setIsComposeOpen(false);
  };

  const filteredScoops =
    activeFilter === "All"
      ? scoops
      : scoops.filter((s) => s.stamp === activeFilter);

  // Map Initialization
  useEffect(() => {
    if (!mapDesktopContainer.current || desktopMapRef.current) return;

    const map = new MapLibreMap({
      container: mapDesktopContainer.current,
      style: isDark ? MAP_STYLES.dark : MAP_STYLES.light,
      center: [-86.9, 39.5],
      zoom: 6.2,
      attributionControl: false,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    desktopMapRef.current = map;

    const pins = [
      { coords: [-87.6306, 40.1245] as [number, number] },
      { coords: [-86.1581, 39.7684] as [number, number] },
      { coords: [-87.5711, 37.9716] as [number, number] },
    ];

    pins.forEach((p) => {
      const el = document.createElement("div");
      el.className = "flex items-center justify-center p-1";
      el.innerHTML = `<div class="h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-500/40 animate-pulse"></div>`;
      new Marker({ element: el }).setLngLat(p.coords).addTo(map);
    });

    return () => {
      map.remove();
      desktopMapRef.current = null;
    };
  }, [isDark]);

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 antialiased ${
        isDark ? "bg-black text-zinc-100" : "bg-stone-50 text-zinc-900"
      }`}
    >
      {/* ================= 1. CLEAN CONSOLIDATED HEADER (NO CONGESTION) ================= */}
      <header
        className={`sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b px-4 lg:px-8 backdrop-blur-md transition-colors ${
          isDark ? "border-zinc-800/80 bg-black/80" : "border-zinc-200/90 bg-white/80"
        }`}
      >
        {/* Left: Brand + Edition Dropdown */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setActiveTab("front-page")}
            className="flex items-center gap-2 text-left focus:outline-hidden"
          >
            <span className="font-serif text-lg font-black tracking-tight">FIELDPRESS</span>
          </button>

          <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-800" />

          {/* Clean Edition Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsEditionMenuOpen(!isEditionMenuOpen)}
              className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1 text-xs font-mono font-medium hover:border-amber-500 transition"
            >
              <span className="truncate max-w-[150px] sm:max-w-none">{activeEdition.name}</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {isEditionMenuOpen && (
              <div
                className={`absolute left-0 top-9 z-50 w-60 rounded-xl border p-1.5 shadow-2xl backdrop-blur-md transition-all ${
                  isDark ? "border-zinc-800 bg-zinc-900/95" : "border-zinc-200 bg-white/95"
                }`}
              >
                <div className="px-2.5 py-1 text-2xs font-mono uppercase text-zinc-400 font-bold">
                  Select Edition
                </div>
                {EDITIONS.map((ed) => (
                  <button
                    key={ed.id}
                    onClick={() => {
                      setActiveEdition(ed);
                      setIsEditionMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      activeEdition.id === ed.id
                        ? "bg-amber-500 text-zinc-950 font-bold"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span>{ed.name}</span>
                    <span className="text-[10px] opacity-75">{ed.vol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Only Press Pass + Hamburger Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("press-pass")}
            className="flex items-center gap-2 focus:outline-hidden"
            title="My Press Pass"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
              alt="Victor"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-amber-500"
            />
          </button>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Settings & Control Deck"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ================= 2. DESKTOP 3-COLUMN WORKSTATION ================= */}
      <div className="mx-auto max-w-7xl px-0 sm:px-4 lg:px-8 py-0 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Clean Nav Rail (3 cols) */}
          <aside className="hidden lg:flex lg:col-span-3 lg:flex-col lg:sticky lg:top-20 space-y-4">
            
            <nav className={`p-2 rounded-2xl border font-mono text-xs space-y-1 ${isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-zinc-200 bg-white"}`}>
              <button
                onClick={() => setActiveTab("front-page")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "front-page" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Front Page</span>
              </button>

              <button
                onClick={() => setActiveTab("back-page")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "back-page" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                <Tag className="h-4 w-4" />
                <span>The Back Page</span>
              </button>

              <button
                onClick={() => setActiveTab("press-pass")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition ${
                  activeTab === "press-pass" ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                }`}
              >
                <User className="h-4 w-4" />
                <span>My Press Pass</span>
              </button>
            </nav>

            <button
              onClick={() => setIsComposeOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-zinc-950 shadow-md hover:bg-amber-400 transition"
            >
              <Flame className="h-4 w-4 fill-zinc-950" />
              <span>Drop a Scoop</span>
            </button>

            {/* Pressie Pass Mini Card */}
            <div className={`p-4 rounded-2xl border ${isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-zinc-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                  alt="Victor"
                  className="h-10 w-10 rounded-xl object-cover ring-1 ring-amber-500"
                />
                <div>
                  <h4 className="font-serif font-bold text-sm">Victor Birkle</h4>
                  <span className="font-mono text-2xs text-amber-500 font-semibold block">FP-9284-IL · Editor</span>
                </div>
              </div>
            </div>

            {/* Press Suite Operator Desk Gateway */}
            <div className={`p-4 rounded-2xl border ${isDark ? "border-zinc-800/80 bg-zinc-900/20" : "border-zinc-200 bg-white"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-4 w-4 text-amber-500" />
                <h5 className="font-serif text-xs font-bold">Press Suite Agency</h5>
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                Curate custom branded editions and manage Stripe passes.
              </p>
              <a
                href="/preview/FieldPressApp"
                className="mt-2.5 inline-flex items-center gap-1 font-mono text-2xs text-amber-500 font-bold hover:underline"
              >
                <span>Launch Desk →</span>
              </a>
            </div>

          </aside>

          {/* ================= CENTER COLUMN (6 cols) ================= */}
          <main className={`col-span-1 lg:col-span-6 border-x min-h-screen pb-24 lg:pb-12 ${
            isDark ? "border-zinc-800/80 bg-zinc-950" : "border-zinc-200 bg-white"
          }`}>
            
            {/* Mobile Section Nav Tabs (< 1024px) */}
            <div className={`flex border-b font-mono text-xs lg:hidden ${
              isDark ? "border-zinc-800 bg-black/60" : "border-zinc-200 bg-stone-50"
            }`}>
              <button
                onClick={() => setActiveTab("front-page")}
                className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
                  activeTab === "front-page" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500"
                }`}
              >
                Front Page
              </button>
              <button
                onClick={() => setActiveTab("back-page")}
                className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
                  activeTab === "back-page" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500"
                }`}
              >
                The Back Page
              </button>
              <button
                onClick={() => setActiveTab("press-pass")}
                className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
                  activeTab === "press-pass" ? "border-amber-500 text-amber-500" : "border-transparent text-zinc-500"
                }`}
              >
                Press Pass
              </button>
            </div>

            {/* TAB 1: FRONT PAGE */}
            {activeTab === "front-page" && (
              <div>
                {/* Horizontal Stamp Filter Carousel (Zero Congestion) */}
                <div className={`flex items-center gap-2 p-3 border-b overflow-x-auto no-scrollbar font-mono text-xs ${
                  isDark ? "border-zinc-800/80 bg-zinc-950" : "border-zinc-100 bg-stone-50"
                }`}>
                  {["All", "SCOOP", "SPOTTED", "BREAKING", "LOCAL VIBE"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1 rounded-full shrink-0 transition ${
                        activeFilter === filter
                          ? "bg-amber-500 text-zinc-950 font-bold"
                          : "border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Inline Composer Prompt (Desktop) */}
                <div className={`p-4 border-b hidden sm:flex items-center gap-3 ${
                  isDark ? "border-zinc-800/80 bg-zinc-900/20" : "border-zinc-100 bg-stone-50/60"
                }`}>
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                    alt="Victor"
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                  <button
                    onClick={() => setIsComposeOpen(true)}
                    className="flex-1 text-left rounded-full border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs text-zinc-400 hover:border-amber-500 transition"
                  >
                    Drop a scoop or street report to {activeEdition.name}...
                  </button>
                </div>

                {/* Scoops Stream */}
                {filteredScoops.map((item) => (
                  <article
                    key={item.id}
                    className={`border-b p-5 transition ${
                      isDark ? "border-zinc-800/80 hover:bg-zinc-900/30" : "border-zinc-100 hover:bg-stone-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <img src={item.avatar} alt={item.author} className="h-6 w-6 rounded-full object-cover" />
                        <span className="font-semibold">{item.author}</span>
                        <span className="rounded bg-amber-500/10 text-amber-500 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                          {item.stamp}
                        </span>
                      </div>
                      <span className="text-2xs font-mono text-zinc-400">{item.time} · {item.location}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold leading-snug mb-1.5 tracking-tight">
                      {item.headline}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mb-3 font-sans">
                      {item.body}
                    </p>

                    {item.imageUrl && (
                      <div className="mb-3.5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <img src={item.imageUrl} alt={item.headline} className="h-64 w-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-zinc-500 text-xs font-mono">
                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => toggleLike(item.id)}
                          className={`flex items-center gap-1.5 transition ${
                            item.isLiked ? "text-red-500 font-bold" : "hover:text-red-500"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${item.isLiked ? "fill-red-500" : ""}`} />
                          <span>{item.likes}</span>
                        </button>

                        <button className="flex items-center gap-1.5 hover:text-amber-500 transition">
                          <MessageCircle className="h-4 w-4" />
                          <span>{item.comments}</span>
                        </button>

                        <button
                          onClick={() => toggleBookmark(item.id)}
                          className={`flex items-center gap-1.5 transition ${
                            item.isBookmarked ? "text-amber-500" : "hover:text-amber-500"
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${item.isBookmarked ? "fill-amber-500" : ""}`} />
                        </button>
                      </div>

                      <button className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* TAB 2: BACK PAGE */}
            {activeTab === "back-page" && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-2xs font-mono uppercase text-zinc-400 block">Notice Board</span>
                    <h2 className="font-serif text-2xl font-bold">The Back Page</h2>
                  </div>
                  <span className="font-mono text-xs text-amber-500 font-bold">Community Trades</span>
                </div>

                <div className="space-y-3">
                  {classifieds.map((cl) => (
                    <div
                      key={cl.id}
                      className={`p-4 rounded-xl border ${
                        isDark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-stone-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between text-2xs font-mono mb-1">
                        <span className="font-bold uppercase text-zinc-500">{cl.category}</span>
                        <span className="font-bold text-amber-500 text-xs">{cl.priceOrTrade}</span>
                      </div>
                      <h4 className="font-serif text-base font-bold">{cl.title}</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">{cl.body}</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-2xs font-mono text-zinc-400">
                        <span>📍 {cl.location} · @{cl.author}</span>
                        <button className="font-semibold text-amber-500 hover:underline">
                          Send Inquiry →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PRESS PASS */}
            {activeTab === "press-pass" && (
              <div className="p-6 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-3xl border-2 border-amber-500 bg-stone-50 dark:bg-zinc-950 p-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3 font-mono text-2xs">
                    <span className="font-serif font-black text-sm">FIELDPRESS PASS</span>
                    <span className="font-bold text-amber-500">FP-9284-IL</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
                      alt="Victor"
                      className="h-16 w-16 rounded-xl object-cover border-2"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base">Victor Birkle</h3>
                      <p className="font-mono text-xs text-zinc-500">@ras.ip</p>
                      <span className="inline-block mt-1 rounded bg-amber-500 px-2 py-0.2 text-[9px] font-mono font-bold text-zinc-950 uppercase">
                        Press Editor
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-2xs font-mono text-emerald-500 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED CREDENTIAL
                    </span>
                    <span className="text-zinc-400">EXP: SEP 2026</span>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* ================= RIGHT RAIL (3 cols) ================= */}
          <aside className="hidden lg:flex lg:col-span-3 lg:flex-col lg:sticky lg:top-20 space-y-4">
            
            <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-zinc-200 bg-white"}`}>
              <div className="p-3 border-b flex items-center justify-between font-mono text-2xs font-bold uppercase">
                <span className="flex items-center gap-1.5"><Compass className="h-3.5 w-3.5 text-amber-500" /> Radar</span>
                <span className="text-emerald-500">3 Live Nodes</span>
              </div>
              <div className="relative h-56 w-full bg-zinc-950">
                <div ref={mapDesktopContainer} className="h-full w-full" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? "border-zinc-800/80 bg-zinc-900/30" : "border-zinc-200 bg-white"}`}>
              <span className="font-mono text-2xs uppercase text-zinc-400 font-bold block border-b pb-2">
                Incoming Wire
              </span>
              <div className="space-y-2.5 text-xs">
                {scoops.map((s) => (
                  <div key={s.id} className="cursor-pointer group">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-0.5">
                      <span className="text-amber-500">{s.location}</span>
                      <span>{s.time}</span>
                    </div>
                    <h5 className="font-serif font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-500 transition line-clamp-1">
                      {s.headline}
                    </h5>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>

        {/* ================= MOBILE FLOATING ACTION ================= */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 lg:hidden">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-bold text-zinc-950 shadow-2xl hover:bg-amber-400 transition"
          >
            <Flame className="h-5 w-5 fill-zinc-950" />
            <span className="text-sm font-semibold">Drop a Scoop</span>
          </button>
        </div>

        {/* ================= EDITORIAL HAMBURGER DRAWER (WITH THEME TOGGLE) ================= */}
        {isDrawerOpen && (
          <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)} />
            <aside className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs flex flex-col border-l p-5 shadow-2xl ${
              isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"
            }`}>
              <div className="flex items-center justify-between border-b pb-3 mb-4">
                <span className="font-mono text-xs uppercase font-bold text-amber-500">Control Deck</span>
                <button onClick={() => setIsDrawerOpen(false)} className="rounded-full p-1 text-zinc-400 hover:text-zinc-100">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs flex-1 overflow-y-auto">
                
                {/* 1. THEME TOGGLE IN HAMBURGER */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isDark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-stone-50"
                }`}>
                  <div className="flex items-center gap-2 text-xs">
                    {isDark ? <Moon className="h-4 w-4 text-amber-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
                    <span className="font-semibold">Appearance</span>
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 font-bold hover:border-amber-500 transition"
                  >
                    {isDark ? "Dark Mode" : "Light Mode"}
                  </button>
                </div>

                {/* 2. Pressy'O Toggle */}
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
                      <Bot className="h-4 w-4" />
                      <span>Pressy'O Liaison</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={pressyMode}
                      onChange={(e) => setPressyMode(e.target.checked)}
                      className="cursor-pointer accent-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-tight">
                    Hold-your-hand guide for filing scoops and polishing headlines.
                  </p>
                </div>

                {/* 3. Operator Desk Gateway */}
                <div className="border-t pt-3 border-zinc-200 dark:border-zinc-800">
                  <a
                    href="/preview/FieldPressApp"
                    className="flex items-center justify-between w-full p-3 rounded-xl bg-amber-500/10 text-amber-500 font-bold hover:bg-amber-500/20 transition"
                  >
                    <span>Open Operator Desk</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* ================= SCOOP COMPOSER ================= */}
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-xs">
            <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl border p-5 shadow-2xl ${
              isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"
            }`}>
              
              <div className="flex items-center justify-between border-b pb-3 mb-3 border-zinc-200 dark:border-zinc-800">
                <span className="font-serif text-sm font-bold">File Scoop to {activeEdition.name}</span>
                <button onClick={() => setIsComposeOpen(false)} className="rounded-full p-1 text-zinc-400">✕</button>
              </div>

              <form onSubmit={handlePublish} className="space-y-3">
                <div className="flex gap-1.5">
                  {(["SCOOP", "SPOTTED", "BREAKING", "LOCAL VIBE"] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSelectedStamp(s)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition ${
                        selectedStamp === s ? "bg-amber-500 text-zinc-950" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <input
                  autoFocus
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Headline (What happened?)"
                  className="w-full bg-transparent font-serif text-base font-bold placeholder-zinc-400 focus:outline-hidden"
                />

                <textarea
                  rows={3}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Street details..."
                  className="w-full resize-none bg-transparent text-xs sm:text-sm placeholder-zinc-400 focus:outline-hidden"
                />

                {attachedImageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-amber-500/40">
                    <img src={attachedImageUrl} alt="Attached" className="h-40 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachedImageUrl(null)}
                      className="absolute top-2 right-2 rounded-full bg-black/70 text-white p-1 hover:bg-black"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {mediaDrawer === "gen" && (
                  <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 space-y-2">
                    <div className="flex items-center justify-between text-2xs font-mono text-zinc-400">
                      <span>Select AI Aesthetic Filter:</span>
                      {isGenerating && <span className="text-amber-500 animate-pulse">Generating...</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {IMAGE_STYLES.map((st) => (
                        <button
                          type="button"
                          key={st.id}
                          onClick={() => handleGenerateImage(st.sampleUrl, st.name)}
                          disabled={isGenerating}
                          className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-left hover:border-amber-500 transition"
                        >
                          {st.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {mediaDrawer === "archive" && (
                  <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 space-y-2">
                    <span className="text-2xs font-mono text-zinc-400 block">Pick from your private Press Roll:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {myArchive.map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => {
                            setAttachedImageUrl(m.url);
                            setMediaDrawer("none");
                          }}
                          className="h-16 rounded-lg overflow-hidden border hover:border-amber-500 transition"
                        >
                          <img src={m.url} alt={m.label} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaDrawer(mediaDrawer === "gen" ? "none" : "gen")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                        mediaDrawer === "gen" ? "bg-amber-500 text-zinc-950 font-bold" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>AI Shot</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMediaDrawer(mediaDrawer === "archive" ? "none" : "archive")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition ${
                        mediaDrawer === "archive" ? "bg-amber-500 text-zinc-950 font-bold" : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      <FolderLock className="h-3.5 w-3.5" />
                      <span>Press Roll</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 shadow-sm transition"
                  >
                    <Send className="h-3 w-3" />
                    <span>Publish</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default FieldPressMaster;
