import React, { useState, useRef } from "react";
import {
  Camera,
  MapPin,
  Globe,
  Github,
  Calendar,
  ShieldCheck,
  QrCode,
  Share2,
  Edit3,
  CheckCircle,
  ExternalLink,
  Flame,
  Award,
  Sun,
  Moon,
  Tag,
  MessageSquare,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  joinedDate: string;
  tier: "Rookie Fieldy" | "Street Anchor" | "Senior Correspondent" | "Press Agency Editor";
  tierLevel: number;
  stats: {
    scoops: number;
    frontPage: number;
    classifieds: number;
  };
  links: { label: string; url: string }[];
  verifiedBeats: string[];
}

const DEFAULT_PROFILE: UserProfile = {
  id: "FP-9284-IL",
  name: "Victor Birkle",
  handle: "ras.ip",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
  coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
  bio: "Multimedia developer, corridor mapper, and independent street press curator connecting Danville, Indy, and Evansville.",
  location: "Danville, IL · Wabash Corridor",
  joinedDate: "August 2026",
  tier: "Senior Correspondent",
  tierLevel: 3,
  stats: {
    scoops: 52,
    frontPage: 16,
    classifieds: 3,
  },
  links: [
    { label: "Studio", url: "https://fieldpress.studio" },
    { label: "Sound Deck", url: "https://github.com/RASvibir/uXu" },
    { label: "Community", url: "https://chloreform.space" },
  ],
  verifiedBeats: ["Transit Logistics", "Live Audio Pop-ups", "Civic Ground Reports"],
};

