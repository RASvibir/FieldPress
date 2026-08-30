#!/usr/bin/env bash
set -euo pipefail

echo "==> 1. Creating src/lib/images.ts..."
cat << 'LIB_EOF' > src/lib/images.ts
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
  const data = await response.json();
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
LIB_EOF

echo "==> 2. Creating src/routes/images.ts..."
cat << 'ROUTE_EOF' > src/routes/images.ts
import { Router, Request, Response } from 'express';
import { searchArchivalMedia, synthesizePhotoPrompt } from '../lib/images';

export const imagesRouter = Router();

// Validate UUID vs preview slug (Issue 2 from manual)
const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// POST /api/stories/:id/images/search
imagesRouter.post('/stories/:id/images/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    const results = await searchArchivalMedia(query);
    return res.json(results);
  } catch (error: any) {
    console.error('Image search failed:', error);
    return res.status(500).json({ error: 'Archival media search failed', details: error.message });
  }
});

// POST /api/stories/:id/images/generate-prompt
imagesRouter.post('/stories/:id/images/generate-prompt', async (req: Request, res: Response) => {
  try {
    const { format, headline, fieldNotes } = req.body;
    const result = synthesizePhotoPrompt({ format, headline, fieldNotes });
    return res.json(result);
  } catch (error: any) {
    console.error('Prompt generation failed:', error);
    return res.status(500).json({ error: 'Prompt generation failed', details: error.message });
  }
});

// POST /api/stories/:id/media-assets
imagesRouter.post('/stories/:id/media-assets', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.json({ success: true, mode: 'preview', asset: req.body });
    }
    return res.json({ success: true, asset: req.body });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/stories/:id/media-assets/:assetId
imagesRouter.patch('/stories/:id/media-assets/:assetId', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, updated: req.body });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default imagesRouter;
ROUTE_EOF

echo "==> 3. Normalizing src/app.ts router mounting..."
# Clean any duplicate or broken injections
sed -i '' '/import.*imagesRouter/d' src/app.ts
sed -i '' '/app\.use(".*imagesRouter)/d' src/app.ts

# 1. Insert import at line 1
sed -i '' '1s|^|import { imagesRouter } from "./routes/images";\'$'\n|' src/app.ts

# 2. Mount router before first app.use(
sed -i '' '1,/app\.use(/s/app\.use(/app.use("\/api", imagesRouter);\'$'\napp.use(/' src/app.ts

echo "==> 4. Compiling with esbuild..."
npm run build

echo "==> 5. Restarting Backend API on Port 3000..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
node --env-file=.env.production dist/index.mjs &
sleep 2

echo "==> 6. Testing Endpoints..."
echo "--- Testing Archival Search ---"
curl -s -X POST http://localhost:3000/api/stories/search-preview/images/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Journalism Press"}' | head -c 200
echo -e "\n"

echo "--- Testing Prompt Generation ---"
curl -s -X POST http://localhost:3000/api/stories/search-preview/images/generate-prompt \
  -H "Content-Type: application/json" \
  -d '{"format": "article_hero", "headline": "Groundwater Contamination", "fieldNotes": "Local industrial runoff investigation."}'
echo -e "\n"

echo "==> Build & verification complete."
