#!/usr/bin/env python3
"""Wire PostComposer + MainNav into App.tsx (surgical)."""
from pathlib import Path

p = Path("/workspace/src/App.tsx")
text = p.read_text()

imports = """import { PostComposer } from "./features/post/PostComposer";
import { MainNav } from "./features/shell/MainNav";
import { AvatarMenuPanel } from "./features/shell/AvatarMenuPanel";
import { HomeChrome } from "./features/shell/HomeChrome";
import { ExploreChrome, type ExploreTab } from "./features/shell/ExploreChrome";
import { TOPIC_OPTIONS } from "./features/post/looks";
"""
if "PostComposer" not in text:
    text = text.replace(
        'import { PostAiTray, type LeadItem } from "./components/PostAiTray";',
        'import { PostAiTray, type LeadItem } from "./components/PostAiTray";\n' + imports,
    )

if "mainSection" not in text:
    text = text.replace(
        'const [activeTab, setActiveTab] = useState<"edition" | "wire" | "map" | "classifieds" | "discover">("edition");',
        """const [mainSection, setMainSection] = useState<"home" | "explore">("home");
  const [homeViewMode, setHomeViewMode] = useState<"cards" | "list">("cards");
  const [exploreTab, setExploreTab] = useState<ExploreTab>("people");
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [homeTopicFilter, setHomeTopicFilter] = useState<string>("ALL");
  const [composerDraftLabel, setComposerDraftLabel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edition" | "wire" | "map" | "classifieds" | "discover">("edition");""",
    )

if "Sync home/explore" not in text:
    text = text.replace(
        "  const [showNavMoreMenu, setShowNavMoreMenu] = useState(false);",
        """  const [showNavMoreMenu, setShowNavMoreMenu] = useState(false);

  // Sync home/explore chrome to legacy tab routes
  useEffect(() => {
    if (mainSection === "home") {
      setActiveTab(homeViewMode === "cards" ? "edition" : "wire");
    }
  }, [mainSection, homeViewMode]);
  useEffect(() => {
    if (mainSection !== "explore") return;
    if (exploreTab === "people") setActiveTab("discover");
    else if (exploreTab === "map") setActiveTab("map");
    else if (exploreTab === "notices") setActiveTab("classifieds");
    else if (exploreTab === "search") setActiveTab("wire");
  }, [mainSection, exploreTab]);""",
    )

# Replace old header block - from MAIN HEADER to end header
start = text.find("      {/* 3. MAIN HEADER BAR */}")
end = text.find("      {/* 4. MAIN CONTENT AREA */}")
if start != -1 and end != -1:
    new_header = '''      <MainNav
        section={mainSection}
        onSectionChange={(s) => {
          setMainSection(s);
          setShowAvatarMenu(false);
        }}
        onPost={() => openCreatePressie()}
        onMessages={() => setShowMessengerModal(true)}
        onNotifications={() => {
          setShowNotifPanel(true);
          markNotificationsSeen();
        }}
        onSearch={() => setShowGlobalSearch(true)}
        onAvatarMenu={() => setShowAvatarMenu((v) => !v)}
        avatarUrl={authAccount?.avatarUrl || pressPass.avatarUrl}
        isDark={isDark}
        notifCount={unseenNotifications.length + serverUnreadCount}
        showAvatarMenu={showAvatarMenu}
        avatarMenu={
          <AvatarMenuPanel
            isDark={isDark}
            signedIn={Boolean(authAccount)}
            canAdmin={Boolean(authAccount?.canAccessAdminConsole)}
            onClose={() => setShowAvatarMenu(false)}
            onProfile={() => {
              setShowAvatarMenu(false);
              openPressPassEditor();
            }}
            onDrafts={() => {
              setShowAvatarMenu(false);
              setShowSettingsDrawer(true);
              setSettingsActiveTab("drafts");
            }}
            onSaved={() => {
              setShowAvatarMenu(false);
              setShowSettingsDrawer(true);
              setSettingsActiveTab("bookmarks");
            }}
            onAssistant={() => {
              setShowAvatarMenu(false);
              setShowPressyoModal(true);
            }}
            onSettings={() => {
              setShowAvatarMenu(false);
              setShowSettingsDrawer(true);
              setSettingsActiveTab("appearance");
            }}
            onAdmin={() => {
              setShowAvatarMenu(false);
              setShowSettingsDrawer(true);
              setSettingsActiveTab("admin");
              loadAdminUsers();
            }}
            onSignIn={() => {
              setShowAvatarMenu(false);
              setAuthModalMode("signin");
            }}
            onSignOut={() => {
              setShowAvatarMenu(false);
              void submitAuthSignOut();
            }}
          />
        }
      />

'''
    text = text[:start] + new_header + text[end:]
    print("header replaced")

