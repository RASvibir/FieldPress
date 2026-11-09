import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildImbrgrEmbedUrl,
  buildImbrgrCreateImageUrl,
  buildComposeDeepLink,
  isAllowedComposeImageHost,
  parseComposeImageParam,
  parseComposeDraftParam,
  suggestImagePromptFromPost,
} from "./composeLinks";

describe("composeLinks hosts", () => {
  it("allows imbrgr production and vercel hosts", () => {
    assert.equal(isAllowedComposeImageHost("imbrgr.website"), true);
    assert.equal(isAllowedComposeImageHost("www.imbrgr.website"), true);
    assert.equal(isAllowedComposeImageHost("imbrgr.vercel.app"), true);
    // Preview hosts require VITE_IMBRGR_TRUST_PREVIEWS=1 (off by default).
    assert.equal(isAllowedComposeImageHost("imbrgr-abc123.vercel.app"), false);
    assert.equal(isAllowedComposeImageHost("evil.com"), false);
  });

  it("parses HTTPS imbrgr file URLs", () => {
    const url = "https://imbrgr.website/api/media/file/uploads/x.png?mime=image%2Fpng";
    const parsed = parseComposeImageParam(url);
    assert.ok(parsed);
    assert.equal(new URL(parsed!).hostname, "imbrgr.website");
    assert.equal(parseComposeImageParam("https://evil.com/x.png"), null);
  });

  it("parses FieldPress draft ids", () => {
    assert.ok(parseComposeDraftParam("Fp_1730000000000"));
    assert.equal(parseComposeDraftParam("bad/id"), null);
  });
});

describe("imbrgr URL builders", () => {
  it("builds embed URLs with embed=1 and from=fieldpress", () => {
    const url = buildImbrgrEmbedUrl({ draftId: "Fp_1730000000000", prompt: "sunset desk" });
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("embed"), "1");
    assert.equal(parsed.searchParams.get("from"), "fieldpress");
    assert.equal(parsed.searchParams.get("draft"), "Fp_1730000000000");
    assert.equal(parsed.searchParams.get("prompt"), "sunset desk");
    assert.equal(parsed.searchParams.get("tab"), "generate");
  });

  it("builds full-studio create URLs without embed", () => {
    const url = buildImbrgrCreateImageUrl({ draftId: "Fp_1730000000000", prompt: "x" });
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("embed"), null);
    assert.equal(parsed.searchParams.get("from"), "fieldpress");
  });

  it("builds compose deep links", () => {
    const url = buildComposeDeepLink({
      imageUrl: "https://imbrgr.website/api/media/file/x.png",
      draftId: "Fp_1730000000000",
      title: "Hello",
    });
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("compose"), "1");
    assert.equal(parsed.searchParams.get("draft"), "Fp_1730000000000");
    assert.equal(parsed.searchParams.get("title"), "Hello");
  });

  it("suggests prompt from title and body", () => {
    const p = suggestImagePromptFromPost("Flooding", "Water rose overnight on Main St.");
    assert.ok(p.includes("Flooding"));
    assert.ok(p.includes("Water rose"));
  });
});
