import React, { useState } from "react";
import { Sliders, X, ShieldCheck } from "lucide-react";
import { Dispatch, PressPassData } from "../../types/dispatch";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pressPass: PressPassData;
  openPressPassEditor: () => void;
  openCreatePressie: (disp?: Dispatch) => void;
  setSelectedStory: (disp: Dispatch) => void;
  pressRoll: Dispatch[];
  deleteDraft: (id: string) => void;
  bookmarks: string[];
  toggleBookmark: (id: string) => void;
  dispatches: Dispatch[];
  setDispatches: React.Dispatch<React.SetStateAction<Dispatch[]>>;
  setPressRoll: React.Dispatch<React.SetStateAction<Dispatch[]>>;
  setBookmarks: React.Dispatch<React.SetStateAction<string[]>>;
  exportUserArchives: () => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  watermarkVisible: boolean;
  setWatermarkVisible: (v: boolean) => void;
  setSavedSuccessToast: (msg: string) => void;
  initialDispatches: Dispatch[];
  isDark: boolean;
  inputThemeClass: string;
  subCardThemeClass: string;
  borderThemeClass: string;
  subTextThemeClass: string;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  pressPass,
  openPressPassEditor,
  openCreatePressie,
  setSelectedStory,
  pressRoll,
  deleteDraft,
  bookmarks,
  toggleBookmark,
  dispatches,
  setDispatches,
  setPressRoll,
  setBookmarks,
  exportUserArchives,
  theme,
  setTheme,
  watermarkVisible,
  setWatermarkVisible,
  setSavedSuccessToast,
  initialDispatches,
  isDark,
  inputThemeClass,
  subCardThemeClass,
  borderThemeClass,
  subTextThemeClass
}) => {
  const [settingsActiveTab, setSettingsActiveTab] = useState<"profile" | "drafts" | "bookmarks" | "archives" | "appearance" | "system">("profile");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState("30s");
  const [defaultBeat, setDefaultBeat] = useState("Danville, IL • Vermilion Line");
  const [offlineCacheEnabled, setOfflineCacheEnabled] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-md h-full flex flex-col border-l shadow-2xl transition ${
        isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
      }`}>
        
        <div className={`p-4 border-b flex items-center justify-between font-mono ${borderThemeClass}`}>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-sm">Workstation Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-zinc-800 font-mono text-xs overflow-x-auto">
          {(["profile", "drafts", "bookmarks", "archives", "appearance", "system"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSettingsActiveTab(tab)}
              className={`px-3 py-2 transition capitalize flex-shrink-0 cursor-pointer ${
                settingsActiveTab === tab
                  ? "border-b-2 border-amber-500 text-amber-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
          {settingsActiveTab === "profile" && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${subCardThemeClass}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-500 bg-zinc-800 flex items-center justify-center">
                    {pressPass.avatarUrl ? (
                      <img src={pressPass.avatarUrl} alt={pressPass.callsign} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-amber-400">{pressPass.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{pressPass.name}</h4>
                    <p className="text-amber-400">@{pressPass.callsign}</p>
                    <p className={`text-[11px] ${subTextThemeClass}`}>{pressPass.role}</p>
                  </div>
                </div>
                <p className={`mt-3 text-xs font-sans leading-relaxed ${subTextThemeClass}`}>{pressPass.bio}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openPressPassEditor();
                }}
                className="w-full py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Edit Press Pass Credential & Photo</span>
              </button>
            </div>
          )}

          {settingsActiveTab === "drafts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold">Staged Press Roll ({pressRoll.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openCreatePressie();
                  }}
                  className="text-amber-500 hover:underline font-bold cursor-pointer transition hover:text-amber-400"
                >
                  + Compose New
                </button>
              </div>

              {pressRoll.length === 0 ? (
                <p className={`text-xs ${subTextThemeClass}`}>No drafts currently staged in queue.</p>
              ) : (
                pressRoll.map((p) => (
                  <div key={p.id} className={`p-3 rounded border space-y-2 ${subCardThemeClass}`}>
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-bold text-xs">{p.title}</h5>
                      <span className="text-[10px] text-zinc-500">{p.location}</span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${subTextThemeClass}`}>{p.content}</p>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          openCreatePressie(p);
                        }}
                        className="text-amber-400 hover:underline font-bold cursor-pointer transition hover:text-amber-300"
                      >
                        Edit in Builder →
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDraft(p.id)}
                        className="text-rose-400 hover:underline text-[10px] cursor-pointer transition hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {settingsActiveTab === "bookmarks" && (
            <div className="space-y-3">
              <span className="font-bold">Saved Articles ({bookmarks.length})</span>
              {bookmarks.length === 0 ? (
                <p className={`text-xs ${subTextThemeClass}`}>No articles bookmarked yet.</p>
              ) : (
                dispatches
                  .filter((d) => bookmarks.includes(d.id))
                  .map((d) => (
                    <div key={d.id} className={`p-3 rounded border space-y-1.5 ${subCardThemeClass}`}>
                      <h5
                        onClick={() => {
                          onClose();
                          setSelectedStory(d);
                        }}
                        className="font-bold text-xs hover:text-amber-400 cursor-pointer"
                      >
                        {d.title}
                      </h5>
                      <p className={`text-[10px] ${subTextThemeClass}`}>{d.location} • By {d.author}</p>
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            setSelectedStory(d);
                          }}
                          className="text-amber-400 hover:underline text-[10px] cursor-pointer transition hover:text-amber-300"
                        >
                          Read Story →
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBookmark(d.id)}
                          className="text-rose-400 hover:underline text-[10px] cursor-pointer transition hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {settingsActiveTab === "archives" && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border space-y-2 ${subCardThemeClass}`}>
                <h5 className="font-bold">Export Reporter Dossier</h5>
                <p className={`text-xs ${subTextThemeClass}`}>
                  Download all verified dispatches, credentials, and staged drafts formatted as offline JSON backup.
                </p>
                <button
                  type="button"
                  onClick={exportUserArchives}
                  className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer shadow-xs"
                >
                  Download JSON Archive
                </button>
              </div>

              <div className={`p-4 rounded-lg border space-y-2 border-rose-900/40 bg-rose-950/10`}>
                <h5 className="font-bold text-rose-400">Reset Local Store</h5>
                <p className={`text-xs ${subTextThemeClass}`}>
                  Restore default broadsheet dispatches and purge local browser cache.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    setDispatches(initialDispatches);
                    setPressRoll([]);
                    setBookmarks(["d-1"]);
                    setSavedSuccessToast("Local storage reset to default wire.");
                    setTimeout(() => setSavedSuccessToast(""), 2500);
                  }}
                  className="px-3 py-1.5 rounded border border-rose-800 text-rose-400 hover:bg-rose-900/40 transition cursor-pointer shadow-xs"
                >
                  Purge & Reset
                </button>
              </div>
            </div>
          )}

          {settingsActiveTab === "appearance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded border border-zinc-800">
                <span>Daylight / Dark Theme</span>
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer shadow-xs"
                >
                  Toggle ({theme === "light" ? "Daylight" : "Dark"})
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded border border-zinc-800">
                <span>Background Watermark</span>
                <button
                  type="button"
                  onClick={() => setWatermarkVisible(!watermarkVisible)}
                  className={`px-3 py-1 rounded transition cursor-pointer ${
                    watermarkVisible
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500 font-bold"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {watermarkVisible ? "Visible" : "Hidden"}
                </button>
              </div>
            </div>
          )}

          {settingsActiveTab === "system" && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold mb-1">Auto-refresh Frequency</label>
                <select
                  value={autoRefreshInterval}
                  onChange={(e) => setAutoRefreshInterval(e.target.value)}
                  className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
                >
                  <option value="15s">15 seconds (Tactical)</option>
                  <option value="30s">30 seconds (Standard)</option>
                  <option value="60s">1 minute</option>
                  <option value="manual">Manual Sync Only</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Primary Beat Node</label>
                <input
                  type="text"
                  value={defaultBeat}
                  onChange={(e) => setDefaultBeat(e.target.value)}
                  className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded border border-zinc-800">
                <span>Offline PWA Telemetry Cache</span>
                <button
                  type="button"
                  onClick={() => setOfflineCacheEnabled(!offlineCacheEnabled)}
                  className={`px-3 py-1 rounded transition cursor-pointer ${
                    offlineCacheEnabled ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {offlineCacheEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 border-t font-mono text-xs flex justify-between items-center ${borderThemeClass} ${
          isDark ? "bg-zinc-950/80" : "bg-zinc-50"
        }`}>
          <span className={subTextThemeClass}>FieldPress v2.5.0-master</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
