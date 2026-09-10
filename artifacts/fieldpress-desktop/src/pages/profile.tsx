import React, { useState } from 'react';
import { useSkin, SKINS, SkinColor } from '../context/SkinContext';

export interface ReporterProfile {
  handle: string;
  displayName: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  bio: string;
  corridor: string;
  rankTier: string;
  corridorRank: string;
  signalScore: number;
  bureaus: string[];
  badges: {
    id: 'frontline' | 'proof' | 'anchor' | 'pillar';
    name: string;
    icon: string;
    desc: string;
  }[];
  stats: {
    verifiedDispatches: number;
    downstreamForks: number;
    corroborationRate: string;
  };
}

export interface FieldChannelPost {
  id: string;
  authorHandle: string;
  authorName: string;
  content: string;
  category: 'offduty' | 'gear' | 'soundtrack' | 'bts';
  mediaUrl?: string;
  timestamp: string;
  reactions: {
    verified: number;
    signal: number;
    flash: number;
  };
}

export const ReporterProfilePage: React.FC<{
  handle?: string;
  onOpenDm?: (handle: string) => void;
}> = ({ handle = 'ras.ip', onOpenDm }) => {
  const { currentSkin, skinConfig, saveSkinPreference, isSaving } = useSkin();
  const [activeTab, setActiveTab] = useState<'dispatches' | 'channel' | 'forks' | 'bureaus'>('channel');
  const [copied, setCopied] = useState(false);
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false);
  const [modalDmText, setModalDmText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  // Profile data with cover and avatar
  const [profile, setProfile] = useState<ReporterProfile>({
    handle,
    displayName: handle === 'ras.ip' ? 'Victor Birkle' : 'Pamela Black',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    coverPhotoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
    bio: 'Boots-on-the-ground field reporter & newsroom architect. Tracking municipal utilities, rail corridors, and grassroots infrastructure along the Vermilion line.',
    corridor: 'Evansville • Indianapolis • Danville Corridor',
    rankTier: 'Senior Frontline Vanguard',
    corridorRank: 'Top 3% Sector Rank',
    signalScore: 842,
    bureaus: ['Danville Junction Bureau', 'Midwest Transit Watch'],
    badges: [
      { id: 'frontline', name: 'Frontline Scout', icon: '🎖️', desc: 'First verified dispatch on scene' },
      { id: 'proof', name: 'Proof of Scene', icon: '📸', desc: 'Authentic high-contrast photo evidence' },
      { id: 'anchor', name: 'Fact Anchor', icon: '🛡️', desc: 'Agency documents & FOIA citations attached' },
      { id: 'pillar', name: 'Bureau Pillar', icon: '🌲', desc: 'High-output independent desk coordinator' },
    ],
    stats: {
      verifiedDispatches: 38,
      downstreamForks: 114,
      corroborationRate: '98.4%',
    },
  });

  // Separate Casual Field Channel Feed
  const [channelPosts, setChannelPosts] = useState<FieldChannelPost[]>([
    {
      id: 'cp-1',
      authorHandle: profile.handle,
      authorName: profile.displayName,
      content: 'Tuning SDR receiver between scanning assignments. Vermilion freight frequency quiet for the afternoon. #offduty #soundtrack',
      category: 'offduty',
      timestamp: '42 mins ago',
      reactions: { verified: 14, signal: 8, flash: 5 },
    },
    {
      id: 'cp-2',
      authorHandle: profile.handle,
      authorName: profile.displayName,
      content: 'Field desk rig check for the Danville Junction stakeout. Running offline maps & battery backup. #gear',
      category: 'gear',
      mediaUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80',
      timestamp: 'Yesterday at 5:15 PM',
      reactions: { verified: 22, signal: 19, flash: 11 },
    },
  ]);

  const [newPostText, setNewPostText] = useState('');
  const [postCategory, setPostCategory] = useState<'offduty' | 'gear' | 'soundtrack' | 'bts'>('offduty');

  const handlePostChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const post: FieldChannelPost = {
      id: crypto.randomUUID(),
      authorHandle: profile.handle,
      authorName: profile.displayName,
      content: newPostText,
      category: postCategory,
      timestamp: 'Just now',
      reactions: { verified: 1, signal: 0, flash: 0 },
    };

    setChannelPosts([post, ...channelPosts]);
    setNewPostText('');
  };

  const handleReaction = (postId: string, type: 'verified' | 'signal' | 'flash') => {
    setChannelPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, reactions: { ...p.reactions, [type]: p.reactions[type] + 1 } }
          : p
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 sm:pt-24 pb-16 font-mono text-zinc-200">
      {/* 1. Panoramic Cover Photo Header */}
      <div className="relative rounded-t-xl overflow-hidden border-x border-t border-zinc-800 h-52 sm:h-64 bg-zinc-900 group">
        <img
          src={profile.coverPhotoUrl}
          alt="Reporter Field Cover"
          className="w-full h-full object-cover opacity-75 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Competitive Standing Ribbon */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className="px-3 py-1 rounded bg-black/80 border border-zinc-700 text-[10px] font-bold text-amber-300">
            🏆 {profile.corridorRank}
          </span>
          <span
            className="px-3 py-1 rounded border text-[10px] font-bold bg-black/80"
            style={{ borderColor: skinConfig.hex, color: skinConfig.hex }}
          >
            ⚡ {profile.rankTier}
          </span>
        </div>
      </div>

      {/* 2. Avatar & Identity Overlay */}
      <div className="border-x border-b border-zinc-800 bg-zinc-950 rounded-b-xl px-6 pb-6 pt-0 mb-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
          <div className="flex items-end space-x-4">
            {/* Avatar with Skin Accent Ring */}
            <div className="relative">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-xl object-cover border-2 shadow-2xl bg-zinc-900"
                style={{ borderColor: skinConfig.hex }}
              />
              <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-black" />
            </div>

            <div className="pb-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-wide">{profile.displayName}</h1>
                <span className="text-zinc-500 text-sm">@{profile.handle}</span>
              </div>
              <p className="text-xs text-emerald-400 mt-0.5">📍 {profile.corridor}</p>
            </div>
          </div>

          {/* Quick Portfolio Controls */}
          <div className="flex items-center space-x-2 pb-1">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`https://fieldpress.studio/@${profile.handle}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1.5 border border-zinc-700 hover:border-zinc-500 rounded text-xs text-zinc-300 bg-zinc-900"
            >
              {copied ? '✓ Copied' : '🔗 Share Desk'}
            </button>
            {onOpenDm && (
              <button
                type="button"
                onClick={() => setShowDirectMessageModal(true)}
                className="px-3 py-1.5 font-bold rounded text-xs text-black"
                style={{ backgroundColor: skinConfig.hex }}
              >
                💬 Dispatch DM
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed mb-4">{profile.bio}</p>

        {/* Credentials & Merit Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-900">
          {profile.badges.map(b => (
            <div key={b.id} className="p-2 rounded bg-zinc-900/40 border border-zinc-800 flex items-center space-x-2">
              <span className="text-lg">{b.icon}</span>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold text-zinc-200">{b.name}</div>
                <div className="text-[9px] text-zinc-500 truncate">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Persistent Skin Color Selector */}
      <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-950 mb-6 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-3">
          <div>
            <h3 className="font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-2">
              <span>🎨 Console Skin & Tactical Glow</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Customizes your border rings, button glows, and console highlights.
            </p>
          </div>
          {isSaving && <span className="text-[10px] text-cyan-400 font-bold animate-pulse">💾 Saved</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {(Object.keys(SKINS) as SkinColor[]).map(key => {
            const skin = SKINS[key];
            const isSelected = currentSkin === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => saveSkinPreference(key)}
                className={`p-2 rounded border text-left transition ${
                  isSelected ? 'bg-zinc-900 border-zinc-300' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: skin.hex }} />
                  <span className="font-bold text-xs text-zinc-200">{skin.name}</span>
                </div>
                <div className="text-[9px] text-zinc-500 leading-tight">{skin.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tab Navigation (Featuring Field Channel) */}
      <div className="flex border-b border-zinc-800 mb-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('channel')}
          className={`pb-2 mr-6 flex items-center space-x-1.5 ${
            activeTab === 'channel' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <span>📻 Field Channel</span>
          <span className="px-1.5 py-0.2 bg-zinc-800 text-[10px] rounded text-zinc-400">Personal Log</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dispatches')}
          className={`pb-2 mr-6 ${
            activeTab === 'dispatches' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Verified Pressies ({profile.stats.verifiedDispatches})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('forks')}
          className={`pb-2 mr-6 ${
            activeTab === 'forks' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Corroborated Forks ({profile.stats.downstreamForks})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('bureaus')}
          className={`pb-2 ${
            activeTab === 'bureaus' ? 'border-b-2 border-cyan-400 text-cyan-300' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Bureau Desks ({profile.bureaus.length})
        </button>
      </div>

      {/* 5. Field Channel Feed (Casual / Off-Duty / Personal) */}
      {activeTab === 'channel' && (
        <div className="space-y-4">
          {/* Channel Composer */}
          <form onSubmit={handlePostChannel} className="p-4 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-bold uppercase text-zinc-300">Broadcast to Off-Duty Field Channel</span>
              <div className="flex space-x-2">
                {(['offduty', 'gear', 'soundtrack', 'bts'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPostCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      postCategory === cat ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    #{cat}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              placeholder="Drop an off-duty field update, radio clip, gear photo, or soundtrack recommendation..."
              className="w-full bg-black border border-zinc-800 rounded p-2.5 text-zinc-200 text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500">
                Personal logs stay separate from official newsroom fact-check queues.
              </span>
              <button
                type="submit"
                className="px-4 py-1.5 rounded font-bold text-xs text-black"
                style={{ backgroundColor: skinConfig.hex }}
              >
                Log to Channel
              </button>
            </div>
          </form>

          {/* Posts Stream */}
          <div className="space-y-3">
            {channelPosts.map(post => (
              <div key={post.id} className="p-4 rounded-lg border border-zinc-800 bg-zinc-950/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">@{post.authorHandle}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-900 border border-zinc-800 text-cyan-400 uppercase">
                      #{post.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{post.timestamp}</span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

                {post.mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-zinc-800 mb-3 max-h-80 bg-black">
                    <img src={post.mediaUrl} alt="Field Scene Capture" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Casual Channel Reactions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-zinc-900 text-xs">
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, 'verified')}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 flex items-center space-x-1 text-[11px]"
                  >
                    <span>🛡️ Verified</span>
                    <span className="font-bold text-[10px] text-zinc-400">{post.reactions.verified}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, 'signal')}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 flex items-center space-x-1 text-[11px]"
                  >
                    <span>📡 Signal</span>
                    <span className="font-bold text-[10px] text-zinc-400">{post.reactions.signal}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, 'flash')}
                    className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-zinc-300 flex items-center space-x-1 text-[11px]"
                  >
                    <span>⚡ Flash</span>
                    <span className="font-bold text-[10px] text-zinc-400">{post.reactions.flash}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatches Tab */}
      {activeTab === 'dispatches' && (
        <div className="p-4 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
          Official verified Pressie dispatches filed by @{profile.handle}.
        </div>
      )}

      {/* Forks Tab */}
      {activeTab === 'forks' && (
        <div className="p-4 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
          Corroborations and attribution forks remixed from and by @{profile.handle}.
        </div>
      )}

      {/* Bureaus Tab */}
      {activeTab === 'bureaus' && (
        <div className="p-4 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
          Active bureau desk affiliations and county operating corridors.
        </div>
      )}
    
      {/* Social Media Instant Direct Message Slide-Over / Modal */}
      {showDirectMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono text-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2.5">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="font-bold text-white text-sm">Direct Dispatch to @{profile.handle}</span>
              </div>
              <button
                type="button"
                onClick={() => { setShowDirectMessageModal(false); setSentSuccess(false); }}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Send an encrypted field note, tip corroboration, or reach out to {profile.displayName} directly.
            </p>

            {sentSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-center font-bold">
                ✓ Dispatch sent directly to @{profile.handle}'s wire lounge.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!modalDmText.trim()) return;
                  setSentSuccess(true);
                  setTimeout(() => {
                    setShowDirectMessageModal(false);
                    setSentSuccess(false);
                    setModalDmText('');
                  }, 1200);
                }}
                className="space-y-3"
              >
                <textarea
                  rows={4}
                  required
                  value={modalDmText}
                  onChange={(e) => setModalDmText(e.target.value)}
                  placeholder={`Type your direct message to @${profile.handle}...`}
                  className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowDirectMessageModal(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold shadow-md"
                  >
                    Send Direct Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
</div>
  );
};

export default ReporterProfilePage;
