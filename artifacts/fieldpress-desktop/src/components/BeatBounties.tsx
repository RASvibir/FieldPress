import React, { useState } from 'react';

export interface BeatBounty {
  id: string;
  title: string;
  description: string;
  locationSector: string;
  rewardDollars: number;
  creatorHandle: string;
  status: 'open' | 'claimed' | 'settled';
  claimedBy?: string;
  createdAt: string;
}

export const BeatBounties: React.FC<{
  currentUserHandle?: string;
  onClaimBounty?: (bounty: BeatBounty) => void;
}> = ({ currentUserHandle = 'ras.ip', onClaimBounty }) => {
  const [bounties, setBounties] = useState<BeatBounty[]>([
    {
      id: 'b-1',
      title: 'Photo Evidence: Curbside EV Chargers on 63rd St',
      description: 'Need on-scene photo confirmation of the high-voltage trenching status between Dorchester and Blackstone.',
      locationSector: 'Chicago South Side • 63rd St Corridor',
      rewardDollars: 25,
      creatorHandle: 'jordan',
      status: 'open',
      createdAt: '2 hours ago',
    },
    {
      id: 'b-2',
      title: 'Scanner Log Corroboration: Vermilion Junction Signals',
      description: 'Audio capture or operator log timestamp of Norfolk Southern dispatcher relay orders from 11:00 AM window.',
      locationSector: 'Danville Junction • Vermilion County',
      rewardDollars: 40,
      creatorHandle: 'glitterpop',
      status: 'open',
      createdAt: '35 mins ago',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newReward, setNewReward] = useState('20');

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: BeatBounty = {
      id: crypto.randomUUID(),
      title: newTitle,
      description: newDesc,
      locationSector: newLocation || 'Regional Desk',
      rewardDollars: parseInt(newReward, 10) || 20,
      creatorHandle: currentUserHandle,
      status: 'open',
      createdAt: 'Just now',
    };

    setBounties([item, ...bounties]);
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setShowCreateModal(false);
  };

  return (
    <div className="font-mono text-xs rounded-lg border border-border dark:border-border dark:border-zinc-800 bg-card dark:bg-card dark:bg-zinc-950 p-4 my-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border dark:border-border dark:border-zinc-800 mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground dark:text-foreground dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <span>🎯 Beat Bounties & Community Sponsorships</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Peer-funded field assignments settled directly via Stripe Connect Express.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs"
        >
          {showCreateModal ? '✕ Cancel' : '+ Post Beat Bounty'}
        </button>
      </div>

      {/* Bounty Creation Modal Drawer */}
      {showCreateModal && (
        <form onSubmit={handleCreateBounty} className="mb-4 p-4 rounded bg-muted/60 dark:bg-muted/60 dark:bg-zinc-900/60 border border-border dark:border-border dark:border-zinc-700 space-y-3">
          <div className="text-xs font-bold text-foreground dark:text-foreground dark:text-zinc-200 uppercase">Define Field Assignment & Reward</div>
          <input
            type="text"
            required
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Assignment title (e.g. 'Photo verification of transit relay')..."
            className="w-full bg-background dark:bg-background dark:bg-black border border-border dark:border-border dark:border-zinc-700 rounded p-2 text-foreground dark:text-foreground dark:text-zinc-200 text-xs"
          />
          <textarea
            rows={2}
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Specific evidence criteria (records, audio logs, photos)..."
            className="w-full bg-background dark:bg-background dark:bg-black border border-border dark:border-border dark:border-zinc-700 rounded p-2 text-foreground dark:text-foreground dark:text-zinc-200 text-xs"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              placeholder="Target Location / Sector..."
              className="flex-1 bg-background dark:bg-background dark:bg-black border border-border dark:border-border dark:border-zinc-700 rounded p-2 text-foreground dark:text-foreground dark:text-zinc-200 text-xs"
            />
            <div className="flex items-center space-x-1 bg-background dark:bg-background dark:bg-black border border-border dark:border-border dark:border-zinc-700 rounded px-2">
              <span className="text-muted-foreground/80">$</span>
              <input
                type="number"
                min="5"
                step="5"
                value={newReward}
                onChange={e => setNewReward(e.target.value)}
                className="w-16 bg-transparent text-emerald-400 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded">
              Fund & Broadcast Assignment
            </button>
          </div>
        </form>
      )}

      {/* Bounties Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {bounties.map(b => (
          <div key={b.id} className="p-3.5 rounded border border-border dark:border-border dark:border-zinc-800 bg-muted/60 dark:bg-muted/60 dark:bg-zinc-900/60 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-[10px] text-emerald-400 font-semibold">📍 {b.locationSector}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-xs">
                  ${b.rewardDollars} USD
                </span>
              </div>
              <h4 className="font-bold text-foreground dark:text-foreground dark:text-zinc-100 text-xs mb-1">{b.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-snug mb-3">{b.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border dark:border-border dark:border-zinc-800/80 text-[10px] text-muted-foreground/80">
              <span>Funded by @{b.creatorHandle} • {b.createdAt}</span>
              <button
                type="button"
                onClick={() => onClaimBounty && onClaimBounty(b)}
                className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold"
              >
                Claim & File Dispatch →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeatBounties;
