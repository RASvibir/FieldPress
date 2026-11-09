import test from "node:test";
import assert from "node:assert/strict";
import { parseCaptionAltReply } from "./pressyoCaptionAlt.mjs";

test("parseCaptionAltReply accepts valid JSON block", () => {
  const raw = `TYPE: caption_alt
{"caption":"Workers repair the main line.","altText":"Utility crew in hard hats beside an open trench on a residential street."}`;
  const r = parseCaptionAltReply(raw);
  assert.equal(r.ok, true);
  assert.equal(r.caption, "Workers repair the main line.");
  assert.ok(r.altText.includes("Utility crew"));
});

test("parseCaptionAltReply rejects draft type", () => {
  const r = parseCaptionAltReply("TYPE: draft\nTITLE: x\nbody");
  assert.equal(r.ok, false);
});
