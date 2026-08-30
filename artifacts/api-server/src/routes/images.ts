import express, { Router, Request, Response } from 'express';
import { searchArchivalMedia, synthesizePhotoPrompt } from '../lib/images';

export const imagesRouter = Router();

// Ensure body parser runs at the router level regardless of app mount order
imagesRouter.use(express.json());

// Validate UUID vs preview slug
const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// POST /api/stories/:id/images/search
imagesRouter.post('/stories/:id/images/search', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const query = body.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required in request body' });
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
    const body = req.body || {};
    const { format = 'article_hero', headline = '', fieldNotes = '' } = body;
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
      return res.json({ success: true, mode: 'preview', asset: req.body || {} });
    }
    return res.json({ success: true, asset: req.body || {} });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/stories/:id/media-assets/:assetId
imagesRouter.patch('/stories/:id/media-assets/:assetId', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, updated: req.body || {} });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default imagesRouter;
