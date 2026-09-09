import React, { useState } from 'react';

export type NoteType = 'confirmed' | 'context' | 'contradiction';

export interface VerificationNote {
  id: string;
  storyId: string;
  authorHandle: string;
  noteType: NoteType;
  content: string;
  citationSource?: string;
  isAnchored: boolean;
  helpfulVotes: number;
  unhelpfulVotes: number;
  createdAt: string;
}

const typeStyles: Record<NoteType, { label: string; badge: string; border: string }> = {
  confirmed: {
    label: 'Corroborated with Records',
    badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    border: 'border-emerald-800/80 bg-emerald-950/20',
  },
  context: {
    label: 'Critical Context Added',
    badge: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
    border: 'border-cyan-800/80 bg-cyan-950/20',
  },
  contradiction: {
    label: 'Contradiction / Dispute',
    badge: 'bg-amber-950/80 text-amber-400 border-amber-800',
    border: 'border-amber-800/80 bg-amber-950/20',
  },
};

export const CommunityNotes: React.FC<{
  storyId: string;
  currentUserHandle?: string;
}> = ({ storyId, currentUserHandle = 'ras.ip' }) => {
  const [notes, setNotes] = useState<VerificationNote[]>([
    {
      id: 'note-1',
      storyId,
      authorHandle: 'jordan',
      noteType: 'context',
      content: 'Vermilion County dispatch records indicate relay switches on this spur are maintained by Norfolk Southern signals dept, not municipal transit.',
      citationSource: 'County Infrastructure Audit 2025-Q4, Schedule C',
      isAnchored: true,
      helpfulVotes: 18,
      unhelpfulVotes: 1,
      createdAt: '11:42 AM',
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>('confirmed');
  const [content, setContent] = useState('');
  const [citation, setCitation] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newNote: VerificationNote = {
      id: crypto.randomUUID(),
      storyId,
      authorHandle: currentUserHandle,
      noteType,
      content,
      citationSource: citation.trim() || undefined,
      isAnchored: false,
      helpfulVotes: 1,
      unhelpfulVotes: 0,
      createdAt: 'Just now',
    };

    setNotes([newNote, ...notes]);
    setContent('');
    setCitation('');
    setIsOpen(false);
  };

  const vote = (id: string, isHelpful: boolean) => {
    setNotes(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              helpfulVotes: isHelpful ? n.helpfulVotes + 1 : n.helpfulVotes,
              unhelpfulVotes: !isHelpful ? n.unhelpfulVotes + 1 : n.unhelpfulVotes,
            }
          : n
      )
    );
  };

  const anchoredNote = notes.find(n => n.isAnchored);
  const regularNotes = notes.filter(n => !n.isAnchored);

  return (
    <div className="font-mono text-xs mb-6 space-y-4">
      {/* Anchored Top Note (Peer Consensus Reached) */}
      {anchoredNote && (
        <div className={`p-4 rounded-lg border ${typeStyles[anchoredNote.noteType].border}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                📌 Anchored Community Note
              </span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${typeStyles[anchoredNote.noteType].badge}`}>
                {typeStyles[anchoredNote.noteType].label}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground/80">by @{anchoredNote.authorHandle}</span>
          </div>

          <p className="text-foreground dark:text-foreground dark:text-zinc-200 text-xs leading-relaxed mb-2">{anchoredNote.content}</p>

          {anchoredNote.citationSource && (
            <div className="text-[10px] text-muted-foreground bg-muted/40 dark:bg-background dark:bg-muted/40 dark:bg-background dark:bg-black/50 p-2 rounded border border-border dark:border-border dark:border-zinc-800/80 mb-2">
              <strong className="text-foreground/90 dark:text-foreground/90 dark:text-zinc-300">Public Record Citation:</strong> {anchoredNote.citationSource}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border dark:border-border dark:border-zinc-800/80 text-[10px] text-muted-foreground">
            <span>Peer Consensus: {anchoredNote.helpfulVotes} rated helpful</span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => vote(anchoredNote.id, true)}
                className="hover:text-emerald-400"
              >
                👍 Helpful ({anchoredNote.helpfulVotes})
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => vote(anchoredNote.id, false)}
                className="hover:text-amber-400"
              >
                👎 Not Helpful
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Action Trigger */}
      <div className="flex items-center justify-between p-3 rounded bg-muted/60 dark:bg-muted/60 dark:bg-zinc-900/60 border border-border dark:border-border dark:border-zinc-800">
        <span className="text-muted-foreground text-xs">
          Have official agency records, contrary scanner logs, or local context?
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-800/50 text-xs font-bold"
        >
          {isOpen ? '✕ Cancel' : '+ Add Verification Note'}
        </button>
      </div>

      {/* Verification Note Entry Drawer */}
      {isOpen && (
        <form onSubmit={handleAddNote} className="p-4 rounded-lg bg-card dark:bg-card dark:bg-zinc-950 border border-border dark:border-border dark:border-zinc-700 space-y-3">
          <div className="text-xs font-bold text-foreground dark:text-foreground dark:text-zinc-200 uppercase tracking-wider">
            Draft Community Verification Note
          </div>

          <div className="flex space-x-2">
            {(['confirmed', 'context', 'contradiction'] as NoteType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setNoteType(t)}
                className={`flex-1 py-1 text-[11px] rounded border font-semibold ${
                  noteType === t ? typeStyles[t].badge : 'border-border dark:border-border dark:border-zinc-800 text-muted-foreground'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Explain the verified correction, corroboration, or missing context..."
            className="w-full bg-background dark:bg-background dark:bg-black border border-border dark:border-border dark:border-zinc-700 rounded p-2.5 text-foreground dark:text-foreground dark:text-zinc-200 text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />

          <input
            type="text"
            value={citation}
            onChange={e => setCitation(e.target.value)}
            placeholder="Agency document, budget line item #, or official log citation..."
            className="w-full bg-background dark:bg-background dark:bg-black border border-border dark:border-border dark:border-zinc-700 rounded p-2 text-foreground dark:text-foreground dark:text-zinc-200 text-xs placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded text-xs"
            >
              Submit Note for Peer Review
            </button>
          </div>
        </form>
      )}

      {/* Candidate Notes List */}
      {regularNotes.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/80">
            Candidate Notes Under Peer Review ({regularNotes.length})
          </div>
          {regularNotes.map(n => (
            <div key={n.id} className="p-3 rounded border border-border dark:border-border dark:border-zinc-800/80 bg-muted/60 dark:bg-muted/60 dark:bg-zinc-900/60">
              <div className="flex justify-between items-center mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${typeStyles[n.noteType].badge}`}>
                  {typeStyles[n.noteType].label}
                </span>
                <span className="text-[10px] text-muted-foreground/80">by @{n.authorHandle} • {n.createdAt}</span>
              </div>
              <p className="text-foreground/90 dark:text-foreground/90 dark:text-zinc-300 text-xs my-1.5 leading-snug">{n.content}</p>
              {n.citationSource && (
                <p className="text-[10px] text-muted-foreground italic mb-1.5">Source: {n.citationSource}</p>
              )}
              <div className="flex items-center space-x-3 text-[10px] text-muted-foreground/80">
                <button type="button" onClick={() => vote(n.id, true)} className="hover:text-emerald-400">
                  👍 Helpful ({n.helpfulVotes})
                </button>
                <button type="button" onClick={() => vote(n.id, false)} className="hover:text-amber-400">
                  👎 Unhelpful ({n.unhelpfulVotes})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
