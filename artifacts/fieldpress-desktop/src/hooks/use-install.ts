import { useCallback, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type DeviceKind = "ios" | "android" | "desktop";

declare global {
  interface Window {
    __fpDeferredPrompt?: BeforeInstallPromptEvent | null;
    __fpInstallCapture?: boolean;
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

export function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function isIosSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const webkit = /WebKit/i.test(ua);
  const other = /CriOS|FxiOS|OPiOS|EdgiOS/i.test(ua);
  return ios && webkit && !other;
}

export function useInstallApp() {
  const [device, setDevice] = useState<DeviceKind>("desktop");
  const [installed, setInstalled] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(getDeferredPrompt);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    captureInstallPrompt();
    setDevice(detectDevice());
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

  const install = useCallback(async () => {
    const event = getDeferredPrompt();
    if (!event) return false;
    setBusy(true);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === "accepted") setInstalled(true);
      return choice.outcome === "accepted";
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const label = useMemo(() => {
    if (installed) return "Open FieldPress";
    if (device === "ios") return "Add to Home Screen";
    if (canNativeInstall) return "Install FieldPress";
    return "Install FieldPress";
  }, [installed, device, canNativeInstall]);

  return { device, installed, canNativeInstall, busy, install, label, safari: isIosSafari() };
}
