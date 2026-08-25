// FieldPress AI Mock — returns a structured draft from story + text notes
// v1: No network call, purely local. generateAiDraft simulates a 2s "AI" delay.

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

    // ---------------------------------------------------------------------------
    // TODO (v2): Replace the setTimeout block below with a real AI API call.
    //
    // Inputs available at this point:
    //   story.title     — string, the story headline
    //   story.id        — string, unique story identifier
    //   textItems       — StoryItem[], each has { content: string, ... }
    //   noteCount       — number of text notes
    //   snippets        — string[], first 60 chars of each note
    //
    // Example call (OpenAI / Anthropic / Gemini all follow a similar pattern):
    //
    //   const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${OPENAI_API_KEY}`,
    //     },
    //     body: JSON.stringify({
    //       model: 'gpt-4o',
    //       messages: [
    //         {
    //           role: 'system',
    //           content:
    //             'You are a professional news producer. Given a story title and field notes, ' +
    //             'return a JSON object with keys: summary (string), outline (string[]), caption (string).',
    //         },
    //         {
    //           role: 'user',
    //           content: `Story: "${story.title}"\n\nNotes:\n${snippets.join('\n')}`,
    //         },
    //       ],
    //       response_format: { type: 'json_object' },
    //     }),
    //   });
    //   const { summary, outline, caption }: AiDraft = await response.json();
    //   resolve({ summary, outline, caption });
    //
    // Expected AiDraft shape:
    //   {
    //     summary: string,           // 2–4 sentence narrative summary
    //     outline: string[],         // ordered list of story section headings
    //     caption: string,           // short social-media caption with hashtags
    //   }
    // ---------------------------------------------------------------------------

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
        whyNow: `Public attention is already on stories like "${titleWords}." Use the field notes to add what national coverage is missing.`,
        audience: 'Readers and listeners who felt the national headline but have not heard from the ground.',
        trends: [
          {
            scale: 'relatable',
            headline: 'People want the human scene behind the headline',
            whyItMatters: 'A single witnessed detail beats a generic recap.',
            productHook: 'Open with the most concrete moment from the notes.',
          },
          {
            scale: 'national',
            headline: 'National coverage is moving without this reporting',
            whyItMatters: 'The field notes can correct or complicate the official frame.',
            productHook: 'In the nut graf, say what the national story is getting wrong or leaving out.',
          },
          {
            scale: 'global',
            headline: 'Listeners elsewhere will map this onto their own crisis',
            whyItMatters: 'A parallel keeps overseas audiences in the episode.',
            productHook: 'Podcast cold open: pose the global question, then drop into the scene.',
          },
        ],
      });
    }, 2000);
  });
}
