// FieldPress data model
// Journalism workflow: Story (headline) → StoryItems (notes + audio) → AI draft

export type Story = {
  id: string;
  title: string;
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

// AI Producer output — generated from text notes (mocked in v1)
// Hook real AI here in v2: replace generateAiDraft() in services/aiMock.ts
export type AiDraft = {
  summary: string;    // Short paragraph for the story
  outline: string[];  // 3–5 structured bullet points
  caption: string;    // Snappy social media caption
};
