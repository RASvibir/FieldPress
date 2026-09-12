import React, { useState, useEffect } from "react";
import { Radio, RefreshCw, Send, Layers, FileText, Camera } from "lucide-react";

// Theme & Tokens
import { getAccentColorClasses, getThemeClasses } from "./theme/tokens";

// Types & Initial State
import {
  PressPassData,
  DEFAULT_PRESS_PASS,
  Dispatch,
  INITIAL_DISPATCHES,
  ClassifiedItem,
  INITIAL_CLASSIFIEDS,
  EditionFormat,
  ActiveTab
} from "./types/dispatch";

// Common UI
import { PressieMark } from "./components/common/PressieMark";
import { HeaderNav } from "./components/navigation/HeaderNav";

// Edition Staging Components
import { MorningBroadsheet } from "./components/editions/MorningBroadsheet";
import { TacticalTelemetry } from "./components/editions/TacticalTelemetry";
import { PhotojournalismGazette } from "./components/editions/PhotojournalismGazette";
import { CivicBureauLedger } from "./components/editions/CivicBureauLedger";

// Feature Views
import { DispatchFeed } from "./components/wire/DispatchFeed";
import { TelemetryMap } from "./components/radar/TelemetryMap";
import { ClassifiedsDeck } from "./components/classifieds/ClassifiedsDeck";
import { DesktopEditorialSuite } from "./components/desk/DesktopEditorialSuite";

// Modals & Drawers
import { DispatchComposerModal } from "./components/modals/DispatchComposerModal";
import { PressPassModal } from "./components/modals/PressPassModal";
import { StoryReaderModal } from "./components/modals/StoryReaderModal";
import { ShareClippingModal } from "./components/modals/ShareClippingModal";
import { PostNoticeModal } from "./components/modals/PostNoticeModal";
import { SettingsDrawer } from "./components/drawers/SettingsDrawer";

