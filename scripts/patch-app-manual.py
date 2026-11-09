#!/usr/bin/env python3
from pathlib import Path

p = Path("/workspace/src/App.tsx")
text = p.read_text()

nav_old = """          {/* Logo Header: Fp_ + favicon + FieldPress */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setActiveTab("edition")}
              className="flex items-center gap-1.5 font-mono text-base font-bold tracking-tight hover:opacity-80 transition cursor-pointer"
            >
              <span className="text-amber-500 font-black">Fp_</span>
              <img src="/pressie.svg" alt="" className="h-5 w-5 flex-shrink-0" />
              <span className={`font-bold tracking-wide ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                FieldPress
              </span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 font-mono text-xs overflow-x-auto py-1">
            {/* Primary content tabs move to the bottom rail on small screens */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("edition")}
"""

nav_new = """          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <button
              onClick={() => setActiveTab("edition")}
              className="flex items-center gap-1.5 font-mono text-base font-bold tracking-tight hover:opacity-80 transition cursor-pointer min-w-0"
            >
              <span className="text-amber-500 font-black">Fp_</span>
              <img src="/pressie.svg" alt="" className="h-5 w-5 flex-shrink-0" />
              <span className={`font-bold tracking-wide truncate ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>FieldPress</span>
            </button>
            <span className={`hidden lg:inline font-mono text-[10px] truncate ${subTextThemeClass}`}>{HOME_BUREAU.name}</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs overflow-x-auto py-1">
            <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("edition")}
"""

if nav_old in text:
    # partial replace - do full block via finding end marker
    start = text.find(nav_old.split("\n")[0])
    end_marker = "          </nav>\n\n          {/* Action Tools: Header Press Pass Trigger, Settings, Theme */}"
    end = text.find(end_marker, start)
    if start != -1 and end != -1:
        replacement = '''          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            <button
              onClick={() => setActiveTab("edition")}
              className="flex items-center gap-1.5 font-mono text-base font-bold tracking-tight hover:opacity-80 transition cursor-pointer min-w-0"
            >
              <span className="text-amber-500 font-black">Fp_</span>
              <img src="/pressie.svg" alt="" className="h-5 w-5 flex-shrink-0" />
              <span className={`font-bold tracking-wide truncate ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>FieldPress</span>
            </button>
            <span className={`hidden lg:inline font-mono text-[10px] truncate ${subTextThemeClass}`}>{HOME_BUREAU.name}</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs overflow-x-auto py-1">
            <div className="hidden sm:flex items-center gap-1">
              <button type="button" onClick={() => setActiveTab("edition")} className={`px-2.5 py-1.5 rounded transition cursor-pointer ${activeTab === "edition" ? (isDark ? "bg-zinc-800 text-amber-400 font-bold" : "bg-zinc-200 text-amber-700 font-bold") : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}>Dispatches</button>
              <button type="button" onClick={() => setActiveTab("wire")} className={`px-2.5 py-1.5 rounded transition cursor-pointer ${activeTab === "wire" ? (isDark ? "bg-zinc-800 text-amber-400 font-bold" : "bg-zinc-200 text-amber-700 font-bold") : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"}`}>Wire</button>
              <button type="button" onClick={() => openCreatePressie()} className={`px-2.5 py-1.5 rounded font-bold transition cursor-pointer ${currentAccent.btn}`}>Write</button>
              <div className="relative">
                <button type="button" onClick={() => setShowNavMoreMenu((v) => !v)} className={`px-2.5 py-1.5 rounded border transition cursor-pointer flex items-center gap-1 ${isDark ? "border-zinc-800 text-zinc-400 hover:bg-zinc-800" : "border-zinc-300 text-zinc-600 hover:bg-zinc-200"}`}>
                  <Menu className="h-3.5 w-3.5" /> More
                </button>
                {showNavMoreMenu && (
                  <div className={`absolute right-0 mt-1 w-44 rounded-lg border shadow-xl z-50 py-1 ${isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200"}`}>
                    {(["map", "classifieds", "discover"] as const).map((tab) => (
                      <button key={tab} type="button" onClick={() => { setActiveTab(tab); setShowNavMoreMenu(false); }} className={`w-full text-left px-3 py-2 hover:bg-amber-500/10 capitalize ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                        {tab}{tab === "discover" && suggestedCohorts.length > 0 ? ` (${suggestedCohorts.length})` : ""}
                      </button>
                    ))}
                    <button type="button" onClick={() => { setShowNavMoreMenu(false); setShowSettingsDrawer(true); }} className={`w-full text-left px-3 py-2 hover:bg-amber-500/10 ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Settings</button>
                    {authAccount?.canAccessAdminConsole && (
                      <button type="button" onClick={() => { setShowNavMoreMenu(false); setShowSettingsDrawer(true); setSettingsActiveTab("admin"); loadAdminUsers(); }} className="w-full text-left px-3 py-2 hover:bg-amber-500/10 text-amber-500 font-bold">Admin</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <a href={IMBRGR_URL} target="_blank" rel="noopener noreferrer" className={`flex-shrink-0 px-2.5 py-1.5 rounded border font-bold transition ${isDark ? "border-amber-500/40 text-amber-400 hover:bg-amber-500/10" : "border-amber-600/40 text-amber-700 hover:bg-amber-50"}`} title="Open imbrgr">Images</a>
            <button type="button" onClick={() => setShowPressyoModal(true)} className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-amber-500/50 bg-white" title="Pressy'O — Journalism assistant">
              <img src="/pressyo-icon.jpg" alt="Pressy'O" className="w-full h-full object-cover" />
            </button>
            <button type="button" onClick={() => setShowMessengerModal(true)} className={`w-8 h-8 flex-shrink-0 rounded-full border flex items-center justify-center ${isDark ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400" : "border-zinc-300 hover:bg-zinc-200 text-zinc-600"}`} title="Messages">
              <MessageCircle className="h-4 w-4" />
            </button>
          </nav>

          {/* Action Tools: Header Press Pass Trigger, Settings, Theme */}'''
        # find start from Logo Header
        start = text.find("          {/* Logo Header: Fp_ + favicon + FieldPress */}")
        text = text[:start] + replacement + text[end + len(end_marker):]
        print("nav replaced")

