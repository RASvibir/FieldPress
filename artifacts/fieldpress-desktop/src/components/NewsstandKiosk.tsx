import React from 'react';
import { useLocation } from 'wouter';
import { GitFork, ExternalLink, Bookmark } from 'lucide-react';
import { InkPad } from '@/components/ink-pad';

export interface NewsstandStory {
  id: string;
  title: string;
  author?: string;
  lane?: string;
  pulse?: string;
  myInk?: string | null;
  inkCounts?: Record<string, number>;
  createdAt?: string;
  items?: Array<{ id: string; type: string; content: string }>;
  location?: string;
}

export const NewsstandKioskRack: React.FC<{
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  storyCount: number;
}> = ({ activeFilter, onSelectFilter, storyCount }) => {
  const racks = [
    { id: 'all', label: 'All Editions', icon: '🗞️' },
    { id: 'tactical', label: 'Tactical Wire', icon: '⚡' },
    { id: 'vintage', label: '1920s Broadsheet', icon: '📰' },
    { id: 'comic', label: 'Graphic Novel', icon: '💥' },
    { id: 'pixel', label: '8-Bit CRT', icon: '👾' },
    { id: 'sleek', label: 'Sleek Magazine', icon: '✨' },
  ];

  return (
    <div className="p-5 rounded-2xl border-2 border-border bg-[#fdfcf9] dark:bg-zinc-950 dark:border-zinc-800 font-mono text-xs space-y-4 shadow-sm text-foreground">
      <div className="border-b border-border pb-3">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          NEWSSTAND KIOSK
        </div>
        <h3 className="text-base font-bold text-foreground font-serif mt-0.5">Edition Rack & Corridors</h3>
        <p className="text-[11px] text-muted-foreground mt-1">
          {storyCount} verified dispatches currently pinned to the rack.
        </p>
      </div>

      {/* Edition Filter Rack */}
      <div className="space-y-1.5">
        <div className="text-[10px] text-muted-foreground uppercase font-bold">Filter by Print Edition:</div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
          {racks.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectFilter(r.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition ${
                activeFilter === r.id
                  ? 'bg-primary/15 text-primary border border-primary/50 font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
              }`}
            >
              <span>{r.icon}</span>
              <span className="truncate">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Corridor Desks */}
      <div className="pt-3 border-t border-border space-y-1.5">
        <div className="text-[10px] text-muted-foreground uppercase font-bold">Active Regional Desks:</div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
            <span>📍 Danville Junction Spur</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
            <span>📍 Vermilion Rail Corridor</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NewsstandCard: React.FC<{
  story: NewsstandStory;
  editionFilter?: string;
  onFork: (story: any) => void;
  onStampInk: (storyId: string, ink: string) => void;
}> = ({ story, onFork, onStampInk }) => {
  const [, navigate] = useLocation();

  const author = story.author || 'Field Reporter';
  const location = story.location || 'Danville Junction Bureau';
  const formattedDate = story.createdAt
    ? new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Sep 8, 2026';

  const textItems = story.items?.filter(i => i.type === 'text' || !i.type) || [];
  const photoItems = story.items?.filter(
    i => i.type === 'photo' || i.content?.startsWith('data:image') || i.content?.startsWith('http')
  ) || [];

  const leadText = textItems[0]?.content || '';

  return (
    <article
      onClick={() => navigate(`/story/${story.id}`)}
      className="w-full rounded-2xl border-2 border-border bg-[#fcfaf5] dark:bg-zinc-950 dark:border-zinc-800 text-foreground p-6 sm:p-8 font-mono transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-primary/50 relative overflow-hidden group selection:bg-amber-200"
    >
      {/* 1. Newsprint Masthead Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border text-[10px] tracking-wider uppercase font-bold mb-4 text-muted-foreground">
        <div className="flex items-center space-x-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">📍 {location}</span>
          <span>•</span>
          <span>DISPATCH #{story.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{formattedDate}</span>
          <span className="px-2 py-0.5 rounded border border-border bg-muted/60 text-foreground text-[9px] font-bold">
            {story.lane === 'feed' ? '🗞️ NEWSSTAND BROADSHEET' : '🧱 BULLETIN'}
          </span>
        </div>
      </div>

      {/* 2. Deep Black Printer's Ink Editorial Headline */}
      <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight leading-snug mb-4 text-[#14120e] dark:text-white group-hover:text-primary transition-colors">
        {story.title}
      </h2>

      {/* 3. FIELDED BY Creator Banner on Paper */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-[#f4ede1] dark:bg-zinc-900/80 mb-5">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-card border-2 border-primary flex items-center justify-center font-bold text-primary text-xs shadow-sm">
            @{author.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">FIELDED BY:</span>
              <strong className="text-xs text-foreground font-bold">@{author}</strong>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950/20 border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">
                🎖️ Frontline Scout
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Danville Junction Desk • [✦ Verified Provenance]
            </div>
          </div>
        </div>

        {/* Ink Stamps & Reaction Totals */}
        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-lg border border-emerald-600/40 bg-card text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            ⚡ {story.inkCounts?.['signal'] || 42} SIGNALS
          </div>
          <div className="px-2.5 py-1 rounded-lg border border-amber-600/40 bg-card text-amber-700 dark:text-amber-400 text-xs font-bold">
            🔥 {story.inkCounts?.['heat'] || 12} HEAT
          </div>
        </div>
      </div>

      {/* 4. Reading Spread: AP Dateline Text & Photojournalism Cutline */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-5">
        <div className={`space-y-3 text-xs leading-relaxed ${photoItems.length > 0 ? 'md:col-span-7' : 'md:col-span-12'}`}>
          <p className="text-foreground/90 font-serif text-sm leading-relaxed">
            <strong className="uppercase mr-1.5 font-mono text-xs font-black text-foreground">
              {location.split('•')[0].trim().toUpperCase()} —
            </strong>
            {leadText || 'Field inspection confirmed on-scene relay activities along the municipal corridor.'}
          </p>
          {textItems.slice(1, 3).map(t => (
            <p key={t.id} className="text-muted-foreground font-serif text-xs leading-relaxed">
              {t.content}
            </p>
          ))}
        </div>

        {photoItems.length > 0 && (
          <div className="md:col-span-5 rounded-xl overflow-hidden border-2 border-border bg-black shadow-sm">
            <img src={photoItems[0].content} alt="Field Proof" className="w-full max-h-56 object-cover" />
            <div className="p-2.5 bg-card text-[10px] text-muted-foreground border-t border-border flex justify-between items-center">
              <span>📸 Photo evidence by @{author}</span>
              <span className="text-primary font-semibold">Proof Attached</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Bottom Newsstand Action Rail & Real Ink Pad */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">STAMP INK:</span>
          <InkPad
            value={story.myInk || story.pulse}
            counts={story.inkCounts}
            onPick={(ink) => void onStampInk(story.id, ink)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onFork(story)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition"
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>FORK TO DESK</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/story/${story.id}`)}
            className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-sm transition"
          >
            <span>Read Full Edition →</span>
          </button>
        </div>
      </div>

      {/* Physical Red Rubber Stamp on Newsprint Paper */}
      <div className="absolute bottom-5 right-6 pointer-events-none select-none flex items-center space-x-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-[#852c1e] bg-[#852c1e]/5 transform -rotate-3">
        <img src="/favicon.svg" alt="" className="h-4 w-4 opacity-80 filter sepia" />
        <div className="text-[9px] font-mono tracking-widest text-[#852c1e] font-black uppercase">
          VERIFIED FIELD DISPATCH
        </div>
      </div>
    </article>
  );
};

export default NewsstandCard;
