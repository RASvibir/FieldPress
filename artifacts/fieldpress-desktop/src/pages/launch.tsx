import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Download, Share, Check, Copy, Smartphone, Monitor, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStandaloneApp, useInstallApp } from "@/hooks/use-install";

export default function LaunchPage() {
  const [, navigate] = useLocation();
  const { device, browser, installed, canNativeInstall, busy, install, safari } = useInstallApp();
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const qrSrc = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=39FF14&bgcolor=000000&margin=8&data=${encodeURIComponent(origin)}`,
    [origin],
  );
  const safariMac = safari && device === "desktop";
  const installLabel =
    busy ? "INSTALLING…" : device === "ios" ? "ADD TO HOME SCREEN" : safariMac ? "ADD TO DOCK" : "INSTALL ON THIS DEVICE";

  useEffect(() => {
    if (isStandaloneApp()) navigate("/app");
  }, [navigate]);

  async function handleInstall() {
    const ok = await install();
    if (ok) {
      navigate("/app");
      return;
    }
    setShowHelp(true);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="min-h-screen bg-background text-neon flex flex-col">
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <img
              src="/icon-192.png"
              alt="FieldPress"
              className="w-24 h-24 mx-auto rounded-[22%] border border-neon/40 shadow-[0_0_28px_rgba(57,255,20,0.35)]"
            />
            <h1 className="text-5xl sm:text-6xl tracking-[0.18em] text-glow-pulse">FIELDPRESS</h1>
            <p className="text-muted-foreground text-lg">Pocket newsroom. One tap to open.</p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full min-h-14 text-xl tracking-[0.2em]"
              onClick={() => navigate("/app")}
            >
              OPEN APP
              <ArrowRight className="w-5 h-5" />
            </Button>

            {!installed && (
              <Button
                variant="outline"
                className="w-full min-h-14 text-lg tracking-[0.14em] border-neon text-neon"
                onClick={handleInstall}
                disabled={busy}
              >
                <Download className="w-5 h-5" />
                {installLabel}
              </Button>
            )}
            <Button
              variant="ghost"
              className="w-full min-h-11 text-base tracking-[0.14em] text-muted-foreground"
              onClick={() => navigate("/guide")}
            >
              <BookOpen className="w-4 h-4" />
              USER GUIDE
            </Button>
          </div>

          {showHelp && device === "ios" && (
            <ol className="space-y-3 border border-neon/25 bg-card p-4 text-left text-base text-foreground/90">
              {!safari && (
                <li className="flex gap-3">
                  <span className="text-neon-yellow">!</span>
                  <span>
                    iPhone can only install from <strong>Safari</strong>. Open this page there, then come back to this button.
                  </span>
                </li>
              )}
              <li className="flex gap-3">
                <span className="text-neon-yellow">1</span>
                <span>
                  Tap <Share className="inline w-4 h-4 text-neon" /> <strong>Share</strong> at the bottom of Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-neon-yellow">2</span>
                <span>
                  Scroll and tap <strong>Add to Home Screen</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-neon-yellow">3</span>
                <span>
                  Tap the new <strong>FieldPress</strong> icon to open the app
                </span>
              </li>
            </ol>
          )}

          {showHelp && safariMac && (
            <ol className="space-y-3 border border-neon/25 bg-card p-4 text-left text-base text-foreground/90">
              <li className="flex gap-3">
                <span className="text-neon-yellow">!</span>
                <span>
                  Safari cannot install from a page button. Use <strong>Add to Dock</strong> here, or open this site in Chrome / Edge for a one-click install.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-neon-yellow">1</span>
                <span>
                  Menu bar: <strong>File → Add to Dock…</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-neon-yellow">2</span>
                <span>
                  Or click <Share className="inline w-4 h-4 text-neon" /> <strong>Share</strong> in the toolbar, then <strong>Add to Dock</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-neon-yellow">3</span>
                <span>
                  Open <strong>FieldPress</strong> from the Dock or Spotlight
                </span>
              </li>
            </ol>
          )}

          {showHelp && device !== "ios" && !safariMac && (
            <ol className="space-y-3 border border-neon/25 bg-card p-4 text-left text-base text-foreground/90">
              {canNativeInstall ? (
                <li className="flex gap-3">
                  <span className="text-neon-yellow">*</span>
                  <span>
                    Tap <strong>Install on this device</strong> again — the browser is ready to add FieldPress.
                  </span>
                </li>
              ) : (
                <>
                  <li className="flex gap-3">
                    <span className="text-neon-yellow">1</span>
                    <span>
                      {device === "android"
                        ? "Tap the ⋮ menu in Chrome"
                        : browser === "firefox"
                          ? "Open this page in Chrome or Edge, then click Install"
                          : "Click the install icon in the address bar (Chrome / Edge)"}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-yellow">2</span>
                    <span>
                      Tap <strong>Install app</strong> / <strong>Add to Home screen</strong>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neon-yellow">3</span>
                    <span>
                      Open <strong>FieldPress</strong> from your home screen
                    </span>
                  </li>
                </>
              )}
            </ol>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={copyLink}
              className="border border-neon/20 bg-card p-4 text-left hover:border-neon/50 transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-neon mb-2" />
              ) : (
                <Copy className="w-5 h-5 text-neon-yellow mb-2" />
              )}
              <div className="text-sm tracking-widest">{copied ? "COPIED" : "COPY LINK"}</div>
              <div className="text-xs text-muted-foreground mt-1">Send to your phone</div>
            </button>
            <div className="border border-neon/20 bg-card p-4 flex flex-col items-center justify-center">
              {origin ? (
                <img src={qrSrc} alt="QR code to open FieldPress" className="w-24 h-24" />
              ) : null}
              <div className="text-xs text-muted-foreground mt-2 tracking-widest">SCAN TO OPEN</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground tracking-widest">
            <span className="inline-flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> PHONE
            </span>
            <span className="text-neon/40">//</span>
            <span className="inline-flex items-center gap-1">
              <Monitor className="w-3 h-3" /> DESKTOP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
