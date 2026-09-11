import { CustomizePressPassModal } from "../components/CustomizePressPassModal";
import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useSkin } from '../context/SkinContext';

export interface PressPassProps {
  params?: { handle?: string };
}

export const PressPassPage: React.FC<PressPassProps> = (props) => {
  const [, routeParams] = useRoute('/pass/:handle');
  const handle = routeParams?.handle || props.params?.handle || 'ras.ip';
  const { skinConfig } = useSkin();
  const [passIssueTime, setPassIssueTime] = useState('');
  const [isCustomizingPass, setIsCustomizingPass] = useState(false);
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('fieldpress_profile_' + handle);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      handle,
      displayName: handle === 'ras.ip' ? 'Victor Birkle' : 'Pamela Black',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
      bio: 'Boots-on-the-ground field reporter & newsroom architect.',
      corridor: 'Danville • Vermilion Desk',
      rankTier: 'Senior Frontline Vanguard',
      corridorRank: 'Top 3% Sector Rank',
      signalScore: 842,
      bureaus: ['Danville Junction Bureau'],
      badges: [
        { id: 'frontline', name: 'Frontline Scout', icon: '🎖️', desc: 'First verified dispatch' },
        { id: 'proof', name: 'Proof of Scene', icon: '📸', desc: 'Authentic photo proof' },
        { id: 'anchor', name: 'Fact Anchor', icon: '🛡️', desc: 'Agency citations' },
        { id: 'pillar', name: 'Bureau Pillar', icon: '🌲', desc: 'Desk coordinator' },
      ],
      stats: { verifiedDispatches: 38, downstreamForks: 114, corroborationRate: '98.4%' },
    };
  });

  const [isCohort, setIsCohort] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`fp_cohort_${handle}`);
      return saved === 'true';
    }
    return false;
  });

  const [cohortCount, setCohortCount] = useState(24);
  const [showDmInput, setShowDmInput] = useState(false);
  const [dmText, setDmText] = useState('');
  const [sentNotice, setSentNotice] = useState(false);

  const toggleCohort = () => {
    const next = !isCohort;
    setIsCohort(next);
    setCohortCount(prev => next ? prev + 1 : prev - 1);
    localStorage.setItem(`fp_cohort_${handle}`, String(next));
  };

  const handleSendDm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmText.trim()) return;
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      setShowDmInput(false);
      setDmText('');
    }, 1400);
  };


  useEffect(() => {
    setPassIssueTime(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }, []);

  const verificationHash = `FP-PASS-${handle.toUpperCase()}-VERIFIED-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="max-w-md mx-auto px-4 pt-20 sm:pt-24 pb-16 font-mono text-zinc-200">
      <div className="text-center mb-4">
        <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
          ← Return to Newsroom Desk
        </a>
      </div>

      {/* Tamper-Evident Physical Press Card Simulation */}
      <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-950 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
        {/* Top Security Banner */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 text-center">
          <div className="text-[9px] uppercase tracking-[0.25em] text-emerald-400 font-bold mb-1">
            VERIFIED FIELD JOURNALISM CREDENTIAL
          </div>
          <h1 className="text-lg font-bold tracking-wider text-white">FIELDPRESS NEWSROOM</h1>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            DECENTRALIZED FREELANCE BUREAU CORRESPONDENT
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          {/* Portrait & Core Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-24 w-24 rounded-xl object-cover border-2 shadow-md"
                  style={{ borderColor: skinConfig.hex }}
                />
              ) : (
                <div
                  className="h-24 w-24 rounded-xl bg-zinc-900 border-2 flex items-center justify-center text-xl font-bold text-cyan-300 shadow-inner"
                  style={{ borderColor: skinConfig.hex }}
                >
                  @{profile.handle.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black" />
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold text-white leading-tight">
                {profile.displayName}
              </div>
              <div className="text-xs text-cyan-400 font-semibold">@{handle}</div>
              <div className="text-[10px] text-zinc-400">
                Corridor: <span className="text-zinc-200 font-bold">{profile.corridor}</span>
              </div>
              <div className="inline-block px-2.5 py-1 rounded bg-amber-950/80 border border-amber-600 text-amber-300 text-[11px] font-bold">
                {profile.rankTier}
              </div>
            </div>
          </div>

          {/* Credentials Grid */}
          
          {/* Cohort Network & Direct Communication Strip */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">
                COHORT NETWORK: <strong className="text-white">{cohortCount} Connected</strong>
              </span>
              <span className="text-[9px] text-emerald-400 font-bold">● ONLINE ON DESK</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleCohort}
                className={`py-2 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center space-x-1.5 ${
                  isCohort
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-300'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-md'
                }`}
              >
                <span>{isCohort ? '✓' : '+'}</span>
                <span>{isCohort ? 'Connected Cohort' : 'Add as Cohort'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDmInput(!showDmInput)}
                className="py-2 px-3 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center space-x-1.5"
              >
                <span>💬</span>
                <span>Dispatch Memo</span>
              </button>
            </div>

            {showDmInput && (
              <form onSubmit={handleSendDm} className="pt-2 border-t border-zinc-800/80 space-y-2">
                {sentNotice ? (
                  <div className="p-2 bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-center text-xs font-bold rounded">
                    ✓ Memo dispatched to @{handle}'s wire lounge.
                  </div>
                ) : (
                  <>
                    <textarea
                      rows={2}
                      value={dmText}
                      onChange={e => setDmText(e.target.value)}
                      placeholder={`Direct field memo to cohort @${handle}...`}
                      className="w-full bg-black border border-zinc-700 rounded p-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded"
                      >
                        Transmit Memo
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

<div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div>
              <div className="text-[9px] uppercase text-zinc-500 font-bold">SIGNAL SCORE</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">⚡ 842 CRED</div>
            </div>
            <div>
              <div className="text-[9px] uppercase text-zinc-500 font-bold">DISPATCH ACCURACY</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">98.4% PEER VETTED</div>
            </div>
          </div>

          {/* Mock QR Verification Stamp */}
          <div className="p-3 rounded-xl border border-zinc-800 bg-black flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[9px] uppercase font-bold text-zinc-400">LIVE MERIT VERIFICATION</div>
              <div className="text-[10px] text-emerald-400 font-mono truncate max-w-[180px]">
                {verificationHash}
              </div>
              <div className="text-[9px] text-zinc-500">Issued: {passIssueTime} • Verified Offline</div>
            </div>
            {/* Visual Simulated QR Block */}
            <div className="h-12 w-12 bg-white p-1 rounded grid grid-cols-4 gap-0.5">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div key={idx} className={`${idx % 2 === 0 || idx % 5 === 0 ? 'bg-black' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>

          
          {/* In-Place Customize Pass Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsCustomizingPass(true)}
              className="w-full py-2.5 rounded-xl border border-amber-500/70 bg-amber-950/30 hover:bg-amber-950/60 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
            >
              <span>⚙️</span>
              <span>Customize Pass & Clearance Tiers</span>
            </button>
          </div>

          <CustomizePressPassModal
            isOpen={isCustomizingPass}
            onClose={() => setIsCustomizingPass(false)}
            profile={profile as any}
            onSave={(updated) => {
              setProfile(updated);
              try {
                localStorage.setItem("fieldpress_profile_" + updated.handle, JSON.stringify(updated));
              } catch {}
              setIsCustomizingPass(false);
            }}
          />

          {/* Legal Rights Callout */}
          <div className="text-[9px] text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-3 text-center">
            The bearer is an independent newsroom correspondent gathering news, audio logs, and photographic proof in public spaces. Protected under state and federal press freedoms.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressPassPage;