# Replace view header bar
vh_start = text.find("        {/* Active View Header Bar */}")
vh_end = text.find("        {/* TAB 1: DAILY BROADSHEET EDITION */}")
if vh_start != -1 and vh_end != -1:
    new_vh = """        {mainSection === "home" && (
          <HomeChrome
            isDark={isDark}
            viewMode={homeViewMode}
            onViewModeChange={setHomeViewMode}
            topicFilter={homeTopicFilter}
            onTopicFilterChange={setHomeTopicFilter}
            topics={[...TOPIC_OPTIONS]}
            subTextClass={subTextThemeClass}
          />
        )}
        {mainSection === "explore" && (
          <ExploreChrome
            tab={exploreTab}
            onTabChange={setExploreTab}
            isDark={isDark}
            onOpenSearch={() => setShowGlobalSearch(true)}
          />
        )}

"""
    text = text[:vh_start] + new_vh + text[vh_end:]
    print("view header replaced")

# Replace pressie modal
m_start = text.find("      {showPressieBuilderModal && (")
m_end = text.find("      {/* 6. DEDICATED PRESS PASS CREDENTIAL")
if m_start != -1 and m_end != -1:
    modal = r'''      <PostComposer
        open={showPressieBuilderModal}
        isDark={isDark}
        isSubmitting={isSubmittingPressie}
        editingPublishedId={editingPublishedId}
        editingDraftId={editingDraftId}
        formError={formValidationError}
        authSignedIn={Boolean(authAccount)}
        authAvatarUrl={authAccount?.avatarUrl || pressPass.avatarUrl}
        displayName={authAccount ? pressPass.name : "Sign in to post"}
        displayHandle={authAccount?.callsign || pressPass.callsign || "guest"}
        draftSavedLabel={composerDraftLabel}
        newTitle={newTitle}
        newContent={newContent}
        setNewTitle={setNewTitle}
        setNewContent={setNewContent}
        newSourceUrl={newSourceUrl}
        setNewSourceUrl={setNewSourceUrl}
        newLocation={newLocation}
        setNewLocation={setNewLocation}
        newCoordinates={newCoordinates}
        setNewCoordinates={setNewCoordinates}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newEditionStyle={newEditionStyle}
        setNewEditionStyle={setNewEditionStyle}
        newSharingOption={newSharingOption}
        setNewSharingOption={setNewSharingOption}
        newIsAnonymous={newIsAnonymous}
        setNewIsAnonymous={setNewIsAnonymous}
        newDecoupleLocationPin={newDecoupleLocationPin}
        setNewDecoupleLocationPin={setNewDecoupleLocationPin}
        newImageUrl={newImageUrl}
        setNewImageUrl={setNewImageUrl}
        newImageCaption={newImageCaption}
        setNewImageCaption={setNewImageCaption}
        builderUseThemePhotoFilter={builderUseThemePhotoFilter}
        setBuilderUseThemePhotoFilter={setBuilderUseThemePhotoFilter}
        evidenceGallery={evidenceGallery}
        setEvidenceGallery={setEvidenceGallery}
        manualImageUrl={manualImageUrl}
        setManualImageUrl={setManualImageUrl}
        showUrlInput={showUrlInput}
        setShowUrlInput={setShowUrlInput}
        isUnfurling={isUnfurlingTitleUrl}
        unfurlStatus={unfurlTitleStatus}
        pressyoBusy={isPressyoEditorBusy}
        pressyoStatus={pressyoEditorStatus}
        pressyoLeads={pressyoLeads}
        pressyoCanUndo={Boolean(pressyoEditorUndo)}
        onPressyoUndo={handleUndoPressyoEdit}
        onPressyoWrite={(id) => handlePressyoEditorAction(id as any)}
        onPressyoFindLeads={() => handlePressyoEditorAction("find_leads")}
        onCreateImage={() => void handleCreateImageHandoff()}
        onPressyoCustom={(t) => handlePressyoEditorAction("custom_edit", undefined, t)}
        onPressyoAdvanced={(action, style) =>
          handlePressyoEditorAction(action, style as PressyoEdition | undefined)
        }
        onGuestSignInPrompt={() => setAuthModalMode("signin")}
        onCloseRequest={() => setShowPressieBuilderModal(false)}
        onSaveDraft={() => {
          void handleSaveDraft();
          setComposerDraftLabel("Draft saved");
          setTimeout(() => setComposerDraftLabel(null), 2500);
        }}
        onPost={() => void handleCreatePressie()}
        onPastePrepared={() => void handlePastePreparedContent()}
        onPinMyArea={handlePinMyVicinity}
        onUploadClick={() => imageFileInputRef.current?.click()}
        onAddImageUrl={handleAddImageUrl}
        onUnfurlFromText={(raw) => {
          const m = raw.match(/https?:\/\/[^\s]+/i);
          if (m) void handleUnfurlUrlFromTitle(m[0]);
        }}
        onUseVideoFrameAsCover={() => {
          const vid = extractYoutubeVideoId(newSourceUrl);
          if (!vid) return;
          const frameUrl = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
          setNewImageUrl(frameUrl);
          setEvidenceGallery((prev) => [
            { id: "yt-" + Date.now(), url: frameUrl, source: "url", caption: "Video frame", timestamp: "Linked" },
            ...prev.filter((p) => p.url !== frameUrl).slice(0, 7),
          ]);
        }}
        hasYoutubeSource={Boolean(extractYoutubeVideoId(newSourceUrl))}
        imageFileInputRef={imageFileInputRef}
        onImageFileChange={handleUploadImageFile}
        extractYoutubeId={extractYoutubeVideoId}
        inputClass={inputThemeClass}
        subCardClass={subCardThemeClass}
        subTextClass={subTextThemeClass}
      />

'''
    text = text[:m_start] + modal + text[m_end:]
    print("modal replaced")

