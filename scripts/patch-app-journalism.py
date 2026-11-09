#!/usr/bin/env python3
"""One-shot App.tsx patches for journalism / imbrgr / perf cleanup."""
from pathlib import Path

p = Path("/workspace/src/App.tsx")
text = p.read_text()
orig_len = len(text)

def once(sub, repl, label):
    global text
    if sub not in text:
        print(f"SKIP (missing): {label}")
        return
    text = text.replace(sub, repl, 1)
    print(f"OK: {label}")

once(
    'import * as maplibregl from "maplibre-gl";',
    "",
    "remove maplibre import",
)
once(
    'import React, { useState, useEffect, useRef } from "react";',
    'import React, { useState, useEffect, useRef, Suspense, lazy } from "react";',
    "react lazy import",
)
once(
    'import * as maplibregl from "maplibre-gl";\n',
    "",
    "maplibre import 2",
)

imports_anchor = 'import * as maplibregl from "maplibre-gl";'
if imports_anchor in text:
    text = text.replace(imports_anchor, "")

if "from \"./config/site\"" not in text:
    text = text.replace(
        'import * as maplibregl from "maplibre-gl";',
        "",
    )
    text = text.replace(
        "import * as maplibregl from \"maplibre-gl\";\n",
        'import {\n  AUTHOR_DEFAULT_FILING,\n  HOME_BUREAU,\n  IMBRGR_URL,\n  formatCoordinatesPair,\n} from "./config/site";\nimport { buildImbrgrStudioUrl, parseComposeImageParam, parseComposeTitleParam } from "./lib/composeLinks";\nimport { pickDispatchImageUrl } from "./lib/dispatchMedia";\nimport { dispatchBodyDisplay } from "./lib/dispatchContent";\nimport { SafeExternalImage } from "./components/SafeExternalImage";\n\nconst BeatMapPanel = lazy(() =>\n  import("./components/BeatMapPanel").then((m) => ({ default: m.BeatMapPanel }))\n);\n',
    )

# if maplibre already removed, add imports after lucide block
if "from \"./config/site\"" not in text:
    text = text.replace(
        '} from "lucide-react";\n',
        '} from "lucide-react";\nimport {\n  AUTHOR_DEFAULT_FILING,\n  HOME_BUREAU,\n  IMBRGR_URL,\n  formatCoordinatesPair,\n} from "./config/site";\nimport { buildImbrgrStudioUrl, parseComposeImageParam, parseComposeTitleParam } from "./lib/composeLinks";\nimport { pickDispatchImageUrl } from "./lib/dispatchMedia";\nimport { dispatchBodyDisplay } from "./lib/dispatchContent";\nimport { SafeExternalImage } from "./components/SafeExternalImage";\n\nconst BeatMapPanel = lazy(() =>\n  import("./components/BeatMapPanel").then((m) => ({ default: m.BeatMapPanel }))\n);\n',
    )

once(
    'const PRESSYO_GREETING = "Greetings Bureau Chief! I am Pressy\'o v3.0, your autonomous field newsroom copilot powered by a 3-tier LLM engine (Ollama → Groq LPU → Gemini). I now draft and live-rewrite dispatches across all 8 Pressie Edition Archetypes (Tactical, Broadsheet, Field Note, Almanac, Curio, Comic, Arcade, and Sleek Magazine), support Hybrid Visual Workflows (real archival/web photo verification + Pollinations AI photojournalism prompts), and include 1-click Uplift Angle & 15s Broadcast Read tools.";',
    'const PRESSYO_GREETING = "Hi — I\'m Pressy\'o, your journalism desk assistant (Ollama → Groq → Gemini). I help draft and edit dispatches: headlines, ledes, structure, tightening copy, attribution checks, and light AP-style polish. For photos, use imbrgr and paste the image URL into your dispatch.";',
    "pressyo greeting",
)

once(
    'const [activeTab, setActiveTab] = useState<"edition" | "wire" | "map" | "classifieds" | "discover">("edition");',
    'const [activeTab, setActiveTab] = useState<"edition" | "wire" | "map" | "classifieds" | "discover">("edition");\n  const [showNavMoreMenu, setShowNavMoreMenu] = useState(false);',
    "nav more state",
)

once(
    'const [newLocation, setNewLocation] = useState("Midwest Corridor");',
    'const [newLocation, setNewLocation] = useState(AUTHOR_DEFAULT_FILING.label);',
    "filing location default",
)
once(
    'const [newCoordinates, setNewCoordinates] = useState<string>("-87.63, 40.12");',
    'const [newCoordinates, setNewCoordinates] = useState<string>(formatCoordinatesPair(AUTHOR_DEFAULT_FILING.coordinates));',
    "coords default",
)

old_filter = """  const isThemePhotoFilterActive = (dispatch?: Dispatch | null): boolean => {
    if (!dispatch) return true;
    if (typeof editionPhotoFilterOverrides[dispatch.id] === "boolean") {
      return editionPhotoFilterOverrides[dispatch.id];
    }
    if (typeof dispatch.embedData?.useThemePhotoFilter === "boolean") {
      return dispatch.embedData.useThemePhotoFilter;
    }
    if (dispatch.imageCaption && dispatch.imageCaption.includes("[RAW COLOR]")) {
      return false;
    }
    return true;
  };"""
