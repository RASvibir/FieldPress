import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import {
  Menu, X, Shield, User, Radio, BookOpen, Tag, Moon, Sun, 
  Monitor, Tv, LogOut, LogIn, Mail, ChevronRight, Palette, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchMe, signOut, type SessionUser } from "@/lib/session";
import {
  applyDisplaySettings,
  crtEnabled,
  glowEnabled,
  setCrtEnabled,
  setGlowEnabled,
} from "@/lib/desk-settings";
import { useSkin, SKINS, SkinColor } from "@/context/SkinContext";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const { currentSkin, skinConfig, saveSkinPreference } = useSkin();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [crt, setCrt] = useState(crtEnabled());
  const [glow, setGlow] = useState(glowEnabled());

  useEffect(() => {
    fetchMe().then(setUser);
  }, [open]);

  const isSuperAdmin = 
    user?.email === "vibir@fieldpress.studio" || 
    user?.role === "super_admin" ||
    (typeof window !== "undefined" && localStorage.getItem("fieldpress_admin_auth") === "true");

  const handleNav = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleToggleCrt = (val: boolean) => {
    setCrt(val);
    setCrtEnabled(val);
    applyDisplaySettings();
  };

  const handleToggleGlow = (val: boolean) => {
    setGlow(val);
    setGlowEnabled(val);
    applyDisplaySettings();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 font-mono text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Menu className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline font-bold">MENU</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-sm bg-zinc-950 border-l border-zinc-800 text-zinc-200 p-0 flex flex-col font-mono text-xs shadow-2xl"
      >
        <SheetHeader className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/40 text-left">
          <SheetTitle className="text-xs uppercase font-bold tracking-widest text-zinc-400 flex items-center justify-between">
            <span>Newsroom Desk Settings</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          
          {/* User Profile Card Header */}
          <div 
            onClick={() => handleNav("/profile")}
            className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-950/40 border border-amber-500/60 flex items-center justify-center text-amber-300 font-bold text-base overflow-hidden">
                <User className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {user?.displayName || "Victor Birkle"}
                </div>
                <div className="text-[11px] text-zinc-500">
                  @{user?.email ? user.email.split("@")[0] : "ras.ip"}
                </div>
                <div className="mt-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isSuperAdmin ? "bg-red-950 text-red-300 border border-red-800" : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  }`}>
                    {isSuperAdmin ? "⚡ SUPER ADMIN" : "🛡️ FRONTLINE SCOUT"}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Core Navigation Section */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-1 mb-2">
              Newsroom Navigation
            </div>
            
            <button
              onClick={() => handleNav("/")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-sm">📰</span>
                <span>Field Dispatch Feed</span>
              </span>
              <span className="text-[10px] text-zinc-600">LIVE</span>
            </button>

            <button
              onClick={() => handleNav("/profile")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-sm">🪪</span>
                <span>Press Pass Profile</span>
              </span>
              <span className="text-[10px] text-amber-500 font-bold">CUSTOMIZE</span>
            </button>

            <button
              onClick={() => handleNav("/classifieds")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-sm">🎯</span>
                <span>Desk Bounties & Classifieds</span>
              </span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => handleNav("/admin")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-950/20 border border-red-900/50 text-red-300 hover:bg-red-950/40 transition-colors text-left mt-2"
              >
                <span className="flex items-center gap-2.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-red-400" />
                  <span>Bureau Oversight Console</span>
                </span>
                <span className="text-[9px] bg-red-900/60 text-red-200 px-1 py-0.5 rounded font-bold">/ADMIN</span>
              </button>
            )}
          </div>

          {/* Tactical Display & Theme Section */}
          <div className="space-y-3 pt-4 border-t border-zinc-900">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-1">
              Display & Aesthetics
            </div>

            {/* Light / Dark Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-zinc-900/70 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setTheme("dark")}
                className={`py-1.5 flex items-center justify-center gap-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  theme === "dark" ? "bg-zinc-800 text-zinc-100 shadow" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>Dark CRT</span>
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`py-1.5 flex items-center justify-center gap-1.5 rounded-lg font-bold text-[11px] transition-all ${
                  theme === "light" ? "bg-zinc-100 text-zinc-900 shadow" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Solar E-Ink</span>
              </button>
            </div>

            {/* CRT Toggles */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-zinc-400 text-[11px] flex items-center gap-2">
                  <Tv className="w-3.5 h-3.5 text-zinc-500" />
                  <span>CRT Scanlines</span>
                </span>
                <Switch checked={crt} onCheckedChange={handleToggleCrt} />
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-zinc-400 text-[11px] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Phosphor Glow</span>
                </span>
                <Switch checked={glow} onCheckedChange={handleToggleGlow} />
              </div>
            </div>

            {/* Console Skin Palette */}
            <div className="pt-2">
              <div className="text-[10px] text-zinc-500 uppercase px-1 mb-2">Tactical Skin Glow</div>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(SKINS) as SkinColor[]).map(skinKey => {
                  const s = SKINS[skinKey];
                  const isCur = currentSkin === skinKey;
                  return (
                    <button
                      key={skinKey}
                      onClick={() => saveSkinPreference(skinKey)}
                      className={`px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all ${
                        isCur ? "border-amber-400 bg-zinc-900 text-zinc-100" : "border-zinc-800/80 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.hex }} />
                      <span className="text-[10px] truncate font-bold">{s.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Support & Bureau Desk */}
          <div className="space-y-1 pt-4 border-t border-zinc-900">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-1 mb-2">
              Bureau Desk & Guides
            </div>
            
            <button
              onClick={() => handleNav("/guide")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors text-left"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span>Field Guide & Manual</span>
              </span>
            </button>

            <a
              href="mailto:support@fieldpress.studio"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors text-left block"
            >
              <span className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Dispatch Support</span>
              </span>
              <span className="text-[10px] text-zinc-600">support@fieldpress.studio</span>
            </a>
          </div>

        </div>

        {/* Footer Session Action */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
          {user ? (
            <button
              onClick={async () => {
                await signOut();
                setUser(null);
                handleNav("/login");
              }}
              className="w-full py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-red-300 hover:border-red-900/50 hover:bg-red-950/20 font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Desk</span>
            </button>
          ) : (
            <button
              onClick={() => handleNav("/login")}
              className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Reporter Sign In</span>
            </button>
          )}
        </div>

      </SheetContent>
    </Sheet>
  );
}
