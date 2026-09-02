import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "next-themes";
import { BookOpen, Download, LogIn, LogOut, Menu, Monitor, Moon, Sun } from "lucide-react";
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

const THEMES = [
  { id: "dark", label: "Dark", hint: "Neon CRT desk", Icon: Moon },
  { id: "light", label: "Light", hint: "Newsprint edition", Icon: Sun },
  { id: "system", label: "System", hint: "Follow the device", Icon: Monitor },
] as const;

export function SettingsMenu() {
  const [, navigate] = useLocation();
  const { theme, setTheme } = useTheme();
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

  const ageLabel =
    user?.ageBand === "kids" ? "Under 13 · G / Kids" : user?.ageBand === "adult" ? "Over 18" : user ? "Teenager · PG-13" : "Unsigned visitors see PG-13";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="border-border bg-card/90 backdrop-blur-sm"
          aria-label="Open settings"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="text-left">
          <SheetTitle className="tracking-[0.18em]">SETTINGS</SheetTitle>
          <SheetDescription>
            Theme, account, and outlet bookmarks. Share still opens in the other app unless you connect a push later.
          </SheetDescription>
        </SheetHeader>

        <section className="mt-6 space-y-3">
          <h3 className="text-xs tracking-widest text-muted-foreground">APPEARANCE</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dark is the neon desk. Light is paper and ink. System follows this device.
          </p>
          {ready && (
            <div className="grid gap-2">
              {THEMES.map(({ id, label, hint, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme(id)}
                  className={`flex items-center gap-3 border px-3 py-2 text-left ${theme === id ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm tracking-widest">{label}</span>
                    <span className="block text-xs text-muted-foreground">{hint}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="text-xs tracking-widest text-muted-foreground">DISPLAY</h3>
          <label className="flex items-center justify-between gap-3 border border-border px-3 py-2">
            <span>
              <span className="block text-sm">CRT scanlines</span>
              <span className="block text-xs text-muted-foreground">Dark mode only</span>
            </span>
            <Switch
              checked={crt}
              onCheckedChange={(on) => {
                setCrt(on);
                setCrtEnabled(on);
              }}
            />
          </label>
          <label className="flex items-center justify-between gap-3 border border-border px-3 py-2">
            <span>
              <span className="block text-sm">Neon glow</span>
              <span className="block text-xs text-muted-foreground">Pulse on titles in dark mode</span>
            </span>
            <Switch
              checked={glow}
              onCheckedChange={(on) => {
                setGlow(on);
                setGlowEnabled(on);
              }}
            />
          </label>
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="text-xs tracking-widest text-muted-foreground">ACCOUNT</h3>
          {user ? (
            <>
              <p className="text-sm">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Desk rating: {ageLabel}. Chosen at signup. No birthday is stored.</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  await signOut();
                  setUser(null);
                  setOpen(false);
                  navigate("/app");
                }}
              >
                <LogOut className="h-4 w-4" />
                SIGN OUT
              </Button>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">{ageLabel}. Sign in to capture photos, keep private files, and set a desk rating.</p>
              <Button className="w-full" onClick={() => go("/login?next=%2Fapp")}>
                <LogIn className="h-4 w-4" />
                SIGN IN
              </Button>
            </>
          )}
        </section>

        {user && (
          <section className="mt-6 space-y-3">
            <h3 className="text-xs tracking-widest text-muted-foreground">OUTLETS</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Profile and RSS bookmarks so you can open the right desk. They do not log you in.
            </p>
            <DeskConnections />
          </section>
        )}

        <section className="mt-6 mb-8 space-y-2">
          <h3 className="text-xs tracking-widest text-muted-foreground">HELP</h3>
          <Button variant="ghost" className="w-full justify-start" onClick={() => go("/guide")}>
            <BookOpen className="h-4 w-4" />
            GUIDE
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => go("/")}>
            <Download className="h-4 w-4" />
            GET APP
          </Button>
        </section>
      </SheetContent>
    </Sheet>
  );
}