compose_block = '''  const [authAccount, setAuthAccount] = useState<{
    id: string; email: string; callsign: string; name: string; bureau: string; avatarUrl: string; coverPhotoUrl?: string; role: string; verifiedLocal?: boolean;
  } | null>(null);'''

compose_repl = '''  const [authAccount, setAuthAccount] = useState<{
    id: string; email: string; callsign: string; name: string; bureau: string; avatarUrl: string; coverPhotoUrl?: string; role: string; verifiedLocal?: boolean;
    canAccessAdminConsole?: boolean;
  } | null>(null);
  const [authSessionChecked, setAuthSessionChecked] = useState(false);
  const PENDING_COMPOSE_KEY = "fieldpress_pending_compose";'''

if compose_block in text:
    text = text.replace(compose_block, compose_repl, 1)

admin_anchor = "  }, []);\n\n  // --- Admin: role management panel (super_admin only) ---"
compose_helpers = '''  }, []);

  const storePendingCompose = (payload: { imageUrl: string | null; title: string }) => {
    try { sessionStorage.setItem(PENDING_COMPOSE_KEY, JSON.stringify(payload)); } catch {}
  };
  const consumePendingCompose = (): { imageUrl: string | null; title: string } | null => {
    try {
      const raw = sessionStorage.getItem(PENDING_COMPOSE_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(PENDING_COMPOSE_KEY);
      return JSON.parse(raw);
    } catch { return null; }
  };
  const applyComposePrefill = (imageUrl: string | null, title: string) => {
    if (title) setNewTitle(title);
    if (imageUrl) {
      setNewImageUrl(imageUrl);
      setNewImageCaption("Image from imbrgr");
      setEvidenceGallery([{ id: `imbrgr-${Date.now()}`, url: imageUrl, source: "url", caption: "Image from imbrgr", timestamp: "Linked" }]);
    }
    setShowPressieBuilderModal(true);
    setShowPressPassModal(false);
    setFormValidationError(null);
  };
  const openFreshComposeWithPrefill = (imageUrl: string | null, title: string) => {
    setEditingPublishedId(null);
    setEditingDraftId(null);
    setForkParentId(null);
    setNewCategory("Field Dispatch");
    setNewLocation(AUTHOR_DEFAULT_FILING.label);
    setNewContent("");
    setNewEditionStyle("tactical");
    setNewCoordinates(formatCoordinatesPair(AUTHOR_DEFAULT_FILING.coordinates));
    applyComposePrefill(imageUrl, title);
  };
  const resumeComposeIfPending = (signedIn: boolean) => {
    const pending = consumePendingCompose();
    if (!pending || (!pending.imageUrl && !pending.title)) return;
    if (!signedIn) {
      storePendingCompose(pending);
      setAuthModalMode("signin");
      setSavedSuccessToast("Sign in to finish your dispatch from imbrgr.");
      setTimeout(() => setSavedSuccessToast(""), 3500);
      return;
    }
    openFreshComposeWithPrefill(pending.imageUrl, pending.title);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("compose") !== "1") return;
    const imageUrl = parseComposeImageParam(params.get("image"));
    const title = parseComposeTitleParam(params.get("title"));
    params.delete("compose");
    params.delete("image");
    params.delete("title");
    const rest = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
    if (imageUrl || title) storePendingCompose({ imageUrl, title });
  }, []);

  useEffect(() => {
    if (!authSessionChecked) return;
    if (!authAccount?.canAccessAdminConsole && (settingsActiveTab === "admin" || settingsActiveTab === "moderation")) {
      setSettingsActiveTab("quicklinks");
    }
    if (!authAccount) setAdminUsers([]);
    resumeComposeIfPending(Boolean(authAccount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSessionChecked, authAccount?.id, authAccount?.canAccessAdminConsole]);

  // --- Admin: role management panel (super_admin only) ---'''

