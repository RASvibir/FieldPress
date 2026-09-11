import React, { useState } from "react";
import {
  Sparkles,
  Flame,
  Send,
  Camera,
  Mic,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  Sun,
  Moon,
  CheckCircle2,
  ChevronRight,
  Radio,
  ExternalLink,
  BookOpen,
  Award,
} from "lucide-react";

interface Scoop {
  id: string;
  author: string;
  avatar: string;
  anchorLevel: string; // e.g. "Street Anchor", "Lead Contributor"
  location: string;
  time: string;
  headline: string;
  body: string;
  stamp: "BREAKING" | "SCOOP" | "SPOTTED" | "LOCAL VIBE";
  imageUrl?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface Edition {
  id: string;
  title: string;
  tagline: string;
  curator: string;
  badgeColor: string;
  vol: string;
}

const EDITIONS: Edition[] = [
  {
    id: "morning-courier",
    title: "The Morning Courier",
    tagline: "Breakfast scoops, street transit, and morning pulse.",
    curator: "Danville Press Desk",
    badgeColor: "bg-amber-500 text-zinc-950",
    vol: "Issue #48",
  },
  {
    id: "night-wire",
    title: "The Night Wire",
    tagline: "Late night sounds, live stages, and midnight city culture.",
    curator: "ChloReform Sound Labs",
    badgeColor: "bg-purple-500 text-white",
    vol: "Late Edition",
  },
  {
    id: "corridor-beat",
    title: "Corridor Dispatch",
    tagline: "Ground updates connecting Danville, Indy, and Evansville.",
    curator: "Regional Press Agency",
    badgeColor: "bg-emerald-500 text-zinc-950",
    vol: "Special Beat",
  },
];

const INITIAL_SCOOPS: Record<string, Scoop[]> = {
  "morning-courier": [
    {
      id: "s1",
      author: "Maya Lin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      anchorLevel: "Field Anchor",
      location: "Main St, Danville",
      time: "8m ago",
      headline: "Downtown Bakery Line Stretches Across 3rd Street",
      body: "First batch of morning cinnamon rolls out. Local crowd gathering early. Transit bus 4 just pulled up right on schedule.",
      stamp: "SPOTTED",
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
      likes: 28,
      comments: 5,
    },
    {
      id: "s2",
      author: "Leo Walker",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      anchorLevel: "Rookie Anchor",
      location: "Vermilion County Hub",
      time: "30m ago",
      headline: "Freight Relay Clearance Green Across Rail 2",
      body: "Crews finished the sunrise track inspection. Morning freight trains given full clearance for the southbound corridor.",
      stamp: "LOCAL VIBE",
      likes: 19,
      comments: 2,
    },
  ],
  "night-wire": [
    {
      id: "s3",
      author: "DJ Sunflower",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      anchorLevel: "Chief Anchor",
      location: "Broad Ripple, Indy",
      time: "2h ago",
      headline: "Secret Vinyl Pop-up Under the Canal Bridge",
      body: "Unannounced acoustic deck spinning live tapes. Crowds gathering with portable speakers. Incredible atmosphere tonight.",
      stamp: "SCOOP",
      imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
      likes: 84,
      comments: 18,
    },
  ],
  "corridor-beat": [
    {
      id: "s4",
      author: "Sam Rivera",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      anchorLevel: "Lead Anchor",
      location: "Evansville Waterfront",
      time: "1h ago",
      headline: "River Barges Docked at South Terminal",
      body: "High river traffic this afternoon. Riverfront promenade filled with observers and citizen cameramen.",
      stamp: "BREAKING",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      likes: 47,
      comments: 9,
    },
  ],
};

const STAMP_STYLES = {
  BREAKING: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  SCOOP: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  SPOTTED: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "LOCAL VIBE": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

export const FieldPressSocial: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [activeEditionId, setActiveEditionId] = useState("morning-courier");
  const [scoopsMap, setScoopsMap] = useState(INITIAL_SCOOPS);

  // Quick Composer State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [headline, setHeadline] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [selectedStamp, setSelectedStamp] = useState<"SCOOP" | "SPOTTED" | "BREAKING" | "LOCAL VIBE">("SCOOP");
  const [scoopLocation, setScoopLocation] = useState("Danville, IL");

  const currentEdition = EDITIONS.find((e) => e.id === activeEditionId) || EDITIONS[0];
  const currentScoops = scoopsMap[activeEditionId] || [];

  const handlePublishScoop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) return;

