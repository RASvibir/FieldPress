import { generateCompletion } from "./gemini";

export interface EditorialImageResult {
  title: string;
  url: string;
  thumbnailUrl: string;
  sourceType: "archival_search";
  sourceName: string;
  sourcePageUrl: string;
  author: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
  originalDate?: string;
  description?: string;
  width: number;
  height: number;
}

export interface PromptGenerationRequest {
  headline: string;
  trendBrief?: string;
  fieldNotes?: string;
  format: "article_hero" | "social_card" | "podcast_cover";
}

export interface GeneratedVisualPrompt {
  format: "article_hero" | "social_card" | "podcast_cover";
  aspectRatio: "16:9" | "4:5" | "1:1";
  prompt: string;
  negativePrompt: string;
  editorialRationale: string;
  suggestedCaption: string;
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export async function searchWikimediaCommons(
  query: string,
  limit: number = 8
): Promise<EditorialImageResult[]> {
  const endpoint = "https://commons.wikimedia.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `${query} filetype:bitmap`,
    gsrlimit: limit.toString(),
    prop: "imageinfo",
    iiprop: "url|size|extmetadata|dimensions",
    iiurlwidth: "800",
    format: "json",
    origin: "*",
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    headers: {
      "User-Agent": "FieldPress/1.0 (Editorial Workbench; support@fieldpress.studio)",
    },
  });

  if (!response.ok) {
    throw new Error(`Wikimedia API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.query || !data.query.pages) {
    return [];
  }

  const results: EditorialImageResult[] = [];

  for (const pageId of Object.keys(data.query.pages)) {
    const page = data.query.pages[pageId];
    if (!page.imageinfo || page.imageinfo.length === 0) continue;

    const info = page.imageinfo[0];
    const meta = info.extmetadata || {};

    const rawAuthor = meta.Artist?.value || meta.Credit?.value || "Unknown";
    const author = stripHtml(rawAuthor) || "Unknown";
    const license = meta.LicenseShortName?.value || meta.UsageTerms?.value || "Public Domain / CC0";
    const licenseUrl = meta.LicenseUrl?.value;
    const originalDate = meta.DateTimeOriginal?.value || meta.DateTime?.value;
    const rawDesc = meta.ImageDescription?.value || meta.ObjectName?.value || "";
    const description = stripHtml(rawDesc);
    const sourcePageUrl = info.descriptionurl || `https://commons.wikimedia.org/?curid=${pageId}`;

    const attribution = `Photo: ${author} / Wikimedia Commons (${license})`;

    results.push({
      title: page.title.replace(/^File:/, ""),
      url: info.url,
      thumbnailUrl: info.thumburl || info.url,
      sourceType: "archival_search",
      sourceName: "Wikimedia Commons",
      sourcePageUrl,
      author,
      license,
      licenseUrl,
      attribution,
      originalDate: originalDate ? stripHtml(originalDate) : undefined,
      description,
      width: info.width || 0,
      height: info.height || 0,
    });
  }

  return results;
}

export async function synthesizeVisualPrompts(
  req: PromptGenerationRequest
): Promise<GeneratedVisualPrompt[]> {
  const aspectConfig = {
    article_hero: { aspectRatio: "16:9" as const, label: "Article Hero (16:9 landscape)" },
    social_card: { aspectRatio: "4:5" as const, label: "Social Card (4:5 portrait)" },
    podcast_cover: { aspectRatio: "1:1" as const, label: "Podcast Cover (1:1 square)" },
  };

  const selectedFormat = req.format;
  const config = aspectConfig[selectedFormat];

  const systemInstruction = `You are a photojournalism editor and visual prompt engineer for FieldPress.
Construct photojournalistic image prompts grounded in field notes when archival imagery is unavailable.

EDITORIAL GUIDELINES:
1. Style: Editorial 35mm documentary photography, candid framing, natural ambient light, authentic texture.
2. Anti-Synthetic Directives: Explicitly forbid CGI, glossy rendering, plastic skin, AI digital art look, floating artifacts, exaggerated saturation, distorted anatomy, or synthetic text overlays.
3. Grounding: Tie subjects and scene context directly to the headline, trend brief, and field notes.
4. Output JSON strictly matching the schema.`;

  const userPrompt = `Generate a photojournalistic visual prompt for:
Headline: ${req.headline}
Trend Context: ${req.trendBrief || "N/A"}
Field Notes: ${req.fieldNotes || "N/A"}
Format: ${config.label}
Aspect Ratio: ${config.aspectRatio}

Respond with valid JSON formatted as:
{
  "format": "${selectedFormat}",
  "aspectRatio": "${config.aspectRatio}",
  "prompt": "Detailed documentary photography prompt describing subject, composition, background context, lighting, camera angle, and lens type (e.g. 35mm f/2.8, documentary style, natural light)...",
  "negativePrompt": "cartoon, illustration, 3D render, CGI, glossy airbrushed skin, oversaturated, text, watermark, deformed, fake, artificial bokeh",
  "editorialRationale": "Short rationale explaining how this visual reflects the journalistic context of the story.",
  "suggestedCaption": "A neutral, AP-style journalistic caption describing the conceptual scene."
}`;

  const completion = await generateCompletion({
    prompt: userPrompt,
    systemInstruction,
    temperature: 0.3,
  });

  try {
    const cleaned = completion.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned) as GeneratedVisualPrompt;
    return [parsed];
  } catch {
    return [
      {
        format: selectedFormat,
        aspectRatio: config.aspectRatio,
        prompt: `Editorial documentary photograph related to ${req.headline}. Natural light, 35mm lens, photojournalistic framing, candid authentic texture.`,
        negativePrompt: "cartoon, illustration, 3d render, CGI, fake, watermark, plastic skin",
        editorialRationale: "Generated baseline documentary prompt based on headline.",
        suggestedCaption: `Conceptual editorial illustration representing ${req.headline}.`,
      },
    ];
  }
}
