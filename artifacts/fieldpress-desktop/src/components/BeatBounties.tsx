import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, Plus, DollarSign, CheckCircle2 } from 'lucide-react';

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
  pressAccreditation?: string;
  kycReferenceId?: string;
}

export const BeatBounties: React.FC<{
  currentUserHandle?: string;
  isRegisteredPress?: boolean;
  isKycVerified?: boolean;
  onClaimBounty?: (bounty: BeatBounty) => void;
}> = ({
  currentUserHandle = 'Fieldy',
  isRegisteredPress = false,
  isKycVerified = false,
  onClaimBounty,
}) => {
  const [bounties, setBounties] = useState<BeatBounty[]>([
    {
      id: 'b-1',
      title: 'Photo Verification: Curbside Charger Trenching on 63rd',
      description: 'Need ground photo confirmation of high-voltage conduit status between Dorchester and Blackstone.',
      locationSector: 'Chicago South Side • 63rd St',
      rewardDollars: 25,
      creatorHandle: 'SouthSideCourier',
      status: 'open',
      createdAt: '2 hours ago',
      pressAccreditation: 'Accredited Press Bureau',
      kycReferenceId: 'KYC_VERIFIED_IL_402',
    },
    {
      id: 'b-2',
      title: 'Dispatcher Log Relay: Vermilion Junction Crossing',
      description: 'Timestamped audio or log confirmation of manual switch instructions from 11:00 AM window.',
      locationSector: 'Danville Junction Spur',
      rewardDollars: 40,
      creatorHandle: 'DanvilleBroadsheet',
      status: 'open',
      createdAt: '35 mins ago',
      pressAccreditation: 'Accredited Press Bureau',
      kycReferenceId: 'KYC_VERIFIED_IL_109',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newReward, setNewReward] = useState('25');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canPostBounty = isRegisteredPress && isKycVerified;

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPostBounty) {
      setErrorMessage('Only KYC-verified Registered Presses with an active Desktop Press Suite license are authorized to issue beat bounties.');
      return;
    }
    if (!newTitle.trim()) return;

    const item: BeatBounty = {
      id: `bty_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      locationSector: newLocation.trim() || 'Regional Desk',
      rewardDollars: parseInt(newReward, 10) || 25,
      creatorHandle: currentUserHandle,
      status: 'open',
      createdAt: 'Just now',
      pressAccreditation: 'Accredited Press Bureau',
      kycReferenceId: 'KYC_VERIFIED_DESK',
    };

    setBounties([item, ...bounties]);
    setNewTitle('');
    setNewDesc('');
    setNewLocation('');
    setShowCreateModal(false);
  };

  return (
    <div className="font-mono text-xs rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>KYC-ACCREDITED NEWSROOM LEDGER</span>
          </div>
          <h3 className="text-xl font-bold font-serif text-foreground mt-1">
            Beat Bounties & Field Assignments
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl leading-relaxed">
            Directly funded reporting assignments. All bounties are issued exclusively by KYC-accredited Registered Presses with zero platform escrow liability.
          </p>
        </div>

        {/* Action Button: Gated based on Press Status */}
        {canPostBounty ? (
          <button
            type="button"
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showCreateModal ? 'Cancel' : 'Post Beat Bounty'}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-border bg-muted/50 text-muted-foreground text-[11px]">
            <Lock className="h-3.5 w-3.5 text-amber-500" />
            <span>Issuance: Registered Press & KYC Required</span>
          </div>
        )}
      </div>

      {/* Accreditation Policy Notice for Fieldies */}
      <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-start space-x-3 text-xs">
        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-[11px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Press Integrity Guard:</strong> To prevent non-journalistic manipulation, only vetted publishers with an active Desktop Press Suite license and verified identity (KYC) may create financial bounties. Independent Fieldies may freely claim, corroborate, and settle bounties below.
        </div>
      </div>

      {/* Creation Drawer (Only Accessible by Accredited Press) */}
      {showCreateModal && canPostBounty && (
        <form onSubmit={handleCreateBounty} className="p-5 rounded-xl bg-muted/40 border border-border space-y-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-foreground">
            <span>Issue Accredited Beat Bounty</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">✓ KYC Identity Verified</span>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Assignment Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Photo proof of high-voltage charger installations..."
              className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Reporting Criteria & Requirements</label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Specific on-scene requirements (e.g. high-contrast photo, serial numbers, agency citations)..."
              className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground text-xs focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Target Sector / Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Danville Junction Spur • Vermilion Line"
                className="w-full bg-background border border-border rounded-xl p-2.5 text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div className="w-full sm:w-40">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Reward (USD)</label>
              <div className="flex items-center border border-border rounded-xl px-3 bg-background">
                <span className="text-muted-foreground font-bold">$</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={newReward}
                  onChange={(e) => setNewReward(e.target.value)}
                  className="w-full bg-transparent p-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-500 font-bold">{errorMessage}</p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md"
            >
              Fund & Transmit Assignment to Wire
            </button>
          </div>
        </form>
      )}

      {/* Bounties Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bounties.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-xl border border-border bg-[#fdfcf9] dark:bg-zinc-900/60 flex flex-col justify-between space-y-4 shadow-sm hover:border-primary/40 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  📍 {b.locationSector}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  ${b.rewardDollars} USD
                </span>
              </div>

              <h4 className="font-bold font-serif text-base text-foreground leading-snug mb-1.5">
                {b.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {b.description}
              </p>
            </div>

            {/* Provenance & Claim Action */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <div>
                <div className="text-muted-foreground">
                  Issuer: <strong className="text-foreground">@{b.creatorHandle}</strong>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{b.pressAccreditation || 'KYC Verified Press'}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onClaimBounty && onClaimBounty(b)}
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm transition"
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
