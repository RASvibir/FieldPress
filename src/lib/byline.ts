/** User-facing byline; avoids empty handles like "Field Correspondent (@)". */
export function formatByline(author: string, callsign?: string | null): string {
  const name = (author || "").trim();
  const handle = (callsign || "").trim();
  if ((!handle && (name === "Field Correspondent" || name === "Guest")) || (!name && !handle)) {
    return "Sign in to post";
  }
  return handle ? `${name} (@${handle})` : name;
}
