# FieldPress 📰

> Autonomous Field Bureau, Dispatches, and Telemetry Platform for Independent Correspondents.

---

## 🛠️ Modal Endpoint Separation & Pressie Builder Architecture

### 1. Correct Endpoint Wiring: "Create Pressie" vs. "Press Pass"
- **The Issue**: In previous revisions, the "Create Pressie" navigation button opened the **Press Pass Credential Editor** (the ID card badge preview labeled *"Create & Issue Your Pressie"* with button *"Issue & Save Pressie"*). This caused crossed endpoints because a "Pressie" is a dispatch / news item, not the reporter ID badge.
- **The Resolution**:
  - **Create Pressie** (`openCreatePressie()`): Opens the **Pressie Builder** (`New Field Dispatch or Press Roll`).
  - **Press Pass** (`openPressPassEditor()`): Exclusively opened by clicking the **PRESS PASS: [callsign]** badge button in the top-right utility bar or via Settings Profile. Labeled accurately as **"Press Pass Credential & ID Studio"** with button **"Save Press Pass Credentials"**.

### 2. The Enhanced Pressie Builder (Dispatch Composer)
Built directly on the foundation of the clean dispatch modal with three key studio features:
1. **Image Generation Prompt Box**:
   - Visual framing brief input box (`"Visual framing brief (e.g. Substation telemetry array along rural rail lines)..."`).
   - "Gen Visual" action button with camera icon and live rendering spinner.
   - 1-click "Prompt from Title" shortcut to auto-generate briefs from the headline.
   - Quick thematic preset tags (Rail Corridor, Power Grid, Dark Fiber, River Basin).
2. **Hybrid Generated Image Preview**:
   - Live preview of the active cover image with source attribution tag (`AI Gen` vs `Field Upload`).
   - "Active Cover" check badge and "Detach Cover" button.
   - Active Cover Verification Caption input.
3. **Add Local / Capture Image Tray**:
   - Native device upload / camera capture button (`<input type="file" accept="image/*" capture="environment" />`).
   - Image URL linking input.
   - Multi-image evidence tray with side-by-side thumbnail previews, 1-click cover selection, high-res download, and removal.
4. **Core Dispatch Controls**:
   - Headline and Beat Location with 1-tap regional corridor quick-snapping (Danville, Lafayette, Covington, Catlin, Champaign-Urbana).
   - Category selector (Field Dispatch, Breaking Wire, Infrastructure, Civic Wire, Transit, Telecom, Editorial).
   - Story copy narrative textarea with live character and word counters.
   - "Stage to Press Roll" (saves draft to queue) and "Publish to Live Feed" (publishes live to Wire).

---

## 🚀 Running FieldPress

```bash
cd ~/FieldPress
npm run dev
```
