export interface MediaSearchResult {
  id: number | string;
  title: string;
  url: string;
  thumbUrl: string;
  author: string;
  license: string;
  description: string;
  width?: number;
  height?: number;
}

export async function searchArchivalMedia(query: string): Promise<MediaSearchResult[]> {
  const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(
    query
  )}&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata|size&format=json&origin=*`;

  const response = await fetch(wikiUrl);
  if (!response.ok) {
    throw new Error(`Wikimedia API error: ${response.statusText}`);
  }
  const data = (await response.json()) as { query?: { pages?: Record<string, unknown> } };
  const pages = data.query?.pages || {};

  return Object.values(pages).map((page: any) => {
    const info = page.imageinfo?.[0] || {};
    const meta = info.extmetadata || {};
    return {
      id: page.pageid,
      title: (page.title || '').replace(/^File:/, ''),
      url: info.url || '',
      thumbUrl: info.url || '',
      author: meta.Artist?.value || 'Unknown',
      license: meta.LicenseShortName?.value || 'Public Domain / CC',
      description: meta.ImageDescription?.value || '',
      width: info.width,
      height: info.height,
    };
  });
}

export function synthesizePhotoPrompt(params: {
  format?: string;
  headline?: string;
  fieldNotes?: string;
}) {
  const { format = 'article_hero', headline = '', fieldNotes = '' } = params;
  const baseStyle =
    'Cinematic editorial photojournalism, authentic 35mm film grain, documentary style, natural lighting, Pulitzer-winning photography';

  const formatMap: Record<string, { ar: string; label: string }> = {
    article_hero: { ar: '16:9', label: '16:9 Hero' },
    social_feed: { ar: '4:5', label: '4:5 Social' },
    podcast_square: { ar: '1:1', label: '1:1 Podcast' },
  };

  const selected = formatMap[format] || formatMap.article_hero;
  const prompt = `${headline ? headline + '. ' : ''}${fieldNotes ? fieldNotes + '. ' : ''}${baseStyle} --ar ${selected.ar}`.trim();

  return {
    format,
    headline,
    prompt,
    aspectRatio: selected.ar,
  };
}
