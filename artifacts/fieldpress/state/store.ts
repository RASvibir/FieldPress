import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Story, StoryItem, StoryStatus } from '@/types';
import {
  loadStories,
  loadStoryItems,
  saveStories,
  saveStoryItems,
} from '@/utils/storage';

interface StoriesContextValue {
  stories: Story[];
  storyItems: StoryItem[];
  createStory: (title: string) => Story;
  getStoryById: (id: string) => Story | undefined;
  getItemsForStory: (storyId: string) => StoryItem[];
  addTextItem: (storyId: string, content: string) => void;
  addAudioItem: (storyId: string, uri: string) => void;
  setStoryStatus: (id: string, status: StoryStatus) => void;
}

const StoriesContext = createContext<StoriesContextValue | null>(null);

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function StoriesProvider({ children }: { children: React.ReactNode }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);

  const hydrated = useRef(false);

  useEffect(() => {
    Promise.all([loadStories(), loadStoryItems()]).then(([savedStories, savedItems]) => {
      setStories((current) => {
        const existingIds = new Set(current.map((s) => s.id));
        const merged = [
          ...current,
          ...savedStories.filter((s) => !existingIds.has(s.id)),
        ];
        return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      });
      setStoryItems((current) => {
        const existingIds = new Set(current.map((i) => i.id));
        return [...current, ...savedItems.filter((i) => !existingIds.has(i.id))];
      });
      hydrated.current = true;
    });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStories(stories);
  }, [stories]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveStoryItems(storyItems);
  }, [storyItems]);

  const createStory = (title: string): Story => {
    const story: Story = {
      id: generateId(),
      title: title.trim(),
      status: 'active',
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

  const setStoryStatus = (id: string, status: StoryStatus): void => {
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
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
      setStoryStatus,
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
