import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import {
  BookOpen, Tag,
  LogIn,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Sun,
  Shield,
  Radio,
  Target,
  ExternalLink,
  Tv,
  Palette,
  QrCode,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DeskConnections } from "@/components/desk-connections";
import { fetchMe, signOut, type SessionUser } from "@/lib/session";
import {
  applyDisplaySettings,
  crtEnabled,
  glowEnabled,
  setCrtEnabled,
  setGlowEnabled,
} from "@/lib/desk-settings";
import { useSkin, SKINS, SkinColor } from "@/context/SkinContext";

const THEMES = [
  { id: "dark", label: "Dark", hint: "Neon CRT desk", Icon: Moon },
  { id: "light", label: "Ink & Paper", hint: "Newsprint edition", Icon: Sun },
  { id: "system", label: "System", hint: "Follow device", Icon: Monitor },
] as const;

export function SettingsMenu() {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
  const { currentSkin, saveSkinPreference, skinConfig } = useSkin();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [crt, setCrt] = useState(true);
  const [glow, setGlow] = useState(true);

  useEffect(() => {
    applyDisplaySettings();
    setCrt(crtEnabled());
    setGlow(glowEnabled());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchMe().then(setUser);
  }, [open]);

  function go(path: string) {
    setOpen(false);
    navigate(path);
  }

  const userHandle = user?.email ? user.email.split("@")[0] : "ras.ip";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-border bg-card/90 backdrop-blur-sm shadow-sm"
          aria-label="Open newsroom drawer"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md font-mono text-xs bg-zinc-950 border-zinc-800 p-6"
      >
        <SheetHeader className="text-left pb-4 border-b border-zinc-800">
          <SheetTitle className="tracking-[0.2em] text-white text-sm flex items-center space-x-2">
            <span>NEWSROOM DESK DRAWER</span>
          </SheetTitle>
          <SheetDescription className="text-zinc-400 text-xs mt-1">
            Tactical navigation, reporter credentials, console themes, and governance.
          </SheetDescription>
        </SheetHeader>

        {/* 1. REPORTER IDENTITY & PRESS PASS HERO */}
        <section className="py-4 border-b border-zinc-800/80">
          {user ? (
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
              <div className="flex items-center space-x-3">
                <div
                  className="h-10 w-10 rounded-lg border-2 flex items-center justify-center font-bold text-xs"
                  style={{ borderColor: skinConfig.hex, color: skinConfig.hex }}
                >
                  @{userHandle.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-white text-sm truncate">{user.displayName || userHandle}</span>
                    <span className="px-1 py-0.2 bg-emerald-950 border border-emerald-800 text-emerald-400 text-[9px] font-bold rounded">
                      Scout
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">@{userHandle}</p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => go(`/pass/${userHandle}`)}
                  className="flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold text-[11px] hover:bg-emerald-900"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Press Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => go("/profile")}
                  className="flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-[11px] hover:bg-zinc-750"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>My Portfolio ↗</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2 text-center">
              <p className="text-xs text-zinc-400">Sign in to claim bylines, publish verified dispatches, and access the live wire.</p>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs" onClick={() => go("/login?next=%2Fapp")}>
                <LogIn className="h-4 w-4 mr-1.5" />
                SIGN IN TO DESK
              </Button>
            </div>
          )}
        </section>

        {/* 2. FIELD & DESK UTILITIES */}
        <section className="py-4 border-b border-zinc-800/80 space-y-2">
          <h3 className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold">FIELD CHANNELS & DESK</h3>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => go("/classifieds")}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted text-foreground"
            >
              <div className="flex items-center space-x-2.5">
                <Tag className="h-4 w-4 text-amber-500" />
                <span>The Classifieds & Peer Market</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Gigs & Gear ↗</span>
            </button>
            <button
              type="button"
              onClick={() => go("/pass")}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white"
            >
              <div className="flex items-center space-x-2.5">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Digital Press Pass (/pass)</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Offline-Ready ↗</span>
            </button>
            <button
              type="button"
              onClick={() => go("/")}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white"
            >
              <div className="flex items-center space-x-2.5">
                <Radio className="h-4 w-4 text-cyan-400" />
                <span>Fieldy Wire & Messenger</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Live Chatter ↗</span>
            </button>
            <button
              type="button"
              onClick={() => go("/")}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white"
            >
              <div className="flex items-center space-x-2.5">
                <Target className="h-4 w-4 text-amber-400" />
                <span>Beat Bounties Board</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Sponsorships ↗</span>
            </button>
          </div>
        </section>

        {/* 3. TACTICAL CONSOLE SKINS */}
        <section className="py-4 border-b border-zinc-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold flex items-center space-x-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span>CONSOLE THEME & ACCENT</span>
            </h3>
            <span className="text-[10px] font-bold" style={{ color: skinConfig.hex }}>
              {skinConfig.name}
            </span>
          </div>

          {/* Tactical Skin Palette */}
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(SKINS) as SkinColor[]).map((key) => {
              const skin = SKINS[key];
              const isSelected = currentSkin === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => saveSkinPreference(key)}
                  className={`p-2 rounded border text-left flex items-center space-x-2 transition ${
                    isSelected
                      ? "bg-zinc-900 border-zinc-300"
                      : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: skin.hex }} />
                  <span className="text-[10px] font-bold text-zinc-200 truncate">{skin.name.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Base Day/Night & CRT Effects */}
          {ready && (
            <div className="pt-2 space-y-1.5">
              <div className="grid grid-cols-3 gap-1">
                {THEMES.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    className={`flex items-center justify-center space-x-1 py-1.5 border rounded text-[10px] ${
                      theme === id ? "border-primary bg-primary/10 text-primary" : "border-border text-zinc-400"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-zinc-900/30 border border-zinc-800/60">
                <span className="flex items-center space-x-1.5 text-zinc-400 text-[11px]">
                  <Tv className="h-3.5 w-3.5" />
                  <span>CRT Scanlines</span>
                </span>
                <Switch
                  checked={crt}
                  onCheckedChange={(on) => {
                    setCrt(on);
                    setCrtEnabled(on);
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* 4. GOVERNANCE & HELP */}
        <section className="py-4 space-y-1">
          <h3 className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold mb-2">GOVERNANCE & ADMIN</h3>
          <button
            type="button"
            onClick={() => go("/guide")}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900 text-zinc-300 hover:text-white"
          >
            <div className="flex items-center space-x-2">
              <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
              <span>Field Reporter Manual</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">/guide ↗</span>
          </button>

          {user && (
            <div className="pt-3">
              <Button
                variant="ghost"
                className="w-full text-zinc-500 hover:text-red-400 justify-start px-2 text-xs"
                onClick={async () => {
                  await signOut();
                  setUser(null);
                  setOpen(false);
                  navigate("/app");
                }}
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Sign Out of Newsroom Desk
              </Button>
            </div>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}

export default SettingsMenu;
