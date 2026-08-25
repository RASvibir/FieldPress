import { AiDraft, Story, StoryItem } from '@/types';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export async function generateAiDraft(story: Story, textItems: StoryItem[]): Promise<AiDraft> {
  const response = await fetch(`${API_URL}/api/produce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: story.title,
      notes: textItems.map((item) => item.content),
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        summary?: string;
        outline?: string[];
        caption?: string;
        whyNow?: string;
        audience?: string;
        trends?: AiDraft['trends'];
        error?: string;
      }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? `Producer failed (${response.status})`);
  }

  if (!payload?.summary || !payload.outline || !payload.caption) {
    throw new Error('Producer returned an incomplete draft');
  }

  return {
    summary: payload.summary,
    outline: payload.outline,
    caption: payload.caption,
    whyNow: payload.whyNow,
    audience: payload.audience,
    trends: payload.trends,
  };
}
