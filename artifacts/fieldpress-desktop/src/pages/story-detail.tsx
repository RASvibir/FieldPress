import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { AttributionChain, AttributionNode } from '../components/AttributionChain';
import { CommunityNotes } from '../components/CommunityNotes';
import { PressieOwnershipBanner, PressieActionControls } from '../components/PressieOwnershipBadge';
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
  const resolvedStoryId = props.storyId || routeParams?.storyId || props.params?.storyId || 'story-danville-corroborate';
  const [currentId, setCurrentId] = useState(resolvedStoryId);

  const attributionData: AttributionNode = {
    storyId: 'story-chicago-root',
    authorHandle: 'jordan',
    authorDisplayName: 'Jordan M.',
    location: 'Chicago Loop',
    timestamp: '10:15 AM',
    corroborationType: 'original',
    summary: 'Class 1 freight delay reports filed after main switch relay tripped.',
    children: [
      {
        storyId: 'story-danville-corroborate',
        authorHandle: 'ras.ip',
        authorDisplayName: 'Victor Birkle',
        location: 'Danville Junction',
        timestamp: '11:30 AM',
        corroborationType: 'ground',
        summary: 'Junction switch failure confirmed on Vermilion line; two haulers parked waiting on signal dispatch.',
        isCurrentStory: currentId === 'story-danville-corroborate',
        children: [
          {
            storyId: 'story-photo-evidence',
            authorHandle: 'glitterpop',
            authorDisplayName: 'Pamela Black',
            location: 'Danville South Lead',
            timestamp: '12:05 PM',
            corroborationType: 'photo',
            summary: 'High-contrast photo attached of locked switch indicator at Milepost 124.',
            isCurrentStory: currentId === 'story-photo-evidence',
          },
        ],
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-mono text-zinc-200">
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
          originalCreatorHandle="jordan"
          forkPolicy="open"
          storyId={currentId}
          onForkToDesk={props.onForkToDesk}
          onRequestCollab={(id, author) => alert(`Collab request sent to @${author}`)}
        />
      </div>

      <article className="p-6 rounded-lg border border-zinc-800 bg-zinc-950 mb-6">
        <PressieOwnershipBanner
          originalCreatorHandle="jordan"
          originalCreatorName="Jordan M."
          sharedByHandle="ras.ip"
        />

        <div className="flex items-center space-x-2 text-[11px] text-emerald-400 mb-2">
          <span>📍 Danville Junction • Vermilion County</span>
          <span>•</span>
          <span className="text-zinc-500">Filed at 11:30 AM</span>
        </div>

        <h1 className="text-xl font-bold text-white mb-3">
          Junction Switch Malfunction Stalls Vermilion Line Freight Corridor
        </h1>

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800 text-xs text-zinc-400">
          <span>Reporter: <strong className="text-zinc-200">@ras.ip</strong></span>
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500">Credibility:</span>
            <PeerReactions
              storyId={currentId}
              initialCounts={{ signal: 42, heat: 12, iconic: 8 }}
              initialUserReactions={['signal']}
            />
          </div>
        </div>

        <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
          <p>
            Following initial freight relay alerts originating in the Chicago Loop desk (@jordan), direct inspection at the Danville Junction rail crossing indicates locked points on the northbound Vermilion lead.
          </p>
          <p>
            Two westbound freights have halted operations waiting on manual field authority. Regional logistics coordinators have bypassed normal automated corridors.
          </p>
        </div>
      </article>

      <CommunityNotes storyId={currentId} currentUserHandle="ras.ip" />

      <AttributionChain
        rootNode={attributionData}
        onSelectStory={(id) => setCurrentId(id)}
        onForkBranch={(id) => props.onForkToDesk && props.onForkToDesk(id)}
      />
    </div>
  );
};

export default StoryDetailPage;
