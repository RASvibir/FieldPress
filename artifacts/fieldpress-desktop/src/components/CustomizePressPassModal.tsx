import React, { useState } from "react";
import { X, Shield, Sparkles, Image as ImageIcon, Check, User, MapPin, Award, Radio } from "lucide-react";
import type { ReporterProfile } from "../pages/profile";

export interface CustomizePressPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ReporterProfile;
  onSave: (updated: ReporterProfile) => void;
}

const AVATAR_PRESETS = [
  { label: "Tactical Scout", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80" },
  { label: "Night Dispatcher", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80" },
  { label: "Bureau Chief", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" },
  { label: "Field Observer", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80" },
];

const COVER_PRESETS = [
  { label: "Command Rig", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80" },
  { label: "Danville Junction", url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1400&q=80" },
  { label: "Night Strobe", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80" },
  { label: "Broadsheet Newsprint", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80" },
];

const TIERS = [
  {
    id: "tier-1",
    name: "Tier 1: Community Stringer",
    rankTier: "Community Stringer",
    corridorRank: "Top 50% Observer",
    color: "border-zinc-700 text-zinc-300",
    perks: "Read all wire dispatches • Standard corridor reporting • Offline outbox",
  },
  {
    id: "tier-2",
    name: "Tier 2: Frontline Scout",
    rankTier: "Frontline Scout",
    corridorRank: "Top 15% Sector Rank",
    color: "border-emerald-700 text-emerald-400 bg-emerald-950/20",
    perks: "[⚡ PUSH TO DESK] direct tip routing • Eyewitness seals • Private wire DMs",
  },
  {
    id: "tier-3",
    name: "Tier 3: Senior Frontline Vanguard",
    rankTier: "Senior Frontline Vanguard",
    corridorRank: "Top 3% Sector Rank",
    color: "border-amber-600 text-amber-300 bg-amber-950/30",
    perks: "2x priority tipping multiplier • Multi-frequency SDR scan • Tactical Gold Glow",
  },
  {
    id: "tier-4",
    name: "Tier 4: VIP Bureau Chief",
    rankTier: "VIP Bureau Chief",
    corridorRank: "Top 1% Corridor Pillar",
    color: "border-yellow-500 text-yellow-300 bg-yellow-950/40",
    perks: "Breaking wire blast permissions • Priority bounty matching • Holo-Foil Pass Badge",
  },
  {
    id: "tier-5",
    name: "Tier 5: Bureau Director // Super Admin",
    rankTier: "Bureau Director // Super Admin",
    corridorRank: "ROOT CLEARANCE",
    color: "border-red-600 text-red-300 bg-red-950/40",
    perks: "Full /admin oversight console • Issue & revoke cryptographic press seals • County frequency routing",
  },
];

const AVAILABLE_BADGES = [
  { id: "frontline", name: "Frontline Scout", icon: "🎖️", desc: "First verified dispatch on scene" },
  { id: "proof", name: "Proof of Scene", icon: "📸", desc: "Authentic high-contrast photo evidence" },
  { id: "anchor", name: "Fact Anchor", icon: "🛡️", desc: "Agency documents & FOIA citations attached" },
  { id: "pillar", name: "Bureau Pillar", icon: "🌲", desc: "High-output independent desk coordinator" },
  { id: "sdr", name: "SDR Wire Telemetry", icon: "📻", desc: "Monitors rail & freight telemetry frequencies" },
  { id: "vip", name: "VIP Desk Patron", icon: "💎", desc: "Supporter of grassroots newsroom rails" },
];

export const CustomizePressPassModal: React.FC<CustomizePressPassModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [tab, setTab] = useState<"identity" | "tiers" | "badges">("identity");
  const [formData, setFormData] = useState({
    displayName: profile.displayName,
    handle: profile.handle,
    corridor: profile.corridor,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    coverPhotoUrl: profile.coverPhotoUrl,
    rankTier: profile.rankTier,
    corridorRank: profile.corridorRank,
    badges: [...profile.badges],
  });

  if (!isOpen) return null;

  const handleSelectTier = (t: typeof TIERS[0]) => {
    setFormData(prev => ({
      ...prev,
      rankTier: t.rankTier,
      corridorRank: t.corridorRank,
    }));
  };

  const handleToggleBadge = (b: typeof AVAILABLE_BADGES[0]) => {
    setFormData(prev => {
      const exists = prev.badges.some(x => x.id === b.id);
      const badges = exists
        ? prev.badges.filter(x => x.id !== b.id)
        : [...prev.badges, b];
      return { ...prev, badges };
    });
  };

  const handleSave = () => {
    onSave({
      ...profile,
      ...formData,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10005] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col font-mono text-zinc-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Customize Press Pass & Clearance
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 text-xs bg-zinc-900/30">
          <button
            onClick={() => setTab("identity")}
            className={`flex-1 py-2.5 text-center font-bold border-b-2 transition-all ${
              tab === "identity" ? "border-amber-400 text-amber-300 bg-amber-950/20" : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            1. Identity & Visuals
          </button>
          <button
            onClick={() => setTab("tiers")}
            className={`flex-1 py-2.5 text-center font-bold border-b-2 transition-all ${
              tab === "tiers" ? "border-amber-400 text-amber-300 bg-amber-950/20" : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            2. Clearance & VIP Tiers
          </button>
          <button
            onClick={() => setTab("badges")}
            className={`flex-1 py-2.5 text-center font-bold border-b-2 transition-all ${
              tab === "badges" ? "border-amber-400 text-amber-300 bg-amber-950/20" : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            3. Desk Badges ({formData.badges.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {tab === "identity" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-zinc-400 block mb-1">Callsign Handle</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={e => setFormData({ ...formData, handle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Corridor Sector</label>
                <input
                  type="text"
                  value={formData.corridor}
                  onChange={e => setFormData({ ...formData, corridor: e.target.value })}
                  placeholder="e.g. Evansville • Indianapolis • Danville Corridor"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1">Bio / Newsroom Note</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Avatar Presets */}
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1.5">Avatar Image URL & Presets</label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400 mb-2"
                />
                <div className="flex gap-2">
                  {AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl: p.url })}
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] hover:border-amber-500/50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Presets */}
              <div>
                <label className="text-[10px] uppercase text-zinc-400 block mb-1.5">Cover Banner URL & Presets</label>
                <input
                  type="text"
                  value={formData.coverPhotoUrl}
                  onChange={e => setFormData({ ...formData, coverPhotoUrl: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400 mb-2"
                />
                <div className="flex gap-2">
                  {COVER_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, coverPhotoUrl: p.url })}
                      className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] hover:border-amber-500/50"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "tiers" && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs">
                Select your clearance tier to unlock advantageous newsroom privileges and visual card badges:
              </p>
              <div className="space-y-2">
                {TIERS.map(t => {
                  const isSelected = formData.rankTier === t.rankTier;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectTier(t)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected ? "border-amber-400 bg-amber-950/30" : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-100">{t.name}</span>
                        {isSelected ? (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> ACTIVE CLEARANCE
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500">Click to Upgrade</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">{t.perks}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "badges" && (
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs">
                Toggle credentials and specialized field seals displayed on your press pass:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_BADGES.map(b => {
                  const isChecked = formData.badges.some(x => x.id === b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleToggleBadge(b)}
                      className={`p-2.5 rounded border cursor-pointer flex items-start gap-2.5 transition-all ${
                        isChecked ? "border-amber-500 bg-amber-950/20" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 opacity-60"
                      }`}
                    >
                      <span className="text-xl">{b.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-zinc-200 text-xs">{b.name}</div>
                        <div className="text-[10px] text-zinc-400 leading-tight">{b.desc}</div>
                      </div>
                      {isChecked && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Clearance: <span className="text-amber-400 font-bold">{formData.rankTier}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black font-bold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" /> Save & Apply Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePressPassModal;
