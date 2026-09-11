import React, { useState } from "react";
import {
  QrCode,
  ShieldCheck,
  MapPin,
  Flame,
  Award,
  Share2,
  ExternalLink,
  Repeat2,
  Sparkles,
  Camera,
  CheckCircle,
  RotateCw,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  anchorLevel: "Rookie Fieldy" | "Street Anchor" | "Lead Correspondent" | "Press Editor";
  homeBeat: string;
  bio: string;
  stats: {
    scoopsFiled: number;
    frontPageHits: number;
    amplifies: number;
  };
  verifiedBeats: string[];
  issuedDate: string;
}

const SAMPLE_PROFILE: ProfileData = {
  id: "FP-8402-IL",
  name: "Victor Birkle",
  handle: "ras.ip",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
  role: "Field Editor & Corridor Scout",
  anchorLevel: "Press Editor",
  homeBeat: "Danville · Wabash Corridor",
  bio: "Covering grassroots transit corridors, underground sound labs, and local civic tech across Illinois and Indiana.",
  stats: {
    scoopsFiled: 48,
    frontPageHits: 14,
    amplifies: 1820,
  },
  verifiedBeats: ["Transit Logistics", "Live Audio Pop-ups", "Local Civic Pulse"],
  issuedDate: "SEP 2026",
};

const THEMES = [
  { name: "Press Amber", border: "border-amber-500", accent: "bg-amber-500 text-zinc-950", ring: "ring-amber-500/30" },
  { name: "Noir Slate", border: "border-zinc-400", accent: "bg-zinc-100 text-zinc-950", ring: "ring-white/20" },
  { name: "Neon Cyan", border: "border-cyan-400", accent: "bg-cyan-400 text-zinc-950", ring: "ring-cyan-400/30" },
  { name: "Signal Red", border: "border-red-500", accent: "bg-red-500 text-white", ring: "ring-red-500/30" },
];

