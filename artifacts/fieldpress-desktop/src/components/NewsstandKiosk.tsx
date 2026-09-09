import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { GitFork, Share2, MessageSquare, ExternalLink } from 'lucide-react';
import { InkPad } from '@/components/ink-pad';
import { inkLabel, type InkId } from '@/lib/ink';

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
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/90 font-mono text-xs space-y-4 shadow-xl">
      <div className="border-b border-zinc-800 pb-2">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          NEWSSTAND KIOSK
        </div>
        <h3 className="text-sm font-bold text-white mt-0.5">Edition Rack & Corridors</h3>
        <p className="text-[11px] text-zinc-400 mt-1">
          {storyCount} verified dispatches currently pinned to the newsstand.
        </p>
      </div>

      {/* Edition Filter Pills */}
      <div className="space-y-1">
        <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1.5">Filter by Print Edition:</div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1">
          {racks.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectFilter(r.id)}
              className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition ${
                activeFilter === r.id
                  ? 'bg-cyan-950 border border-cyan-600 text-cyan-200 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <span>{r.icon}</span>
              <span className="truncate">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Corridor Frequencies */}
      <div className="pt-3 border-t border-zinc-900 space-y-1.5">
        <div className="text-[10px] text-zinc-500 uppercase font-bold">Active Corridor Desks:</div>
        <div className="space-y-1 text-[11px] text-zinc-400">
          <div className="flex justify-between items-center p-1.5 rounded bg-zinc-900/40">
            <span>📍 Danville Junction Spur</span>
            <span className="text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center p-1.5 rounded bg-zinc-900/40">
            <span>📍 Vermilion Rail Corridor</span>
            <span className="text-emerald-400 font-bold">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center p-1.5 rounded bg-zinc-900/40">
            <span>📍 Chicago South 63rd</span>
            <span className="text-zinc-500">STANDBY</span>
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
}> = ({ story, editionFilter = 'all', onFork, onStampInk }) => {
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
  const isVintage = editionFilter === 'vintage';

  return (
    <article
      onClick={() => navigate(`/story/${story.id}`)}
      className={`w-full rounded-xl border p-6 font-mono transition-all cursor-pointer shadow-xl relative overflow-hidden group ${
        isVintage
          ? 'bg-[#f5efe4] border-[#3d3326] text-[#1c1914]'
          : 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-zinc-700'
      }`}
    >
      {/* 1. Newsstand Masthead Header Strip */}
      <div
        className={`flex items-center justify-between pb-3 border-b text-[10px] tracking-wider uppercase font-bold mb-4 ${
          isVintage ? 'border-[#3d3326] text-[#5a4c3a]' : 'border-zinc-800 text-emerald-400'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span>📍 {location}</span>
          <span>•</span>
          <span>DISPATCH #{story.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>{formattedDate}</span>
          <span className={`px-1.5 py-0.2 rounded border text-[9px] ${
            isVintage ? 'border-[#3d3326] bg-[#e8dfcf] text-[#2b241b]' : 'border-cyan-800 bg-cyan-950 text-cyan-300'
          }`}>
            {story.lane === 'feed' ? '🗞️ NEWSSTAND EDITION' : '🧱 WALL BULLETIN'}
          </span>
        </div>
      </div>

      {/* 2. Large Broadsheet Headline */}
      <h2
        className={`text-2xl sm:text-3xl font-bold font-serif tracking-tight leading-snug mb-4 group-hover:text-cyan-400 transition-colors ${
          isVintage ? 'text-[#14120e] group-hover:text-amber-900' : 'text-white'
        }`}
      >
        {story.title}
      </h2>

      {/* 3. Prominent FIELDED BY Creator Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border mb-5 ${
          isVintage
            ? 'bg-[#ede4d3] border-[#3d3326]'
            : 'bg-zinc-900/70 border-zinc-800'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-800 border-2 border-cyan-400 flex items-center justify-center font-bold text-cyan-300 text-xs shadow-md">
            @{author.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className={`text-[10px] uppercase font-bold ${isVintage ? 'text-[#5a4c3a]' : 'text-zinc-500'}`}>
                FIELDED BY:
              </span>
              <strong className={`text-xs ${isVintage ? 'text-black' : 'text-white'}`}>@{author}</strong>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-bold">
                🎖️ Frontline Scout
              </span>
            </div>
            <div className={`text-[10px] ${isVintage ? 'text-[#5a4c3a]' : 'text-zinc-400'}`}>
              Danville Junction Desk • [✦ Immutable Provenance]
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className={`px-2 py-1 rounded border text-[10px] font-bold ${
            isVintage
              ? 'bg-[#f5efe4] border-[#852c1e] text-[#852c1e]'
              : 'bg-black/70 border-emerald-700/60 text-emerald-300'
          }`}>
            ⚡ {story.inkCounts?.['signal'] || 42} SIGNALS
          </div>
          <div className={`px-2 py-1 rounded border text-[10px] font-bold ${
            isVintage
              ? 'bg-[#f5efe4] border-amber-900 text-amber-900'
              : 'bg-black/70 border-amber-700/60 text-amber-300'
          }`}>
            🔥 {story.inkCounts?.['heat'] || 12} HEAT
          </div>
        </div>
      </div>

      {/* 4. Two-Column Spread: Text & Photojournalism Frame */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-5">
        <div className={`space-y-3 text-xs leading-relaxed ${photoItems.length > 0 ? 'md:col-span-7' : 'md:col-span-12'}`}>
          <p className={isVintage ? 'text-[#1c1914]' : 'text-zinc-300'}>
            <strong className={`uppercase mr-1.5 ${isVintage ? 'text-black font-serif text-sm' : 'text-zinc-100 font-mono'}`}>
              {location.split('•')[0].trim().toUpperCase()} —
            </strong>
            {leadText || 'Field dispatch filed from scene along the rail freight line.'}
          </p>
          {textItems.slice(1, 3).map(t => (
            <p key={t.id} className={isVintage ? 'text-[#382f24]' : 'text-zinc-400'}>
              {t.content}
            </p>
          ))}
        </div>

        {photoItems.length > 0 && (
          <div className="md:col-span-5 rounded-lg overflow-hidden border border-zinc-800 bg-black">
            <img src={photoItems[0].content} alt="Field Proof" className="w-full max-h-56 object-cover" />
            <div className="p-2 bg-zinc-900/90 text-[10px] text-zinc-400 border-t border-zinc-800 flex justify-between">
              <span>📸 Evidence by @{author}</span>
              <span className="text-cyan-400 font-semibold">Proof Attached</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Bottom Newsstand Actions & Ink Pad */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
          isVintage ? 'border-[#3d3326]' : 'border-zinc-800/80'
        }`}
      >
        <div className="flex items-center space-x-2">
          <span className={`text-[10px] uppercase font-bold ${isVintage ? 'text-[#5a4c3a]' : 'text-zinc-500'}`}>STAMP INK:</span>
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
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold"
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>FORK TO DESK</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/story/${story.id}`)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-bold shadow-md"
          >
            <span>Read Full Edition →</span>
          </button>
        </div>
      </div>
    
      {/* Light Translucent Favicon Watermark Stamp */}
      <div className="absolute bottom-5 right-6 pointer-events-none select-none flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 backdrop-blur-[1px] transform -rotate-3 transition-opacity group-hover:opacity-100 opacity-60">
        <img src="/favicon.svg" alt="" className="h-4 w-4 opacity-70 filter drop-shadow-[0_0_4px_rgba(16,185,129,0.3)]" />
        <div className="text-[9px] font-mono tracking-widest text-emerald-400/90 font-bold uppercase">
          VERIFIED FIELD DISPATCH
        </div>
      </div>

    </article>
  );
};

export default NewsstandCard;
