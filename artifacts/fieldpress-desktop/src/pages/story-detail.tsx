import React, { useState } from 'react';
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
      <article className="p-6 rounded-lg border border-zinc-800 bg-zinc-950 mb-6">
        {/* Immutable Original Creator Provenance */}
        <PressieOwnershipBanner
          originalCreatorHandle={creatorHandle}
          originalCreatorName={(story as any).author}
          sharedByHandle={(story as any).sharedByHandle}
        />

        <div className="flex items-center space-x-2 text-[11px] text-emerald-400 mb-2">
          <span>📍 {(story as any).location || 'Field Bureau Desk'}</span>
          <span>•</span>
          <span className="text-zinc-500">Filed at {formattedDate}</span>
          <span>•</span>
          <span className="text-zinc-500 uppercase">{(story as any).lane || "Pressie"}</span>
        </div>

        {/* Real Story Title */}
        <h1 className="text-xl font-bold text-white mb-3 leading-snug">
          {story.title}
        </h1>

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800 text-xs text-zinc-400">
          <span>Reporter: <strong className="text-zinc-200">@{authorHandle}</strong></span>
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500">Credibility:</span>
            <PeerReactions
              storyId={story.id}
              initialCounts={{
                signal: inkCounts['signal'] || 0,
                heat: inkCounts['heat'] || 0,
                iconic: inkCounts['iconic'] || 0,
              }}
              initialUserReactions={(story as any).myInk ? [(story as any).myInk] : []}
            />
          </div>
        </div>

        {/* Real Story Items & Photos */}
        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          {story.items && story.items.length > 0 ? (
            story.items.map((item: any) => {
              const isPhoto =
                item.type === 'photo' ||
                item.content?.startsWith('data:image') ||
                item.content?.startsWith('http');

              if (isPhoto) {
                return (
                  <div key={item.id} className="rounded-lg overflow-hidden border border-zinc-800 my-3 bg-black">
                    <img
                      src={item.content}
                      alt="Field Proof Capture"
                      className="w-full max-h-[460px] object-contain"
                    />
                  </div>
                );
              }

              return (
                <p key={item.id} className="whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              );
            })
          ) : (
            <p className="text-zinc-500 italic text-xs">No extended body filed for this dispatch.</p>
          )}
        </div>
      </article>

      {/* Community Verification Notes for this specific story */}
      <CommunityNotes storyId={story.id} currentUserHandle="ras.ip" />

      {/* Attribution Tree */}
      <AttributionChain
        rootNode={dynamicAttribution}
        onSelectStory={(id) => setCurrentId(id)}
        onForkBranch={(id) => props.onForkToDesk && props.onForkToDesk(id)}
      />
    </div>
  );
};

export default StoryDetailPage;
