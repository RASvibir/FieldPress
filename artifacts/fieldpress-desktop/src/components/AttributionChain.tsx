import React from 'react';

export interface AttributionNode {
  storyId: string;
  authorHandle: string;
  authorDisplayName: string;
  location: string;
  timestamp: string;
  corroborationType: 'original' | 'ground' | 'photo' | 'document' | 'remix';
  summary: string;
  children?: AttributionNode[];
  isCurrentStory?: boolean;
}

const typeIcons: Record<AttributionNode['corroborationType'], string> = {
  original: '📡 Original Dispatch',
  ground: '🍴 Ground Corroboration',
  photo: '📸 Photo Evidence Attached',
  document: '🛡️ Document / Records Attached',
  remix: '⚡ Story Remix',
};

export const AttributionTreeItem: React.FC<{
  node: AttributionNode;
  level?: number;
  isLast?: boolean;
  onSelectStory?: (storyId: string) => void;
}> = ({ node, level = 0, isLast = true, onSelectStory }) => {
  return (
    <div className="relative font-mono text-xs">
      {/* Node Row */}
      <div className="flex items-start space-x-2.5 py-1.5 group">
        {/* Tree Branch Visual Glyphs */}
        {level > 0 && (
          <span className="text-zinc-600 font-bold select-none pt-0.5">
            {isLast ? '└── ' : '├── '}
          </span>
        )}

        <div
          onClick={() => onSelectStory && onSelectStory(node.storyId)}
          className={`flex-1 p-2.5 rounded border cursor-pointer transition ${
            node.isCurrentStory
              ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
              : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                node.corroborationType === 'original'
                  ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                {typeIcons[node.corroborationType]}
              </span>
              <span className="text-zinc-300 font-bold">@{node.authorHandle}</span>
            </div>

            <div className="text-[10px] text-zinc-500 flex items-center space-x-1.5">
              <span>📍 {node.location}</span>
              <span>•</span>
              <span>{node.timestamp}</span>
            </div>
          </div>

          <p className="text-zinc-400 text-xs mt-0.5 leading-snug">{node.summary}</p>

          {node.isCurrentStory && (
            <div className="mt-1.5 text-[9px] uppercase tracking-wider font-bold text-cyan-400">
              ◄ You are viewing this dispatch
            </div>
          )}
        </div>
      </div>

      {/* Recursive Children */}
      {node.children && node.children.length > 0 && (
        <div className={`ml-${level === 0 ? '4' : '6'} pl-2 border-l border-zinc-800/80 space-y-1`}>
          {node.children.map((child, idx) => (
            <AttributionTreeItem
              key={child.storyId}
              node={child}
              level={level + 1}
              isLast={idx === (node.children?.length ?? 0) - 1}
              onSelectStory={onSelectStory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AttributionChain: React.FC<{
  rootNode: AttributionNode;
  onSelectStory?: (storyId: string) => void;
  onForkBranch?: (storyId: string) => void;
}> = ({ rootNode, onSelectStory, onForkBranch }) => {
  return (
    <div className="border border-zinc-800 bg-zinc-950/80 rounded-lg p-4 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
        <div>
          <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center space-x-1.5">
            <span>🌳 Story Attribution Tree & Corroboration Chain</span>
          </h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Tracing origin reporting, on-scene evidence, and county-line corroborations.
          </p>
        </div>

        {onForkBranch && (
          <button
            type="button"
            onClick={() => onForkBranch(rootNode.storyId)}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold"
          >
            🍴 Fork This Branch
          </button>
        )}
      </div>

      <div className="space-y-1">
        <AttributionTreeItem node={rootNode} onSelectStory={onSelectStory} />
      </div>
    </div>
  );
};
