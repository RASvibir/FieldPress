import React from "react";
import { Send, ShieldCheck, Sliders, Sun, Moon } from "lucide-react";
import { PressieMark } from "../common/PressieMark";
import { PressPassData, ActiveTab } from "../../types/dispatch";
import { AccentColorClasses } from "../../theme/tokens";

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openCreatePressie: () => void;
  openPressPassEditor: () => void;
  openSettingsDrawer: () => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  pressPass: PressPassData;
  currentAccent: AccentColorClasses;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  openCreatePressie,
  openPressPassEditor,
  openSettingsDrawer,
  theme,
  setTheme,
  pressPass,
  currentAccent
}) => {
  const isDark = theme === "dark";

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 sm:px-6 py-3 transition ${
      isDark ? "bg-zinc-950/90 border-zinc-800/80" : "bg-white/90 border-zinc-200"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Logo Header: FP_* FieldPress */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setActiveTab("edition")}
            className="flex items-center gap-1.5 font-mono text-base font-bold tracking-tight hover:opacity-80 transition cursor-pointer"
          >
            <span className="text-amber-500 font-black">FP_</span>
            <PressieMark className="h-5 w-5 text-emerald-500" />
            <span className={`font-bold tracking-wide ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
              FieldPress
            </span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 font-mono text-xs overflow-x-auto py-1">
          {([
            { id: "edition", label: "Daily Edition" },
            { id: "wire", label: "Live Wire" },
            { id: "map", label: "Map Radar" },
            { id: "classifieds", label: "Classifieds" },
            { id: "desk", label: "Editorial Desk" }
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded transition-all cursor-pointer flex-shrink-0 ${
                  isActive
                    ? isDark
                      ? `bg-zinc-800 ${currentAccent.text} font-bold border border-zinc-700 shadow-xs`
                      : `bg-zinc-200 ${currentAccent.text} font-bold border border-zinc-300 shadow-xs`
                    : isDark
                      ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* DEDICATED UNIFIED BUTTON: CREATE PRESSIE */}
          <button
            onClick={openCreatePressie}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition font-bold shadow-xs hover:border-emerald-400 flex-shrink-0 cursor-pointer ml-1"
            title="Open Pressie Builder (New Field Dispatch / Press Roll)"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Create Pressie</span>
          </button>
        </nav>

        {/* Action Tools: Header Press Pass Trigger, Settings, Theme */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={openPressPassEditor}
            className={`flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono transition ${currentAccent.badge} hover:brightness-110 cursor-pointer`}
            title="Open Press Pass Credential & ID Studio"
          >
            {pressPass.avatarUrl ? (
              <img
                src={pressPass.avatarUrl}
                alt={pressPass.callsign}
                className="w-5 h-5 rounded-full object-cover border border-amber-400/60"
              />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline font-bold">PRESS PASS:</span>
            <span>{pressPass.callsign}</span>
          </button>

          <button
            onClick={openSettingsDrawer}
            className={`p-1.5 rounded border transition cursor-pointer ${
              isDark
                ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                : "border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
            }`}
            title="Workstation Settings"
          >
            <Sliders className="h-4 w-4" />
          </button>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`p-1.5 rounded border transition cursor-pointer ${
              isDark
                ? "border-zinc-800 hover:bg-zinc-800 text-amber-400"
                : "border-zinc-300 hover:bg-zinc-200 text-amber-600"
            }`}
            title={`Switch to ${isDark ? "Daylight (Light)" : "Dark"} Mode`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
