// FieldPress state store — React Context, local only (no backend)
// To add real persistence: swap useState for AsyncStorage-backed state here
import React, { createContext, useContext, useMemo, useState } from 'react';
import { Story, StoryItem } from '@/types';

interface StoriesContextValue {
  stories: Story[];
  storyItems: StoryItem[];
  createStory: (title: string) => Story;
  getStoryById: (id: string) => Story | undefined;
  getItemsForStory: (storyId: string) => StoryItem[];
  addTextItem: (storyId: string, content: string) => void;
  addAudioItem: (storyId: string, uri: string) => void;
}

const StoriesContext = createContext<StoriesContextValue | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function StoriesProvider({ children }: { children: React.ReactNode }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);

  const createStory = (title: string): Story => {
    const story: Story = {
      id: generateId(),
      title: title.trim(),
      createdAt: new Date().toISOString(),
    };
    setStories((prev) => [story, ...prev]);
    return story;
  };

  const getStoryById = (id: string): Story | undefined =>
    stories.find((s) => s.id === id);

  const getItemsForStory = (storyId: string): StoryItem[] =>
    storyItems
      .filter((i) => i.storyId === storyId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const addTextItem = (storyId: string, content: string): void => {
    const item: StoryItem = {
      id: generateId(),
      storyId,
      type: 'text',
      content,
      createdAt: new Date().toISOString(),
    };
    setStoryItems((prev) => [...prev, item]);
  };

  const addAudioItem = (storyId: string, uri: string): void => {
    const item: StoryItem = {
      id: generateId(),
      storyId,
      type: 'audio',
      content: uri,
      createdAt: new Date().toISOString(),
    };
    setStoryItems((prev) => [...prev, item]);
  };

  const value = useMemo<StoriesContextValue>(
    () => ({
      stories,
      storyItems,
      createStory,
      getStoryById,
      getItemsForStory,
      addTextItem,
      addAudioItem,
    }),
    [stories, storyItems],
  );

  return React.createElement(StoriesContext.Provider, { value }, children);
}

export function useStories(): StoriesContextValue {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error('useStories must be used within StoriesProvider');
  return ctx;
}
