// FieldPress state store — React Context + AsyncStorage persistence
// All data is local; no backend. Stories and items survive app restarts via AsyncStorage.
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Story, StoryItem } from '@/types';
import {
  loadStories,
  loadStoryItems,
  saveStories,
  saveStoryItems,
} from '@/utils/storage';

interface StoriesContextValue {
  stories: Story[];
  storyItems: StoryItem[];
  hydrated: boolean;
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
  const [hydrated, setHydrated] = useState(false);

  // Load persisted data once on mount
  useEffect(() => {
    Promise.all([loadStories(), loadStoryItems()]).then(([savedStories, savedItems]) => {
      setStories(savedStories);
      setStoryItems(savedItems);
      setHydrated(true);
    });
  }, []);

  // Persist stories whenever they change (skip pre-hydration to avoid overwriting)
  useEffect(() => {
    if (!hydrated) return;
    saveStories(stories);
  }, [stories, hydrated]);

  // Persist storyItems whenever they change (skip pre-hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveStoryItems(storyItems);
  }, [storyItems, hydrated]);

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
      hydrated,
      createStory,
      getStoryById,
      getItemsForStory,
      addTextItem,
      addAudioItem,
    }),
    [stories, storyItems, hydrated],
  );

  return React.createElement(StoriesContext.Provider, { value }, children);
}

export function useStories(): StoriesContextValue {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error('useStories must be used within StoriesProvider');
  return ctx;
}
