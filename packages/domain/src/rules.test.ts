import assert from "node:assert/strict";
import { test } from "node:test";
import { mediaAssetSchema } from "./entities.ts";
import { assertOriginalNotReplaced, storageKeyNotUrl } from "./rules.ts";

test("original lineage rejects overwrite-style derivatives", () => {
  assert.throws(() =>
    assertOriginalNotReplaced(
      { kind: "original", id: "a" },
      { kind: "original", parentAssetId: "a" },
    ),
  );
  assert.doesNotThrow(() =>
    assertOriginalNotReplaced(
      { kind: "original", id: "a" },
      { kind: "proxy", parentAssetId: "a" },
    ),
  );
});

test("storage keys are not public URLs", () => {
  const asset = mediaAssetSchema.parse({
    id: "m1",
    captureId: "c1",
    kind: "original",
    parentAssetId: null,
    storageKey: "org/proj/captures/c1/original.bin",
    originalFilename: "take.wav",
    mimeType: "audio/wav",
    sha256: "a".repeat(64),
    byteSize: 12,
    durationMs: 1000,
  });
  assert.equal(storageKeyNotUrl(asset), true);
});
