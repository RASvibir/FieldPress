import test from "node:test";
import assert from "node:assert/strict";
import { resolveImageAlt } from "./imageAlt";

test("resolveImageAlt prefers alt text", () => {
  assert.equal(resolveImageAlt("Alt", "Cap", "Head"), "Alt");
});

test("resolveImageAlt falls back to caption then headline", () => {
  assert.equal(resolveImageAlt("", "Cap", "Head"), "Cap");
  assert.equal(resolveImageAlt(null, "", "Head"), "Head");
});
