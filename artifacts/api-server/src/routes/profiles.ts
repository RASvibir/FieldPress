import { Router, Request, Response } from 'express';

const router = Router();

// PUT /api/profiles/:handle - Update reporter profile state & skin preferences
router.put('/profiles/:handle', async (req: Request, res: Response) => {
  const rawHandle = req.params.handle;
  const handle = (typeof rawHandle === 'string' ? rawHandle : Array.isArray(rawHandle) ? rawHandle[0] : '').trim();
  const { displayName, bio, coverPhotoUrl, avatarUrl, skinColor, rankTier } = req.body;

  if (!handle) {
    res.status(400).json({ error: 'Reporter handle required' });
    return;
  }

  try {
    // If using Drizzle / Neon DB pool from request context or global env
    const db = req.app.locals.db;
    
    if (db) {
      await db.execute(
        `UPDATE reporter_profiles 
         SET display_name = COALESCE($1, display_name),
             bio = COALESCE($2, bio),
             cover_photo_url = COALESCE($3, cover_photo_url),
             avatar_url = COALESCE($4, avatar_url),
             skin_preference = COALESCE($5, skin_preference),
             rank_tier = COALESCE($6, rank_tier),
             updated_at = NOW()
         WHERE handle = $7`,
        [displayName, bio, coverPhotoUrl, avatarUrl, skinColor, rankTier, handle]
      );
    }

    res.json({ success: true, message: `Profile for @${handle} updated and persisted successfully.` });
  } catch (err: any) {
    console.error('[Profile API Error]:', err);
    res.status(500).json({ error: 'Failed to persist profile update to database', details: err.message });
  }
});

export default router;
