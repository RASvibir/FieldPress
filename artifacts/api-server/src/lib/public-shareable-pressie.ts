import { and, asc, eq, isNull, or } from "drizzle-orm";
import { db, storiesTable, storyItemsTable } from "@workspace/db";

const TEXT_TYPES = new Set(["text", "body", "note", "caption", "quote", "markdown"]);

export const MAX_PUBLIC_PRESSIE_ID_LENGTH = 255;
export const MAX_PUBLIC_TITLE_LENGTH = 180;
export const MAX_PUBLIC_EXCERPT_LENGTH = 260;

export type PublicShareablePressie = {
  id: string;
  title: string;
  excerpt: string;
};

export function normalizePublicPressieId(value: unknown): string | null {
  const id = String(value || "").trim();

  if (!id || id.length > MAX_PUBLIC_PRESSIE_ID_LENGTH) {
    return null;
  }

  return id;
}

export function cleanPublicShareText(value: unknown): string {
  return String(value || "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/file:\/\/\S+/gi, "")
    .replace(/\/(?:Users|tmp)\/\S+/gi, "")
    .replace(/WKFileShare-\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isSafePublicShareExcerpt(value: string): boolean {
  const text = value.trim();

  if (!text) {
    return false;
  }

  return !(
    /^(?:\/Users\/|\/tmp\/|file:|https?:\/\/)/i.test(text) ||
    text.includes("WKFileShare-")
  );
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export async function getPublicShareablePressie(
  rawStoryId: unknown,
): Promise<PublicShareablePressie | null> {
  const storyId = normalizePublicPressieId(rawStoryId);

  if (!storyId) {
    return null;
  }

  const [story] = await db
    .select({
      id: storiesTable.id,
      title: storiesTable.title,
    })
    .from(storiesTable)
    .where(
      and(
        eq(storiesTable.id, storyId),
        eq(storiesTable.status, "active"),
        or(
          eq(storiesTable.visibility, "public"),
          isNull(storiesTable.ownerId),
        ),
      ),
    )
    .limit(1);

  if (!story) {
    return null;
  }

  const items = await db
    .select({
      type: storyItemsTable.type,
      content: storyItemsTable.content,
    })
    .from(storyItemsTable)
    .where(eq(storyItemsTable.storyId, story.id))
    .orderBy(asc(storyItemsTable.createdAt))
    .limit(12);

  const excerpt = items
    .filter((item) => TEXT_TYPES.has(String(item.type || "").toLowerCase()))
    .map((item) => cleanPublicShareText(item.content))
    .find(isSafePublicShareExcerpt);

  return {
    id: story.id,
    title: truncate(
      cleanPublicShareText(story.title) || "FieldPress Pressie",
      MAX_PUBLIC_TITLE_LENGTH,
    ),
    excerpt: excerpt ? truncate(excerpt, MAX_PUBLIC_EXCERPT_LENGTH) : "",
  };
}
