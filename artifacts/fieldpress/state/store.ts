// FieldPress state store — React Context + AsyncStorage persistence
// All data is local; no backend. Stories and items survive app restarts via AsyncStorage.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Story, StoryItem } from '@/types';
import {
  loadStories,
  loadStoryItems,
  saveStories,
  saveStoryItems,
} from '@/utils/storage';

// Context shape is unchanged from v1 — hydration is a private implementation detail.
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

  // hydrated is a ref so it never causes a re-render and never leaks to consumers.
  const hydrated = useRef(false);

  // Load persisted data once on mount.
  // Merge strategy: any mutations that beat the async load (very rare race)
  // are preserved — saved records not already in memory are appended.
  useEffect(() => {
    Promise.all([loadStories(), loadStoryItems()]).then(([savedStories, savedItems]) => {
      setStories((current) => {
        const existingIds = new Set(current.map((s) => s.id));
        const merged = [
          ...current,
          ...savedStories.filter((s) => !existingIds.has(s.id)),
        ];
        // Keep newest-first ordering consistent with createStory
        return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
      setStoryItems((current) => {
        const existingIds = new Set(current.map((i) => i.id));
        return [...current, ...savedItems.filter((i) => !existingIds.has(i.id))];
      });
      hydrated.current = true;
    });
  }, []);

  // Persist stories whenever they change (guarded: skip pre-hydration runs).
  useEffect(() => {
    if (!hydrated.current) return;
    saveStories(stories);
  }, [stories]);

  // Persist storyItems whenever they change (guarded: skip pre-hydration runs).
  useEffect(() => {
    if (!hydrated.current) return;
    saveStoryItems(storyItems);
  }, [storyItems]);

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