export const PressPassCard: React.FC = () => {
  const [profile] = useState<ProfileData>(SAMPLE_PROFILE);
  const [isFlipped, setIsFlipped] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeTheme = THEMES[themeIdx];

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen w-full bg-stone-200/60 dark:bg-zinc-950 p-4 sm:p-8 flex flex-col items-center justify-center font-sans antialiased text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* Controls Bar */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-1.5 text-xs font-semibold shadow-xs hover:border-amber-500 transition"
        >
          <RotateCw className="h-3.5 w-3.5 text-amber-500" />
          <span>Flip to {isFlipped ? "Front Credential" : "Back Details"}</span>
        </button>

        {/* Theme Picker */}
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1">
          {THEMES.map((t, idx) => (
            <button
              key={t.name}
              onClick={() => setThemeIdx(idx)}
              className={`h-5 w-5 rounded-full transition ${t.accent.split(" ")[0]} ${
                themeIdx === idx ? "ring-2 ring-offset-2 dark:ring-offset-zinc-900 ring-zinc-900 dark:ring-white scale-110" : "opacity-60 hover:opacity-100"
              }`}
              title={t.name}
            />
          ))}
        </div>
      </div>

      {/* The Physical Laminate Press Pass Container */}
      <div className="relative w-full max-w-sm">
        
        {/* Lanyard Top Attachment Hole */}
        <div className="mx-auto -mb-3 flex h-6 w-20 items-center justify-center rounded-t-lg border-2 border-b-0 border-zinc-400 dark:border-zinc-700 bg-zinc-300 dark:bg-zinc-800 shadow-inner z-10 relative">
          <div className="h-2.5 w-10 rounded-full bg-stone-200 dark:bg-zinc-950 border border-zinc-500/50 shadow-xs" />
        </div>

        {/* Pass Badge Card */}
        <div
          className={`relative rounded-3xl border-2 ${activeTheme.border} bg-white dark:bg-zinc-900 shadow-2xl p-6 transition-all duration-300 overflow-hidden`}
        >
          {/* Subtle Security Hologram Strip on Right Edge */}
          <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-b from-amber-400 via-purple-400 to-cyan-400 opacity-60" />

          {!isFlipped ? (
            /* ================= FRONT SIDE ================= */
            <div className="flex flex-col items-center text-center">
              
              {/* Pass Header */}
              <div className="w-full flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-1.5 font-serif font-black tracking-tight text-sm">
                  <span>FIELDPRESS</span>
                  <span className="font-mono text-[9px] text-zinc-400 font-normal">CORP</span>
                </div>
                <span className="rounded font-mono text-2xs uppercase tracking-wider px-2 py-0.5 font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                  {profile.id}
                </span>
              </div>

              {/* Photo & Level Badge */}
              <div className="relative mb-3">
                <div className={`h-24 w-24 rounded-2xl overflow-hidden border-2 border-zinc-900 dark:border-white shadow-md ${activeTheme.ring}`}>
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase shadow-sm ${activeTheme.accent}`}
                >
                  {profile.anchorLevel}
                </span>
              </div>

              {/* Identity */}
              <h2 className="font-serif text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
                {profile.name}
              </h2>
              <p className="font-mono text-xs text-zinc-500">@{profile.handle}</p>
              
              <div className="mt-1 flex items-center gap-1 text-2xs font-mono text-amber-600 dark:text-amber-400 font-medium">
                <MapPin className="h-3 w-3" />
                <span>{profile.homeBeat}</span>
              </div>

              {/* Key Credibility Stats */}
              <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 font-mono">
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase block">Scoops</span>
                  <strong className="text-sm font-bold">{profile.stats.scoopsFiled}</strong>
                </div>
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase block">Front Page</span>
                  <strong className="text-sm font-bold text-amber-500">{profile.stats.frontPageHits}</strong>
                </div>
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase block">Amplifies</span>
                  <strong className="text-sm font-bold">{profile.stats.amplifies}</strong>
                </div>
              </div>

              {/* QR Verification Footer */}
              <div className="mt-5 w-full flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-2xs font-mono text-zinc-400">
                <div className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>VERIFIED ANCHOR</span>
                </div>
                <span>EXP: {profile.issuedDate}</span>
              </div>
            </div>
          ) : (
            /* ================= BACK SIDE ================= */
            <div className="flex flex-col text-left">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
                <span className="font-mono text-2xs uppercase text-zinc-400">ANCHOR DOSSIER</span>
                <span className="font-mono text-2xs text-amber-500 font-bold">{profile.role}</span>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Field Bio</span>
                <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {profile.bio}
                </p>
              </div>

              {/* Assigned Beats */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1.5">
                  Verified Reporting Beats
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.verifiedBeats.map((beat) => (
                    <span
                      key={beat}
                      className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-950 px-2 py-0.5 text-2xs font-mono text-zinc-700 dark:text-zinc-300"
                    >
                      {beat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification & Barcode */}
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-2xs font-mono block text-zinc-400">ISSUING AUTHORITY</span>
                  <span className="text-xs font-serif font-bold text-zinc-800 dark:text-zinc-200">
                    FieldPress Sovereign Media
                  </span>
                </div>
                <div className="h-8 w-16 bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center rounded p-1">
                  <div className="w-full flex justify-between h-4">
                    <div className="w-0.5 bg-white dark:bg-zinc-900" />
                    <div className="w-1 bg-white dark:bg-zinc-900" />
                    <div className="w-0.5 bg-white dark:bg-zinc-900" />
                    <div className="w-1.5 bg-white dark:bg-zinc-900" />
                    <div className="w-0.5 bg-white dark:bg-zinc-900" />
                    <div className="w-1 bg-white dark:bg-zinc-900" />
                  </div>
                </div>
              </div>

              {/* Agency Desk Access Link */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                <a
                  href="/preview/FieldPressApp"
                  className="inline-flex items-center gap-1 font-mono text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                >
                  <span>Open Operator Desk</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share / Export Bar */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-zinc-950 shadow-md hover:bg-amber-400 transition"
        >
          {copied ? <CheckCircle className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          <span>{copied ? "Pass Link Copied!" : "Share Press Pass"}</span>
        </button>
      </div>
    </div>
  );
};

export default PressPassCard;
