import test from "node:test";
import assert from "node:assert/strict";
import {
  captionForPublish,
  isLegacyComposerPlaceholderCaption,
  shouldShowPublicImageCaption,
} from "./composerImageCaption";

test("detects legacy placeholder captions", () => {
  assert.equal(isLegacyComposerPlaceholderCaption("[📸 Real Web Photo] Field media link"), true);
  assert.equal(isLegacyComposerPlaceholderCaption("Workers on the bridge."), false);
});

test("captionForPublish uses only non-empty writer caption", () => {
  assert.equal(captionForPublish(""), undefined);
  assert.equal(captionForPublish("  My caption  "), "My caption");
});

test("shouldShowPublicImageCaption hides legacy placeholders", () => {
  assert.equal(shouldShowPublicImageCaption("[📸 Real Web Photo] Field media link"), false);
  assert.equal(shouldShowPublicImageCaption("A real caption"), true);
});
