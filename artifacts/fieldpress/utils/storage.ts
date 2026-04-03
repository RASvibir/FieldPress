import AsyncStorage from '@react-native-async-storage/async-storage';

import { Story, StoryItem } from '@/types';

const STORIES_KEY = '@chrf:FieldPress/stories';
const ITEMS_KEY = '@chrf:FieldPress/storyItems';

function migrateStory(s: any): Story {
  return {
    id: s.id,
    title: s.title,
    status: s.status ?? 'active',
    createdAt: s.createdAt,
  };
}

export async function saveStories(stories: Story[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  } catch {
  }
}

export async function loadStories(): Promise<Story[]> {
  try {
    const raw = await AsyncStorage.getItem(STORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    return parsed.map(migrateStory);
  } catch {
    return [];
  }
}

export async function saveStoryItems(items: StoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
  }
}

export async function loadStoryItems(): Promise<StoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(ITEMS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoryItem[];
  } catch {
    return [];
  }
}
