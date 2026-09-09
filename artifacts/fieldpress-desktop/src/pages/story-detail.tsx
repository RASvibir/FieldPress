import { PressieEditorModal } from "../components/PressieEditorModal";
import { PressieArticleRenderer } from '../components/PressieEditions';
import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useGetStory } from '@workspace/api-client-react';
import { AttributionChain, AttributionNode } from '../components/AttributionChain';
import { CommunityNotes } from '../components/CommunityNotes';
import { PressieOwnershipBanner, PressieActionControls, ForkPolicy } from '../components/PressieOwnershipBadge';
import { PeerReactions } from '../components/PeerReactions';

export interface StoryDetailPageProps {
  params?: { storyId?: string };
  storyId?: string;
  onBack?: () => void;
  onForkToDesk?: (storyId: string) => void;
  [key: string]: any;
}

export const StoryDetailPage: React.FC<StoryDetailPageProps> = (props) => {
  const [, routeParams] = useRoute('/story/:storyId');
  const resolvedStoryId = props.storyId || routeParams?.storyId || props.params?.storyId || '';

  const { data: story, isLoading, isError } = useGetStory(resolvedStoryId);

  const [currentId, setCurrentId] = useState(resolvedStoryId);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Sync edit fields when story loads
  useEffect(() => {
    if (story) {
      setEditTitle(story.title || '');
      setEditLocation((story as any).location || '');
    }
  }, [story]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story?.id) return;
    setEditSaving(true);
    try {
      await fetch(`/api/stories/${story.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, location: editLocation }),
      });
      window.location.reload();
    } catch {
      alert('Could not update pressie.');
    } finally {
      setEditSaving(false);
    }
  };


  // Loading State
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-mono text-zinc-400">
        <div className="flex items-center space-x-3">
          <span className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs">Accessing verified dispatch #{resolvedStoryId.slice(0, 8)}...</span>
        </div>
      </div>
    );
  }

  // Not Found State
  if (isError || !story) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-mono text-zinc-300">
        <h2 className="text-base font-bold text-red-400 mb-2">Dispatch Inaccessible or Not Found</h2>
        <p className="text-xs text-zinc-500 mb-4">
          The requested dispatch #{resolvedStoryId} does not exist or has been retracted from the bureau frequency.
        </p>
        <a href="/" className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-cyan-400 text-xs">
          ← Return to Newsroom Desk
        </a>
      </div>
    );
  }

  const authorHandle = (story as any).author || 'Field Reporter';
  const creatorHandle = (story as any).originalCreatorHandle || authorHandle;
  const forkPolicy: ForkPolicy = (story as any).forkPolicy || 'open';
  const formattedDate = story.createdAt
    ? new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  // Dynamic Attribution Tree rooted on this real story
  const dynamicAttribution: AttributionNode = {
    storyId: story.id,
    authorHandle: authorHandle,
    authorDisplayName: authorHandle,
    location: (story as any).location || 'Field Bureau',
    timestamp: formattedDate,
    corroborationType: (story as any).parentStoryId ? 'ground' : 'original',
    summary: story.title,
    isCurrentStory: currentId === story.id,
  };

  const inkCounts = (story as any).inkCounts || {};

  return (
    <div className="max-w-4xl mx-auto px-4 pt-20 sm:pt-24 pb-16 font-mono text-zinc-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        {props.onBack ? (
          <button
            type="button"
            onClick={props.onBack}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            ← Return to Dashboard
          </button>
        ) : (
          <a href="/" className="text-xs text-zinc-400 hover:text-zinc-200">
            ← Return to Dashboard
          </a>
        )}

        <PressieActionControls
          originalCreatorHandle={creatorHandle}
          forkPolicy={forkPolicy}
          storyId={story.id}
          onForkToDesk={props.onForkToDesk}
          onRequestCollab={(id, author) => alert(`Collab request sent to @${author}`)}
        />
      </div>

      {/* Story Card */}
      
      {/* Multi-Edition Pressie Article Presentation (Tactical, Vintage, Comic, 8-Bit, Sleek) */}
      <PressieArticleRenderer onEdit={() => setIsEditOpen(true)} canEdit={true}
        story={{
          id: story.id,
          title: story.title,
          author: authorHandle,
          originalCreatorHandle: creatorHandle,
          location: (story as any).location || 'Field Bureau Desk',
          formattedDate,
          lane: (story as any).lane,
          items: story.items,
        }}
        inkCounts={inkCounts}
        initialEdition="tactical"
      />


      {/* Community Verification Notes for this specific story */}
      <CommunityNotes storyId={story.id} currentUserHandle="ras.ip" />

      {/* Attribution Tree */}
      <AttributionChain
        rootNode={dynamicAttribution}
        onSelectStory={(id) => setCurrentId(id)}
        onForkBranch={(id) => props.onForkToDesk && props.onForkToDesk(id)}
      />
    
      {/* Edit Pressie Drawer / Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono text-xs">
          <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm uppercase flex items-center space-x-2">
                <span>✏️ Edit Verified Pressie</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Dispatch Headline
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg p-2.5 text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">
                  Corridor / Dateline Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Danville Junction Spur • Vermilion Line"
                  className="w-full bg-black border border-zinc-700 rounded-lg p-2.5 text-zinc-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs"
                >
                  {editSaving ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PressieEditorModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} story={story} onSaved={() => window.location.reload()} />
</div>
  );
};

export default StoryDetailPage;