if admin_anchor in text and "storePendingCompose" not in text:
    text = text.replace(admin_anchor, compose_helpers, 1)

text = text.replace(
    "      .catch(() => {});\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);\n\n  // Real DM threads",
    "      .catch(() => {})\n      .finally(() => setAuthSessionChecked(true));\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);\n\n  // Real DM threads",
    1,
)

text = text.replace(
    "          setPressPass(DEFAULT_PRESS_PASS);\n          try {\n            localStorage.removeItem(\"fieldpress_press_pass\");\n          } catch {}\n        }\n      })\n      .catch(() => {})\n      .finally(() => setAuthSessionChecked(true));",
    "          setAuthAccount(null);\n          setPressPass(DEFAULT_PRESS_PASS);\n          try {\n            localStorage.removeItem(\"fieldpress_press_pass\");\n          } catch {}\n        }\n      })\n      .catch(() => {})\n      .finally(() => setAuthSessionChecked(true));",
    1,
)

text = text.replace(
    "      setSavedSuccessToast(isSignup ? \"Account created. You're signed in on this device.\" : \"Signed in.\");\n      setTimeout(() => setSavedSuccessToast(\"\"), 2500);\n    } catch {\n      setAuthError(\"Network error. Please try again.\");\n    }\n    setAuthLoading(false);\n  };\n\n  const submitForgotPassword",
    "      setAuthSessionChecked(true);\n      setSavedSuccessToast(isSignup ? \"Account created. You're signed in on this device.\" : \"Signed in.\");\n      setTimeout(() => setSavedSuccessToast(\"\"), 2500);\n      resumeComposeIfPending(true);\n    } catch {\n      setAuthError(\"Network error. Please try again.\");\n    }\n    setAuthLoading(false);\n  };\n\n  const submitForgotPassword",
    1,
)

text = text.replace(
    "  const loadAdminUsers = async () => {\n    setAdminUsersLoading(true);",
    "  const loadAdminUsers = async () => {\n    if (!authAccount?.canAccessAdminConsole) return;\n    setAdminUsersLoading(true);",
    1,
)
text = text.replace(
    "  const loadModerationData = async () => {\n    setModLoading(true);",
    "  const loadModerationData = async () => {\n    if (!authAccount?.canAccessAdminConsole) return;\n    setModLoading(true);",
    1,
)

text = text.replace(
    'source: "ai" | "upload"; caption?: string; timestamp: string }>',
    'source: "ai" | "upload" | "url"; caption?: string; timestamp: string }>',
    1,
)

# beat map types
text = text.replace(
    "isDispatchAnonOrDecoupled={isDispatchAnonOrDecoupled}\n                  onSelectDispatch={setSelectedStory}",
    "isDispatchAnonOrDecoupled={(d) => isDispatchAnonOrDecoupled(d as Dispatch)}\n                  onSelectDispatch={(d) => {\n                    const full = dispatches.find((x) => x.id === d.id);\n                    if (full) setSelectedStory(full);\n                  }}",
    1,
)

# media tray imbrgr
old_tray = """                    <button
                      type="button"
                      onClick={() => setBuilderUseThemePhotoFilter(!builderUseThemePhotoFilter)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition cursor-pointer ${
                        builderUseThemePhotoFilter
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                          : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                      title="Toggle between Edition Theme Photo Filter and Original Color"
                    >
                      {builderUseThemePhotoFilter ? `${getEditionThemeConfig(newEditionStyle).filterBadge}: ON` : "📸 Original Color"}
                    </button>"""

new_tray = """                    <a
                      href={buildImbrgrStudioUrl(newTitle || newContent.slice(0, 280))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-bold border border-amber-500/40 flex items-center gap-1"
                    >
                      Open imbrgr to make a photo <ExternalLink className="h-3 w-3" />
                    </a>"""

if old_tray in text:
    text = text.replace(old_tray, new_tray, 1)
text = text.replace("<span>Visual Evidence & Media Tray</span>", "<span>Photo (optional)</span>", 1)

p.write_text(text)
print("manual patches done")
