export type StoryStatus = 'active' | 'archived';

export type Story = {
  id: string;
  title: string;
  status: StoryStatus;
  createdAt: string; // ISO 8601
};

export type StoryItemType = 'text' | 'audio';

export type StoryItem = {
  id: string;
  storyId: string;
  type: StoryItemType;
  content: string;   // text: note body; audio: local file URI
  createdAt: string; // ISO 8601
};

export type AiDraft = {
  summary: string;
  outline: string[];
  caption: string;
  whyNow?: string;
  audience?: string;
  trends?: Array<{
    scale: 'relatable' | 'national' | 'global';
    headline: string;
    whyItMatters: string;
    productHook: string;
    source?: string;
  }>;
};
