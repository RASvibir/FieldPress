// FieldPress AI Mock — returns a structured draft from story + text notes
// v1: No network call, purely local. generateAiDraft simulates a 2s "AI" delay.
// v2 hook: Replace the setTimeout body with a real API call (OpenAI, Anthropic, etc.)
//          and return the parsed AiDraft from the response.

import { AiDraft, Story, StoryItem } from '@/types';

const OUTLINE_TEMPLATES = [
  (title: string) => `Introduction — context and significance of "${title}"`,
  (title: string, n: number) =>
    `Key findings from ${n} field note${n !== 1 ? 's' : ''} captured on-scene`,
  () => `Primary sources and witness accounts`,
  () => `Background, history, and broader implications`,
  () => `Next steps — editorial follow-up and verification`,
];

export function generateAiDraft(story: Story, textItems: StoryItem[]): Promise<AiDraft> {
  return new Promise((resolve) => {
    const noteCount = textItems.length;
    const snippets = textItems.map((i) => i.content.slice(0, 60));
    const firstSnippet = snippets[0] ?? 'no field notes yet';
    const titleWords = story.title.split(' ').slice(0, 4).join(' ');

    setTimeout(() => {
      resolve({
        summary:
          `Reporting from the field on "${story.title}." ` +
          `This story has ${noteCount} field note${noteCount !== 1 ? 's' : ''} captured. ` +
          `Initial observations: "${firstSnippet}..." ` +
          `The situation is developing; further sourcing is underway. ` +
          `Coverage reflects on-the-ground conditions at time of reporting.`,

        outline: OUTLINE_TEMPLATES.map((fn, i) =>
          i === 0
            ? fn(story.title)
            : i === 1
            ? fn(titleWords, noteCount)
            : (fn as () => string)(),
        ),

        caption:
          `DEVELOPING: ${story.title}. ` +
          `Reporter in the field — ${noteCount} note${noteCount !== 1 ? 's' : ''} captured. ` +
          `Full story coming. #FieldPress #BreakingNews #Journalism`,
      });
    }, 2000);
  });
}