    const newScoop: Scoop = {
      id: `s-${Date.now()}`,
      author: "Fieldy Anchor",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      anchorLevel: "Active Fieldy",
      location: scoopLocation,
      time: "Just now",
      headline,
      body: bodyText,
      stamp: selectedStamp,
      likes: 1,
      comments: 0,
      isLiked: true,
    };

    setScoopsMap((prev) => ({
      ...prev,
      [activeEditionId]: [newScoop, ...(prev[activeEditionId] || [])],
    }));

    setHeadline("");
    setBodyText("");
    setIsComposeOpen(false);
  };

  const toggleLike = (id: string) => {
    setScoopsMap((prev) => ({
      ...prev,
      [activeEditionId]: prev[activeEditionId].map((s) =>
        s.id === id
          ? { ...s, likes: s.isLiked ? s.likes - 1 : s.likes + 1, isLiked: !s.isLiked }
          : s
      ),
    }));
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 ${
        isDark ? "bg-zinc-950 text-zinc-100" : "bg-stone-100/70 text-zinc-900"
      }`}
    >
      <div className="mx-auto flex min-h-screen max-w-lg flex-col border-x border-zinc-200 dark:border-zinc-800">
        
        {/* Top Masthead Header */}
        <header
          className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md transition-colors ${
            isDark ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-200 bg-white/85"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-black tracking-tight">FIELDPRESS</span>
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-black uppercase text-zinc-950">
              EDITION
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 shadow-2xs"
              }`}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Tactile Edition Switcher Carousel */}
        <section
          className={`border-b p-3 transition-colors ${
            isDark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="font-mono text-[11px] font-semibold uppercase text-zinc-500">
              Choose Your Edition
            </span>
            <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
              Tap to Flip Paper
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-0.5">
            {EDITIONS.map((ed) => {
              const isActive = ed.id === activeEditionId;
              return (
                <button
                  key={ed.id}
                  onClick={() => setActiveEditionId(ed.id)}
                  className={`flex flex-col text-left shrink-0 rounded-xl p-3 border transition-all duration-150 ${
                    isActive
                      ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-sm scale-102"
                      : isDark
                      ? "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-400"
                      : "border-zinc-200 bg-stone-50 hover:border-zinc-300 text-zinc-600"
                  }`}
                  style={{ width: "200px" }}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-400">
                      {ed.vol}
                    </span>
                    {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  <h4
                    className={`font-serif text-sm font-bold truncate w-full ${
                      isActive
                        ? isDark
                          ? "text-zinc-100"
                          : "text-zinc-950"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {ed.title}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-zinc-500">
                    {ed.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Edition Front Page Banner */}
        <section
          className={`border-b px-4 py-3 transition-colors ${
            isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-stone-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-black tracking-tight">
                {currentEdition.title}
              </h2>
              <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
                <span>Curated by <strong className="text-zinc-700 dark:text-zinc-300">{currentEdition.curator}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
              <Radio className="h-3 w-3 text-red-500 animate-pulse" />
              <span>LIVE WIRE</span>
            </div>
          </div>
        </section>

        {/* Edition Scoops Feed */}
        <main className="flex-1 pb-28">
          {currentScoops.map((scoop, index) => {
            const isLead = index === 0;
            return (
              <article
                key={scoop.id}
                className={`border-b p-4 transition-colors ${
                  isDark
                    ? "border-zinc-800 hover:bg-zinc-900/30"
                    : "border-zinc-200/90 bg-white hover:bg-stone-50/70"
                }`}
              >
                {/* Stamp & Anchor Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-black tracking-wider uppercase ${
                        STAMP_STYLES[scoop.stamp]
                      }`}
                    >
                      {scoop.stamp}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">·</span>
                    <span className="text-xs text-zinc-500 font-mono">{scoop.time}</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
                    <MapPin className="h-3 w-3 text-amber-500" />
                    <span>{scoop.location}</span>
                  </div>
                </div>

                {/* Headline */}
                <h3
                  className={`font-serif font-black tracking-tight leading-snug mb-2 ${
                    isLead ? "text-xl text-zinc-900 dark:text-zinc-50" : "text-base text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {scoop.headline}
                </h3>

                {/* Body Text */}
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {scoop.body}
                </p>

                {/* Photo (Lead gets large display) */}
                {scoop.imageUrl && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={scoop.imageUrl}
                      alt={scoop.headline}
                      className={`w-full object-cover ${isLead ? "h-60" : "h-44"}`}
                    />
                  </div>
                )}

                {/* Author & Interactions */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <img
                      src={scoop.avatar}
                      alt={scoop.author}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold">{scoop.author}</span>
                    <span className="rounded bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.2 font-mono text-[9px] text-zinc-600 dark:text-zinc-400">
                      {scoop.anchorLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-zinc-500">
                    <button
                      onClick={() => toggleLike(scoop.id)}
                      className={`flex items-center gap-1 text-xs transition ${
                        scoop.isLiked ? "text-red-500 font-bold" : "hover:text-red-500"
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${scoop.isLiked ? "fill-red-500" : ""}`} />
                      <span>{scoop.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs hover:text-amber-500 transition">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{scoop.comments}</span>
                    </button>
                    <button className="hover:text-zinc-800 dark:hover:text-zinc-200 transition">
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Callout to recruit Fieldies into Press Suite investors */}
          <div className="p-4 mx-4 my-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 text-center">
            <Award className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <h4 className="font-serif text-sm font-bold">Want to publish your own Edition?</h4>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
              Launch a tailored press agency, customize your masthead, and curate scoops from your local army of anchors.
            </p>
            <a
              href="/preview/FieldPressApp"
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition"
            >
              <span>Explore Press Suite</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </main>

        {/* Sticky Primary Action: "Drop a Scoop" (Child-Simple Floating Button) */}
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-bold text-zinc-950 shadow-2xl hover:bg-amber-400 hover:scale-105 active:scale-95 transition"
          >
            <Flame className="h-5 w-5 fill-zinc-950" />
            <span className="text-sm tracking-wide">Drop a Scoop</span>
          </button>
        </div>

        {/* Dead-Simple 3-Step Scoop Composer */}
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-xs">
            <div
              className={`w-full max-w-md rounded-t-3xl sm:rounded-2xl border p-5 shadow-2xl transition-all ${
                isDark ? "border-zinc-800 bg-zinc-900 text-zinc-100" : "border-zinc-200 bg-white text-zinc-900"
              }`}
            >
              <div className="flex items-center justify-between border-b pb-3 border-zinc-200 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-mono text-amber-500 uppercase font-bold">Fieldy Anchor Dispatch</span>
                  <h3 className="font-serif text-base font-bold">Pitch to {currentEdition.title}</h3>
                </div>
                <button
                  onClick={() => setIsComposeOpen(false)}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePublishScoop} className="mt-4 space-y-3">
                {/* 1. Pick a Stamp */}
                <div>
                  <label className="block text-2xs font-mono text-zinc-500 uppercase mb-1">
                    Step 1: Choose Your Stamp
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["SCOOP", "SPOTTED", "BREAKING", "LOCAL VIBE"] as const).map((st) => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setSelectedStamp(st)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition ${
                          selectedStamp === st
                            ? "bg-amber-500 text-zinc-950 shadow-xs"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Catchy Headline */}
                <div>
                  <label className="block text-2xs font-mono text-zinc-500 uppercase mb-1">
                    Step 2: The Headline (What happened?)
                  </label>
                  <input
                    autoFocus
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Free coffee pop-up outside City Hall!"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm font-semibold focus:outline-hidden"
                  />
                </div>

                {/* 3. Short Note */}
                <div>
                  <label className="block text-2xs font-mono text-zinc-500 uppercase mb-1">
                    Step 3: Quick Details (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder="Give the crowd a little more context..."
                    className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>

                {/* Location Picker & Send */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 text-amber-500" />
                    <select
                      value={scoopLocation}
                      onChange={(e) => setScoopLocation(e.target.value)}
                      className="bg-transparent border-none text-xs font-mono focus:outline-hidden text-zinc-700 dark:text-zinc-300"
                    >
                      <option value="Danville, IL">Danville, IL</option>
                      <option value="Indianapolis, IN">Indianapolis, IN</option>
                      <option value="Evansville, IN">Evansville, IN</option>
                      <option value="Chicago, IL">Chicago, IL</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 shadow-md hover:bg-amber-400 transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send to Anchors</span>
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

export default FieldPressSocial;