export const FieldPressMaster: React.FC = () => {
  // Theme State - Default Daylight ("light") mode
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("fieldpress_theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });

  const [watermarkVisible, setWatermarkVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("edition");
  const [editionFormat, setEditionFormat] = useState<EditionFormat>("broadsheet");

  // Standardized Modal & Drawer Booleans
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isPressPassModalOpen, setIsPressPassModalOpen] = useState(false);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isPostNoticeModalOpen, setIsPostNoticeModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Dispatch | null>(null);
  const [shareModalStory, setShareModalStory] = useState<Dispatch | null>(null);
  const [editingDraft, setEditingDraft] = useState<Dispatch | null>(null);

  // Persistence: Press Pass
  const [pressPass, setPressPass] = useState<PressPassData>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_press_pass");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRESS_PASS;
  });

  // Persistence: Dispatches
  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_dispatches");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DISPATCHES;
  });

  // Persistence: Staged Press Roll Drafts
  const [pressRoll, setPressRoll] = useState<Dispatch[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_press_roll");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persistence: Saved Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_bookmarks");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ["d-1"];
  });

  // Persistence: Classifieds
  const [classifiedsList, setClassifiedsList] = useState<ClassifiedItem[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_classifieds");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CLASSIFIEDS;
  });

  // Wire search & category filters
  const [wireSearchQuery, setWireSearchQuery] = useState("");
  const [wireCategoryFilter, setWireCategoryFilter] = useState("ALL");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("14:26 CST");
  const [savedSuccessToast, setSavedSuccessToast] = useState("");

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem("fieldpress_theme", theme);
    } catch {}
  }, [theme]);

  // Derived theme classes
  const currentAccent = getAccentColorClasses(pressPass.accentColor);
  const { isDark, inputThemeClass, cardThemeClass, subCardThemeClass, borderThemeClass, subTextThemeClass } =
    getThemeClasses(theme);

  // Modal Triggers
  const openCreatePressie = (draftToEdit?: Dispatch) => {
    setEditingDraft(draftToEdit || null);
    setIsPressPassModalOpen(false);
    setIsDispatchModalOpen(true);
  };

  const openPressPassEditor = () => {
    setIsDispatchModalOpen(false);
    setIsPressPassModalOpen(true);
  };

  const handleSavePass = (newData: PressPassData) => {
    setPressPass(newData);
    try {
      localStorage.setItem("fieldpress_press_pass", JSON.stringify(newData));
    } catch {}
    setSavedSuccessToast("Press Pass credentials saved.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const handleSaveDraft = (draft: Dispatch) => {
    const existingIndex = pressRoll.findIndex((p) => p.id === draft.id);
    let updated: Dispatch[];
    if (existingIndex >= 0) {
      updated = [...pressRoll];
      updated[existingIndex] = draft;
    } else {
      updated = [draft, ...pressRoll];
    }
    setPressRoll(updated);
    try {
      localStorage.setItem("fieldpress_press_roll", JSON.stringify(updated));
    } catch {}
    setSavedSuccessToast("Dispatch staged to Press Roll.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const handlePublishDispatch = (newDispatch: Dispatch) => {
    const updated = [newDispatch, ...dispatches];
    setDispatches(updated);
    try {
      localStorage.setItem("fieldpress_dispatches", JSON.stringify(updated));
    } catch {}
    if (editingDraft) {
      const updatedRoll = pressRoll.filter((p) => p.id !== editingDraft.id);
      setPressRoll(updatedRoll);
      try {
        localStorage.setItem("fieldpress_press_roll", JSON.stringify(updatedRoll));
      } catch {}
    }
    setSavedSuccessToast("Pressie published to Live Wire.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const toggleBookmark = (id: string) => {
    const isBookmarked = bookmarks.includes(id);
    const updated = isBookmarked ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    try {
      localStorage.setItem("fieldpress_bookmarks", JSON.stringify(updated));
    } catch {}
    setSavedSuccessToast(isBookmarked ? "Article removed from bookmarks." : "Article bookmarked in local storage.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const handleShareStory = (disp: Dispatch) => {
    const shareUrl = `${window.location.origin}/#dispatch-${disp.id}`;
    const photoLine = disp.imageUrl ? `\n📷 Evidence Photo: ${disp.imageUrl}` : "";
    const text = `📰 FIELDPRESS FRONT-PAGE DISPATCH\n"${disp.title}"\n📍 [${disp.location}] By ${disp.author} (@${disp.callsign}) • ${disp.bureau}${photoLine}\n🔗 ${shareUrl}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setShareModalStory(disp);
    setSavedSuccessToast("Front-page press clipping & dateline ready.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const handleSyncFeeds = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setSavedSuccessToast("Feeds synchronized with regional edge node.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }, 800);
  };

  const exportUserArchives = () => {
    const archiveData = {
      reporter: pressPass,
      dispatches: dispatches.filter((d) => d.author === pressPass.name || d.callsign === pressPass.callsign),
      pressRoll,
      bookmarks,
      classifieds: classifiedsList,
      exportedAt: new Date().toISOString(),
      platform: "FieldPress Autonomous Newsroom OS"
    };
    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fieldpress-archive-${pressPass.callsign}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedSuccessToast("Reporter dossier archive downloaded.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const deleteDraft = (id: string) => {
    const updated = pressRoll.filter((p) => p.id !== id);
    setPressRoll(updated);
    try {
      localStorage.setItem("fieldpress_press_roll", JSON.stringify(updated));
    } catch {}
  };

  const handlePostNotice = (item: ClassifiedItem) => {
    const updated = [item, ...classifiedsList];
    setClassifiedsList(updated);
    try {
      localStorage.setItem("fieldpress_classifieds", JSON.stringify(updated));
    } catch {}
    setSavedSuccessToast("Community bulletin notice posted.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  // Wire filtering
  const filteredDispatches = dispatches.filter((d) => {
    const matchesCategory =
      wireCategoryFilter === "ALL" ||
      d.category.toLowerCase() === wireCategoryFilter.toLowerCase() ||
      (wireCategoryFilter.toLowerCase() === "field dispatch" && d.category.toLowerCase() === "field notes") ||
      (wireCategoryFilter.toLowerCase() === "field notes" && d.category.toLowerCase() === "field dispatch");
    const matchesSearch =
      !wireSearchQuery.trim() ||
      d.title.toLowerCase().includes(wireSearchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(wireSearchQuery.toLowerCase()) ||
      d.author.toLowerCase().includes(wireSearchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(wireSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-200 ${
      isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-100 text-zinc-900"
    }`}>

      {/* 1. BACKGROUND WATERMARK */}
      {watermarkVisible && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.035] select-none"
        >
          <div className="flex flex-col items-center justify-center transform -rotate-12 scale-125">
            <PressieMark className="h-[420px] w-[420px] mb-2" />
            <span className={`font-mono text-8xl font-black tracking-widest uppercase ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}>
              FIELDPRESS
            </span>
            <span className={`font-mono text-2xl tracking-widest mt-1 font-semibold ${
              isDark ? "text-zinc-300" : "text-zinc-700"
            }`}>
              PRESS CORPS • INDEPENDENT WIRE
            </span>
          </div>
        </div>
      )}

      {/* 2. TOAST NOTIFICATIONS */}
      {savedSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className="bg-amber-500 text-zinc-950 px-4 py-2.5 rounded-lg shadow-xl font-mono text-xs font-bold flex items-center gap-2 border border-amber-400">
            <span>{savedSuccessToast}</span>
          </div>
        </div>
      )}

      {/* 3. MODULAR TOP NAVIGATION BAR */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCreatePressie={() => openCreatePressie()}
        openPressPassEditor={openPressPassEditor}
        openSettingsDrawer={() => setIsSettingsDrawerOpen(true)}
        theme={theme}
        setTheme={setTheme}
        pressPass={pressPass}
        currentAccent={currentAccent}
      />

      {/* 4. MAIN CONTENT WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
        {/* Active View Header Bar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b ${borderThemeClass}`}>
          <div>
            <h1 className="font-mono text-2xl font-black tracking-tight flex items-center gap-2">
              <span>
                {activeTab === "edition" && "Daily Broadsheet Edition"}
                {activeTab === "wire" && "Live Dispatch Wire"}
                {activeTab === "map" && "Geospatial Beat Radar"}
                {activeTab === "classifieds" && "Community Classifieds Wire"}
                {activeTab === "desk" && "Editorial Desk & Workstation"}
              </span>
              {activeTab === "wire" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase font-bold animate-pulse">
                  <Radio className="h-2.5 w-2.5" /> Live Telemetry
                </span>
              )}
            </h1>
            <p className={`font-mono text-xs mt-0.5 ${subTextThemeClass}`}>
              FieldPress Autonomous Newsroom • Bureau: {pressPass.bureau} • Last synced: {lastSyncTime}
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-3">
            <button
              onClick={() => openCreatePressie()}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-xs font-bold transition shadow-xs cursor-pointer ${currentAccent.btn}`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Create Pressie</span>
            </button>

            <button
              onClick={handleSyncFeeds}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded border transition cursor-pointer ${
                isDark ? "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" : "border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-amber-500" : ""}`} />
              <span>{isSyncing ? "Syncing…" : "Sync"}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DAILY BROADSHEET EDITION (WITH 4 STAGED FORMATS) */}
        {activeTab === "edition" && (
          <div className="space-y-6">
            {/* Edition Staging Style Selector */}
            <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs ${cardThemeClass}`}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-amber-500" />
                  <span>Staged Edition:</span>
                </span>
                <span className={`text-[11px] hidden sm:inline ${subTextThemeClass}`}>
                  Unique broadsheet presentations adapted to your field dispatches
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                {[
                  { id: "broadsheet", label: "Morning Broadsheet", icon: FileText, desc: "Classic front-page lead with 3-column articles" },
                  { id: "tactical", label: "Tactical Telemetry", icon: Radio, desc: "GPS coordinates, PGP stamps & radar targeting" },
                  { id: "photo", label: "Photojournalism", icon: Camera, desc: "35mm visual stills & documentary evidence plates" },
                  { id: "civic", label: "Civic Ledger", icon: Layers, desc: "Bureau registry & municipal classifieds digest" }
                ].map((fmt) => {
                  const isActive = editionFormat === fmt.id;
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setEditionFormat(fmt.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all cursor-pointer font-bold flex-shrink-0 ${
                        isActive
                          ? `${currentAccent.btn} shadow-xs`
                          : isDark
                            ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                            : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300 hover:text-zinc-900"
                      }`}
                      title={fmt.desc}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FORMAT 1: MORNING BROADSHEET */}
            {editionFormat === "broadsheet" && (
              <MorningBroadsheet
                dispatches={dispatches}
                bookmarks={bookmarks}
                toggleBookmark={toggleBookmark}
                handleShareStory={handleShareStory}
                setSelectedStory={setSelectedStory}
                isDark={isDark}
                cardThemeClass={cardThemeClass}
                borderThemeClass={borderThemeClass}
                subTextThemeClass={subTextThemeClass}
              />
            )}

            {/* FORMAT 2: TACTICAL TELEMETRY */}
            {editionFormat === "tactical" && (
              <TacticalTelemetry
                dispatches={dispatches}
                bookmarks={bookmarks}
                toggleBookmark={toggleBookmark}
                handleShareStory={handleShareStory}
                setSelectedStory={setSelectedStory}
                onNavigateToMap={() => setActiveTab("map")}
                cardThemeClass={cardThemeClass}
                subCardThemeClass={subCardThemeClass}
                subTextThemeClass={subTextThemeClass}
              />
            )}

            {/* FORMAT 3: PHOTOJOURNALISM GAZETTE */}
            {editionFormat === "photo" && (
              <PhotojournalismGazette
                dispatches={dispatches}
                handleShareStory={handleShareStory}
                setSelectedStory={setSelectedStory}
                openCreatePressie={openCreatePressie}
                cardThemeClass={cardThemeClass}
                subCardThemeClass={subCardThemeClass}
                borderThemeClass={borderThemeClass}
                subTextThemeClass={subTextThemeClass}
              />
            )}

            {/* FORMAT 4: CIVIC BUREAU LEDGER */}
            {editionFormat === "civic" && (
              <CivicBureauLedger
                dispatches={dispatches}
                classifiedsList={classifiedsList}
                setSelectedStory={setSelectedStory}
                openPostNoticeModal={() => setIsPostNoticeModalOpen(true)}
                exportUserArchives={exportUserArchives}
                cardThemeClass={cardThemeClass}
                subCardThemeClass={subCardThemeClass}
                subTextThemeClass={subTextThemeClass}
              />
            )}
          </div>
        )}

        {/* TAB 2: LIVE DISPATCH WIRE */}
        {activeTab === "wire" && (
          <DispatchFeed
            dispatches={dispatches}
            filteredDispatches={filteredDispatches}
            pressRoll={pressRoll}
            wireSearchQuery={wireSearchQuery}
            setWireSearchQuery={setWireSearchQuery}
            wireCategoryFilter={wireCategoryFilter}
            setWireCategoryFilter={setWireCategoryFilter}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            handleShareStory={handleShareStory}
            setSelectedStory={setSelectedStory}
            openCreatePressie={openCreatePressie}
            currentAccent={currentAccent}
            isDark={isDark}
            cardThemeClass={cardThemeClass}
            subCardThemeClass={subCardThemeClass}
            inputThemeClass={inputThemeClass}
            subTextThemeClass={subTextThemeClass}
          />
        )}

        {/* TAB 3: GEOSPATIAL BEAT RADAR */}
        {activeTab === "map" && (
          <TelemetryMap
            dispatches={dispatches}
            setSelectedStory={setSelectedStory}
            isDark={isDark}
            cardThemeClass={cardThemeClass}
            subTextThemeClass={subTextThemeClass}
          />
        )}

        {/* TAB 4: CLASSIFIEDS */}
        {activeTab === "classifieds" && (
          <ClassifiedsDeck
            classifiedsList={classifiedsList}
            openPostNoticeModal={() => setIsPostNoticeModalOpen(true)}
            setSavedSuccessToast={setSavedSuccessToast}
            cardThemeClass={cardThemeClass}
            subCardThemeClass={subCardThemeClass}
            subTextThemeClass={subTextThemeClass}
          />
        )}

        {/* TAB 5: DESK WORKSTATION (SPRINT 3 EDITORIAL SUITE) */}
        {activeTab === "desk" && (
          <DesktopEditorialSuite
            dispatches={dispatches}
            pressRoll={pressRoll}
            setDispatches={setDispatches}
            setPressRoll={setPressRoll}
            pressPass={pressPass}
            setSavedSuccessToast={setSavedSuccessToast}
            currentAccent={currentAccent}
            isDark={isDark}
            cardThemeClass={cardThemeClass}
            subCardThemeClass={subCardThemeClass}
            inputThemeClass={inputThemeClass}
            borderThemeClass={borderThemeClass}
            subTextThemeClass={subTextThemeClass}
          />
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODULAR MODALS & DRAWERS                                                  */}
      {/* ========================================================================= */}

      {/* 5. PRESSIE COMPOSER MODAL */}
      <DispatchComposerModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        draftToEdit={editingDraft}
        pressPass={pressPass}
        onSaveDraft={handleSaveDraft}
        onPublishDispatch={handlePublishDispatch}
        isDark={isDark}
        inputThemeClass={inputThemeClass}
        subCardThemeClass={subCardThemeClass}
        borderThemeClass={borderThemeClass}
        subTextThemeClass={subTextThemeClass}
      />

      {/* 6. REPORTER PRESS PASS CREDENTIAL STUDIO MODAL */}
      <PressPassModal
        isOpen={isPressPassModalOpen}
        onClose={() => setIsPressPassModalOpen(false)}
        pressPass={pressPass}
        onSavePass={handleSavePass}
        isDark={isDark}
        inputThemeClass={inputThemeClass}
        borderThemeClass={borderThemeClass}
      />

      {/* 7. INTERACTIVE STORY READER MODAL */}
      <StoryReaderModal
        selectedStory={selectedStory}
        setSelectedStory={setSelectedStory}
        bookmarks={bookmarks}
        toggleBookmark={toggleBookmark}
        handleShareStory={handleShareStory}
        isDark={isDark}
        borderThemeClass={borderThemeClass}
        subCardThemeClass={subCardThemeClass}
        subTextThemeClass={subTextThemeClass}
      />

      {/* 7B. FRONT-PAGE PRESS CLIPPING & SYNDICATED SHARE MODAL */}
      <ShareClippingModal
        shareModalStory={shareModalStory}
        setShareModalStory={setShareModalStory}
        setSavedSuccessToast={setSavedSuccessToast}
        isDark={isDark}
        borderThemeClass={borderThemeClass}
      />

      {/* 8. POST COMMUNITY NOTICE MODAL */}
      <PostNoticeModal
        isOpen={isPostNoticeModalOpen}
        onClose={() => setIsPostNoticeModalOpen(false)}
        onPostNotice={handlePostNotice}
        pressPass={pressPass}
        isDark={isDark}
        inputThemeClass={inputThemeClass}
      />

      {/* 9. WORKSTATION SETTINGS DRAWER */}
      <SettingsDrawer
        isOpen={isSettingsDrawerOpen}
        onClose={() => setIsSettingsDrawerOpen(false)}
        pressPass={pressPass}
        openPressPassEditor={openPressPassEditor}
        openCreatePressie={openCreatePressie}
        setSelectedStory={setSelectedStory}
        pressRoll={pressRoll}
        deleteDraft={deleteDraft}
        bookmarks={bookmarks}
        toggleBookmark={toggleBookmark}
        dispatches={dispatches}
        setDispatches={setDispatches}
        setPressRoll={setPressRoll}
        setBookmarks={setBookmarks}
        exportUserArchives={exportUserArchives}
        theme={theme}
        setTheme={setTheme}
        watermarkVisible={watermarkVisible}
        setWatermarkVisible={setWatermarkVisible}
        setSavedSuccessToast={setSavedSuccessToast}
        initialDispatches={INITIAL_DISPATCHES}
        isDark={isDark}
        inputThemeClass={inputThemeClass}
        subCardThemeClass={subCardThemeClass}
        borderThemeClass={borderThemeClass}
        subTextThemeClass={subTextThemeClass}
      />

    </div>
  );
};

export default FieldPressMaster;
