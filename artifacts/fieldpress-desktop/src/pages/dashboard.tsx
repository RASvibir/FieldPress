
function getChicagoDateString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

import { scanPressieDraft, autoRedactSensitiveData } from '../lib/auditScanner';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Camera, Radio, Target, Newspaper, Sparkles, Send } from 'lucide-react';
import { useListStories } from '@workspace/api-client-react';
import { NewsstandCard, NewsstandKioskRack } from '../components/NewsstandKiosk';
import { FieldyCommunications } from '../components/FieldyCommunications';
import { BeatBounties } from '../components/BeatBounties';
import { MobileBottomRail } from '../components/MobileBottomRail';
import { AnonymousFieldyToggle } from '../components/AnonymousFieldyToggle';
import { ForkPolicySelector, ForkPolicy } from '../components/PressieOwnershipBadge';

export type Tab = 'feed' | 'wire' | 'bounties';

export function DashboardPage() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>('feed');
  const [rackFilter, setRackFilter] = useState<string>('all');

  // Composer State
  const [composerTitle, setComposerTitle] = useState('');
  const [composerNote, setComposerNote] = useState('');
  const [composerForkPolicy, setComposerForkPolicy] = useState<ForkPolicy>('open');

  // Dynamically resolve real authenticated user handle
  const [activeUserHandle, setActiveUserHandle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fp_user_handle') || localStorage.getItem('fp_handle');
      if (saved) return saved;
    }
    return 'ras.ip';
  });

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        if (user && user.displayName) {
          setActiveUserHandle(user.displayName);
          localStorage.setItem('fp_user_handle', user.displayName);
        } else if (user && user.email) {
          const handle = user.email.split('@')[0];
          setActiveUserHandle(handle);
          localStorage.setItem('fp_user_handle', handle);
        }
      })
      .catch(() => {});
  }, []);

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Stories query from API
  const { data: storiesData, refetch } = useListStories({ status: 'active' });

  const handleStampInk = async (storyId: string, ink: string) => {
    try {
      await fetch(`/api/stories/${storyId}/ink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ink }),
      });
      refetch();
    } catch {}
  };
  const stories = (storiesData as any)?.stories || storiesData || [];

  const handlePostToNewsstand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerTitle.trim()) return;
    setIsPosting(true);
    try {
      await fetch('/api/stories', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: composerTitle.trim(),
          lane: 'feed',
          note: composerNote.trim(),
          photo: photoPreview || undefined,
          forkPolicy: composerForkPolicy,
          isAnonymous,
        }),
      });
      setComposerTitle('');
      setComposerNote('');
      setPhotoPreview(null);
      refetch();
    } catch {
      alert('Could not publish dispatch to Newsstand.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono pb-24 md:pb-12 pt-20 sm:pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Newsroom Masthead Header */}
        <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-emerald-400 uppercase font-bold mb-1 flex items-center space-x-1.5">
              <span>📍 DANVILLE JUNCTION & VERMILION CORRIDOR DESK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-foreground dark:text-white">
              FIELDPRESS NEWSROOM
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Decentralized boots-on-the-ground reporting. Verified peer corroboration across county lines.
            </p>
          </div>

          {/* Clean 3-Tab View Switcher */}
          <div className="flex rounded-xl bg-muted/70 p-1 border border-border rounded-xl shadow-sm self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTab('feed')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                tab === 'feed' ? 'bg-card text-foreground shadow-sm border border-border font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Newspaper className="h-4 w-4 text-amber-400" />
              <span>🗞️ The Newsstand</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('wire')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                tab === 'wire' ? 'bg-card text-cyan-600 dark:text-cyan-300 shadow-sm border border-cyan-500/50 font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Radio className="h-4 w-4 text-cyan-400" />
              <span>📡 Fieldy Wire & DMs</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('bounties')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
                tab === 'bounties' ? 'bg-card text-emerald-600 dark:text-emerald-300 shadow-sm border border-emerald-500/50 font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="h-4 w-4 text-emerald-400" />
              <span>🎯 Beat Bounties</span>
            </button>
          </div>
        </header>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: THE NEWSSTAND (COMPOSER + BROADSHEET FEED + KIOSK RACK)*/}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'feed' && (
          <div className="space-y-6">
            {/* The Newsstand Dispatch Composer */}
            <form
              onSubmit={handlePostToNewsstand}
              className="p-6 rounded-2xl border-2 border-border bg-[#fdfcf9] dark:bg-zinc-950 dark:border-zinc-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border pb-2 text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground uppercase flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>File Live Ground Dispatch</span>
                </span>
                <span className="text-[10px] text-zinc-500">Posts directly to verified Newsstand</span>
              </div>

              <input
                type="text"
                required
                value={composerTitle}
                onChange={(e) => setComposerTitle(e.target.value)}
                placeholder="Headline or breaking news hook (e.g. Danville switch delay confirmed)..."
                className="w-full bg-background border-2 border-border/80 rounded-xl p-3 text-foreground text-sm font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary font-serif"
              />

              <textarea
                rows={2}
                value={composerNote}
                onChange={(e) => setComposerNote(e.target.value)}
                placeholder="Field notes, scanner audio transcripts, or ground observations..."
                className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary font-mono"
              />

              {photoPreview && (
                <div className="relative inline-block border border-zinc-700 rounded-lg overflow-hidden max-h-32">
                  <img src={photoPreview} alt="" className="h-32 w-auto object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-border pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-border bg-muted/60 text-muted-foreground hover:text-foreground flex items-center space-x-1.5 text-xs">
                    <Camera className="h-3.5 w-3.5" />
                    <span>Attach Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCameraCapture} />
                  </label>
                  <AnonymousFieldyToggle
                    isAnonymous={isAnonymous}
                    onChange={setIsAnonymous}
                    currentUserHandle={activeUserHandle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPosting || !composerTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isPosting ? 'Publishing...' : 'POST PRESSIE TO NEWSSTAND'}</span>
                </button>
              </div>

              <div className="pt-2">
                <ForkPolicySelector
                  selectedPolicy={composerForkPolicy}
                  onChange={setComposerForkPolicy}
                />
              </div>
            </form>

            {/* Desktop 2-Column Grid: Newsstand Broadsheet Stream + Kiosk Rack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Main Broadsheet Stream */}
              <div className="lg:col-span-8 space-y-6">
                {stories.length === 0 ? (
                  <div className="p-12 rounded-2xl border-2 border-dashed border-zinc-800 text-center space-y-3 bg-zinc-950/40">
                    <div className="text-3xl">🗞️</div>
                    <h3 className="text-base font-bold text-white font-serif">The Newsstand is Fresh & Ready</h3>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      All previous test records have been archived. File the first verified field dispatch using the composer above!
                    </p>
                  </div>
                ) : (
                  stories.map((s: any) => (
                    <NewsstandCard
                      key={s.id}
                      story={s}
                      editionFilter={rackFilter}
                      onFork={() => navigate(`/story/${s.id}`)}
                      onStampInk={handleStampInk}
                    />
                  ))
                )}
              </div>

              {/* Kiosk Sidebar Rack */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24">
                <NewsstandKioskRack
                  activeFilter={rackFilter}
                  onSelectFilter={setRackFilter}
                  storyCount={stories.length}
                />
              </aside>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 2: FIELDY WIRE & MESSENGER                                */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'wire' && (
          <FieldyCommunications
            currentUserHandle={activeUserHandle}
            onPromoteTipToDesk={(tip, handle) => {
              setComposerTitle(`[Dispatched via @${handle}]: ${tip}`);
              setTab('feed');
            }}
          />
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: BEAT BOUNTIES BOARD                                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'bounties' && (
          <BeatBounties
            currentUserHandle={activeUserHandle}
            onClaimBounty={(bounty) => {
              setComposerTitle(`[Claiming Bounty: ${bounty.title} - $${bounty.rewardDollars}]: `);
              setTab('feed');
            }}
          />
        )}
      </div>

      <MobileBottomRail currentTab={tab} onSelectTab={(t) => setTab(t as Tab)} />
    </div>
  );
}

export default DashboardPage;
