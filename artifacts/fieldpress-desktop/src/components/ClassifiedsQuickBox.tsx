import React, { useState } from 'react';
import { Tag, Plus, ArrowRight, Share2, Briefcase, Camera, Repeat } from 'lucide-react';
import { useLocation } from 'wouter';
import { SocialShareModal } from './SocialShareModal';

export const ClassifiedsQuickBox: React.FC<{
  onOpenCreate?: () => void;
}> = ({ onOpenCreate }) => {
  const [, navigate] = useLocation();
  const [shareItem, setShareItem] = useState<{ title: string; desc: string; url: string } | null>(null);

  const highlights = [
    {
      id: 'cl-1',
      tag: 'GIG',
      title: 'Field Driver & Fixer Needed (Vermilion Stakeout)',
      price: '$150 Day',
      corridor: 'Danville Spur',
    },
    {
      id: 'cl-2',
      tag: 'GEAR',
      title: 'RTL-SDR V4 Radio Tuner + Antenna Kit',
      price: 'Trade / $45',
      corridor: 'Champaign-Urbana',
    },
  ];

  return (
    <div className="p-5 rounded-2xl border-2 border-border bg-[#fdfcf9] dark:bg-zinc-950 font-mono text-xs space-y-4 shadow-sm text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div>
          <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold flex items-center space-x-1">
            <Tag className="h-3 w-3" />
            <span>THE CLASSIFIEDS SPOTLIGHT</span>
          </div>
          <h3 className="text-sm font-bold text-foreground font-serif mt-0.5">Peer Market & Gigs</h3>
        </div>

        <button
          type="button"
          onClick={() => onOpenCreate ? onOpenCreate() : navigate('/classifieds')}
          className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-[10px] font-bold flex items-center space-x-1"
        >
          <Plus className="h-3 w-3" />
          <span>Post Ad</span>
        </button>
      </div>

      {/* Highlights List */}
      <div className="space-y-2">
        {highlights.map(item => (
          <div
            key={item.id}
            className="p-2.5 rounded-xl border border-border bg-muted/40 hover:border-primary/40 transition flex flex-col justify-between space-y-1.5"
          >
            <div className="flex items-center justify-between text-[9px] uppercase font-bold text-muted-foreground">
              <span className="px-1.5 py-0.2 rounded bg-background border border-border text-foreground">
                {item.tag}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.price}</span>
            </div>

            <h4
              onClick={() => navigate('/classifieds')}
              className="font-serif font-bold text-xs text-foreground hover:text-primary cursor-pointer leading-snug"
            >
              {item.title}
            </h4>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
              <span>📍 {item.corridor}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShareItem({
                    title: item.title,
                    desc: `${item.price} • ${item.corridor}`,
                    url: `/classifieds#${item.id}`,
                  });
                }}
                className="hover:text-primary flex items-center space-x-1 text-[9px] font-bold"
              >
                <Share2 className="h-2.5 w-2.5" />
                <span>Share Post</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/classifieds')}
        className="w-full py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-[11px] font-bold flex items-center justify-center space-x-1 transition shadow-sm"
      >
        <span>Browse All Market & Gigs</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>

      {shareItem && (
        <SocialShareModal
          isOpen={!!shareItem}
          onClose={() => setShareItem(null)}
          title={shareItem.title}
          summary={shareItem.desc}
          url={shareItem.url}
          type="classified"
        />
      )}
    </div>
  );
};

export default ClassifiedsQuickBox;
