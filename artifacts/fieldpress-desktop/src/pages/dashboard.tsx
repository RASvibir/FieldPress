import { PressieBuilderStudio } from '../components/PressieBuilderStudio';

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
            
          </div>
        </header>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 1: THE NEWSSTAND (COMPOSER + BROADSHEET FEED + KIOSK RACK)*/}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'feed' && (
          <div className="space-y-6">
            <PressieBuilderStudio
              currentUserHandle={activeUserHandle}
              onStoryPublished={() => refetch()}
            />

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
            onPromoteTipToDesk={() => setTab('feed')}
          />
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAB 3: BEAT BOUNTIES BOARD                                    */}
        {/* ───────────────────────────────────────────────────────────── */}
        {tab === 'bounties' && (
          <BeatBounties
            currentUserHandle={activeUserHandle}
            onClaimBounty={() => setTab('feed')}
          />
        )}
      </div>

      <MobileBottomRail currentTab={tab} onSelectTab={(t) => setTab(t as Tab)} />
    </div>
  );
}

export default DashboardPage;
