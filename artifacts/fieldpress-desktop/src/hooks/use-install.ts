import { useCallback, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type DeviceKind = "ios" | "android" | "desktop";
export type BrowserKind = "safari" | "chrome" | "edge" | "firefox" | "other";

declare global {
  interface Window {
    __fpDeferredPrompt?: BeforeInstallPromptEvent | null;
    __fpInstallCapture?: boolean;
  }
  interface Navigator {
    install?: () => Promise<void>;
  }
}

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function getDeferredPrompt() {
  if (typeof window === "undefined") return null;
  return window.__fpDeferredPrompt ?? null;
}

function setDeferredPrompt(event: BeforeInstallPromptEvent | null) {
  if (typeof window === "undefined") return;
  window.__fpDeferredPrompt = event;
  notify();
}

/** Capture the native install event as soon as the module loads — before React paints. */
export function captureInstallPrompt() {
  if (typeof window === "undefined" || window.__fpInstallCapture) return;
  window.__fpInstallCapture = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    setDeferredPrompt(event as BeforeInstallPromptEvent);
  });
  window.addEventListener("appinstalled", () => {
    setDeferredPrompt(null);
  });
}

export function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  return navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null);
}

function detectDevice(): DeviceKind {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function detectBrowser(): BrowserKind {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua) || /EdgiOS/i.test(ua)) return "edge";
  if (/Chrome|CriOS|Chromium/i.test(ua)) return "chrome";
  if (/Firefox|FxiOS/i.test(ua)) return "firefox";
  if (/Safari/i.test(ua)) return "safari";
  return "other";
}

export function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function useInstallApp() {
  const [device, setDevice] = useState<DeviceKind>("desktop");
  const [browser, setBrowser] = useState<BrowserKind>("other");
  const [installed, setInstalled] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(getDeferredPrompt);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    captureInstallPrompt();
    setDevice(detectDevice());
    setBrowser(detectBrowser());
    setInstalled(isStandaloneApp());
    setDeferred(getDeferredPrompt());
    void registerServiceWorker();

    const sync = () => setDeferred(getDeferredPrompt());
    listeners.add(sync);
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canNativeInstall = Boolean(deferred) && !installed;
  const safari = browser === "safari";

  const install = useCallback(async () => {
    setBusy(true);
    try {
      const event = getDeferredPrompt();
      if (event) {
        await event.prompt();
        const choice = await event.userChoice;
        setDeferredPrompt(null);
        if (choice.outcome === "accepted") setInstalled(true);
        return choice.outcome === "accepted";
      }
      if (typeof navigator.install === "function") {
        await navigator.install();
        setInstalled(isStandaloneApp());
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const label = useMemo(() => {
    if (installed) return "Open FieldPress";
    if (device === "ios") return "Add to Home Screen";
    if (safari && device === "desktop") return "Add to Dock";
    if (canNativeInstall) return "Install FieldPress";
    return "Install FieldPress";
  }, [installed, device, safari, canNativeInstall]);

  return { device, browser, installed, canNativeInstall, busy, install, label, safari };
}