# settings default tab
text = text.replace(
    'useState<"quicklinks" | "profile"',
    'useState<"profile" | "advanced"',
)
text = text.replace('setSettingsActiveTab("quicklinks");', 'setSettingsActiveTab("profile");')

# Remove quicklinks from tabs list in settings - simple remove quicklinks tab button and panel
text = text.replace('"quicklinks", ', '')
text = text.replace('{settingsActiveTab === "quicklinks" && (', '{false && settingsActiveTab === "quicklinks" && (')

# submitAuthSignOut - grep if exists
if "submitAuthSignOut" not in text:
    text = text.replace(
        "  const submitAuthForm = async (e: React.FormEvent) => {",
        """  const submitAuthSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setAuthAccount(null);
    setPressPass(DEFAULT_PRESS_PASS);
  };

  const submitAuthForm = async (e: React.FormEvent) => {""",
    )

# Hide edition/wire when wrong section
text = text.replace(
    '{activeTab === "edition" && (',
    '{mainSection === "home" && homeViewMode === "cards" && activeTab === "edition" && (',
    1,
)
text = text.replace(
    '{activeTab === "wire" && (',
    '{mainSection === "home" && homeViewMode === "list" && activeTab === "wire" && (',
    1,
)
text = text.replace(
    '{activeTab === "map" && (',
    '{mainSection === "explore" && exploreTab === "map" && activeTab === "map" && (',
    1,
)
text = text.replace(
    '{activeTab === "classifieds" && (',
    '{mainSection === "explore" && exploreTab === "notices" && activeTab === "classifieds" && (',
    1,
)
text = text.replace(
    '{activeTab === "discover" && (',
    '{mainSection === "explore" && exploreTab === "people" && activeTab === "discover" && (',
    1,
)

p.write_text(text)
print("done")
