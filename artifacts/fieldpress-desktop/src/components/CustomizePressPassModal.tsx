import React, { useState } from "react";
import { X, Camera, Shield, Check, MapPin, Sparkles, Award } from "lucide-react";
import type { ReporterProfile } from "../pages/profile";

export interface CustomizePressPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ReporterProfile;
  onSave: (updated: ReporterProfile) => void;
}

const AVATAR_PRESETS = [
  { label: "Scout", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80" },
  { label: "Dispatcher", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80" },
  { label: "Chief", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" },
  { label: "Observer", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80" },
];

const COVER_PRESETS = [
  { label: "Command Rig", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80" },
  { label: "Danville Rail", url: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=1400&q=80" },
  { label: "Night Strobe", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80" },
  { label: "Broadsheet", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80" },
];

const TIERS = [
  { label: "Stringer", tier: "Community Stringer", rank: "Observer", perk: "Public dispatches & community wire" },
  { label: "Scout", tier: "Frontline Scout", rank: "Top 15% Rank", perk: "Verified wire tips & private DMs" },
  { label: "Vanguard", tier: "Senior Frontline Vanguard", rank: "Top 3% Sector Rank", perk: "Priority tipping & SDR telemetry" },
  { label: "VIP Chief", tier: "VIP Bureau Chief", rank: "Top 1% Pillar", perk: "Breaking wire alerts & bounty bonus" },
  { label: "Director", tier: "Bureau Director // Super Admin", rank: "ROOT CLEARANCE", perk: "Full /admin oversight & credential issuance" },
];

const AVAILABLE_BADGES = [
  { id: "frontline", name: "Frontline Scout", icon: "🎖️", desc: "First verified dispatch" },
  { id: "proof", name: "Proof of Scene", icon: "📸", desc: "Authentic photo proof" },
  { id: "anchor", name: "Fact Anchor", icon: "🛡️", desc: "FOIA & agency records" },
  { id: "pillar", name: "Bureau Pillar", icon: "🌲", desc: "Desk coordinator" },
  { id: "sdr", name: "SDR Scanner", icon: "📻", desc: "Frequency monitor" },
  { id: "vip", name: "VIP Patron", icon: "💎", desc: "Newsroom supporter" },
];

export const CustomizePressPassModal: React.FC<CustomizePressPassModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
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

  const [showImageUrls, setShowImageUrls] = useState(false);

  if (!isOpen) return null;

  const currentTierObj = TIERS.find(t => t.tier === formData.rankTier) || TIERS[0];

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
    onSave({ ...profile, ...formData });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10005] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col font-mono text-zinc-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold tracking-wide uppercase text-zinc-100">
              Edit Profile & Press Pass
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Visual Header & Avatar Preview */}
          <div className="space-y-2">
            <div className="relative h-32 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
              <img
                src={formData.coverPhotoUrl}
                alt="Banner"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImageUrls(!showImageUrls)}
                  className="px-3 py-1.5 rounded-full bg-black/70 border border-zinc-500 text-[11px] font-bold text-zinc-100 hover:bg-black flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Change Banner</span>
                </button>
              </div>

              {/* Overlapping Avatar */}
              <div className="absolute -bottom-2 left-4 transform translate-y-1/3">
                <div className="relative w-16 h-16 rounded-xl border-2 border-amber-500/80 bg-zinc-900 overflow-hidden shadow-lg group/avatar">
                  <img
                    src={formData.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div
                    onClick={() => setShowImageUrls(!showImageUrls)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Preset Pickers */}
            <div className="pt-4 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 text-[10px]">PHOTO:</span>
                {AVATAR_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarUrl: p.url })}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-amber-400"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 text-[10px]">COVER:</span>
                {COVER_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, coverPhotoUrl: p.url })}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-amber-400"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Expandable */}
            {showImageUrls && (
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2 mt-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Custom Avatar URL</label>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase block mb-1">Custom Cover Banner URL</label>
                  <input
                    type="text"
                    value={formData.coverPhotoUrl}
                    onChange={e => setFormData({ ...formData, coverPhotoUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase text-zinc-400 block mb-1">Handle</label>
              <input
                type="text"
                value={formData.handle}
                onChange={e => setFormData({ ...formData, handle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase text-zinc-400 block mb-1">Bio / Newsroom Beat</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase text-zinc-400">Corridor Sector</label>
              <span className="text-[10px] text-zinc-500">Regional anchor</span>
            </div>
            <input
              type="text"
              value={formData.corridor}
              onChange={e => setFormData({ ...formData, corridor: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-amber-400 mb-1.5"
            />
            <div className="flex gap-1.5">
              {["Danville Junction", "Vermilion Freight", "Chicago Loop", "Evansville"].map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, corridor: c })}
                  className="px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200"
                >
                  +{c}
                </button>
              ))}
            </div>
          </div>

          {/* Clearance Tier Segmented Bar */}
          <div className="pt-2 border-t border-zinc-900 space-y-2">
            <label className="text-[10px] uppercase text-zinc-400 block">
              Press Clearance Tier & Privileges
            </label>
            <div className="grid grid-cols-5 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {TIERS.map(t => {
                const isActive = formData.rankTier === t.tier;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, rankTier: t.tier, corridorRank: t.rank })}
                    className={`py-1.5 text-center text-[11px] font-bold rounded-lg transition-all ${
                      isActive
                        ? "bg-amber-500 text-black shadow"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">{currentTierObj.perk}</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{currentTierObj.rank}</span>
            </div>
          </div>

          {/* Desk Badges */}
          <div className="pt-2 border-t border-zinc-900 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase text-zinc-400">Desk Badges</label>
              <span className="text-[10px] text-zinc-500">{formData.badges.length} selected</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_BADGES.map(b => {
                const isSelected = formData.badges.some(x => x.id === b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleToggleBadge(b)}
                    className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-amber-500/70 bg-amber-950/20 text-zinc-100"
                        : "border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-base">{b.icon}</span>
                    <div className="overflow-hidden flex-1">
                      <div className="font-bold truncate text-[11px]">{b.name}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Clearance: <strong className="text-amber-400">{formData.rankTier}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomizePressPassModal;