once(old_filter, "  const isThemePhotoFilterActive = (_dispatch?: Dispatch | null): boolean => false;", "retire filters")

once('authAccount?.role === "super_admin"', "authAccount?.canAccessAdminConsole", "admin gate")

once(
    "FieldPress Autonomous Newsroom • Bureau: {pressPass.bureau} • Last synced: {lastSyncTime}",
    "FieldPress • Home Bureau: {HOME_BUREAU.label} • Last synced: {lastSyncTime}",
    "masthead subheader",
)

# darkroom strip
start = text.find("            {/* Edition Theme Photo Filter Legend & Master Quick-Toggle Strip */}")
if start != -1:
    end = text.find("            {dispatches[0] && (() => {", start)
    if end != -1:
        text = text[:start] + text[end:]
        print("OK: removed darkroom strip")

# map useEffect
mstart = text.find("  // MapLibre Global & National Vicinity Interaction Radar")
mend = text.find("  // When a search query is active, the server has already matched")
if mstart != -1 and mend != -1:
    text = text[:mstart] + text[mend:]
    print("OK: removed map useEffect")

# map container -> BeatMapPanel
map_div = """              <div
                ref={mapContainerRef}
                className={`w-full h-[540px] rounded-lg border overflow-hidden relative shadow-inner ${
                  isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-300 bg-zinc-100"
                }`}
              />"""
map_repl = """              <Suspense fallback={<div className="w-full h-[540px] rounded-lg border border-zinc-800 bg-zinc-950 animate-pulse" />}>
                <BeatMapPanel
                  dispatches={dispatches}
                  mapSignalFilter={mapSignalFilter}
                  mapRegionPreset={mapRegionPreset}
                  isDispatchAnonOrDecoupled={isDispatchAnonOrDecoupled}
                  onSelectDispatch={setSelectedStory}
                  isDark={isDark}
                />
              </Suspense>"""
once(map_div, map_repl, "beat map panel")

# fallbacks
once(
"""  const getFallbackImageForDispatch = (d?: Partial<Dispatch> | null): string => {
    if (d?.embedData?.thumbnail_url) return d.embedData.thumbnail_url;
    const ytId = extractYoutubeVideoId(d?.sourceUrl) || extractYoutubeVideoId(d?.imageUrl);
    if (ytId) return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85";
  };

  const handleImgFallbackError = (e: React.SyntheticEvent<HTMLImageElement, Event>, d?: Partial<Dispatch> | null) => {
    const target = e.currentTarget;
    if (target.dataset.fallbackApplied === "1") return;
    target.dataset.fallbackApplied = "1";
    target.src = getFallbackImageForDispatch(d);
  };""",
"""  const getFallbackImageForDispatch = (d?: Partial<Dispatch> | null): string | null =>
    pickDispatchImageUrl(d?.imageUrl, d?.embedData?.thumbnail_url ?? null);

  const handleImgFallbackError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = "none";
  };""",
    "image fallback",
)

once(
"""      const safeImg =
        draftToEdit.imageUrl && !draftToEdit.imageUrl.includes("pollinations.ai") && !draftToEdit.imageUrl.includes("/wikipedia/commons/thumb/")
          ? draftToEdit.imageUrl
          : getFallbackImageForDispatch(draftToEdit);""",
"""      const safeImg = getFallbackImageForDispatch(draftToEdit) || "";""",
    "safe img edit",
)

once('setNewLocation(draftToEdit.location || "Midwest Corridor");', 'setNewLocation(draftToEdit.location || AUTHOR_DEFAULT_FILING.label);', "edit loc")
once('setNewLocation("Midwest Corridor (Vicinity)");', "setNewLocation(AUTHOR_DEFAULT_FILING.label);", "new loc")
once('setNewCoordinates("-87.63, 40.12");', "setNewCoordinates(formatCoordinatesPair(AUTHOR_DEFAULT_FILING.coordinates));", "new coords")
once(
    "let parsedCoords: [number, number] | undefined = pressPass.coordinates || [-87.63, 40.12];",
    "let parsedCoords: [number, number] | undefined = pressPass.coordinates || AUTHOR_DEFAULT_FILING.coordinates;",
    "parsed coords",
)

# remove generateVisual
gstart = text.find("  // AI Visual Generator with graceful fallback")
if gstart != -1:
    gend = text.find("  // =========================================================================\n  // CREATE PRESSIE HANDLER", gstart)
    if gend != -1:
        text = text[:gstart] + text[gend:]
        print("OK: removed generateVisual")

once('earRight: "HIGH SCORE: 994,200",', 'earRight: "ARCADE EDITION",', "arcade ear")
once('mastheadRightEar: "HIGH SCORE: 994,200",', 'mastheadRightEar: "ARCADE EDITION",', "arcade masthead ear")
once('<span className="hidden sm:inline">HIGH SCORE: 994200</span>', '<span className="hidden sm:inline">ARCADE</span>', "arcade ui")
once('<span className="text-zinc-400">ISSUE NO. 24</span>', "", "issue no")

text = text.replace("handleImgFallbackError(e, d)", "handleImgFallbackError(e)")
text = text.replace("handleImgFallbackError(e, disp)", "handleImgFallbackError(e)")
text = text.replace("handleImgFallbackError(e, selectedStory)", "handleImgFallbackError(e)")

p.write_text(text)
print("done", orig_len, "->", len(text))
