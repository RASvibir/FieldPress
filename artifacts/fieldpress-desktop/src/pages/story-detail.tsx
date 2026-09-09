import { PressieArticleRenderer } from '../components/PressieEditions';
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
      
      {/* Multi-Edition Pressie Article Presentation (Tactical, Vintage, Comic, 8-Bit, Sleek) */}
      <PressieArticleRenderer
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
    </div>
  );
};

export default StoryDetailPage;
