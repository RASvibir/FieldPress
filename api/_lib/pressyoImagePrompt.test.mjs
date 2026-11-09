import test from "node:test";
import assert from "node:assert/strict";
import { parseImagePromptReply } from "./pressyoImagePrompt.mjs";

test("parseImagePromptReply accepts PROMPT line", () => {
  const raw = `TYPE: image_prompt
PROMPT: Golden hour street scene with reporters under umbrellas, photorealistic.`;
  const r = parseImagePromptReply(raw);
  assert.equal(r.ok, true);
  assert.ok(r.prompt.includes("Golden hour"));
});

test("parseImagePromptReply rejects empty", () => {
  assert.equal(parseImagePromptReply("TYPE: chat\nhi").ok, false);
  assert.equal(parseImagePromptReply("").ok, false);
});
