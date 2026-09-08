import React, { useState } from 'react';

export interface PeerReactionsProps {
  storyId: string;
  initialCounts: {
    signal: number;
    heat: number;
    iconic: number;
  };
  initialUserReactions?: ('signal' | 'heat' | 'iconic')[];
  onToggleReaction?: (type: 'signal' | 'heat' | 'iconic', active: boolean) => void;
}

export const PeerReactions: React.FC<PeerReactionsProps> = ({
  storyId,
  initialCounts,
  initialUserReactions = [],
  onToggleReaction,
}) => {
  const [counts, setCounts] = useState(initialCounts);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set(initialUserReactions));

  const toggle = (type: 'signal' | 'heat' | 'iconic') => {
    const isCurrentlyActive = userReactions.has(type);
    const updated = new Set(userReactions);

    if (isCurrentlyActive) {
      updated.delete(type);
      setCounts(prev => ({ ...prev, [type]: prev[type] - 1 }));
    } else {
      updated.add(type);
      setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }

    setUserReactions(updated);
    if (onToggleReaction) {
      onToggleReaction(type, !isCurrentlyActive);
    }
  };

  const reactionMeta = [
    {
      type: 'signal' as const,
      label: 'Signal',
      icon: '⚡',
      weight: '+5 Cred',
      activeClass: 'bg-emerald-950/70 border-emerald-600 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
    },
    {
      type: 'heat' as const,
      label: 'Heat',
      icon: '🔥',
      weight: '+2 Cred',
      activeClass: 'bg-amber-950/70 border-amber-600 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
    },
    {
      type: 'iconic' as const,
      label: 'Iconic',
      icon: '💎',
      weight: '+10 Cred',
      activeClass: 'bg-cyan-950/70 border-cyan-600 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]',
    },
  ];

  return (
    <div className="flex items-center space-x-2 font-mono text-xs">
      {reactionMeta.map(rm => {
        const isActive = userReactions.has(rm.type);
        return (
          <button
            key={rm.type}
            type="button"
            onClick={() => toggle(rm.type)}
            title={`${rm.label} (${rm.weight})`}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition ${
              isActive
                ? rm.activeClass
                : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
            }`}
          >
            <span>{rm.icon}</span>
            <span className="font-bold">{counts[rm.type]}</span>
            <span className="text-[10px] hidden sm:inline text-zinc-500">{rm.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PeerReactions;
