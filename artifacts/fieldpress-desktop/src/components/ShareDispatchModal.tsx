import React, { useState } from 'react';
import { PressieOwnershipBanner } from './PressieOwnershipBadge';

export interface ShareDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: {
    id: string;
    title: string;
    snippet: string;
    originalCreatorHandle: string;
    originalCreatorName?: string;
  };
  currentSharerHandle?: string;
  onConfirmShare: (sharePayload: {
    storyId: string;
    sharerComment: string;
    targetBureau: string;
  }) => void;
}

export const ShareDispatchModal: React.FC<ShareDispatchModalProps> = ({
  isOpen,
  onClose,
  story,
  currentSharerHandle = 'ras.ip',
  onConfirmShare,
}) => {
  const [comment, setComment] = useState('');
  const [targetBureau, setTargetBureau] = useState('global');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const permalink = `https://fieldpress.studio/pressie/${story.id}?ref=${currentSharerHandle}`;

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmShare({
      storyId: story.id,
      sharerComment: comment,
      targetBureau,
    });
    setComment('');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(permalink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted/40 dark:bg-background dark:bg-muted/40 dark:bg-background dark:bg-black/50 font-mono text-xs p-4">
      <div className="w-full max-w-lg rounded-lg border border-border dark:border-border dark:border-zinc-700 bg-card dark:bg-card dark:bg-zinc-950 p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center pb-2 border-b border-border dark:border-border dark:border-zinc-800">
          <h3 className="text-sm font-bold text-foreground dark:text-foreground dark:text-white uppercase flex items-center space-x-2">
            <span>📢 Share & Corroborate Dispatch</span>
          </h3>
          <button type="button" onClick={onClose} className="text-muted-foreground/80 hover:text-foreground/90 dark:text-foreground/90 dark:text-zinc-300">
            ✕
          </button>
        </div>

        {/* Immutable Provenance Lock Preview */}
        <div className="rounded border border-amber-900/60 bg-amber-950/20 p-3">
          <PressieOwnershipBanner
            originalCreatorHandle={story.originalCreatorHandle}
            originalCreatorName={story.originalCreatorName}
            sharedByHandle={currentSharerHandle}
          />
          <h4 className="font-bold text-foreground dark:text-foreground dark:text-zinc-100 text-xs mt-2">{story.title}</h4>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{story.snippet}</p>
        </div>

        <form onSubmit={handleShare} className="space-y-3">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
              Add Context / Reporter Corroboration Note
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="E.g., Spot-checked at Danville crossing; line is backed up..."
              className="w-full bg-background dark:bg-background dark:bg-black border border-border dark:border-border dark:border-zinc-700 rounded p-2 text-foreground dark:text-foreground dark:text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded border border-border dark:border-border dark:border-zinc-700 bg-muted dark:bg-muted dark:bg-zinc-900 text-foreground/90 dark:text-foreground/90 dark:text-zinc-300 hover:border-zinc-500 font-semibold"
            >
              {copiedLink ? '✓ Copied Permlink' : '🔗 Copy Attribution Link'}
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-border dark:border-border dark:border-zinc-800 text-muted-foreground hover:text-foreground dark:text-foreground dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold"
              >
                Broadcast Share
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
