// FieldPress — AsyncStorage persistence helpers
// Keys are namespaced under @chrf:FieldPress/ to avoid collisions.
// All functions are safe: they never throw — errors return empty arrays.

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Story, StoryItem } from '@/types';

const STORIES_KEY = '@chrf:FieldPress/stories';
const ITEMS_KEY = '@chrf:FieldPress/storyItems';

export async function saveStories(stories: Story[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  } catch {
    // Silent — storage write failure should never crash the app
  }
}

export async function loadStories(): Promise<Story[]> {
  try {
    const raw = await AsyncStorage.getItem(STORIES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Story[];
  } catch {
    return [];
  }
}

export async function saveStoryItems(items: StoryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch {
    // Silent — storage write failure should never crash the app
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
