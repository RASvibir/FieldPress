import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseImbrgrComposeMessage, IMBRGR_COMPOSE_MESSAGE_TYPE } from "./imbrgrComposeMessage";

describe("parseImbrgrComposeMessage", () => {
  it("accepts trusted origin and valid payload", () => {
    const r = parseImbrgrComposeMessage("https://imbrgr.website", {
      type: IMBRGR_COMPOSE_MESSAGE_TYPE,
      imageUrl: "https://imbrgr.website/api/media/file/x.png",
      draftId: "Fp_1730000000000",
      title: "Desk",
    });
    assert.ok(r);
    assert.equal(r!.draftId, "Fp_1730000000000");
    assert.equal(r!.title, "Desk");
  });

  it("rejects untrusted origin", () => {
    const r = parseImbrgrComposeMessage("https://evil.com", {
      type: IMBRGR_COMPOSE_MESSAGE_TYPE,
      imageUrl: "https://imbrgr.website/api/media/file/x.png",
    });
    assert.equal(r, null);
  });

  it("rejects imbrgr Vercel preview origins unless explicitly trusted", () => {
    const r = parseImbrgrComposeMessage("https://imbrgr-attacker.vercel.app", {
      type: IMBRGR_COMPOSE_MESSAGE_TYPE,
      imageUrl: "https://imbrgr.website/api/media/file/x.png",
    });
    assert.equal(r, null);
  });

  it("rejects bad image host even from trusted origin", () => {
    const r = parseImbrgrComposeMessage("https://imbrgr.website", {
      type: IMBRGR_COMPOSE_MESSAGE_TYPE,
      imageUrl: "https://evil.com/x.png",
    });
    assert.equal(r, null);
  });
});
