import React, { useState } from 'react';

export type ForkPolicy = 'open' | 'collab_only' | 'locked';

export interface OwnershipProps {
  originalCreatorHandle: string;
  originalCreatorName?: string;
  sharedByHandle?: string;
  forkPolicy: ForkPolicy;
  storyId: string;
  onForkToDesk?: (storyId: string) => void;
  onRequestCollab?: (storyId: string, creatorHandle: string) => void;
}

export const PressieOwnershipBanner: React.FC<{
  originalCreatorHandle: string;
  originalCreatorName?: string;
  sharedByHandle?: string;
}> = ({ originalCreatorHandle, originalCreatorName, sharedByHandle }) => {
  return (
    <div className="font-mono text-xs rounded border border-zinc-800 bg-zinc-900/40 p-2.5 mb-3">
      {sharedByHandle && (
        <div className="text-[10px] text-zinc-500 mb-1 flex items-center space-x-1.5">
          <span>📢 Shared by <strong className="text-zinc-400">@{sharedByHandle}</strong></span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-amber-400 font-bold text-[11px]">✦ ORIGINAL DISPATCH CREATOR:</span>
          <span className="font-bold text-white">@{originalCreatorHandle}</span>
          {originalCreatorName && (
            <span className="text-zinc-500 text-[10px]">({originalCreatorName})</span>
          )}
        </div>
        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800 text-amber-300 font-bold">
          Immutable Provenance
        </span>
      </div>
    </div>
  );
};

export const PressieActionControls: React.FC<OwnershipProps> = ({
  originalCreatorHandle,
  forkPolicy,
  storyId,
  onForkToDesk,
  onRequestCollab,
}) => {
  const [collabRequested, setCollabRequested] = useState(false);

  const handleCollab = () => {
    setCollabRequested(true);
    if (onRequestCollab) {
      onRequestCollab(storyId, originalCreatorHandle);
    }
  };

  return (
    <div className="flex items-center space-x-2 font-mono text-xs">
      {forkPolicy === 'open' && (
        <button
          type="button"
          onClick={() => onForkToDesk && onForkToDesk(storyId)}
          className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold"
        >
          [🍴 FORK TO DESK]
        </button>
      )}

      {forkPolicy === 'collab_only' && (
        <button
          type="button"
          disabled={collabRequested}
          onClick={handleCollab}
          className={`px-3 py-1.5 rounded border font-bold ${
            collabRequested
              ? 'bg-cyan-950/50 border-cyan-800 text-cyan-400'
              : 'bg-cyan-600 hover:bg-cyan-500 text-black border-cyan-500'
          }`}
        >
          {collabRequested ? '✓ Collab Request Sent' : '[🤝 REQUEST COLLAB]'}
        </button>
      )}

      {forkPolicy === 'locked' && (
        <span className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-semibold text-[11px] cursor-not-allowed">
          🔒 Forks Locked by Creator
        </span>
      )}
    </div>
  );
};

export const ForkPolicySelector: React.FC<{
  selectedPolicy: ForkPolicy;
  onChange: (policy: ForkPolicy) => void;
}> = ({ selectedPolicy, onChange }) => {
  const options: { id: ForkPolicy; label: string; desc: string }[] = [
    { id: 'open', label: 'Open Forking', desc: 'Any verified reporter can directly fork and corroborate' },
    { id: 'collab_only', label: 'Collab Only', desc: 'Reporters must request co-reporting permission' },
    { id: 'locked', label: 'Locked / No Forks', desc: 'Read-only original; cannot be forked to desk' },
  ];

  return (
    <div className="font-mono text-xs space-y-1.5">
      <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
        Fork & Collaboration Governance
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map(opt => (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`p-2 rounded border cursor-pointer transition ${
              selectedPolicy === opt.id
                ? 'bg-cyan-950/40 border-cyan-600 text-cyan-200'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs">{opt.label}</div>
            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">{opt.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