export const UserProfileView: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [activeTab, setActiveTab] = useState<"scoops" | "pass" | "classifieds" | "about">("pass");
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [bioInput, setBioInput] = useState(profile.bio);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Handle local avatar upload preview
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatar: url }));
    }
  };

  // Handle local cover upload preview
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, coverImage: url }));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({ ...prev, name: nameInput, bio: bioInput }));
    setIsEditing(false);
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-200 font-sans antialiased ${
        isDark ? "bg-zinc-950 text-zinc-100" : "bg-stone-100 text-zinc-900"
      }`}
    >
      <div className="mx-auto max-w-2xl border-x border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xl min-h-screen flex flex-col">
        
        {/* Sticky App Header */}
        <header
          className={`sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md ${
            isDark ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-200 bg-white/80"
          }`}
        >
          <div className="flex items-center gap-2 font-serif font-black tracking-tight">
            <span>FIELDPRESS</span>
            <span className="font-mono text-xs font-normal text-zinc-400">/ Profile</span>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
              isDark
                ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        {/* Facebook-Style Cover Image */}
        <div className="relative h-44 sm:h-56 w-full bg-zinc-800 overflow-hidden group">
          <img
            src={profile.coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
          <button
            onClick={() => coverInputRef.current?.click()}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 transition"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit Cover</span>
          </button>
          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Profile Info Section */}
        <div className="relative px-5 pt-0 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          
          {/* Avatar with Upload Badge */}
          <div className="flex items-end justify-between -mt-16 sm:-mt-20 mb-3">
            <div className="relative">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-xl bg-zinc-800">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-zinc-950 shadow-md hover:bg-amber-400 transition"
                title="Upload new profile picture"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Quick Action: Edit Profile */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-1.5 text-xs font-semibold hover:border-amber-500 transition"
              >
                <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </button>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3 mb-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <div>
                <label className="text-2xs font-mono text-zinc-400 uppercase block mb-1">Display Name</label>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-sm font-semibold focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-2xs font-mono text-zinc-400 uppercase block mb-1">Field Bio</label>
                <textarea
                  rows={2}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-1.5 text-xs focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-zinc-950 hover:bg-amber-400"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <>
              {/* Name & Unique Press ID Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                  {profile.name}
                </h1>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {profile.tier}
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-500">@{profile.handle}</p>

              {/* Bio */}
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {profile.bio}
              </p>

              {/* Location & Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-500" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Anchor since {profile.joinedDate}</span>
                </div>
              </div>

              {/* Safe 3rd-Party Web Links */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {profile.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950/60 px-2.5 py-1 text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-amber-500 hover:border-amber-500/40 transition"
                  >
                    <Globe className="h-3 w-3" />
                    <span>{link.label}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Anchor Scoreboard */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 font-mono text-center">
            <div className="p-2 rounded-xl bg-stone-100/80 dark:bg-zinc-950/40">
              <span className="text-2xs text-zinc-400 uppercase block">Scoops Filed</span>
              <strong className="text-sm font-bold">{profile.stats.scoops}</strong>
            </div>
            <div className="p-2 rounded-xl bg-stone-100/80 dark:bg-zinc-950/40">
              <span className="text-2xs text-zinc-400 uppercase block">Front Page</span>
              <strong className="text-sm font-bold text-amber-500">{profile.stats.frontPage}</strong>
            </div>
            <div className="p-2 rounded-xl bg-stone-100/80 dark:bg-zinc-950/40">
              <span className="text-2xs text-zinc-400 uppercase block">Classifieds</span>
              <strong className="text-sm font-bold">{profile.stats.classifieds}</strong>
            </div>
          </div>
        </div>

        {/* Profile Content Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab("pass")}
            className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
              activeTab === "pass"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            🪪 Press Pass (ID)
          </button>
          <button
            onClick={() => setActiveTab("scoops")}
            className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
              activeTab === "scoops"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            📰 Dispatches
          </button>
          <button
            onClick={() => setActiveTab("classifieds")}
            className={`flex-1 py-3 text-center font-bold border-b-2 transition ${
              activeTab === "classifieds"
                ? "border-amber-500 text-amber-500"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            📦 Notices ({profile.stats.classifieds})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-5">
          {activeTab === "pass" && (
            /* The Dedicated Press Pass Identification Card */
            <div className="flex flex-col items-center">
              <div className="w-full max-w-sm rounded-3xl border-2 border-amber-500 bg-stone-50 dark:bg-zinc-950 p-6 shadow-2xl relative overflow-hidden">
                
                {/* Security Foil Strip */}
                <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-b from-amber-400 via-purple-500 to-cyan-400 opacity-70" />

                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5 mb-4">
                  <div className="font-serif font-black text-sm tracking-tight">
                    FIELDPRESS SOVEREIGN PASS
                  </div>
                  <span className="font-mono text-2xs font-bold text-amber-500">
                    {profile.id}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-16 w-16 rounded-xl object-cover border-2 border-zinc-900 dark:border-white shadow-md shrink-0"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-base leading-tight">
                      {profile.name}
                    </h3>
                    <p className="font-mono text-xs text-zinc-500">@{profile.handle}</p>
                    <span className="inline-block mt-1 rounded bg-amber-500 px-2 py-0.2 text-[9px] font-mono font-bold text-zinc-950 uppercase">
                      Tier {profile.tierLevel} · {profile.tier}
                    </span>
                  </div>
                </div>

                {/* Verified Beats Badges */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                    Verified Reporting Beats
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {profile.verifiedBeats.map((b) => (
                      <span
                        key={b}
                        className="rounded border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-0.5 text-2xs font-mono text-zinc-700 dark:text-zinc-300"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Machine-Readable Barcode & Credential Footer */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between font-mono text-2xs text-zinc-500">
                  <div className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>AUTHENTIC PASS</span>
                  </div>
                  <div className="flex gap-0.5 h-4">
                    <div className="w-0.5 bg-zinc-700 dark:bg-zinc-300" />
                    <div className="w-1 bg-zinc-700 dark:bg-zinc-300" />
                    <div className="w-0.5 bg-zinc-700 dark:bg-zinc-300" />
                    <div className="w-1.5 bg-zinc-700 dark:bg-zinc-300" />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-zinc-500 max-w-xs">
                This digital pass is your cryptographic identifier across all FieldPress regional editions and operator dispatch nodes.
              </p>
            </div>
          )}

          {activeTab === "scoops" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-amber-500/15 text-amber-500 px-2 py-0.2 text-[10px] font-mono font-bold uppercase">
                    SCOOP
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">2h ago · Danville Sector</span>
                </div>
                <h4 className="font-serif font-bold text-sm">Western Corridor Relay Station Restored</h4>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Technicians finished recalibrating the signal boosters along the rail line. Bandwidth holding steady.
                </p>
              </div>
            </div>
          )}

          {activeTab === "classifieds" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.2 text-[10px] font-mono font-semibold uppercase">
                    Gear & Tools
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-500">$220</span>
                </div>
                <h4 className="font-serif font-bold text-sm">Vintage Fender Bass Amp</h4>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Local pickup only in downtown Danville. Clean tone, tested.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserProfileView;
