
export interface FieldMessage {
  id: string;
  chatId: string;
  sender: string;
  callsign: string;
  avatarUrl?: string;
  text: string;
  imageUrl?: string;
  linkUrl?: string;
  timestamp: string;
  reactions?: Record<string, number>;
}

export interface ChatChannel {
  id: string;
  name: string;
  callsign?: string;
  bureau?: string;
  isGroup: boolean;
  membersCount?: number;
  avatarUrl?: string;
  description?: string;
  unreadCount?: number;
}
export interface CommentItem {
  id: string;
  author: string;
  callsign: string;
  text: string;
  timestamp: string;
}

export interface StoryReactions {
  frontpage: number;
  signal: number;
  investigate: number;
  solidarity: number;
  broadcast: number;
  dispute: number;
}
import React, { useState, useEffect, useRef } from "react";
import {
  Inbox,
  Newspaper,
  Bell,
  Menu,
  X,
  Settings,
  User,
  Send,
  FolderLock,
  Sun,
  Moon,
  ShieldCheck,
  Radio,
  MapPin,
  RefreshCw,
  Save,
  Check,
  Share2,
  Bookmark,
  Sliders,
  Trash2,
  Camera,
  Upload,
  Archive,
  Download,
  Copy,
  Eye,
  PlusCircle,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Edit3,
  Sparkles,
  Search,
  MessageCircle,
  Volume2,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Link2,
  Smile,
  Paperclip,
  Bot,
  SquarePen,
  LogIn,
  UserPlus,
  LogOut,
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import * as maplibregl from "maplibre-gl";

// Exact FieldPress "Pressie" Favicon Mark
export const PressieMark: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <rect width="32" height="32" rx="7" fill="#09090b" />
    <rect x="10" y="5" width="12" height="3.5" rx="1.5" stroke="#22c55e" strokeWidth="1.5" />
    <line x1="16" y1="8.5" x2="16" y2="12" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="16" cy="10.5" r="1" fill="#22c55e" />
    <rect x="11" y="12" width="10" height="2.5" rx="0.5" stroke="#22c55e" strokeWidth="1.5" />
    <rect x="7.5" y="14.5" width="17" height="4" rx="1.5" stroke="#22c55e" strokeWidth="1.5" />
    <circle cx="16" cy="22" r="4" stroke="#22c55e" strokeWidth="1.5" />
    <circle cx="16" cy="22" r="1.5" stroke="#22c55e" strokeWidth="1.2" strokeDasharray="1 1" />
    <line x1="6" y1="27.5" x2="26" y2="27.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export interface PressPassData {
  name: string;
  callsign: string;
  email?: string;
  role: string;
  bureau: string;
  badgeId: string;
  issueDate: string;
  accentColor: string;
  avatarUrl?: string;
  bio: string;
  pgpKey: string;
  contactSignal: string;
  location?: string;
  coordinates?: [number, number];
  provenanceEnabled?: boolean;
  isAdmin?: boolean;
}

// Shown only for unauthenticated visitors, before /api/auth/me resolves
// (or if it resolves to no account). Intentionally generic — this used to
// be a real admin's persona (Victor Birkle) and rendered for every fresh
// browser and all signed-out traffic, which made anonymous visitors look
// like the signed-in bureau chief. Do not put a real person's identity or
// admin flag here; real identity/role always comes from authAccount.
export const DEFAULT_PRESS_PASS: PressPassData = {
  name: "Field Correspondent",
  callsign: "",
  email: undefined,
  role: "Guest (signed out)",
  bureau: "Midwest Corridor Dispatch",
  location: undefined,
  coordinates: undefined,
  provenanceEnabled: false,
  badgeId: "",
  issueDate: "",
  accentColor: "amber",
  avatarUrl: "/pressyo-icon.jpg",
  bio: "",
  pgpKey: "",
  contactSignal: "",
  isAdmin: false
};

export interface Dispatch {
  id: string;
  accountId?: string;
  title: string;
  category: string;
  author: string;
  callsign: string;
  bureau: string;
  timestamp: string;
  location: string;
  coordinates?: [number, number];
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  isLead?: boolean;
  isPressRoll?: boolean;
  editionStyle?: "tactical" | "newspaper" | "comic" | "arcade" | "magazine";
  sharingOption?: "fork" | "colab" | "none";
  parentDispatchId?: string;
  createdAt?: string;
  updatedAt?: string;
  repostOf?: string;
  repostedByName?: string;
  repostedByCallsign?: string;
}

export const INITIAL_DISPATCHES: Dispatch[] = [
];

export interface ClassifiedItem {
  id: string;
  tag: string;
  tagColor: "amber" | "emerald" | "cyan" | "rose";
  title: string;
  details: string;
  contact: string;
  timestamp: string;
}

export const INITIAL_CLASSIFIEDS: ClassifiedItem[] = [
];


// Every dispatch share link gets a fresh cache-busting query param. Link
// unfurl crawlers (Facebook, Slack, Discord, etc.) cache Open Graph data
// per *exact* URL, sometimes stubbornly -- a manual "Scrape Again" doesn't
// always actually clear it. Appending a unique, harmless `v` param means
// each share is a URL those crawlers have never seen before, so they're
// forced to fetch fresh instead of serving back a stale cached object
// (e.g. an old generic image from before this dispatch existed or was
// last updated). The API route ignores `v` entirely -- it's args-only for
// the crawler's cache key, not used for the dispatch lookup itself.
export const buildDispatchShareUrl = (id: string): string => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://fieldpress.studio";
  return `${origin}/api/dispatch/${id}?v=${Date.now()}`;
};

export const getEditionClasses = (style?: string, isDark: boolean = true) => {
  switch (style) {
    case "newspaper":
      return {
        card: isDark
          ? "bg-zinc-900/90 border-amber-900/50 border-4 border-double shadow-md text-amber-100/90"
          : "bg-amber-50/70 border-amber-800/40 border-4 border-double shadow-md text-zinc-900",
        badge: "bg-amber-800/10 text-amber-800 dark:text-amber-300 border border-amber-800/30 font-serif uppercase tracking-widest text-[10px] font-bold px-2 py-0.5",
        headline: "font-serif text-2xl sm:text-3xl font-black tracking-tight leading-tight hover:text-amber-600 dark:hover:text-amber-400 transition",
        body: "font-serif text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300",
        tag: "📰 Broadsheet Edition",
        accentBorder: "border-amber-800/30",
        subtleBadge: "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
      };
    case "comic":
      return {
        card: isDark
          ? "bg-zinc-900 border-2 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(250,204,21,0.7)] rounded-xl text-zinc-100"
          : "bg-amber-50/50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl text-zinc-900",
        badge: "bg-yellow-400 text-black border border-black font-sans uppercase font-black tracking-wide text-[11px] px-2.5 py-0.5 shadow-2xs",
        headline: "font-sans font-black text-2xl sm:text-3xl uppercase tracking-wider leading-snug hover:text-rose-500 transition",
        body: "font-sans font-bold text-xs sm:text-sm leading-relaxed text-zinc-800 dark:text-zinc-200",
        tag: "💥 Comic Strip Edition",
        accentBorder: "border-black dark:border-yellow-400/40",
        subtleBadge: "bg-yellow-400 text-black border border-black font-bold"
      };
    case "arcade":
      return {
        card: "bg-black border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] rounded-none text-emerald-400 font-['VT323']",
        badge: "bg-emerald-950 text-emerald-400 border border-emerald-500 font-['VT323'] text-sm tracking-widest px-2 py-0.5",
        headline: "font-['VT323'] text-3xl sm:text-4xl text-emerald-300 tracking-wider leading-tight hover:text-emerald-100 transition",
        body: "font-['VT323'] text-lg text-emerald-400/90 leading-snug",
        tag: "🕹️ 8-Bit Arcade Edition",
        accentBorder: "border-emerald-500/40",
        subtleBadge: "bg-emerald-950 text-emerald-400 border border-emerald-500"
      };
    case "magazine":
      return {
        card: isDark
          ? "bg-zinc-900/80 border border-purple-500/30 rounded-2xl shadow-md text-zinc-100"
          : "bg-white border border-purple-500/20 rounded-2xl shadow-md text-zinc-900",
        badge: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 rounded-full font-sans uppercase font-bold text-[10px] tracking-widest px-2.5 py-0.5",
        headline: "font-sans text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug hover:text-purple-500 transition",
        body: "font-sans text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 font-normal",
        tag: "✨ Modern Sleek Edition",
        accentBorder: "border-purple-500/30",
        subtleBadge: "bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full"
      };
    case "tactical":
    default:
      return {
        card: isDark
          ? "bg-zinc-950/90 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.06)] rounded-xl text-zinc-100"
          : "bg-white border border-cyan-600/30 shadow-sm rounded-xl text-zinc-900",
        badge: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono uppercase font-bold text-[10px] tracking-widest px-2 py-0.5 rounded",
        headline: "font-mono text-2xl sm:text-3xl font-black tracking-tight leading-tight hover:text-cyan-400 transition",
        body: "font-mono text-xs sm:text-sm leading-relaxed text-zinc-300 dark:text-zinc-300",
        tag: "🛰️ Tactical Wire Edition",
        accentBorder: "border-cyan-500/30",
        subtleBadge: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
      };
  }
};

// ============================================================================
// HELPER: "(edited)" indicator (#154/#170) — a dispatch counts as edited
// once its updated_at moves past created_at. A small buffer avoids
// flagging normal DB round-trip jitter on the initial insert as an edit.
// ============================================================================
function wasDispatchEdited(d: { createdAt?: string; updatedAt?: string }): boolean {
  if (!d.createdAt || !d.updatedAt) return false;
  const created = new Date(d.createdAt).getTime();
  const updated = new Date(d.updatedAt).getTime();
  if (isNaN(created) || isNaN(updated)) return false;
  return updated - created > 2000; // 2s buffer
}

// ============================================================================
// HELPER: Dynamic Social Pressie Graphic Generator (1200x675 HD 16:9)
// ============================================================================
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 4
): number {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        line = line.trim() + "...";
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}

export async function generatePressieCardBlob(disp: Dispatch): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const style = disp.editionStyle || "newspaper";

  type EditionTheme = {
    bg: string;
    border: string;
    innerBorder: string;
    accentBar: string;
    headerTitle: string;
    headerColor: string;
    badgeText: string;
    badgeColor: string;
    titleColor: string;
    bodyColor: string;
    fontTitle: string;
    fontBody: string;
    fontHeader: string;
    frameWidth: number;
    scanlines: boolean;
  };

  const themes: Record<"newspaper" | "comic" | "arcade" | "tactical" | "magazine", EditionTheme> = {
    newspaper: {
      bg: "#faf5eb",
      border: "#5c3e21",
      innerBorder: "rgba(92, 62, 33, 0.35)",
      accentBar: "#5c3e21",
      headerTitle: "THE DAILY BROADSHEET • FIELDPRESS REGIONAL WIRE",
      headerColor: "#5c3e21",
      badgeText: "VERIFIED BROADSHEET DISPATCH",
      badgeColor: "#5c3e21",
      titleColor: "#1c130b",
      bodyColor: "#2c2014",
      fontTitle: "bold 34px Georgia, 'Times New Roman', serif",
      fontBody: "19px Georgia, 'Times New Roman', serif",
      fontHeader: "bold 14px Georgia, 'Times New Roman', serif",
      frameWidth: 2,
      scanlines: false
    },
    comic: {
      bg: "#fffdf0",
      border: "#000000",
      innerBorder: "rgba(250, 204, 21, 0.8)",
      accentBar: "#ef4444",
      headerTitle: "FIELDPRESS COMIC STRIP DISPATCH WIRE",
      headerColor: "#ef4444",
      badgeText: "ACTION DISPATCH",
      badgeColor: "#000000",
      titleColor: "#000000",
      bodyColor: "#18181b",
      fontTitle: "bold 36px Impact, 'Arial Black', sans-serif",
      fontBody: "bold 18px 'Trebuchet MS', sans-serif",
      fontHeader: "bold 15px 'Trebuchet MS', sans-serif",
      frameWidth: 6,
      scanlines: false
    },
    arcade: {
      bg: "#000000",
      border: "#00ff66",
      innerBorder: "rgba(0, 255, 102, 0.3)",
      accentBar: "#00ff66",
      headerTitle: "*** 8-BIT TELEMETRY WIRE // ARCADE EDITION ***",
      headerColor: "#00ff66",
      badgeText: "[ 1P VERIFIED ]",
      badgeColor: "#00ff66",
      titleColor: "#55ff99",
      bodyColor: "#00ff66",
      fontTitle: "bold 30px 'Courier New', monospace",
      fontBody: "18px 'Courier New', monospace",
      fontHeader: "bold 14px 'Courier New', monospace",
      frameWidth: 2,
      scanlines: true
    },
    tactical: {
      bg: "#030a12",
      border: "#06b6d4",
      innerBorder: "rgba(6, 182, 212, 0.3)",
      accentBar: "#06b6d4",
      headerTitle: "// TACTICAL RECONNAISSANCE DISPATCH // CORRIDOR PUBLIC //",
      headerColor: "#22d3ee",
      badgeText: "ENCRYPTED SENSOR FEED",
      badgeColor: "#10b981",
      titleColor: "#e0f2fe",
      bodyColor: "#bae6fd",
      fontTitle: "bold 30px ui-monospace, 'Courier New', monospace",
      fontBody: "18px ui-monospace, 'Courier New', monospace",
      fontHeader: "bold 13px ui-monospace, 'Courier New', monospace",
      frameWidth: 2,
      scanlines: false
    },
    magazine: {
      bg: "#09090b",
      border: "#a855f7",
      innerBorder: "rgba(168, 85, 247, 0.25)",
      accentBar: "#a855f7",
      headerTitle: "FIELDPRESS JOURNAL • SPECIAL PHOTO EDITORIAL",
      headerColor: "#c084fc",
      badgeText: "VERIFIED PHOTO EDITORIAL",
      badgeColor: "#a855f7",
      titleColor: "#fafafa",
      bodyColor: "#e4e4e7",
      fontTitle: "bold 34px system-ui, sans-serif",
      fontBody: "19px Georgia, serif",
      fontHeader: "bold 14px system-ui, sans-serif",
      frameWidth: 2,
      scanlines: false
    }
  };

  const theme = themes[style] || themes.newspaper;

  const renderCard = (withImage: HTMLImageElement | null) => {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, 1200, 675);

    if (theme.scanlines) {
      ctx.fillStyle = "rgba(0, 255, 102, 0.04)";
      for (let y = 0; y < 675; y += 4) {
        ctx.fillRect(0, y, 1200, 2);
      }
    }

    ctx.fillStyle = theme.accentBar;
    ctx.fillRect(0, 0, 1200, 8);

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = theme.frameWidth;
    ctx.strokeRect(24, 24, 1152, 627);

    ctx.strokeStyle = theme.innerBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(28 + (theme.frameWidth - 2), 28 + (theme.frameWidth - 2), 1144 - (theme.frameWidth - 2) * 2, 619 - (theme.frameWidth - 2) * 2);

    ctx.fillStyle = theme.headerColor;
    ctx.font = theme.fontHeader;
    ctx.fillText(theme.headerTitle, 55, 68);

    ctx.fillStyle = theme.badgeColor;
    ctx.font = "bold 12px monospace";
    ctx.fillText(theme.badgeText, 55, 86);

    ctx.fillStyle = theme.headerColor;
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`[${disp.location}] • ${disp.timestamp}`, 1145, 68);
    ctx.textAlign = "left";

    ctx.fillStyle = theme.border;
    ctx.fillRect(55, 100, 1090, 1);

    const catText = (disp.category || "FIELD DISPATCH").toUpperCase();
    ctx.font = "bold 13px monospace";
    const catWidth = ctx.measureText(catText).width + 22;
    ctx.fillStyle = theme.innerBorder;
    ctx.fillRect(55, 116, catWidth, 26);
    ctx.fillStyle = theme.accentBar;
    ctx.fillText(catText, 66, 134);

    ctx.fillStyle = theme.headerColor;
    ctx.font = "13px monospace";
    ctx.fillText(`EDITION: ${style.toUpperCase()} • BEAT: ${disp.location}`, 55 + catWidth + 18, 134);

    let textWidth = 1090;
    if (withImage && withImage.naturalWidth > 0) {
      textWidth = 590;
      try {
        ctx.save();
        ctx.beginPath();
        ctx.rect(680, 160, 465, 340);
        ctx.clip();
        ctx.drawImage(withImage, 680, 160, 465, 340);
        ctx.restore();

        ctx.strokeStyle = theme.border;
        ctx.lineWidth = theme.frameWidth > 2 ? 4 : 2;
        ctx.strokeRect(680, 160, 465, 340);

        if (disp.imageCaption) {
          ctx.fillStyle = "rgba(9, 9, 11, 0.85)";
          ctx.fillRect(680, 470, 465, 30);
          ctx.fillStyle = "#e4e4e7";
          ctx.font = "italic 12px sans-serif";
          ctx.fillText(`Evidence: ${disp.imageCaption.slice(0, 52)}`, 690, 490);
        }
      } catch {}
    }

    ctx.fillStyle = theme.titleColor;
    ctx.font = theme.fontTitle;
    let curY = 195;
    curY = wrapCanvasText(ctx, disp.title, 55, curY, textWidth, 42, 3);

    ctx.fillStyle = theme.bodyColor;
    ctx.font = theme.fontBody;
    curY += 12;
    wrapCanvasText(ctx, disp.content, 55, curY, textWidth, 28, 4);

    ctx.fillStyle = theme.border;
    ctx.fillRect(55, 572, 1090, 1);

    ctx.fillStyle = theme.headerColor;
    ctx.font = "bold 14px monospace";
    ctx.fillText(`BYLINE: ${disp.author} (@${disp.callsign})`, 55, 600);

    ctx.fillStyle = theme.headerColor;
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`fieldpress.studio • ${style.toUpperCase()} EDITION`, 1145, 600);
    ctx.textAlign = "left";
  };

  if (disp.imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = disp.imageUrl;
      await new Promise((res) => {
        img.onload = res;
        img.onerror = res;
        setTimeout(res, 1800);
      });
      renderCard(img.complete && img.naturalWidth > 0 ? img : null);
    } catch {
      renderCard(null);
    }
  } else {
    renderCard(null);
  }

  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => {
        resolve(b);
      }, "image/png");
    } catch {
      resolve(null);
    }
  });
}

export const FieldPressMaster: React.FC = () => {
  // Pressy'o AI Newsroom Copilot State
  const PRESSYO_GREETING = "Greetings Bureau Chief! I am Pressy'o, your autonomous field newsroom assistant. I can draft dispatches across all 5 edition styles (Broadsheet, Comic, Arcade, Tactical, Sleek), generate Pollinations visual prompts, or fact-check your corridor telemetry. How can I assist your reporting today?";
  type PressyoMessage = { sender: "user" | "pressyo"; text: string; actionData?: { title: string; content: string; style: "newspaper" | "comic" | "arcade" | "tactical" | "magazine"; prompt?: string } };
  const [showPressyoModal, setShowPressyoModal] = useState(false);
  const [pressyoInput, setPressyoInput] = useState("");
  const [isPressyoLoading, setIsPressyoLoading] = useState(false);
  const [pressyoChat, setPressyoChat] = useState<PressyoMessage[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_pressyo_chat");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ sender: "pressyo", text: PRESSYO_GREETING }];
  });

  const handleNewPressyoChat = () => {
    const fresh: PressyoMessage[] = [{ sender: "pressyo", text: PRESSYO_GREETING }];
    setPressyoChat(fresh);
    setPressyoInput("");
    try {
      localStorage.setItem("fieldpress_pressyo_chat", JSON.stringify(fresh));
    } catch {}
  };

  const inferEditionStyle = (text: string): "newspaper" | "comic" | "arcade" | "tactical" | "magazine" => {
    const lower = text.toLowerCase();
    if (lower.includes("comic") || lower.includes("kapow") || lower.includes("hero")) return "comic";
    if (lower.includes("broadsheet") || lower.includes("1920") || lower.includes("paper") || lower.includes("old")) return "newspaper";
    if (lower.includes("arcade") || lower.includes("pixel") || lower.includes("8-bit")) return "arcade";
    if (lower.includes("tactical") || lower.includes("intel") || lower.includes("recon")) return "tactical";
    return "magazine";
  };

  const handlePressyoSend = async (customPrompt?: string) => {
    const userText = customPrompt || pressyoInput.trim();
    if (!userText || isPressyoLoading) return;

    const newChat = [...pressyoChat, { sender: "user" as const, text: userText }];
    setPressyoChat(newChat);
    setPressyoInput("");
    setIsPressyoLoading(true);

    const editionStyle = inferEditionStyle(userText);

    try {
      const resp = await fetch("/api/pressyo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText, editionStyle })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || `Request failed (${resp.status})`);
      }

      const finalized = [...newChat, {
        sender: "pressyo" as const,
        text: data.text,
        actionData: {
          title: `Pressy'o Dispatch (${editionStyle})`,
          content: data.text,
          style: editionStyle
        }
      }];
      setPressyoChat(finalized);
      try {
        localStorage.setItem("fieldpress_pressyo_chat", JSON.stringify(finalized));
      } catch {}
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Pressy'o is unreachable right now.";
      const finalized = [...newChat, {
        sender: "pressyo" as const,
        text: `⚠️ Couldn't reach Pressy'o: ${errorMessage}. Try again in a moment.`
      }];
      setPressyoChat(finalized);
      try {
        localStorage.setItem("fieldpress_pressyo_chat", JSON.stringify(finalized));
      } catch {}
    } finally {
      setIsPressyoLoading(false);
    }
  };

  // Theme & UI Preferences
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("fp-theme") || localStorage.getItem("fieldpress_theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem("fp-theme", theme);
      localStorage.setItem("fieldpress_theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch {}
  }, [theme]);
  const [watermarkVisible, setWatermarkVisible] = useState(true);

  // Main Navigation Tabs: "edition" | "wire" | "map" | "classifieds"
  const [activeTab, setActiveTab] = useState<"edition" | "wire" | "map" | "classifieds" | "discover">("edition");

  // =========================================================================
  // STRICTLY SEPARATED MODAL ENDPOINTS:
  // 1. showPressieBuilderModal: The Story/Dispatch Composer (IMAGE 2)
  // 2. showPressPassModal: The Reporter Credential / ID Card Customizer (IMAGE 1)
  // =========================================================================
  // Chicago Midnight Quota Tracker (13 visual generations per day)
  const getChicagoDateString = () => {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  };

  const [dailyGenCount, setDailyGenCount] = useState<number>(() => {
    try {
      const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());
      const raw = localStorage.getItem("fieldpress_gen_quota");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today) return parsed.count || 0;
      }
    } catch {}
    return 0;
  });

  const recordGeneration = () => {
    try {
      const today = getChicagoDateString();
      const next = dailyGenCount + 1;
      setDailyGenCount(next);
      localStorage.setItem("fieldpress_gen_quota", JSON.stringify({ date: today, count: next }));
    } catch {}
  };
  const [showPressieBuilderModal, setShowPressieBuilderModal] = useState(false);
  const [showPressPassModal, setShowPressPassModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Dispatch | null>(null);
  const [shareModalStory, setShareModalStory] = useState<Dispatch | null>(null);
  const [pressieCardBlob, setPressieCardBlob] = useState<Blob | null>(null);
  const [pressieCardUrl, setPressieCardUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);
  const [shareViewMode, setShareViewMode] = useState<"card" | "broadsheet">("card");

  useEffect(() => {
    if (!shareModalStory) {
      if (pressieCardUrl) URL.revokeObjectURL(pressieCardUrl);
      setPressieCardUrl(null);
      setPressieCardBlob(null);
      return;
    }
    let isMounted = true;
    setIsGeneratingCard(true);

    const syncShareMeta = (imageUrl: string | undefined) => {
      // Sync minimal metadata server-side so link-based shares (Facebook, X,
      // Bluesky, Reddit, etc.) can show accurate Open Graph previews instead
      // of nothing. Best-effort: failures here shouldn't block sharing.
      fetch("/api/sync-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: shareModalStory.id,
          title: shareModalStory.title,
          content: shareModalStory.content,
          location: shareModalStory.location,
          category: shareModalStory.category,
          author: shareModalStory.author,
          callsign: shareModalStory.callsign,
          editionStyle: shareModalStory.editionStyle,
          imageUrl
        })
      }).catch(() => {});
    };

    generatePressieCardBlob(shareModalStory).then(async (blob) => {
      if (!isMounted) return;
      if (blob) {
        setPressieCardBlob(blob);
        const url = URL.createObjectURL(blob);
        setPressieCardUrl(url);

        // Upload the actual rendered edition card so social crawlers see the
        // real styled graphic instead of the raw source photo. Falls back to
        // the source image if the upload fails for any reason.
        try {
          const uploadRes = await fetch(`/api/upload-share-card?id=${encodeURIComponent(shareModalStory.id)}`, {
            method: "POST",
            headers: { "Content-Type": "image/png" },
            body: blob
          });
          if (uploadRes.ok) {
            const { url: hostedUrl } = await uploadRes.json();
            syncShareMeta(hostedUrl);
          } else {
            syncShareMeta(shareModalStory.imageUrl);
          }
        } catch {
          syncShareMeta(shareModalStory.imageUrl);
        }
      } else {
        syncShareMeta(shareModalStory.imageUrl);
      }
      setIsGeneratingCard(false);
    });
    return () => {
      isMounted = false;
    };
  }, [shareModalStory]);
  const [showPostNoticeModal, setShowPostNoticeModal] = useState(false);
  const [newEditionStyle, setNewEditionStyle] = useState<"tactical" | "newspaper" | "comic" | "arcade" | "magazine">("tactical");
  const [newSharingOption, setNewSharingOption] = useState<"fork" | "colab" | "none">("fork");
  // Guards handleCreatePressie against double-submission (e.g. a fast
  // double-click on Publish/Save). Without this, two overlapping PUT/POST
  // requests can fire for the same click; the second one races the first
  // and can come back with a confusing error (e.g. a 403 ownership
  // mismatch), leaving a stray draft or error toast behind. Only one
  // in-flight submission is ever allowed.
  const [isSubmittingPressie, setIsSubmittingPressie] = useState(false);
  
  // Global comments & reacts state synchronized across feed & full-page reader
  const [allComments, setAllComments] = useState<Record<string, CommentItem[]>>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_all_comments");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [feedCommentInputs, setFeedCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState("");

  const [allReacts, setAllReacts] = useState<Record<string, StoryReactions>>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_all_reacts");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const [allUserReacts, setAllUserReacts] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_all_user_reacts");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const getCommentsForDispatch = (id: string): CommentItem[] => {
    if (allComments[id]) return allComments[id];
    try {
      const legacy = localStorage.getItem(`fieldpress_comments_${id}`);
      if (legacy) return JSON.parse(legacy);
    } catch {}
    return [];
  };

  const addCommentToDispatch = (id: string, text: string) => {
    if (!text.trim()) return;
    const newComment: CommentItem = {
      id: `cm-${Date.now()}`,
      author: pressPass.name || "Field Correspondent",
      callsign: pressPass.callsign || "ras.ip",
      text: text.trim(),
      timestamp: "Just now"
    };
    const current = getCommentsForDispatch(id);
    const updated = [...current, newComment];
    const newMap = { ...allComments, [id]: updated };
    setAllComments(newMap);
    try {
      localStorage.setItem("fieldpress_all_comments", JSON.stringify(newMap));
      localStorage.setItem(`fieldpress_comments_${id}`, JSON.stringify(updated));
    } catch {}
    setSavedSuccessToast("Field commentary note dispatched.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const getReactsForDispatch = (id: string): StoryReactions => {
    if (allReacts[id]) return allReacts[id];
    try {
      const legacy = localStorage.getItem(`fieldpress_reacts_${id}`);
      if (legacy) return JSON.parse(legacy);
    } catch {}
    // Accurate counts only: No fake generated numbers!
    return { frontpage: 0, signal: 0, investigate: 0, solidarity: 0, broadcast: 0, dispute: 0 };
  };

  const getUserReactsForDispatch = (id: string): Record<string, boolean> => {
    if (allUserReacts[id]) return allUserReacts[id];
    try {
      const legacy = localStorage.getItem(`fieldpress_user_react_${id}`);
      if (legacy) return JSON.parse(legacy);
    } catch {}
    return {};
  };

  const handleToggleReaction = (storyId: string, reactKey: keyof StoryReactions) => {
    const current = getReactsForDispatch(storyId);
    const userMap = getUserReactsForDispatch(storyId);
    const isAlready = !!userMap[reactKey];

    const nextCount = isAlready ? Math.max(0, current[reactKey] - 1) : current[reactKey] + 1;
    const nextReacts: StoryReactions = {
      ...current,
      [reactKey]: nextCount
    };
    const nextUser = {
      ...userMap,
      [reactKey]: !isAlready
    };

    const newAllReacts = { ...allReacts, [storyId]: nextReacts };
    const newAllUser = { ...allUserReacts, [storyId]: nextUser };

    setAllReacts(newAllReacts);
    setAllUserReacts(newAllUser);

    try {
      localStorage.setItem("fieldpress_all_reacts", JSON.stringify(newAllReacts));
      localStorage.setItem("fieldpress_all_user_reacts", JSON.stringify(newAllUser));
      localStorage.setItem(`fieldpress_reacts_${storyId}`, JSON.stringify(nextReacts));
      localStorage.setItem(`fieldpress_user_react_${storyId}`, JSON.stringify(nextUser));
    } catch {}

    // "Disputed" is server-backed (#146, #175 - a trust & safety signal
    // needs to be a real per-account toggle, not a per-browser count) --
    // everything above is optimistic UI; this reconciles with the source
    // of truth. Other reaction keys stop here and stay client-side.
    if (reactKey === "dispute" && authAccount) {
      fetch("/api/reports/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dispatchId: storyId })
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data) return;
          setAllReacts((prev) => {
            const merged = { ...prev, [storyId]: { ...(prev[storyId] || nextReacts), dispute: data.count } };
            try { localStorage.setItem("fieldpress_all_reacts", JSON.stringify(merged)); } catch {}
            return merged;
          });
          setAllUserReacts((prev) => {
            const merged = { ...prev, [storyId]: { ...(prev[storyId] || nextUser), dispute: data.disputed } };
            try { localStorage.setItem("fieldpress_all_user_reacts", JSON.stringify(merged)); } catch {}
            return merged;
          });
        })
        .catch(() => {
          // Network hiccup - the optimistic local toggle above still stands
          // until the next successful sync.
        });
    }
  };

  // Report / flag intake (closes issue #144 -- no report mechanism existed
  // anywhere in the codebase). Intentionally minimal: files a report to the
  // server-side admin queue, no client-side moderation logic or auto-hiding
  // of content. See api/_lib/handlers/reports.mjs.
  const [reportSubmittedId, setReportSubmittedId] = useState<string | null>(null);
  const [reportInFlightId, setReportInFlightId] = useState<string | null>(null);

  const handleReportDispatch = async (dispatchId: string) => {
    const reason = window.prompt(
      "What's the issue with this dispatch? (e.g. misinformation, harassment, spam, other)"
    );
    if (!reason || !reason.trim()) return;

    setReportInFlightId(dispatchId);
    try {
      const res = await fetch("/api/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          targetType: "dispatch",
          targetId: dispatchId,
          reason: reason.trim()
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        window.alert(body.error || "Couldn't submit report. Please try again.");
        return;
      }
      setReportSubmittedId(dispatchId);
      setTimeout(() => setReportSubmittedId((cur) => (cur === dispatchId ? null : cur)), 4000);
    } catch {
      window.alert("Couldn't submit report. Please check your connection and try again.");
    } finally {
      setReportInFlightId(null);
    }
  };

  // Instant Messaging (Field Comms Wire: DMs & Groups)
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [activeChatId, setActiveChatId] = useState("midwest-bureau");
  const [activeChatTab, setActiveChatTab] = useState<"groups" | "dms">("groups");
  const [showCohortRequestModal, setShowCohortRequestModal] = useState(false);
  const [cohortDirectoryQuery, setCohortDirectoryQuery] = useState("");
  type DirectoryUser = {
    id: string; callsign: string; name: string; bureau: string; avatarUrl?: string;
    relation: "none" | "pending_sent" | "pending_received" | "cohort"; requestId: string | null;
  };
  const [cohortDirectoryResults, setCohortDirectoryResults] = useState<DirectoryUser[]>([]);
  const [cohortDirectoryLoading, setCohortDirectoryLoading] = useState(false);
  const [cohortActionPendingId, setCohortActionPendingId] = useState<string | null>(null);

  type CohortConnectionUser = { id: string; callsign: string; name: string; bureau: string; avatarUrl?: string };
  const [cohorts, setCohorts] = useState<Array<{ requestId: string; user: CohortConnectionUser }>>([]);
  const [incomingCohortRequests, setIncomingCohortRequests] = useState<Array<{
    requestId: string; message: string; createdAt: string; user: CohortConnectionUser;
  }>>([]);
  const [outgoingCohortRequests, setOutgoingCohortRequests] = useState<Array<{
    requestId: string; message: string; createdAt: string; user: CohortConnectionUser;
  }>>([]);
  const [messengerInput, setMessengerInput] = useState("");
  const [messengerSearchQuery, setMessengerSearchQuery] = useState("");
  const [messengerImageUrl, setMessengerImageUrl] = useState("");
  const [messengerLinkUrl, setMessengerLinkUrl] = useState("");
  const [showAttachImage, setShowAttachImage] = useState(false);
  const [showAttachLink, setShowAttachLink] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messengerMessages, setMessengerMessages] = useState<FieldMessage[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_messenger_messages");
      if (saved) {
        const parsed: FieldMessage[] = JSON.parse(saved);
        return parsed.filter((m) => m.callsign !== "wire.sec" && m.sender !== "Field Comms Wire Security");
      }
    } catch {}
    return [
      {
        id: "msg-1",
        chatId: "midwest-bureau",
        sender: "Elena Rostova",
        callsign: "elena.wire",
        text: "Checking in from Tippecanoe spur. Telemetry from the rail substations came through intact. 🛰️",
        timestamp: "10:14 AM"
      },
      {
        id: "msg-2",
        chatId: "midwest-bureau",
        sender: "Marcus Vance",
        callsign: "vance.lead",
        text: "Route 63 battery-electric shuttle data is uploaded. Running 20 min ahead of schedule.",
        timestamp: "10:22 AM"
      },
      {
        id: "msg-3",
        chatId: "midwest-bureau",
        sender: "Victor Birkle",
        callsign: "ViBiR",
        text: "Autonomous micro-substations deployed across Vermilion. Clean handoffs, zero grid ripple. ⚡",
        timestamp: "10:28 AM"
      },
      {
        id: "msg-4",
        chatId: "dm-elena",
        sender: "Elena Rostova",
        callsign: "elena.wire",
        text: "Victor, sharing the updated watershed topographical scan. Ready for the civic wire.",
        imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
        linkUrl: "https://fieldpress.studio/#dispatch-d-2",
        timestamp: "Yesterday"
      },
      {
        id: "msg-5",
        chatId: "dm-elena",
        sender: "Victor Birkle",
        callsign: "ViBiR",
        text: "Looks pristine Elena. Juxtaposing it on the Daily Broadsheet front-page now! 👍",
        timestamp: "Just now"
      },
      {
        id: "msg-6",
        chatId: "investigative-desk",
        sender: "Sarah Chen",
        callsign: "chen.data",
        text: "Turbidity meters along the river weir calibrated. Dispatches will include live sensor readings.",
        timestamp: "35m ago"
      }
    ];
  });

  const CHAT_GROUPS: ChatChannel[] = [
    {
      id: "midwest-bureau",
      name: "Midwest Corridor Desk",
      isGroup: true,
      membersCount: 4,
      description: "Corridor dispatch coordination & telemetry wire"
    },
    {
      id: "investigative-desk",
      name: "Investigative & Grid Analysis",
      isGroup: true,
      membersCount: 3,
      description: "Decentralized grid & watershed analysis"
    },
    {
      id: "press-bulletin",
      name: "Public Co-op Bulletin",
      isGroup: true,
      membersCount: 6,
      description: "Open regional frequency notices & classifieds"
    }
  ];

  const CHAT_DMS: ChatChannel[] = [
    {
      id: "dm-elena",
      name: "Elena Rostova",
      callsign: "elena.wire",
      bureau: "Tippecanoe Desk",
      isGroup: false,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      description: "Civic open data & hydrology desk"
    },
    {
      id: "dm-marcus",
      name: "Marcus Vance",
      callsign: "vance.lead",
      bureau: "Wabash Rail Logistics",
      isGroup: false,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      description: "Route 63 transit & freight corridor"
    },
    {
      id: "dm-sarah",
      name: "Sarah Chen",
      callsign: "chen.data",
      bureau: "Civic Hydrology Wire",
      isGroup: false,
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      description: "Watershed telemetry & basin mapping"
    },
    {
      id: "dm-pamela",
      name: "Pamela Black",
      callsign: "glitterpop",
      bureau: "ChloReform Studios",
      isGroup: false,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      description: "Multimedia production & broadcast logistics"
    }
  ];

  const handleSendMessengerMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messengerInput.trim() && !messengerImageUrl.trim() && !messengerLinkUrl.trim()) return;
    if (blockedUserIds.has(activeChatId)) return;

    const newMsg: FieldMessage = {
      id: `msg-${Date.now()}`,
      chatId: activeChatId,
      sender: pressPass.name || "Victor Birkle",
      callsign: pressPass.callsign || "ViBiR",
      avatarUrl: pressPass.avatarUrl,
      text: messengerInput.trim(),
      imageUrl: messengerImageUrl.trim() || undefined,
      linkUrl: messengerLinkUrl.trim() || undefined,
      timestamp: "Just now"
    };

    const updated = [...messengerMessages, newMsg];
    setMessengerMessages(updated);
    setMessengerInput("");
    setMessengerImageUrl("");
    setMessengerLinkUrl("");
    setShowAttachImage(false);
    setShowAttachLink(false);

    try {
      localStorage.setItem("fieldpress_messenger_messages", JSON.stringify(updated));
    } catch {}
  };

  const handleToggleMessageReaction = (msgId: string, emoji: string) => {
    const updated = messengerMessages.map((m) => {
      if (m.id !== msgId) return m;
      const reactions = { ...(m.reactions || {}) };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...m, reactions };
    });
    setMessengerMessages(updated);
    try {
      localStorage.setItem("fieldpress_messenger_messages", JSON.stringify(updated));
    } catch {}
  };

  // Settings Sub-tab
  const [settingsActiveTab, setSettingsActiveTab] = useState<"quicklinks" | "profile" | "drafts" | "bookmarks" | "archives" | "appearance" | "system" | "admin" | "moderation">("quicklinks");

  // Press Pass State
  const [pressPass, setPressPass] = useState<PressPassData>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_press_pass");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRESS_PASS;
  });

  // Real admin status comes from the server-verified session
  // (authAccount.role === "super_admin"), set further down. The old
  // local-only check here matched on pressPass.email/callsign — which is
  // just client state anyone's browser can hold — so it's removed rather
  // than left around unused.

  const [editPassForm, setEditPassForm] = useState<PressPassData>(pressPass);
  const [savedSuccessToast, setSavedSuccessToast] = useState("");

  // --- Real cross-device accounts (email + password) ---
  const [authAccount, setAuthAccount] = useState<{
    id: string; email: string; callsign: string; name: string; bureau: string; avatarUrl: string; role: string; verifiedLocal?: boolean;
  } | null>(null);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup" | "forgot" | "reset" | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authCallsign, setAuthCallsign] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authAvatarFile, setAuthAvatarFile] = useState<File | null>(null);
  const authAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const [authResetToken, setAuthResetToken] = useState("");
  const [authResetSent, setAuthResetSent] = useState(false);
  const [authResetDone, setAuthResetDone] = useState(false);

  // Auto-open the reset modal if the user arrived via a reset-password
  // email link (?reset_token=...). Runs once on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset_token");
    if (token) {
      setAuthResetToken(token);
      setAuthModalMode("reset");
      // Strip the token from the visible URL so it isn't re-shared/bookmarked.
      params.delete("reset_token");
      const rest = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
    }
  }, []);

  // --- Admin: role management panel (super_admin only) ---
  const [adminUsers, setAdminUsers] = useState<Array<{
    id: string; email: string; callsign: string; name: string; bureau: string;
    avatar_url: string | null; role: string; verified_local?: boolean; created_at: string;
  }>>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");
  const [adminRoleUpdatingId, setAdminRoleUpdatingId] = useState<string | null>(null);
  const [adminVerifiedUpdatingId, setAdminVerifiedUpdatingId] = useState<string | null>(null);

  const loadAdminUsers = async () => {
    setAdminUsersLoading(true);
    setAdminUsersError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setAdminUsersError(data.error || "Failed to load users.");
        setAdminUsersLoading(false);
        return;
      }
      setAdminUsers(data.users || []);
    } catch {
      setAdminUsersError("Network error loading users.");
    }
    setAdminUsersLoading(false);
  };

  const updateUserRole = async (accountId: string, role: "super_admin" | "correspondent") => {
    setAdminRoleUpdatingId(accountId);
    setAdminUsersError("");
    try {
      const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, role })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminUsersError(data.error || "Failed to update role.");
        setAdminRoleUpdatingId(null);
        return;
      }
      setAdminUsers((prev) => prev.map((u) => (u.id === accountId ? { ...u, role: data.account.role } : u)));
      setSavedSuccessToast(`${data.account.callsign} is now ${data.account.role === "super_admin" ? "a super admin" : "a correspondent"}.`);
      setTimeout(() => setSavedSuccessToast(""), 2500);
    } catch {
      setAdminUsersError("Network error updating role.");
    }
    setAdminRoleUpdatingId(null);
  };

  const toggleVerifiedLocal = async (accountId: string, verifiedLocal: boolean) => {
    setAdminVerifiedUpdatingId(accountId);
    setAdminUsersError("");
    try {
      const res = await fetch("/api/admin/toggle-verified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, verifiedLocal })
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminUsersError(data.error || "Failed to update verified-local status.");
        setAdminVerifiedUpdatingId(null);
        return;
      }
      setAdminUsers((prev) => prev.map((u) => (u.id === accountId ? { ...u, verified_local: data.account.verified_local } : u)));
      setSavedSuccessToast(`${data.account.callsign} is ${data.account.verified_local ? "now a Verified Local Correspondent." : "no longer marked as verified local."}`);
      setTimeout(() => setSavedSuccessToast(""), 2500);
    } catch {
      setAdminUsersError("Network error updating verified-local status.");
    }
    setAdminVerifiedUpdatingId(null);
  };

  // --- Moderation queue (super_admin only): merges the reports intake
  // (#144/#171, live since #180 but never had a UI consumer) with
  // disputed dispatches (#146/#175, "Disputed" reaction crossing a
  // threshold). Two independent server signals, one screen. ---
  const [modReports, setModReports] = useState<Array<{
    id: string; target_type: string; target_id: string; reason: string; details: string;
    status: string; created_at: string; reporter_id: string; reporter_callsign: string;
  }>>([]);
  const [modDisputed, setModDisputed] = useState<Array<{
    dispatch_id: string; dispute_count: number; last_disputed_at: string;
  }>>([]);
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState("");
  const [modResolvingId, setModResolvingId] = useState<string | null>(null);

  const loadModerationData = async () => {
    setModLoading(true);
    setModError("");
    try {
      const [reportsRes, disputedRes] = await Promise.all([
        fetch("/api/reports/queue"),
        fetch("/api/reports/disputed")
      ]);
      const reportsData = await reportsRes.json();
      const disputedData = await disputedRes.json();
      if (!reportsRes.ok) {
        setModError(reportsData.error || "Failed to load reports.");
      } else {
        setModReports(reportsData.reports || []);
      }
      if (disputedRes.ok) {
        setModDisputed(disputedData.disputed || []);
      }
    } catch {
      setModError("Network error loading the moderation queue.");
    }
    setModLoading(false);
  };

  const resolveReport = async (reportId: string, status: "reviewed" | "dismissed") => {
    setModResolvingId(reportId);
    try {
      const res = await fetch("/api/reports/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status })
      });
      const data = await res.json();
      if (!res.ok) {
        setModError(data.error || "Failed to resolve report.");
        setModResolvingId(null);
        return;
      }
      setModReports((prev) => prev.filter((r) => r.id !== reportId));
      setSavedSuccessToast(status === "reviewed" ? "Report marked reviewed." : "Report dismissed.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    } catch {
      setModError("Network error resolving report.");
    }
    setModResolvingId(null);
  };

  const applyAccountToPressPass = (account: { callsign: string; name: string; bureau: string; avatarUrl: string; email: string; accentColor?: string }) => {
    setPressPass((prev) => {
      const next = { ...prev, name: account.name, callsign: account.callsign, bureau: account.bureau, avatarUrl: account.avatarUrl, email: account.email, accentColor: account.accentColor || prev.accentColor };
      try {
        localStorage.setItem("fieldpress_press_pass", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.account) {
          setAuthAccount(data.account);
          applyAccountToPressPass(data.account);
        } else {
          // No valid session. Don't trust a cached press pass from a
          // previous account on this device (e.g. an expired cookie
          // after someone else's session, or a stale admin persona
          // saved before this was fixed) — fall back to the neutral
          // guest identity instead.
          setPressPass(DEFAULT_PRESS_PASS);
          try {
            localStorage.removeItem("fieldpress_press_pass");
          } catch {}
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real DM threads + history (cohort-gated, text-only for v1 — the
  // messenger schema has no attachment columns). Group chat ("midwest-
  // bureau") is explicitly out of scope for this rewire and stays on the
  // old fake/local messengerMessages system below.
  type MessengerThread = {
    user: { id: string; callsign: string; name: string; bureau: string; avatarUrl?: string };
    lastMessage: { body: string; senderId: string; createdAt: string } | null;
    unreadCount: number;
  };
  type RealMessage = { id: string; senderId: string; body: string; readAt: string | null; createdAt: string };
  const [messengerThreads, setMessengerThreads] = useState<MessengerThread[]>([]);
  const [realMessages, setRealMessages] = useState<RealMessage[]>([]);
  const [realThreadLoading, setRealThreadLoading] = useState(false);
  const [realMessageSending, setRealMessageSending] = useState(false);

  const loadMessengerThreads = async () => {
    if (!authAccount) return;
    try {
      const res = await fetch("/api/messenger/threads");
      if (!res.ok) return;
      const data = await res.json();
      setMessengerThreads(data.threads || []);
    } catch {}
  };

  useEffect(() => {
    if (authAccount) loadMessengerThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAccount?.id]);

  const GROUP_CHAT_ID = "midwest-bureau";

  const loadRealThread = async (withId: string) => {
    setRealThreadLoading(true);
    try {
      const res = await fetch(`/api/messenger/thread?withId=${encodeURIComponent(withId)}`);
      if (res.ok) {
        const data = await res.json();
        setRealMessages(data.messages || []);
      } else {
        setRealMessages([]);
      }
    } catch {
      setRealMessages([]);
    }
    setRealThreadLoading(false);
  };

  const markThreadRead = async (withId: string) => {
    try {
      await fetch("/api/messenger/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withId })
      });
      setMessengerThreads((prev) => prev.map((t) => (t.user.id === withId ? { ...t, unreadCount: 0 } : t)));
    } catch {}
  };

  useEffect(() => {
    if (authAccount && activeChatId && activeChatId !== GROUP_CHAT_ID) {
      loadRealThread(activeChatId);
      markThreadRead(activeChatId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId, authAccount?.id]);

  const sendRealMessage = async (recipientId: string, body: string) => {
    const cleanBody = body.trim();
    if (!cleanBody) return;
    setRealMessageSending(true);
    try {
      const res = await fetch("/api/messenger/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, body: cleanBody })
      });
      const data = await res.json();
      if (!res.ok) {
        setSavedSuccessToast(data.error || "Couldn't send that message.");
        setTimeout(() => setSavedSuccessToast(""), 2500);
      } else {
        setRealMessages((prev) => [...prev, data.message]);
        setMessengerInput("");
        loadMessengerThreads();
      }
    } catch {
      setSavedSuccessToast("Network error sending message.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }
    setRealMessageSending(false);
  };


  // Real cohorts (accepted mutual requests) + pending requests, sourced
  // from the Neon-backed accounts system. Replaces the old system where
  // "establishing a cohort" just wrote a made-up entity into localStorage
  // with no other real account involved.
  const loadMyCohorts = async () => {
    if (!authAccount) return;
    try {
      const res = await fetch("/api/cohorts/mine");
      if (!res.ok) return;
      const data = await res.json();
      setCohorts(data.cohorts || []);
      setIncomingCohortRequests(data.incoming || []);
      setOutgoingCohortRequests(data.outgoing || []);
    } catch {}
  };

  useEffect(() => {
    if (authAccount) loadMyCohorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAccount?.id]);

  // Block/mute (closes issue #145 -- no block/mute mechanism existed for
  // other users, in messenger or cohorts). One-directional and unilateral:
  // no accept/decline. Enforcement is client-side (hide from contact list,
  // disable sending) since messenger history has no server-side table to
  // enforce against directly.
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const [blockActionPendingId, setBlockActionPendingId] = useState<string | null>(null);

  const loadMyBlocks = async () => {
    if (!authAccount) return;
    try {
      const res = await fetch("/api/cohorts/blockedMine");
      if (!res.ok) return;
      const data = await res.json();
      setBlockedUserIds(new Set(data.blockedIds || []));
    } catch {}
  };

  useEffect(() => {
    if (authAccount) loadMyBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAccount?.id]);

  const handleToggleBlock = async (userId: string) => {
    const isCurrentlyBlocked = blockedUserIds.has(userId);
    setBlockActionPendingId(userId);
    try {
      const res = await fetch(`/api/cohorts/${isCurrentlyBlocked ? "unblock" : "block"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ blockedId: userId })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSavedSuccessToast(body.error || "Couldn't update block.");
      } else {
        setBlockedUserIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlyBlocked) next.delete(userId);
          else next.add(userId);
          return next;
        });
        setSavedSuccessToast(isCurrentlyBlocked ? "Unblocked." : "Blocked. They're hidden from your messenger.");
        if (!isCurrentlyBlocked && activeChatId === userId) {
          setActiveChatId("midwest-bureau");
        }
      }
      setTimeout(() => setSavedSuccessToast(""), 2500);
    } catch {
      setSavedSuccessToast("Network error updating block.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }
    setBlockActionPendingId(null);
  };

  // Full, unfiltered directory (relation === "none" entries only matter
  // for suggestions) — loaded once per session for the Discover tab's
  // "suggested cohorts" scoring, separate from the query-driven directory
  // search box which re-fetches on every keystroke.
  const [directoryAll, setDirectoryAll] = useState<DirectoryUser[]>([]);
  const loadDirectoryAll = async () => {
    try {
      const res = await fetch("/api/cohorts/directory");
      if (!res.ok) return;
      const data = await res.json();
      setDirectoryAll(data.users || []);
    } catch {}
  };
  useEffect(() => {
    if (authAccount) loadDirectoryAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAccount?.id]);

  const searchCohortDirectory = async (query: string) => {
    if (!authAccount) return;
    setCohortDirectoryLoading(true);
    try {
      const res = await fetch(`/api/cohorts/directory?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) setCohortDirectoryResults(data.users || []);
    } catch {}
    setCohortDirectoryLoading(false);
  };

  const sendCohortRequest = async (recipientId: string) => {
    setCohortActionPendingId(recipientId);
    try {
      const res = await fetch("/api/cohorts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId })
      });
      const data = await res.json();
      if (!res.ok) {
        setSavedSuccessToast(data.error || "Couldn't send that request.");
      } else {
        setSavedSuccessToast("Cohort request sent.");
        setCohortDirectoryResults((prev) =>
          prev.map((u) => (u.id === recipientId ? { ...u, relation: "pending_sent", requestId: data.request.id } : u))
        );
        setDirectoryAll((prev) =>
          prev.map((u) => (u.id === recipientId ? { ...u, relation: "pending_sent", requestId: data.request.id } : u))
        );
        loadMyCohorts();
      }
      setTimeout(() => setSavedSuccessToast(""), 2500);
    } catch {
      setSavedSuccessToast("Network error sending request.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }
    setCohortActionPendingId(null);
  };

  const respondToCohortRequest = async (requestId: string, action: "accept" | "decline") => {
    setCohortActionPendingId(requestId);
    try {
      const res = await fetch("/api/cohorts/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action })
      });
      const data = await res.json();
      if (!res.ok) {
        setSavedSuccessToast(data.error || "Couldn't update that request.");
      } else {
        setSavedSuccessToast(action === "accept" ? "Cohort request accepted." : "Cohort request declined.");
        setIncomingCohortRequests((prev) => prev.filter((r) => r.requestId !== requestId));
        if (action === "accept") loadMyCohorts();
      }
      setTimeout(() => setSavedSuccessToast(""), 2500);
    } catch {
      setSavedSuccessToast("Network error updating request.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }
    setCohortActionPendingId(null);
  };

  const submitAuthForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const isSignup = authModalMode === "signup";
      const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignup
            ? { email: authEmail, password: authPassword, callsign: authCallsign, name: authName, bureau: pressPass.bureau }
            : { email: authEmail, password: authPassword }
        )
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Something went wrong. Please try again.");
        setAuthLoading(false);
        return;
      }
      setAuthAccount(data.account);
      applyAccountToPressPass(data.account);
      
      // If signup and user selected an avatar, upload it
      if (isSignup && authAvatarFile) {
        try {
          const uploadRes = await fetch("/api/upload-avatar", {
            method: "POST",
            body: authAvatarFile,
            headers: { "Content-Type": authAvatarFile.type }
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            // Update local account with new avatar URL
            const updatedAccount = { ...data.account, avatarUrl: uploadData.url };
            setAuthAccount(updatedAccount);
            applyAccountToPressPass(updatedAccount);
          }
        } catch (uploadErr) {
          // Avatar upload failed, but auth succeeded; log and continue
          console.error("Avatar upload failed:", uploadErr);
        }
      }
      
      setAuthModalMode(null);
      setAuthEmail("");
      setAuthPassword("");
      setAuthCallsign("");
      setAuthName("");
      setAuthAvatarFile(null);
      setSavedSuccessToast(isSignup ? "Account created. You're signed in on this device." : "Signed in.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    } catch {
      setAuthError("Network error. Please try again.");
    }
    setAuthLoading(false);
  };

  const submitForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail })
      });
      // Endpoint always returns a generic ok response by design, so we
      // just show the "check your email" state regardless of outcome.
      await res.json().catch(() => {});
      setAuthResetSent(true);
    } catch {
      setAuthError("Network error. Please try again.");
    }
    setAuthLoading(false);
  };

  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (authPassword.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: authResetToken, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Something went wrong. Please try again.");
        setAuthLoading(false);
        return;
      }
      setAuthResetDone(true);
      setAuthPassword("");
    } catch {
      setAuthError("Network error. Please try again.");
    }
    setAuthLoading(false);
  };

  const logOutAccount = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setAuthAccount(null);
    // Clear the locally-cached identity too — otherwise the previous
    // account's name/avatar/callsign stayed on screen (and in
    // localStorage) after logout, on this device and on any fresh
    // session that inherited it.
    setPressPass(DEFAULT_PRESS_PASS);
    try {
      localStorage.removeItem("fieldpress_press_pass");
    } catch {}
    setSavedSuccessToast("Signed out.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  // Live Dispatches & Press Roll (Staged Drafts) — now backed by Neon via
  // /api/dispatches, scoped per account_id instead of shared browser
  // localStorage. Starts empty and is populated as soon as the API
  // responds.
  const [dispatches, setDispatches] = useState<Dispatch[]>(INITIAL_DISPATCHES);
  const [dispatchesLoaded, setDispatchesLoaded] = useState<boolean>(false);

  // Feed pagination (#201) - the feed comes back a page (40) at a time via
  // a cursor rather than one flat capped request, so "Load More" keeps
  // working as dispatch volume grows instead of silently truncating.
  const [dispatchesCursor, setDispatchesCursor] = useState<string | null>(null);
  const [dispatchesHasMore, setDispatchesHasMore] = useState<boolean>(false);
  const [loadingMoreDispatches, setLoadingMoreDispatches] = useState<boolean>(false);

  const refreshPublicFeed = async () => {
    try {
      const res = await fetch("/api/dispatches");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.dispatches)) {
        setDispatches(data.dispatches.length > 0 ? data.dispatches : INITIAL_DISPATCHES);
      }
      setDispatchesCursor(typeof data.nextCursor === "string" ? data.nextCursor : null);
      setDispatchesHasMore(Boolean(data.nextCursor));
    } catch {
      // Network hiccup — keep whatever's currently shown.
    } finally {
      setDispatchesLoaded(true);
    }
  };

  const loadMoreDispatches = async () => {
    if (!dispatchesCursor || loadingMoreDispatches) return;
    setLoadingMoreDispatches(true);
    try {
      const res = await fetch(`/api/dispatches?cursor=${encodeURIComponent(dispatchesCursor)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.dispatches) && data.dispatches.length > 0) {
        setDispatches((prev) => {
          const seen = new Set(prev.map((d) => d.id));
          const fresh = data.dispatches.filter((d: Dispatch) => !seen.has(d.id));
          return [...prev, ...fresh];
        });
      }
      setDispatchesCursor(typeof data.nextCursor === "string" ? data.nextCursor : null);
      setDispatchesHasMore(Boolean(data.nextCursor));
    } catch {
      // Leave the cursor as-is so the user can just press "Load More" again.
    } finally {
      setLoadingMoreDispatches(false);
    }
  };

  const loadMoreSearchResults = async () => {
    if (!wireSearchCursor || loadingMoreSearch) return;
    const trimmed = wireSearchQuery.trim();
    if (!trimmed) return;
    setLoadingMoreSearch(true);
    try {
      const res = await fetch(`/api/dispatches?q=${encodeURIComponent(trimmed)}&cursor=${encodeURIComponent(wireSearchCursor)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.dispatches) && data.dispatches.length > 0) {
        setWireSearchResults((prev) => {
          const base = prev ?? [];
          const seen = new Set(base.map((d) => d.id));
          const fresh = data.dispatches.filter((d: Dispatch) => !seen.has(d.id));
          return [...base, ...fresh];
        });
      }
      setWireSearchCursor(typeof data.nextCursor === "string" ? data.nextCursor : null);
    } catch {
      // Leave the cursor as-is so the user can just press "Load More" again.
    } finally {
      setLoadingMoreSearch(false);
    }
  };

  useEffect(() => {
    refreshPublicFeed();
  }, []);

  // Deep-link routing: shared URLs point to `#dispatch-<id>`. Open the
  // matching dispatch on load and whenever the hash changes (e.g. the
  // person navigates back/forward, or opens a second share link in the
  // same tab). Falls back to a toast if the dispatch can't be found
  // (e.g. an old share link for a dispatch that has since been deleted).
  useEffect(() => {
    const openFromHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#dispatch-(.+)$/);
      if (!match) return;
      const targetId = decodeURIComponent(match[1]);
      const found = dispatches.find((d) => d.id === targetId) || pressRoll.find((d) => d.id === targetId);
      if (found) {
        setActiveTab("edition");
        setSelectedStory(found);
      } else {
        setSavedSuccessToast("That dispatch link couldn't be found — it may have expired.");
        setTimeout(() => setSavedSuccessToast(""), 3000);
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatches]);

  // --- Notifications: comments on the current user's own dispatches ---
  // Comment timestamps are free-text ("Just now"), not real dates, so we
  // can't detect "new since last visit" by time. Instead we track which
  // comment IDs have already been seen (IDs are unique & creation-ordered
  // via `cm-${Date.now()}`), which is robust regardless of timestamp text.
  const [seenCommentIds, setSeenCommentIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_notif_seen_ids");
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set();
  });
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const myDispatchIds = new Set(
    dispatches
      .filter((d) => d.author === pressPass.name || d.callsign === pressPass.callsign)
      .map((d) => d.id)
  );

  const notificationItems = Object.entries(allComments)
    .filter(([dispId]) => myDispatchIds.has(dispId))
    .flatMap(([dispId, comments]) =>
      comments
        .filter((c) => c.callsign !== pressPass.callsign)
        .map((c) => ({ ...c, dispatchId: dispId }))
    )
    .reverse(); // most recent first (comments are appended in order)

  const unseenNotifications = notificationItems.filter((n) => !seenCommentIds.has(n.id));

  // --- Server-backed notifications (#168): cohort requests/acceptances.
  // Unlike the comment notifications above, these are real Postgres rows
  // (fieldpress_notifications) so they're consistent across every device
  // the user signs into, not just the browser that received them.
  const [serverNotifications, setServerNotifications] = useState<Array<{
    id: string; type: "cohort_request" | "cohort_accepted";
    actor: { id: string; callsign: string; name: string; avatarUrl?: string };
    cohortRequestId?: string; read: boolean; createdAt: string;
  }>>([]);
  const [serverUnreadCount, setServerUnreadCount] = useState(0);

  const refreshServerNotifications = async () => {
    if (!authAccount) return;
    try {
      const res = await fetch("/api/notifications/mine");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        setServerNotifications(data.notifications);
        setServerUnreadCount(typeof data.unreadCount === "number" ? data.unreadCount : 0);
      }
    } catch {
      // Network hiccup — keep whatever's currently shown.
    }
  };

  useEffect(() => {
    if (!authAccount) {
      setServerNotifications([]);
      setServerUnreadCount(0);
      return;
    }
    refreshServerNotifications();
    // Light polling so a new cohort request/acceptance shows up without a
    // full page reload - notifications aren't latency-sensitive enough to
    // warrant a websocket for v1.
    const interval = setInterval(refreshServerNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authAccount?.id]);

  const markNotificationsSeen = () => {
    const allIds = new Set(seenCommentIds);
    notificationItems.forEach((n) => allIds.add(n.id));
    setSeenCommentIds(allIds);
    try {
      localStorage.setItem("fieldpress_notif_seen_ids", JSON.stringify(Array.from(allIds)));
    } catch {}

    if (serverUnreadCount > 0) {
      setServerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setServerUnreadCount(0);
      fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      }).catch(() => {
        // Best-effort — worst case the count re-syncs on the next poll.
      });
    }
  };

  // --- Suggested Cohorts: people to meet, ranked by real activity overlap
  // (comments on shared dispatches) plus shared beat/category interest.
  // Never surfaces anyone's precise location — only their general bureau,
  // and only if they've opted their provenance ping on.
  const suggestedCohorts = (() => {
    // My categories: what I've posted about + what I've commented on
    const myCategories = new Set<string>();
    dispatches
      .filter((d) => d.author === pressPass.name || d.callsign === pressPass.callsign)
      .forEach((d) => myCategories.add(d.category));
    Object.entries(allComments).forEach(([dispId, comments]) => {
      if (comments.some((c) => c.callsign === pressPass.callsign)) {
        const d = dispatches.find((x) => x.id === dispId);
        if (d) myCategories.add(d.category);
      }
    });

    // My commenters + people whose dispatches I've commented on = activity overlap
    const activityOverlap = new Map<string, number>();
    Object.entries(allComments).forEach(([dispId, comments]) => {
      const dispatch = dispatches.find((d) => d.id === dispId);
      const iCommentedHere = comments.some((c) => c.callsign === pressPass.callsign);
      const isMyDispatch = dispatch && (dispatch.author === pressPass.name || dispatch.callsign === pressPass.callsign);
      comments.forEach((c) => {
        if (c.callsign === pressPass.callsign) return;
        if (isMyDispatch || iCommentedHere) {
          activityOverlap.set(c.callsign, (activityOverlap.get(c.callsign) || 0) + 1);
        }
      });
    });

    const candidates = directoryAll.filter((u) => u.relation === "none" && u.callsign !== pressPass.callsign);

    const scored = candidates.map((u) => {
      // Shared categories: what this person has posted or commented on
      const theirCategories = new Set<string>();
      dispatches
        .filter((d) => d.author === u.name || d.callsign === u.callsign)
        .forEach((d) => theirCategories.add(d.category));
      Object.entries(allComments).forEach(([dispId, comments]) => {
        if (comments.some((c) => c.callsign === u.callsign)) {
          const d = dispatches.find((x) => x.id === dispId);
          if (d) theirCategories.add(d.category);
        }
      });
      const sharedCategories = [...myCategories].filter((c) => theirCategories.has(c));

      const activityScore = activityOverlap.get(u.callsign) || 0;
      const interestScore = sharedCategories.length;
      const score = activityScore * 2 + interestScore;

      const reasons: string[] = [];
      if (activityScore > 0) reasons.push("Engaged with your dispatches");
      if (sharedCategories.length > 0) reasons.push(`Covers ${sharedCategories.slice(0, 2).join(", ")}`);

      return { user: u, score, reasons, sharedCategories };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  })();

  // --- Correspondent card: click any commenter's identity to view/request a
  // cohort with them. Comments only carry {name, callsign} text (no
  // accountId), so on open we resolve the callsign against the real
  // account directory to find the actual fieldpress_accounts.id and
  // current relation (none / pending_sent / pending_received / cohort)
  // before offering any action. This replaces the old fake system, which
  // never needed a real account since it just wrote a synthetic local
  // user into localStorage on click.
  const [correspondentPopover, setCorrespondentPopover] = useState<{ name: string; callsign: string } | null>(null);
  const [correspondentResolved, setCorrespondentResolved] = useState<DirectoryUser | null>(null);
  const [correspondentResolveState, setCorrespondentResolveState] = useState<"idle" | "loading" | "found" | "not_found">("idle");

  const openCorrespondentFromComment = (name: string, callsign: string) => {
    if (callsign === pressPass.callsign) return; // don't offer to link yourself
    setCorrespondentPopover({ name, callsign });
    setCorrespondentResolved(null);
    setCorrespondentResolveState("loading");
    fetch(`/api/cohorts/directory?query=${encodeURIComponent(callsign)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const match = (data.users || []).find(
          (u: DirectoryUser) => u.callsign.toLowerCase() === callsign.toLowerCase()
        );
        if (match) {
          setCorrespondentResolved(match);
          setCorrespondentResolveState("found");
        } else {
          setCorrespondentResolveState("not_found");
        }
      })
      .catch(() => setCorrespondentResolveState("not_found"));
  };

  const requestCohortFromPopover = () => {
    if (!correspondentResolved) return;
    sendCohortRequest(correspondentResolved.id);
    setCorrespondentResolved({ ...correspondentResolved, relation: "pending_sent" });
  };

  const messageFromPopover = () => {
    if (!correspondentResolved || correspondentResolved.relation !== "cohort") return;
    setActiveChatId(correspondentResolved.id);
    setCorrespondentPopover(null);
    setShowMessengerModal(true);
  };

  // --- Global search: searches all dispatches regardless of active tab ---
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const globalSearchResults = globalSearchQuery.trim()
    ? dispatches
        .filter((d) => {
          const q = globalSearchQuery.toLowerCase();
          return (
            d.title.toLowerCase().includes(q) ||
            d.content.toLowerCase().includes(q) ||
            d.location.toLowerCase().includes(q) ||
            d.author.toLowerCase().includes(q)
          );
        })
        .slice(0, 8)
    : [];

  const [pressRoll, setPressRoll] = useState<Dispatch[]>([]);

  // Press Roll is account-scoped now, so it only exists once someone is
  // signed in. Fetch on login; clear on logout so the previous account's
  // drafts never leak into the next session on a shared browser.
  useEffect(() => {
    if (!authAccount) {
      setPressRoll([]);
      return;
    }
    let isMounted = true;
    fetch("/api/dispatches?mine=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        const mine: Dispatch[] = Array.isArray(data.dispatches) ? data.dispatches : [];
        setPressRoll(mine.filter((d) => d.isPressRoll));
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [authAccount]);

  // Saved Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_bookmarks");
      if (saved) return JSON.parse(saved);
    } catch {}
    return ["d-1"];
  });

  // Classifieds List
  const [classifiedsList, setClassifiedsList] = useState<ClassifiedItem[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_classifieds");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CLASSIFIEDS;
  });

  // Wire Filter & Search State
  const [wireCategoryFilter, setWireCategoryFilter] = useState<string>("ALL");
  const [wireSearchQuery, setWireSearchQuery] = useState<string>("");
  // Server-side search results (#153/#169). The base `dispatches` feed is
  // capped to the most recent 200 rows, so a non-empty search query is
  // sent to the server to search the full table instead of just filtering
  // whatever happens to be cached client-side.
  const [wireSearchResults, setWireSearchResults] = useState<Dispatch[] | null>(null);
  const [wireSearchLoading, setWireSearchLoading] = useState<boolean>(false);
  // Search results are themselves cursor-paginated now (#201) - a query
  // that matches more than one page just shows "Load More" rather than
  // silently dropping everything past the old flat cap.
  const [wireSearchCursor, setWireSearchCursor] = useState<string | null>(null);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState<boolean>(false);

  useEffect(() => {
    const trimmed = wireSearchQuery.trim();
    if (!trimmed) {
      setWireSearchResults(null);
      setWireSearchLoading(false);
      setWireSearchCursor(null);
      return;
    }
    setWireSearchLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/dispatches?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.dispatches)) {
          setWireSearchResults(data.dispatches);
        }
        setWireSearchCursor(typeof data.nextCursor === "string" ? data.nextCursor : null);
      } catch {
        // Network hiccup — leave the previous results/local filter in place.
      } finally {
        setWireSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [wireSearchQuery]);

  // Syncing Indicator State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  // Pressie Builder Form State
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  // Separate from editingDraftId: set when editing an already-published
  // dispatch (owner editing) rather than promoting a staged Press Roll
  // draft. The two need different save semantics -- promoting a draft
  // deletes the draft row and creates a new published row, while owner
  // editing must PUT in place so the dispatch keeps its id, createdAt,
  // and anything (forks, shares) already pointing at it.
  const [editingPublishedId, setEditingPublishedId] = useState<string | null>(null);
  const [forkParentId, setForkParentId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Field Dispatch");
  const [newLocation, setNewLocation] = useState("Midwest Corridor");
  const [newContent, setNewContent] = useState("");
  const [newCoordinates, setNewCoordinates] = useState<string>("-87.6298, 40.1245");
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const [newImageCaption, setNewImageCaption] = useState<string>("");
  const [visualPrompt, setVisualPrompt] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [evidenceGallery, setEvidenceGallery] = useState<
    Array<{ id: string; url: string; source: "ai" | "upload"; caption?: string; timestamp: string }>
  >([]);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [manualImageUrl, setManualImageUrl] = useState<string>("");

  // Notice Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeTag, setNoticeTag] = useState("NOTICE");
  const [noticeDetails, setNoticeDetails] = useState("");
  const [noticeContact, setNoticeContact] = useState("");

  // System Settings State
  const [autoRefreshInterval, setAutoRefreshInterval] = useState("30s");
  const [defaultBeat, setDefaultBeat] = useState("Midwest Corridor (IL / IN)");
  const [offlineCacheEnabled, setOfflineCacheEnabled] = useState(true);

  // References
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);

  const getAccentColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return {
          bar: "bg-emerald-500",
          text: "text-emerald-400",
          border: "border-emerald-500/50",
          badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          btn: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
        };
      case "cyan":
        return {
          bar: "bg-cyan-500",
          text: "text-cyan-400",
          border: "border-cyan-500/50",
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          btn: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950"
        };
      case "rose":
        return {
          bar: "bg-rose-500",
          text: "text-rose-400",
          border: "border-rose-500/50",
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          btn: "bg-rose-500 hover:bg-rose-400 text-zinc-950"
        };
      case "zinc":
        return {
          bar: "bg-zinc-400",
          text: "text-zinc-300",
          border: "border-zinc-500/50",
          badge: "bg-zinc-800 text-zinc-300 border-zinc-600",
          btn: "bg-zinc-300 hover:bg-zinc-200 text-zinc-950"
        };
      case "amber":
      default:
        return {
          bar: "bg-amber-500",
          text: "text-amber-400",
          border: "border-amber-500/50",
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          btn: "bg-amber-500 hover:bg-amber-400 text-zinc-950"
        };
    }
  };

// Reactions & Commentary are reactively synchronized via getCommentsForDispatch and getReactsForDispatch

  const currentAccent = getAccentColorClasses(pressPass.accentColor);
  // Live preview inside the Edit Press Pass modal must reflect the color
  // the user is actively selecting in the form (editPassForm), not the
  // already-saved pressPass value — otherwise clicking a swatch appears
  // to do nothing until after Save.
  const editPreviewAccent = getAccentColorClasses(editPassForm.accentColor);

  const isDark = theme === "dark";
  const inputThemeClass = isDark
    ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
    : "bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 shadow-xs";
  const cardThemeClass = isDark
    ? "bg-zinc-900/60 border-zinc-800 text-zinc-100"
    : "bg-white border-zinc-200 text-zinc-900 shadow-xs";
  const subCardThemeClass = isDark
    ? "bg-zinc-950/40 border-zinc-800"
    : "bg-zinc-50 border-zinc-200";
  const borderThemeClass = isDark ? "border-zinc-800" : "border-zinc-200";
  const subTextThemeClass = isDark ? "text-zinc-400" : "text-zinc-600";

  // Photo Avatar Handler — uploads immediately to durable storage (Vercel
  // Blob) and persists to the account server-side, rather than holding a
  // local-only base64 preview. The old version looked like it worked (it
  // updated editPassForm/localStorage) but never touched the database, so
  // the photo vanished the moment a fresh tab re-fetched /api/auth/me.
  const [avatarUploading, setAvatarUploading] = useState(false);
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show an immediate local preview while the real upload is in flight.
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) setEditPassForm((prev) => ({ ...prev, avatarUrl: result }));
    };
    reader.readAsDataURL(file);

    if (!authAccount) {
      // Guest editing a local-only press pass: no account to persist
      // to server-side, so the local preview + localStorage save is all
      // there is. Nothing further to do here.
      return;
    }

    setAvatarUploading(true);
    try {
      const uploadRes = await fetch("/api/upload-avatar", {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type }
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        setEditPassForm((prev) => ({ ...prev, avatarUrl: uploadData.url }));
        setAuthAccount((prev) => (prev ? { ...prev, avatarUrl: uploadData.url } : prev));
      } else {
        setSavedSuccessToast("Photo upload failed. Please try again.");
        setTimeout(() => setSavedSuccessToast(""), 3000);
      }
    } catch {
      setSavedSuccessToast("Photo upload failed. Please try again.");
      setTimeout(() => setSavedSuccessToast(""), 3000);
    }
    setAvatarUploading(false);
  };

  // Save Press Pass Credentials — persists name/callsign/bureau to the
  // account server-side when signed in, in addition to local state and
  // localStorage. The old version only did the latter two, which meant
  // edits looked saved but were silently reverted by the /api/auth/me
  // fetch on the next page load (which pulls those fields straight from
  // the DB row, unchanged since signup).
  const [pressPassSaving, setPressPassSaving] = useState(false);
  const savePass = async (newData: PressPassData) => {
    // Local state + localStorage save first so guests (no account) and
    // local-only fields (accent color, provenance ping, etc.) still work
    // exactly as before.
    setPressPass(newData);
    try {
      localStorage.setItem("fieldpress_press_pass", JSON.stringify(newData));
    } catch {}

    if (!authAccount) {
      setSavedSuccessToast("Press Pass credentials & badge updated.");
      setTimeout(() => setSavedSuccessToast(""), 3000);
      return;
    }

    setPressPassSaving(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newData.name, callsign: newData.callsign, bureau: newData.bureau, accentColor: newData.accentColor })
      });
      const data = await res.json();
      if (!res.ok) {
        setSavedSuccessToast(data.error || "Saved locally, but couldn't sync to your account.");
        setTimeout(() => setSavedSuccessToast(""), 4000);
        setPressPassSaving(false);
        return;
      }
      setAuthAccount(data.account);
      setSavedSuccessToast("Press Pass credentials & badge updated.");
      setTimeout(() => setSavedSuccessToast(""), 3000);
    } catch {
      setSavedSuccessToast("Saved locally, but couldn't sync to your account (network error).");
      setTimeout(() => setSavedSuccessToast(""), 4000);
    }
    setPressPassSaving(false);
  };

  // Image helpers for Pressie Builder
  const handleDownloadImage = (url: string, namePrefix = "fieldpress-evidence") => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${namePrefix}-${Date.now()}.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const item = {
          id: "upload-" + Date.now(),
          url: dataUrl,
          source: "upload" as const,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setEvidenceGallery((prev) => [item, ...prev.slice(0, 8)]);
        setNewImageUrl(dataUrl);
        setNewImageCaption(item.caption);
        setSavedSuccessToast("Evidence photo attached to gallery.");
        setTimeout(() => setSavedSuccessToast(""), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!manualImageUrl.trim()) return;
    const item = {
      id: "url-" + Date.now(),
      url: manualImageUrl.trim(),
      source: "upload" as const,
      caption: "Field media link",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setEvidenceGallery((prev) => [item, ...prev.slice(0, 8)]);
    setNewImageUrl(manualImageUrl.trim());
    setNewImageCaption("Field media link");
    setManualImageUrl("");
    setShowUrlInput(false);
    setSavedSuccessToast("Image URL linked to evidence tray.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const handleRemoveGalleryImage = (idToRemove: string) => {
    setEvidenceGallery((prev) => {
      const next = prev.filter((it) => it.id !== idToRemove);
      if (next.length > 0) {
        setNewImageUrl(next[0].url);
        setNewImageCaption(next[0].caption || "");
      } else {
        setNewImageUrl("");
        setNewImageCaption("");
      }
      return next;
    });
  };

  // AI Visual Generator with graceful fallback
  const generateVisual = async (customPrompt?: string) => {
    if (dailyGenCount >= 13) {
      setFormValidationError("Daily limit of 13 visual generations reached. Quota resets at midnight Chicago time.");
      return;
    }

    const rawPrompt = customPrompt || visualPrompt || newTitle;
    if (!rawPrompt.trim()) {
      setFormValidationError("Please enter a headline or visual framing brief first.");
      return;
    }

    setIsGeneratingImage(true);
    setFormValidationError(null);

    try {
      const cleanPrompt = rawPrompt.trim();
      const seed = Math.floor(Math.random() * 1000000);
      const lower = cleanPrompt.toLowerCase();

      // Diverse authentic documentary photojournalism fallbacks (NO gaming controllers!)
      const documentaryPool = [
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&h=675&q=80", // Power grid / substations
        "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&h=675&q=80", // Rail lines / train corridor
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&h=675&q=80", // Cartography & topographical
        "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&h=675&q=80", // Fiber & telecom cables
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&h=675&q=80", // Industrial edge equipment
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&h=675&q=80", // Field workstation & communications
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80"  // Satellite & telemetry globe
      ];

      let editorialFallback = documentaryPool[Math.floor(Math.random() * documentaryPool.length)];
      if (lower.includes("rail") || lower.includes("train") || lower.includes("transit")) {
        editorialFallback = "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&h=675&q=80";
      } else if (lower.includes("power") || lower.includes("substation") || lower.includes("electric")) {
        editorialFallback = "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&h=675&q=80";
      } else if (lower.includes("water") || lower.includes("river") || lower.includes("drainage")) {
        editorialFallback = "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&h=675&q=80";
      }

      const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        cleanPrompt + ", 35mm documentary photojournalism, authentic press wire still, Reuters standard"
      )}?width=1200&height=675&nologo=true&seed=${seed}`;

      const resolvedUrl = await new Promise<string>((resolve) => {
        const img = new Image();
        let settled = false;
        img.onload = () => {
          if (!settled) {
            settled = true;
            resolve(aiUrl);
          }
        };
        img.onerror = () => {
          if (!settled) {
            settled = true;
            resolve(editorialFallback);
          }
        };
        setTimeout(() => {
          if (!settled) {
            settled = true;
            resolve(editorialFallback);
          }
        }, 8000);
        img.src = aiUrl;
      });

      const newItem = {
        id: "ai-" + Date.now(),
        url: resolvedUrl,
        source: "ai" as const,
        caption: `Documentary still: ${cleanPrompt.slice(0, 60)}...`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setEvidenceGallery((prev) => [newItem, ...prev.slice(0, 8)]);
      setNewImageUrl(resolvedUrl);
      setNewImageCaption(newItem.caption);
      recordGeneration();
      setSavedSuccessToast(`Editorial visual rendered (${13 - (dailyGenCount + 1)} left today).`);
      setTimeout(() => setSavedSuccessToast(""), 3000);
    } catch {
      setFormValidationError("Failed to generate visual. Please try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const autoDraftVisualBrief = () => {
    if (!newTitle.trim()) return;
    const generatedBrief = `${newTitle.trim()} on site in ${newLocation}, documentary photojournalism`;
    setVisualPrompt(generatedBrief);
    generateVisual(generatedBrief);
  };

  // =========================================================================
  // CREATE PRESSIE HANDLER (OPENS THE PRESSIE BUILDER MODAL - IMAGE 2)
  // CRITICAL: NEVER opens the Press Pass Credential Editor!
  // =========================================================================
  const openCreatePressie = (draftToEdit?: Dispatch) => {
    // Always clear a stale published-edit id first. openEditPublished
    // calls this function then sets editingPublishedId immediately after,
    // so this only matters for every other entry point (new dispatch,
    // editing a staged draft) where it must not carry over.
    setEditingPublishedId(null);
    if (draftToEdit) {
      setEditingDraftId(draftToEdit.id);
      setForkParentId(null);
      setNewTitle(draftToEdit.title.replace(/^Draft:\s*/i, ""));
      setNewCategory(draftToEdit.category || "Field Dispatch");
      setNewLocation(draftToEdit.location || "Midwest Corridor");
      setNewContent(draftToEdit.content || "");
      setNewImageUrl(draftToEdit.imageUrl || "");
      setNewImageCaption(draftToEdit.imageCaption || "");
      setVisualPrompt(draftToEdit.title || "");
      if (draftToEdit.imageUrl) {
        setEvidenceGallery([{
          id: "init-" + Date.now(),
          url: draftToEdit.imageUrl,
          source: "upload",
          caption: draftToEdit.imageCaption || "",
          timestamp: "Original"
        }]);
      } else {
        setEvidenceGallery([]);
      }
      if (draftToEdit.coordinates) {
        setNewCoordinates(`${draftToEdit.coordinates[0]}, ${draftToEdit.coordinates[1]}`);
      }
    } else {
      setEditingDraftId(null);
      setForkParentId(null);
      setNewTitle("");
      setNewCategory("Field Dispatch");
      setNewLocation("Midwest Corridor");
      setNewContent("");
      setNewImageUrl("");
      setNewImageCaption("");
      setVisualPrompt("");
      setEvidenceGallery([]);
      setShowUrlInput(false);
      setManualImageUrl("");
      setNewCoordinates("-87.6298, 40.1245");
    }
    setFormValidationError(null);
    setShowPressPassModal(false); // ENSURE PRESS PASS IS NOT OPEN
    setShowPressieBuilderModal(true); // OPEN EXACT PRESSIE BUILDER
  };

  // Owner Editing: open the same composer, pre-filled from a published
  // dispatch, but tagged as editingPublishedId rather than editingDraftId
  // so the save handler PUTs the existing row instead of creating a new
  // one or running the draft-promotion delete flow.
  const openEditPublished = (dispatch: Dispatch) => {
    // openCreatePressie(dispatch) pre-fills the form from `dispatch`, but
    // it treats its argument as a *draft* being edited and sets
    // editingDraftId to dispatch.id as a side effect - so a
    // setEditingDraftId(null) placed *before* this call gets clobbered.
    // That used to leave editingDraftId === editingPublishedId (same id),
    // which made handleCreatePressie PUT the update and then immediately
    // run its "delete the promoted draft" cleanup on that same id -
    // silently deleting the dispatch right after publishing the edit.
    // Clearing editingDraftId *after* the pre-fill is what actually takes
    // effect.
    openCreatePressie(dispatch);
    setEditingDraftId(null);
    setEditingPublishedId(dispatch.id);
  };

  // =========================================================================
  // PRESS PASS EDITOR HANDLER (OPENS THE ID BADGE CUSTOMIZER - IMAGE 1)
  // =========================================================================
  const openPressPassEditor = () => {
    setEditPassForm(pressPass);
    setShowPressieBuilderModal(false); // Close Pressie Builder
    setShowPressPassModal(true); // Open Press Pass Credential Studio
  };

  // Dispatch IDs: Fp_ + 13 digits (matches the site's Fp_ branding).
  // Date.now() is 13 digits through the year 2286, so this is stable for
  // the foreseeable future without needing padding logic.
  const generateDispatchId = () => `Fp_${Date.now()}`;

  // Save Draft Handler (Stage to Press Roll)
  const handleSaveDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authAccount) {
      setFormValidationError("Sign in to stage a draft.");
      return;
    }
    if (!newTitle.trim() && !newContent.trim()) {
      setFormValidationError("Please enter at least a title or draft notes to stage.");
      return;
    }

    const titleText = newTitle.trim() || "Untitled Draft Dispatch";
    const finalTitle = titleText.toLowerCase().startsWith("draft:") ? titleText : `Draft: ${titleText}`;

    let parsedCoords: [number, number] | undefined = undefined;
    if (newCoordinates.includes(",")) {
      const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedCoords = [parts[0], parts[1]];
      }
    }

    const draftItem: Dispatch = {
      id: editingDraftId || generateDispatchId(),
      title: finalTitle,
      category: newCategory,
      author: pressPass.name,
      callsign: pressPass.callsign,
      bureau: pressPass.bureau,
      timestamp: "Staged Draft",
      location: newLocation.trim() || "Midwest Corridor",
      coordinates: parsedCoords,
      content: newContent.trim(),
      imageUrl: newImageUrl || undefined,
      imageCaption: newImageCaption || undefined,
      isPressRoll: true
    };

    try {
      const res = await fetch("/api/dispatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draftItem, isPressRoll: true })
      });
      if (!res.ok) throw new Error("save failed");
      const { dispatch: saved } = await res.json();

      const updated: Dispatch[] = editingDraftId
        ? pressRoll.map((p) => (p.id === editingDraftId ? saved : p))
        : [saved, ...pressRoll];
      setPressRoll(updated);

      setShowPressieBuilderModal(false);
      setFormValidationError(null);
      setSavedSuccessToast("Dispatch staged to Press Roll.");
      setTimeout(() => setSavedSuccessToast(""), 3500);
    } catch {
      setFormValidationError("Couldn't save the draft — check your connection and try again.");
    }
  };

  // Publish to Live Feed Handler
  const handleCreatePressie = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingPressie) return;
    if (!newTitle.trim()) {
      setFormValidationError("Please enter a headline for your dispatch.");
      return;
    }
    if (!authAccount) {
      setFormValidationError("Sign in to publish a dispatch.");
      return;
    }
    setIsSubmittingPressie(true);

    const fallbackContent = newContent.trim() || visualPrompt.trim() || `Field dispatch filed from ${pressPass.bureau || "Midwest Corridor"} by ${pressPass.name}.`;

    let parsedCoords: [number, number] | undefined = pressPass.coordinates || [-87.6298, 40.1245];
    if (newCoordinates.includes(",")) {
      const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedCoords = [parts[0], parts[1]];
      }
    }

    const chosenImage = newImageUrl || (evidenceGallery.length > 0 ? evidenceGallery[0].url : undefined);
    const chosenCaption = newImageCaption || (evidenceGallery.length > 0 ? evidenceGallery[0].caption : undefined);

    const pressieItem: Dispatch = {
      id: editingPublishedId || generateDispatchId(),
      title: newTitle.trim(),
      category: "Field Dispatch",
      author: pressPass.name,
      callsign: pressPass.callsign,
      bureau: pressPass.bureau,
      timestamp: "Just now",
      location: pressPass.location || pressPass.bureau || "Midwest Corridor",
      coordinates: parsedCoords,
      content: fallbackContent,
      imageUrl: chosenImage,
      imageCaption: chosenCaption,
      isPressRoll: false,
      editionStyle: newEditionStyle,
      sharingOption: newSharingOption,
      parentDispatchId: forkParentId || undefined
    };

    setForkParentId(null);
    try {
      // Owner editing an already-published dispatch PUTs in place;
      // everything else (new dispatch, or promoting a staged draft)
      // POSTs a new row.
      const res = editingPublishedId
        ? await fetch(`/api/dispatches/${editingPublishedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...pressieItem, isPressRoll: false })
          })
        : await fetch("/api/dispatches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...pressieItem, isPressRoll: false })
          });
      if (!res.ok) throw new Error(editingPublishedId ? "update failed" : "publish failed");
      const { dispatch: published } = await res.json();

      if (editingDraftId) {
        // Promoting a staged draft: remove it from the press roll both
        // server-side and locally. Only drop it from local state once the
        // server confirms the delete — previously this removed it
        // optimistically regardless of outcome, so a failed request left
        // an orphaned duplicate row in fieldpress_dispatches that was
        // invisible client-side (same silent-failure shape as other
        // fixes in this codebase; see repo notes on .catch(() => {})).
        try {
          const delRes = await fetch(`/api/dispatches/${editingDraftId}`, { method: "DELETE" });
          if (delRes.ok) {
            setPressRoll((prev) => prev.filter((p) => p.id !== editingDraftId));
          } else {
            setSavedSuccessToast("Published, but couldn't clear the draft copy — check your Press Roll.");
            setTimeout(() => setSavedSuccessToast(""), 4000);
          }
        } catch {
          setSavedSuccessToast("Published, but couldn't clear the draft copy — check your Press Roll.");
          setTimeout(() => setSavedSuccessToast(""), 4000);
        }
      }

      if (editingPublishedId) {
        setDispatches((prev) => prev.map((d) => (d.id === editingPublishedId ? published : d)));
      } else {
        setDispatches((prev) => [published, ...prev]);
      }

      setShowPressieBuilderModal(false);
      setFormValidationError(null);
      setSavedSuccessToast(editingPublishedId ? "Dispatch updated." : "Dispatch published to Front-Page Feed!");
      if (!editingPublishedId) {
        setActiveTab("edition"); // Immediately show at top of front-page edition, for new publishes only.
      }
      setEditingPublishedId(null);
      setTimeout(() => setSavedSuccessToast(""), 3500);
    } catch {
      setFormValidationError("Couldn't publish — check your connection and try again.");
    } finally {
      setIsSubmittingPressie(false);
    }
  };

  const deleteDraft = async (id: string) => {
    const previous = pressRoll;
    setPressRoll((prev) => prev.filter((p) => p.id !== id));
    setSavedSuccessToast("Draft removed from Press Roll.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
    try {
      const res = await fetch(`/api/dispatches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      // Roll back the optimistic removal if the server didn't confirm it.
      setPressRoll(previous);
      setSavedSuccessToast("Couldn't remove the draft — try again.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }
  };

  const toggleBookmark = (id: string) => {
    const isBookmarked = bookmarks.includes(id);
    const updated = isBookmarked ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    try {
      localStorage.setItem("fieldpress_bookmarks", JSON.stringify(updated));
    } catch {}
    setSavedSuccessToast(isBookmarked ? "Article removed from bookmarks." : "Article bookmarked in local storage.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const handleShareStory = (disp: Dispatch) => {
    setShareModalStory(disp);
    const shareUrl = `${buildDispatchShareUrl(disp.id)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setSavedSuccessToast("Pressie link copied & social hub opened.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const handleForkPressie = (parent: Dispatch) => {
    openCreatePressie();
    setForkParentId(parent.id);
    setNewTitle(`Fork: ${parent.title}`);
    setNewEditionStyle(parent.editionStyle || "tactical");
    setNewContent(`\n\n---\n[Forked from @${parent.callsign} (${parent.author}) • Original: "${parent.title}"]`);
    if (parent.imageUrl) {
      setNewImageUrl(parent.imageUrl);
      setNewImageCaption(parent.imageCaption || "Source visual from parent dispatch");
      setEvidenceGallery([{
        id: "parent-" + Date.now(),
        url: parent.imageUrl,
        source: "upload",
        caption: parent.imageCaption,
        timestamp: "Parent Still"
      }]);
    }
    setSavedSuccessToast(`Forking "${parent.title}". Ready to branch in builder.`);
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  // =========================================================================
  // REPOST TO WIRE (FACEBOOK-STYLE SHARE-WITHOUT-FORKING, BYLINE PRESERVED)
  // =========================================================================
  const handleRepostToWire = (original: Dispatch) => {
    if (original.author === pressPass.name || original.callsign === pressPass.callsign) {
      setSavedSuccessToast("This is already your dispatch.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
      return;
    }
    const alreadyReposted = dispatches.some(
      (d) => d.repostOf === original.id && d.repostedByCallsign === pressPass.callsign
    );
    if (alreadyReposted) {
      setSavedSuccessToast("You've already shared this dispatch to your Wire.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
      return;
    }
    const sourceId = original.repostOf || original.id;
    const repostItem: Dispatch = {
      ...original,
      id: `repost-${Date.now()}`,
      repostOf: sourceId,
      repostedByName: pressPass.name,
      repostedByCallsign: pressPass.callsign,
      timestamp: "Just now",
      isPressRoll: false
    };
    const updatedDispatches = [repostItem, ...dispatches];
    setDispatches(updatedDispatches);
    try {
      localStorage.setItem("fieldpress_dispatches", JSON.stringify(updatedDispatches));
    } catch {}
    setShareModalStory(null);
    setSavedSuccessToast(`Shared to your Wire — @${original.callsign}'s byline preserved.`);
    setActiveTab("edition");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const handleSyncFeeds = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setSavedSuccessToast("Feeds synchronized with regional edge node.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }, 800);
  };

  const exportUserArchives = () => {
    const archiveData = {
      reporter: pressPass,
      dispatches: dispatches.filter((d) => d.author === pressPass.name || d.callsign === pressPass.callsign),
      pressRoll: pressRoll,
      bookmarks: bookmarks,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fieldpress-archive-${pressPass.callsign}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSavedSuccessToast("User archives downloaded.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeDetails.trim()) return;

    let tagColor: "amber" | "emerald" | "cyan" | "rose" = "amber";
    if (noticeTag === "EQUIPMENT") tagColor = "emerald";
    else if (noticeTag === "TRANSIT") tagColor = "cyan";
    else if (noticeTag === "ALERT") tagColor = "rose";

    const newItem: ClassifiedItem = {
      id: `c-${Date.now()}`,
      tag: noticeTag,
      tagColor: tagColor,
      title: noticeTitle.trim(),
      details: noticeDetails.trim(),
      contact: noticeContact.trim() || `@${pressPass.callsign}`,
      timestamp: "Just now"
    };

    const updated = [newItem, ...classifiedsList];
    setClassifiedsList(updated);
    try {
      localStorage.setItem("fieldpress_classifieds", JSON.stringify(updated));
    } catch {}

    setNoticeTitle("");
    setNoticeDetails("");
    setNoticeContact("");
    setShowPostNoticeModal(false);
    setSavedSuccessToast("Community bulletin posted.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  // MapLibre Initialization
  useEffect(() => {
    if (activeTab === "map" && mapContainerRef.current && !mapInstanceRef.current) {
      try {
        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "&copy; OpenStreetMap contributors"
              }
            },
            layers: [
              {
                id: "osm-tiles",
                type: "raster",
                source: "osm",
                minzoom: 0,
                maxzoom: 19
              }
            ]
          },
          center: [-87.6298, 40.1245],
          zoom: 7.5
        });

        dispatches.forEach((d) => {
          if (d.coordinates) {
            const marker = new maplibregl.Marker({ color: "#f59e0b" })
              .setLngLat(d.coordinates)
              .setPopup(
                new maplibregl.Popup({ offset: 25 }).setHTML(
                  `<div style="font-family: monospace; font-size: 12px; color: #09090b; padding: 4px;">
                    <strong>${d.title}</strong><br/>
                    <span style="color:#d97706;">[${d.location}]</span> - ${d.author}
                  </div>`
                )
              )
              .addTo(map);

            marker.getElement().addEventListener("click", () => {
              setSelectedStory(d);
            });
          }
        });

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn("MapLibre fallback:", err);
      }
    }

    return () => {
      if (activeTab !== "map" && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, dispatches]);

  // When a search query is active, the server has already matched
  // title/content/location/author across the full table (see the
  // wireSearchResults effect above) — apply only the category filter on
  // top of that. With no query, fall back to filtering the base feed
  // client-side exactly as before.
  const wireSearchActive = wireSearchQuery.trim().length > 0;
  const filteredDispatches = (wireSearchActive ? (wireSearchResults ?? []) : dispatches).filter((d) => {
    const matchesCategory = wireCategoryFilter === "ALL" || d.category.toLowerCase() === wireCategoryFilter.toLowerCase();
    if (wireSearchActive) return matchesCategory;
    const matchesSearch = !wireSearchQuery.trim() ||
      d.title.toLowerCase().includes(wireSearchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(wireSearchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(wireSearchQuery.toLowerCase()) ||
      d.author.toLowerCase().includes(wireSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen relative font-sans transition-colors duration-200 ${
      isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-100 text-zinc-900"
    }`}>

      {/* 1. BACKGROUND WATERMARK */}
      {watermarkVisible && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden opacity-[0.035] select-none"
        >
          <div className="flex flex-col items-center justify-center transform -rotate-12 scale-125">
            <div className="flex items-center gap-4 mb-2">
              <span className={`font-mono text-8xl font-black ${
                isDark ? "text-zinc-100" : "text-zinc-900"
              }`}>Fp_</span>
              <img src="/pressie.svg" alt="" className="h-[280px] w-[280px] flex-shrink-0" />
            </div>
            <span className={`font-mono text-8xl font-black tracking-widest uppercase ${
              isDark ? "text-zinc-100" : "text-zinc-900"
            }`}>
              FIELDPRESS
            </span>
            <span className={`font-mono text-2xl tracking-widest mt-1 font-semibold ${
              isDark ? "text-zinc-300" : "text-zinc-700"
            }`}>
              PRESS CORPS • INDEPENDENT WIRE
            </span>
          </div>
        </div>
      )}

      {/* 2. TOAST NOTIFICATION */}
      {savedSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 font-mono text-xs font-bold text-zinc-950 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="h-4 w-4 stroke-[3]" />
          <span>{savedSuccessToast}</span>
        </div>
      )}

      {/* 3. MAIN HEADER BAR */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 sm:px-6 py-3 transition ${
        isDark ? "bg-zinc-950/90 border-zinc-800/80" : "bg-white/90 border-zinc-200"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo Header: Fp_ + favicon + FieldPress */}
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
              className={`px-2.5 sm:px-3 py-1.5 rounded transition cursor-pointer ${
                activeTab === "edition"
                  ? isDark
                    ? "bg-zinc-800 text-amber-400 font-bold"
                    : "bg-zinc-200 text-amber-700 font-bold"
                  : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Daily Edition
            </button>
            <button
              onClick={() => setActiveTab("wire")}
              className={`px-2.5 sm:px-3 py-1.5 rounded transition cursor-pointer ${
                activeTab === "wire"
                  ? isDark
                    ? "bg-zinc-800 text-amber-400 font-bold"
                    : "bg-zinc-200 text-amber-700 font-bold"
                  : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Live Wire
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`px-2.5 sm:px-3 py-1.5 rounded transition cursor-pointer ${
                activeTab === "map"
                  ? isDark
                    ? "bg-zinc-800 text-amber-400 font-bold"
                    : "bg-zinc-200 text-amber-700 font-bold"
                  : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Map Radar
            </button>
            <button
              onClick={() => setActiveTab("classifieds")}
              className={`px-2.5 sm:px-3 py-1.5 rounded transition cursor-pointer ${
                activeTab === "classifieds"
                  ? isDark
                    ? "bg-zinc-800 text-amber-400 font-bold"
                    : "bg-zinc-200 text-amber-700 font-bold"
                  : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Classifieds
            </button>
            <button
              onClick={() => setActiveTab("discover")}
              className={`px-2.5 sm:px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1 ${
                activeTab === "discover"
                  ? isDark
                    ? "bg-zinc-800 text-amber-400 font-bold"
                    : "bg-zinc-200 text-amber-700 font-bold"
                  : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Discover
              {suggestedCohorts.length > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-zinc-950 text-[9px] font-bold flex items-center justify-center">
                  {suggestedCohorts.length}
                </span>
              )}
            </button>
            </div>

            {/* Pressy'o Newsroom Copilot — icon only */}
            <button
              type="button"
              onClick={() => setShowPressyoModal(true)}
              className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-amber-500/50 hover:border-amber-400 transition cursor-pointer ml-1 bg-white"
              title="Pressy'O — Newsroom Copilot"
            >
              <img
                src="/pressyo-icon.jpg"
                alt="Pressy'O"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </button>

            {/* Messages — icon only */}
            <button
              onClick={() => setShowMessengerModal(true)}
              className={`relative w-8 h-8 flex-shrink-0 rounded-full border flex items-center justify-center transition cursor-pointer ${
                isDark
                  ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
              }`}
              title="Messages"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </nav>

          {/* Action Tools: Header Press Pass Trigger, Settings, Theme */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Global Search: searches all dispatches regardless of active tab */}
            <div className="relative">
              {showGlobalSearch ? (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${
                  isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-300 bg-white"
                }`}>
                  <Search className={`h-3.5 w-3.5 flex-shrink-0 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                  <input
                    autoFocus
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowGlobalSearch(false);
                        setGlobalSearchQuery("");
                      }
                    }}
                    placeholder="Search all dispatches..."
                    className={`w-36 sm:w-48 bg-transparent outline-none font-mono text-xs ${isDark ? "text-zinc-200 placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-400"}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowGlobalSearch(false);
                      setGlobalSearchQuery("");
                    }}
                    className={`flex-shrink-0 ${isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-700"}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGlobalSearch(true)}
                  className={`p-1.5 rounded border transition cursor-pointer ${
                    isDark
                      ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      : "border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
                  }`}
                  title="Search all dispatches"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}

              {showGlobalSearch && globalSearchQuery.trim() && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowGlobalSearch(false)} />
                  <div className={`absolute right-0 mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto rounded-lg border shadow-xl z-50 ${
                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                  }`}>
                    {globalSearchResults.length === 0 ? (
                      <div className={`px-3 py-6 text-center font-mono text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        No dispatches match "{globalSearchQuery}".
                      </div>
                    ) : (
                      globalSearchResults.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedStory(d);
                            setShowGlobalSearch(false);
                            setGlobalSearchQuery("");
                          }}
                          className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 transition cursor-pointer ${
                            isDark ? "border-zinc-800/60 hover:bg-zinc-800/60" : "border-zinc-100 hover:bg-zinc-50"
                          }`}
                        >
                          <p className="font-mono text-xs font-bold truncate">{d.title}</p>
                          <p className={`font-mono text-[11px] mt-0.5 truncate ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                            {d.location} • {d.author}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Notifications Bell: comments on the user's own dispatches */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const opening = !showNotifPanel;
                  setShowNotifPanel(opening);
                  if (opening) markNotificationsSeen();
                }}
                className={`relative p-1.5 rounded border transition cursor-pointer ${
                  isDark
                    ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    : "border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
                }`}
                title="Notifications"
              >
<Bell className="h-4 w-4" />
                {(unseenNotifications.length + serverUnreadCount) > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold font-mono">
                    {(unseenNotifications.length + serverUnreadCount) > 9 ? "9+" : unseenNotifications.length + serverUnreadCount}
                  </span>
                )}
              </button>

              {showNotifPanel && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
                  <div className={`absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border shadow-xl z-50 ${
                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                  }`}>
                    <div className={`px-3 py-2 border-b font-mono text-xs font-bold ${isDark ? "border-zinc-800 text-zinc-300" : "border-zinc-200 text-zinc-700"}`}>
                      Notifications
                    </div>
{(serverNotifications.length === 0 && notificationItems.length === 0) ? (
                      <div className={`px-3 py-6 text-center font-mono text-xs ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        No activity yet.
                      </div>
                    ) : (
                      <>
                        {serverNotifications.slice(0, 30).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              setShowNotifPanel(false);
                              setActiveTab("discover");
                            }}
                            className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 transition cursor-pointer ${
                              isDark ? "border-zinc-800/60 hover:bg-zinc-800/60" : "border-zinc-100 hover:bg-zinc-50"
                            } ${!n.read ? (isDark ? "bg-cyan-500/5" : "bg-cyan-50") : ""}`}
                          >
                            <p className="font-mono text-xs">
                              <span className="font-bold">@{n.actor.callsign}</span>
                              <span className={isDark ? "text-zinc-400" : "text-zinc-500"}>
                                {n.type === "cohort_request" ? " sent you a cohort request" : " accepted your cohort request"}
                              </span>
                            </p>
                          </button>
                        ))}
                        {notificationItems.slice(0, 30).map((n) => {
                          const disp = dispatches.find((d) => d.id === n.dispatchId);
                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                setShowNotifPanel(false);
                                if (disp) setSelectedStory(disp);
                              }}
                              className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 transition cursor-pointer ${
                                isDark ? "border-zinc-800/60 hover:bg-zinc-800/60" : "border-zinc-100 hover:bg-zinc-50"
                              }`}
                            >
                              <p className="font-mono text-xs">
                                <span className="font-bold">@{n.callsign}</span>
                                <span className={isDark ? "text-zinc-400" : "text-zinc-500"}> commented on </span>
                                <span className="font-bold">{disp ? disp.title : "your dispatch"}</span>
                              </p>
                              <p className={`font-mono text-[11px] mt-0.5 truncate ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                                {n.text}
                              </p>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Account: Sign In trigger (signed out) or account badge + sign out (signed in) */}
            {authAccount ? (
              <button
                onClick={logOutAccount}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition cursor-pointer ${
                  isDark
                    ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    : "border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
                }`}
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sign out</span>
              </button>
            ) : (
              <button
                onClick={() => { setAuthModalMode("signin"); setAuthError(""); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono transition cursor-pointer ${
                  isDark
                    ? "border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400"
                    : "border-cyan-600/30 hover:bg-cyan-50 text-cyan-700"
                }`}
                title="Sign in to sync your account across devices"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign in</span>
              </button>
            )}

            {/* Header Press Pass Badge Trigger (DEDICATED TO REPORTER CREDENTIAL/ID EDITOR - IMAGE 1) */}
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

            {/* Workstation Settings Drawer */}
            <button
              onClick={() => setShowSettingsDrawer(true)}
              className={`p-1.5 rounded border transition cursor-pointer ${
                isDark
                  ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900"
              }`}
              title="Workstation Settings"
            >
              <Sliders className="h-4 w-4" />
            </button>

            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-1.5 rounded border transition cursor-pointer ${
                isDark
                  ? "border-zinc-800 hover:bg-zinc-800 text-amber-400"
                  : "border-zinc-300 hover:bg-zinc-200 text-amber-600"
              }`}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 4. MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-24 sm:pb-8 relative z-10">
        
        {/* Active View Header Bar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b ${borderThemeClass}`}>
          <div>
            <h1 className="font-mono text-2xl font-black tracking-tight flex items-center gap-2">
              <span>
                {activeTab === "edition" && "Daily Broadsheet Edition"}
                {activeTab === "wire" && "Live Dispatch Wire"}
                {activeTab === "map" && "Geospatial Beat Radar"}
                {activeTab === "classifieds" && "Community Classifieds Wire"}
              </span>
              {activeTab === "wire" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase font-bold animate-pulse">
                  <Radio className="h-2.5 w-2.5" /> Live Telemetry
                </span>
              )}
            </h1>
            <p className={`font-mono text-xs mt-0.5 ${subTextThemeClass}`}>
              FieldPress Autonomous Newsroom • Bureau: {pressPass.bureau} • Last synced: {lastSyncTime}
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-3">
            {/* Quick Action Button in View Header */}
            <button
              onClick={() => openCreatePressie()}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-mono text-xs font-bold transition shadow-xs cursor-pointer ${currentAccent.btn}`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Dispatch Pressie</span>
            </button>

            {/* Interactive Sync Button */}
            <button
              onClick={handleSyncFeeds}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded border transition cursor-pointer ${
                isDark ? "border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" : "border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-amber-500" : ""}`} />
              <span>{isSyncing ? "Syncing…" : "Sync"}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DAILY BROADSHEET EDITION */}
        {activeTab === "edition" && (
          <div className="space-y-8">
            {dispatches[0] && (() => {
              const d = dispatches[0];
              const style = d.editionStyle || "newspaper";
              const isComic = style === "comic";
              const isNewspaper = style === "newspaper";
              const isArcade = style === "arcade";
              const isTactical = style === "tactical";
              const isMagazine = style === "magazine";

              return (
                <article
                  onClick={() => setSelectedStory(d)}
                  className={`transition cursor-pointer relative overflow-hidden select-none ${
                    isComic
                      ? "bg-[#fffdf0] dark:bg-[#18181b] border-4 border-black dark:border-yellow-400 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#facc15] rounded-3xl p-6 sm:p-8"
                      : isNewspaper
                        ? "bg-[#faf5eb] dark:bg-[#1b1713] text-[#2c2014] dark:text-[#f5ede0] border-4 border-double border-[#5c3e21] dark:border-[#8f6842] shadow-xl p-6 sm:p-10 rounded-none"
                        : isArcade
                          ? "bg-black border-4 border-[#00ff66] shadow-[0_0_30px_rgba(0,255,102,0.35)] text-[#00ff66] p-6 sm:p-8 rounded-none font-['VT323']"
                          : isTactical
                            ? "bg-[#030a12] border-2 border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.2)] text-cyan-300 p-6 sm:p-8 rounded-xl font-mono"
                            : "bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/40 border border-purple-500/40 shadow-2xl rounded-3xl p-6 sm:p-10 text-zinc-100"
                  }`}
                >
                  {/* Edition Decorative Headers */}
                  {isComic && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-yellow-400 text-black border-2 border-black font-black uppercase text-xs tracking-wider transform -rotate-2 shadow-[2px_2px_0px_0px_#000]">
                        💥 COMIC STRIP WIRE
                      </span>
                      <span className="px-3 py-1 bg-rose-600 text-white border-2 border-black font-black uppercase text-xs transform rotate-2 shadow-[2px_2px_0px_0px_#000]">
                        ACTION DISPATCH!
                      </span>
                    </div>
                  )}

                  {isNewspaper && (
                    <div className="border-t-2 border-b-2 border-black/80 dark:border-amber-700/60 mb-4 py-1.5 flex items-center justify-between font-serif text-[11px] uppercase tracking-[0.25em] font-bold text-[#442c16] dark:text-amber-300">
                      <span>THE MIDWEST CORRIDOR GAZETTE</span>
                      <span className="hidden sm:inline">EST. 1926 • VOL. XCIV NO. 28</span>
                      <span>PRICE TWO CENTS</span>
                    </div>
                  )}

                  {isArcade && (
                    <div className="border-b-2 border-[#00ff66]/60 pb-2 mb-4 flex items-center justify-between text-base tracking-widest uppercase">
                      <span>■ 1-PLAYER WIRE DISPATCH</span>
                      <span className="hidden sm:inline">HIGH SCORE: 994200</span>
                      <span className="animate-pulse">● LIVE INSERT COIN</span>
                    </div>
                  )}

                  {isTactical && (
                    <div className="border-b border-cyan-500/40 pb-2 mb-4 flex items-center justify-between text-[11px] tracking-wider text-cyan-400">
                      <span className="flex items-center gap-1.5">
                        <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                        <span>RECON PROTOCOL // FREQ: 144.390 MHZ</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                        CLASSIFIED
                      </span>
                    </div>
                  )}

                  {isMagazine && (
                    <div className="border-b border-white/10 pb-2.5 mb-4 flex items-center justify-between text-[11px] font-sans tracking-widest text-purple-300 uppercase">
                      <span>FIELDPRESS MAGAZINE • AUTONOMOUS SYSTEMS REPORT</span>
                      <span className="text-zinc-400">ISSUE NO. 24</span>
                    </div>
                  )}

                  {/* Juxtaposition of Image and Editorial Headline & Body */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-6">
                    {/* Juxtaposed Smaller Image with Authentic Edition Filter */}
                    {d.imageUrl && (
                      <div className="md:col-span-5 lg:col-span-5 space-y-2">
                        <div
                          className={`relative aspect-[4/3] max-h-[250px] sm:max-h-[270px] overflow-hidden ${
                            isComic
                              ? "border-4 border-black dark:border-yellow-400 rounded-2xl shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#facc15] bg-yellow-400"
                              : isNewspaper
                                ? "border-2 border-[#5c3e21] p-1 bg-amber-950/20 shadow-md rounded-none"
                                : isArcade
                                  ? "border-2 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.4)] rounded-none bg-black"
                                  : isTactical
                                    ? "border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-lg bg-zinc-950"
                                    : "border border-purple-500/40 rounded-2xl shadow-lg bg-purple-950/20"
                          }`}
                        >
                          <img
                            src={d.imageUrl}
                            alt={d.title}
                            className={`w-full h-full object-cover transition duration-300 group-hover:scale-103 ${
                              isComic
                                ? "contrast-[1.4] saturate-[1.8] brightness-[1.05] filter"
                                : isNewspaper
                                  ? "grayscale contrast-[1.4] sepia-[0.55] brightness-[0.88] filter"
                                  : isArcade
                                    ? "grayscale contrast-[1.6] brightness-90 sepia hue-rotate-[85deg] saturate-[350%] filter"
                                    : isTactical
                                      ? "grayscale-[0.55] contrast-[1.25] brightness-[0.95] sepia-[0.2] hue-rotate-[160deg] saturate-[160%] filter"
                                      : "contrast-[1.08] saturate-[1.2] brightness-100 filter"
                            }`}
                          />

                          {/* Edition-Specific Image Overlays */}
                          {isArcade && (
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-75 z-10" />
                          )}
                          {isTactical && (
                            <>
                              <div className="absolute top-1.5 left-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">┌</div>
                              <div className="absolute top-1.5 right-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">┐</div>
                              <div className="absolute bottom-7 left-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">└</div>
                              <div className="absolute bottom-7 right-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">┘</div>
                            </>
                          )}
                          {isNewspaper && (
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-amber-950/40 via-transparent to-amber-950/20 mix-blend-multiply border border-amber-900/30 z-10" />
                          )}

                          {d.imageCaption && (
                            <div
                              className={`absolute bottom-0 inset-x-0 p-2 text-xs z-20 ${
                                isComic
                                  ? "bg-yellow-400 text-black border-t-2 border-black font-black uppercase text-[10px]"
                                  : isNewspaper
                                    ? "bg-[#faf5eb]/90 dark:bg-[#1b1713]/90 text-[#442c16] dark:text-amber-200 font-serif italic border-t border-[#5c3e21]"
                                    : isArcade
                                      ? "bg-black/90 text-[#00ff66] font-['VT323'] text-sm border-t border-[#00ff66]"
                                      : isTactical
                                        ? "bg-zinc-950/85 text-cyan-300 font-mono text-[10px] border-t border-cyan-500/40"
                                        : "bg-black/60 backdrop-blur-xs text-zinc-200 font-sans text-[10px]"
                              }`}
                            >
                              <span>{d.imageCaption}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Headline, Metadata, and Content Juxtaposition */}
                    <div className={d.imageUrl ? "md:col-span-7 lg:col-span-7 space-y-3" : "md:col-span-12 space-y-3"}>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`font-bold text-[10px] uppercase px-2.5 py-0.5 rounded ${
                            isComic
                              ? "bg-yellow-400 text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_#000]"
                              : isNewspaper
                                ? "bg-[#f2e8d3] text-[#442c18] dark:bg-zinc-800 dark:text-amber-200 border border-[#5c3e21] font-serif"
                                : isArcade
                                  ? "bg-black text-[#00ff66] border border-[#00ff66] font-['VT323'] text-sm tracking-wider"
                                  : isTactical
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono"
                                    : "bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-sans"
                          }`}
                        >
                          {d.category}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="font-bold flex items-center gap-1 text-zinc-400">
                          <MapPin className="h-3 w-3 text-amber-500" /> {d.location}
                        </span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-400">{d.timestamp}</span>
                        {wasDispatchEdited(d) && (
                          <>
                            <span className="text-zinc-400">•</span>
                            <span className="italic text-zinc-500" title="This dispatch was edited after it was first published">(edited)</span>
                          </>
                        )}
                        <span className="text-zinc-400">•</span>
                        <span className="font-mono text-[10px] text-zinc-500 tracking-wide">{d.id}</span>
                      </div>

                      {/* Headline with Heavy Authentic Edition Character */}
                      <h2
                        onClick={() => setSelectedStory(d)}
                        className={`cursor-pointer transition ${
                          isComic
                            ? "font-['Bangers'] text-4xl sm:text-6xl font-black uppercase tracking-wider text-black dark:text-yellow-400 drop-shadow-[2px_2px_0px_rgba(255,255,255,1)] dark:drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] leading-none my-2 hover:text-rose-600"
                            : isNewspaper
                              ? "font-serif text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] text-[#1c130b] dark:text-[#faf6ee] my-3 hover:text-amber-700"
                              : isArcade
                                ? "font-['VT323'] text-4xl sm:text-6xl text-[#55ff99] tracking-wider drop-shadow-[0_0_10px_rgba(0,255,102,0.7)] leading-none my-2 hover:text-white"
                                : isTactical
                                  ? "font-mono text-2xl sm:text-4xl font-black tracking-tight text-cyan-200 uppercase leading-tight my-2 hover:text-cyan-400"
                                  : "font-['Space_Grotesk'] text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-zinc-100 to-purple-200 bg-clip-text text-transparent my-3 hover:opacity-80"
                        }`}
                        title="Click to read full dispatch"
                      >
                        {d.title}
                      </h2>

                      {/* Body Copy Formatted Authentically to Edition Medium */}
                      {isComic ? (
                        /* Comic Speech / Dialogue Balloon */
                        <div className="relative bg-white dark:bg-zinc-800/95 border-3 border-black dark:border-yellow-400 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#facc15] my-3">
                          <p className="font-sans font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-snug tracking-wide">
                            "{d.content}"
                          </p>
                          <div className="absolute -bottom-3 left-8 w-0 h-0 border-l-[10px] border-l-transparent border-t-[12px] border-t-black dark:border-t-yellow-400 border-r-[10px] border-r-transparent" />
                          <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-[8px] border-l-transparent border-t-[10px] border-t-white dark:border-t-zinc-800 border-r-[8px] border-r-transparent" />
                        </div>
                      ) : isNewspaper ? (
                        /* 1920s Broadsheet with Drop Cap */
                        <div className="font-serif text-xs sm:text-sm leading-relaxed text-[#2c2014] dark:text-[#ded2bf] text-justify sm:columns-2 gap-8 my-3">
                          <span className="float-left text-5xl font-serif font-black mr-3 leading-none text-[#5c3e21] dark:text-amber-400 border border-[#5c3e21]/40 p-1.5 bg-amber-100/60 dark:bg-zinc-800">
                            {d.content[0]}
                          </span>
                          <span>{d.content.slice(1)}</span>
                        </div>
                      ) : isArcade ? (
                        /* 8-Bit Arcade Terminal with Cursor */
                        <div className="font-['VT323'] text-xl sm:text-2xl text-[#00ff66] leading-snug tracking-wider bg-zinc-950/90 p-4 border border-[#00ff66]/40 my-2">
                          <p>
                            {d.content} <span className="animate-pulse">█</span>
                          </p>
                        </div>
                      ) : isTactical ? (
                        /* Tactical Recon Debrief */
                        <div className="font-mono text-xs sm:text-sm leading-relaxed text-cyan-300/90 border-l-2 border-cyan-500/60 pl-4 py-1 my-2 bg-cyan-950/20">
                          <p>{d.content}</p>
                        </div>
                      ) : (
                        /* Modern Sleek Feature */
                        <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-300 font-normal max-w-3xl my-2">
                          {d.content}
                        </p>
                      )}

                      {d.repostedByCallsign && (
                        <div className="pt-2 text-[11px] font-mono text-indigo-300 flex items-center gap-1">
                          <span>🔁</span>
                          <span>Shared by @{d.repostedByCallsign}</span>
                        </div>
                      )}
                      {d.parentDispatchId && (() => {
                        const forkParent = dispatches.find((p) => p.id === d.parentDispatchId);
                        return forkParent ? (
                          <div className="pt-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                            <span>🔀</span>
                            <span>Forked from @{forkParent.callsign}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="pt-2 flex items-center justify-between text-xs font-mono text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-zinc-300">Byline:</span>
                          <span>{d.author} (@{d.callsign})</span>
                          <span>•</span>
                          <span>{d.bureau}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-4 border-t border-zinc-700/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400">Edition Model:</span>
                      <span className="font-bold text-amber-500 uppercase">{d.editionStyle || "newspaper"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(d.id);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(d.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                        <span>{bookmarks.includes(d.id) ? "Saved" : "Save"}</span>
                      </button>

                      {authAccount && d.accountId === authAccount.id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditPublished(d);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 transition font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Edit this dispatch"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                      )}

                      {d.sharingOption === "fork" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleForkPressie(d);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Fork this pressie into composer with attribution"
                        >
                          <span>🔀 Fork Pressie</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareStory(d);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => setSelectedStory(d)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Read Full Page</span>
                      </button>
                    </div>
                  </div>

                  {/* Field Commentary Under Feed */}
                  <div className="mt-5 pt-4 border-t border-zinc-700/40 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> Field Notes & Commentary ({getCommentsForDispatch(d.id).length})
                      </span>
                      <span className="text-[11px] text-zinc-400">Live dispatches under feed</span>
                    </div>

                    {getCommentsForDispatch(d.id).length > 0 ? (
                      <div className="space-y-2">
                        {getCommentsForDispatch(d.id).map((c) => (
                          <div key={c.id} className={`p-2.5 rounded-lg border space-y-1 ${subCardThemeClass}`}>
                            <div className="flex items-center justify-between text-[11px]">
                              <div
                                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
                                onClick={() => openCorrespondentFromComment(c.author, c.callsign)}
                              >
                                <span className="font-bold text-zinc-200">{c.author}</span>
                                <span className="text-amber-500 font-semibold">@{c.callsign}</span>
                              </div>
                              <span className={subTextThemeClass}>{c.timestamp}</span>
                            </div>
                            <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                              {c.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs italic ${subTextThemeClass}`}>No commentary filed yet. Dispatch a note below.</p>
                    )}

                    {/* Inline Note Dispatch Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const txt = feedCommentInputs[d.id] || "";
                        if (!txt.trim()) return;
                        addCommentToDispatch(d.id, txt);
                        setFeedCommentInputs({ ...feedCommentInputs, [d.id]: "" });
                      }}
                      className="flex gap-2 pt-1"
                    >
                      <input
                        type="text"
                        value={feedCommentInputs[d.id] || ""}
                        onChange={(e) => setFeedCommentInputs({ ...feedCommentInputs, [d.id]: e.target.value })}
                        placeholder={`Dispatch note as @${pressPass.callsign || "ViBiR"}...`}
                        className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none transition ${inputThemeClass}`}
                      />
                      <button
                        type="submit"
                        disabled={!(feedCommentInputs[d.id] || "").trim()}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs whitespace-nowrap"
                      >
                        <Send className="h-3 w-3" />
                        <span>Dispatch Note</span>
                      </button>
                    </form>

                    {/* Quick Emoji Bar */}
                    <div className="flex flex-wrap items-center gap-1 pt-1.5 text-xs">
                      <span className="text-[10px] text-zinc-400 font-mono mr-1">Insert Emoji:</span>
                      {["📰", "⚡", "🔍", "💬", "🤝", "🔥", "🔻", "📡", "👍", "❤️"].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            const prev = feedCommentInputs[d.id] || "";
                            setFeedCommentInputs({ ...feedCommentInputs, [d.id]: prev + " " + em });
                          }}
                          className="px-1.5 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-700 text-xs border border-zinc-700/50 transition cursor-pointer select-none"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })()}

            {/* Grid of Secondary Dispatches with Authentic Array of Edition Variations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dispatches.slice(1).map((disp, idx) => {
                const fallbackStyles: Array<"tactical" | "magazine" | "comic" | "arcade"> = ["tactical", "magazine", "comic", "arcade"];
                const sStyle = disp.editionStyle || fallbackStyles[idx % 4];
                const isSecComic = sStyle === "comic";
                const isSecNewspaper = sStyle === "newspaper";
                const isSecArcade = sStyle === "arcade";
                const isSecTactical = sStyle === "tactical";

                return (
                  <article
                    key={disp.id}
                    onClick={() => setSelectedStory(disp)}
                    className={`p-5 rounded-2xl border flex flex-col justify-between transition cursor-pointer relative overflow-hidden ${
                      isSecComic
                        ? "bg-[#fffdf0] dark:bg-[#18181b] border-3 border-black dark:border-yellow-400 shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#facc15]"
                        : isSecNewspaper
                          ? "bg-[#faf5eb] dark:bg-[#1b1713] text-[#2c2014] dark:text-[#f5ede0] border-2 border-double border-[#5c3e21] dark:border-[#8f6842] shadow-md rounded-none"
                          : isSecArcade
                            ? "bg-black border-2 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.25)] text-[#00ff66] font-['VT323'] rounded-none"
                            : isSecTactical
                              ? "bg-[#030a12] border border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-cyan-300 font-mono"
                              : "bg-gradient-to-br from-zinc-950 to-purple-950/30 border border-purple-500/30 shadow-md text-zinc-100"
                    }`}
                  >
                    <div>
                      {/* Secondary Thumbnail with Edition Image Aesthetic */}
                      {disp.imageUrl && (
                        <div
                          onClick={() => setSelectedStory(disp)}
                          className={`mb-3 rounded-lg overflow-hidden aspect-[16/10] max-h-[140px] bg-black cursor-pointer group relative ${
                            isSecComic
                              ? "border-2 border-black dark:border-yellow-400 shadow-[3px_3px_0px_0px_#000]"
                              : isSecNewspaper
                                ? "border border-[#5c3e21]"
                                : isSecArcade
                                  ? "border border-[#00ff66]"
                                  : isSecTactical
                                    ? "border border-cyan-500/50"
                                    : "border border-purple-500/30"
                          }`}
                        >
                          <img
                            src={disp.imageUrl}
                            alt={disp.title}
                            className={`w-full h-full object-cover transition group-hover:scale-105 ${
                              isSecComic
                                ? "contrast-[1.4] saturate-[1.7] brightness-[1.03] filter"
                                : isSecNewspaper
                                  ? "grayscale contrast-[1.4] sepia-[0.55] brightness-[0.88] filter"
                                  : isSecArcade
                                    ? "grayscale contrast-[1.6] brightness-90 sepia hue-rotate-[85deg] saturate-[350%] filter"
                                    : isSecTactical
                                      ? "grayscale-[0.55] contrast-[1.25] brightness-[0.95] sepia-[0.2] hue-rotate-[160deg] saturate-[160%] filter"
                                      : "contrast-[1.08] saturate-[1.2] filter"
                            }`}
                          />
                          {isSecArcade && (
                            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-75 z-10" />
                          )}
                        </div>
                      )}

                      {disp.repostedByCallsign && (
                        <div className="text-[10px] text-indigo-400 mb-1.5 flex items-center gap-1">
                          <span>🔁</span>
                          <span>Shared by @{disp.repostedByCallsign}</span>
                        </div>
                      )}
                      {disp.parentDispatchId && (() => {
                        const forkParent = dispatches.find((p) => p.id === disp.parentDispatchId);
                        return forkParent ? (
                          <div className="text-[10px] text-emerald-400 mb-1.5 flex items-center gap-1">
                            <span>🔀</span>
                            <span>Forked from @{forkParent.callsign}</span>
                          </div>
                        ) : null;
                      })()}
                      <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                        <span className="font-bold text-amber-500 uppercase">{disp.category}</span>
                        <span className="text-[10px] uppercase opacity-75 px-1.5 py-0.5 rounded border border-zinc-700/50">
                          {sStyle}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedStory(disp)}
                        className={`text-base sm:text-lg font-bold leading-snug mb-2 hover:opacity-80 transition line-clamp-2 cursor-pointer ${
                          isSecComic
                            ? "font-['Bangers'] text-xl tracking-wide uppercase text-black dark:text-yellow-400"
                            : isSecNewspaper
                              ? "font-serif text-lg font-black text-[#1c130b] dark:text-[#faf6ee]"
                              : isSecArcade
                                ? "font-['VT323'] text-2xl tracking-wider text-[#55ff99]"
                                : isSecTactical
                                  ? "font-mono text-base font-black text-cyan-200 uppercase"
                                  : "font-['Space_Grotesk'] text-lg font-extrabold text-zinc-100"
                        }`}
                        title="Click to read full dispatch"
                      >
                        {disp.title}
                      </h3>

                      <p className="text-xs leading-relaxed mb-4 line-clamp-3 opacity-90">
                        {disp.content}
                      </p>
                    </div>

                    <div>
                      <div className="pt-3 border-t border-zinc-700/40 flex items-center justify-between text-[11px] font-mono">
                        <span>{disp.location}</span>
                        <div className="flex items-center gap-2">
                          {authAccount && disp.accountId === authAccount.id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditPublished(disp);
                              }}
                              className="hover:text-amber-500 p-1 rounded transition cursor-pointer"
                              title="Edit this dispatch"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          )}
                          {disp.sharingOption === "fork" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleForkPressie(disp);
                              }}
                              className="hover:text-emerald-400 p-1 rounded transition cursor-pointer"
                              title="Fork pressie by Pressy'o"
                            >
                              <span className="text-xs">🔀</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareStory(disp);
                            }}
                            className="hover:text-amber-500 p-1 rounded transition cursor-pointer"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(disp.id);
                            }}
                            className={`hover:text-amber-500 p-1 rounded transition cursor-pointer ${
                              bookmarks.includes(disp.id) ? "text-amber-500" : ""
                            }`}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(disp.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                          </button>
                          <button
                            onClick={() => setSelectedStory(disp)}
                            className="hover:text-amber-400 p-1 rounded transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Secondary Commentary Drawer */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-700/40 space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between text-[11px]">
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedComments({
                                ...expandedComments,
                                [disp.id]: !expandedComments[disp.id]
                              });
                            }}
                            className="text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Notes ({getCommentsForDispatch(disp.id).length})</span>
                            <span className="text-[10px] text-zinc-400">{expandedComments[disp.id] ? "▲" : "▼"}</span>
                          </button>
                        </div>

                        {expandedComments[disp.id] && (
                          <div className="space-y-2 pt-1">
                            {getCommentsForDispatch(disp.id).map((c) => (
                              <div key={c.id} className={`p-2 rounded border text-[11px] ${subCardThemeClass}`}>
                                <div className="flex items-center justify-between text-[10px] mb-0.5">
                                  <span
                                    className="font-bold text-zinc-300 cursor-pointer hover:text-amber-400 transition"
                                    onClick={() => openCorrespondentFromComment(c.author, c.callsign)}
                                  >
                                    @{c.callsign}
                                  </span>
                                  <span className={subTextThemeClass}>{c.timestamp}</span>
                                </div>
                                <p className={isDark ? "text-zinc-300" : "text-zinc-700"}>{c.text}</p>
                              </div>
                            ))}

                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const txt = feedCommentInputs[disp.id] || "";
                                if (!txt.trim()) return;
                                addCommentToDispatch(disp.id, txt);
                                setFeedCommentInputs({ ...feedCommentInputs, [disp.id]: "" });
                              }}
                              className="flex gap-1.5"
                            >
                              <input
                                type="text"
                                value={feedCommentInputs[disp.id] || ""}
                                onChange={(e) => setFeedCommentInputs({ ...feedCommentInputs, [disp.id]: e.target.value })}
                                placeholder="Add note..."
                                className={`flex-1 rounded px-2 py-1 text-[11px] focus:outline-none transition ${inputThemeClass}`}
                              />
                              <button
                                type="submit"
                                disabled={!(feedCommentInputs[disp.id] || "").trim()}
                                className="px-2 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 disabled:opacity-40"
                              >
                                Post
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DISPATCH WIRE */}
        {activeTab === "wire" && (
          <div className="space-y-4">
            {pressRoll.length > 0 && (
              <div className={`p-4 rounded-lg border flex items-center justify-between ${
                isDark ? "bg-amber-950/20 border-amber-500/40 text-amber-300" : "bg-amber-50 border-amber-300 text-amber-900"
              }`}>
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  <FolderLock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span>
                    You have <strong>{pressRoll.length} staged draft(s)</strong> in your Press Roll queue.
                  </span>
                </div>
                <button
                  onClick={() => openCreatePressie(pressRoll[0])}
                  className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-mono text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
                >
                  Resume Draft in Pressie Builder
                </button>
              </div>
            )}

            {/* Wire Controls */}
            <div className={`p-3.5 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs ${cardThemeClass}`}>
<div className="flex items-center gap-2 w-full sm:w-auto">
                {wireSearchLoading ? (
                  <RefreshCw className="h-4 w-4 text-zinc-400 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 text-zinc-400" />
                )}
                <input
                  type="text"
                  placeholder="Search all dispatches by keyword, reporter, or location..."
                  value={wireSearchQuery}
                  onChange={(e) => setWireSearchQuery(e.target.value)}
                  className={`px-2.5 py-1.5 rounded text-xs w-full sm:w-72 focus:outline-none ${inputThemeClass}`}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {["ALL", "Infrastructure", "Civic Wire", "Transit", "Telecom", "Field Dispatch"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setWireCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded text-[11px] transition cursor-pointer ${
                      wireCategoryFilter.toLowerCase() === cat.toLowerCase()
                        ? "bg-amber-500 text-zinc-950 font-bold"
                        : isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Wire Feed List */}
            <div className="space-y-3">
              {filteredDispatches.length === 0 ? (
                <div className={`p-8 rounded-lg border text-center font-mono text-xs ${subCardThemeClass} ${subTextThemeClass}`}>
                  {wireSearchActive && wireSearchLoading
                    ? "Searching all dispatches..."
                    : "No dispatches match the active search or category filter."}
                </div>
              ) : (
                filteredDispatches.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedStory(d)}
                    className={`p-4 rounded-lg border transition hover:border-amber-500/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer group ${cardThemeClass}`}
                  >
                    {d.imageUrl && (
                      <div className="w-full sm:w-40 aspect-video sm:aspect-auto sm:h-24 rounded-md overflow-hidden flex-shrink-0 bg-black/50 border border-zinc-800">
                        <img src={d.imageUrl} alt={d.title} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-[10px]">
                          {d.category}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono tracking-wider ${
                          d.editionStyle === "comic" ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/40" :
                          d.editionStyle === "arcade" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" :
                          d.editionStyle === "magazine" ? "bg-purple-500/20 text-purple-400 border border-purple-500/40" :
                          d.editionStyle === "newspaper" ? "bg-amber-800/20 text-amber-400 border border-amber-700/40 font-serif" :
                          "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        }`}>
                          {d.editionStyle || "tactical"}
                        </span>
                        <span className="text-zinc-400 font-bold">[{d.location}]</span>
                        <span className={subTextThemeClass}>•</span>
                        <span className={subTextThemeClass}>{d.timestamp}</span>
                        {wasDispatchEdited(d) && (
                          <span className={`italic ${subTextThemeClass}`} title="This dispatch was edited after it was first published">(edited)</span>
                        )}
                        {bookmarks.includes(d.id) && (
                          <span className="text-amber-500 text-[10px] font-bold flex items-center gap-0.5">
                            <Bookmark className="h-3 w-3 fill-amber-500" /> Saved
                          </span>
                        )}
                      </div>
                      <h3 className="font-mono text-base font-bold group-hover:text-amber-500 transition">{d.title}</h3>
                      <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                        {d.content}
                      </p>
                      {d.parentDispatchId && (() => {
                        const forkParent = dispatches.find((p) => p.id === d.parentDispatchId);
                        return forkParent ? (
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span>🔀</span>
                            <span>Forked from @{forkParent.callsign}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="sm:text-right font-mono text-xs flex-shrink-0 flex sm:flex-col justify-between items-end gap-2">
                      <div>
                        {d.repostedByCallsign && (
                          <div className="text-[10px] text-indigo-400 mb-0.5">🔁 Shared by @{d.repostedByCallsign}</div>
                        )}
                        <div className="font-bold">{d.author}</div>
                        <div className="text-amber-500 font-semibold">@{d.callsign}</div>
                        <div className={`text-[10px] ${subTextThemeClass}`}>{d.bureau}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(d.id);
                          }}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition"
                          title="Bookmark dispatch"
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(d.id) ? "fill-amber-500 text-amber-500" : ""}`} />
                        </button>
                        {authAccount && d.accountId === authAccount.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditPublished(d);
                            }}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-500 transition"
                            title="Edit this dispatch"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}
{d.sharingOption === "fork" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForkPressie(d);
                            }}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition"
                            title="Fork pressie"
                          >
                            <span className="text-xs">🔀</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareStory(d);
                          }}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition"
                          title="Share to social media"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {/* Load More (#201) - feed/search now come a page at a time via
                  cursor pagination instead of one flat LIMIT-200 request. */}
              {!wireSearchActive && dispatchesHasMore && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMoreDispatches}
                    disabled={loadingMoreDispatches}
                    className={`px-4 py-2 rounded-lg border font-mono text-xs font-semibold transition ${
                      loadingMoreDispatches
                        ? "opacity-60 cursor-wait"
                        : "hover:border-amber-500/50 hover:text-amber-500 cursor-pointer"
                    } ${cardThemeClass}`}
                  >
                    {loadingMoreDispatches ? "Loading..." : "Load More Dispatches"}
                  </button>
                </div>
              )}
              {wireSearchActive && wireSearchCursor && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={loadMoreSearchResults}
                    disabled={loadingMoreSearch}
                    className={`px-4 py-2 rounded-lg border font-mono text-xs font-semibold transition ${
                      loadingMoreSearch
                        ? "opacity-60 cursor-wait"
                        : "hover:border-amber-500/50 hover:text-amber-500 cursor-pointer"
                    } ${cardThemeClass}`}
                  >
                    {loadingMoreSearch ? "Loading..." : "Load More Results"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GEOSPATIAL BEAT RADAR */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${cardThemeClass}`}>
              <div className="flex items-center justify-between mb-3 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <span className="font-bold">Active Telemetry Grid: Wabash Valley & Midwest Corridor</span>
                </div>
                <span className={subTextThemeClass}>MapLibre Vector Radar • Click markers to read dispatch</span>
              </div>
              <div
                ref={mapContainerRef}
                className={`w-full h-[540px] rounded-lg border overflow-hidden relative shadow-inner ${
                  isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-300 bg-zinc-100"
                }`}
              />
            </div>
          </div>
        )}

        {/* TAB 4: CLASSIFIEDS */}
        {activeTab === "classifieds" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 rounded-lg border ${cardThemeClass}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-mono text-lg font-bold">Community Classifieds & Notices</h2>
                  <p className={`text-xs font-mono mt-0.5 ${subTextThemeClass}`}>
                    Public bulletin board for regional infrastructure notices, co-op equipment, and volunteer requests.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPostNoticeModal(true)}
                  className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-mono text-xs font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Post Notice</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                {classifiedsList.map((item) => (
                  <div key={item.id} className={`p-4 rounded border flex flex-col justify-between ${subCardThemeClass}`}>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          item.tagColor === "emerald"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.tagColor === "cyan"
                            ? "bg-cyan-500/20 text-cyan-400"
                            : item.tagColor === "rose"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {item.tag}
                        </span>
                        <span className={`text-[10px] ${subTextThemeClass}`}>{item.timestamp}</span>
                      </div>
                      <h4 className="font-bold text-sm mt-2">{item.title}</h4>
                      <p className={`text-xs mt-1.5 leading-relaxed ${subTextThemeClass}`}>{item.details}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-800 text-[11px] flex items-center justify-between">
                      <span className="text-zinc-400">Contact: {item.contact}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(item.contact);
                          }
                          setSavedSuccessToast(`Contact info copied: ${item.contact}`);
                          setTimeout(() => setSavedSuccessToast(""), 2500);
                        }}
                        className="text-amber-500 hover:underline cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "discover" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className={`p-6 rounded-lg border ${cardThemeClass}`}>
              <div className="mb-4">
                <h2 className="font-mono text-lg font-bold">Discover</h2>
                <p className={`text-xs font-mono mt-0.5 ${subTextThemeClass}`}>
                  People to connect with, based on shared coverage areas and activity on your dispatches. Locations are only shown if someone has chosen to share them.
                </p>
              </div>

              {suggestedCohorts.length === 0 ? (
                <div className={`p-8 rounded-lg border text-center text-xs font-mono ${subCardThemeClass} ${subTextThemeClass}`}>
                  <Users className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-bold text-sm mb-1">No suggestions yet</p>
                  <p>Post a dispatch or leave a comment — we'll surface people covering similar ground.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedCohorts.map(({ user: u, reasons }) => (
                    <div key={u.id} className={`p-4 rounded-xl border ${subCardThemeClass}`}>
                      <div className="flex items-start gap-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(u.callsign)}`}
                          alt={u.name}
                          className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{u.name}</p>
                          <p className="text-xs text-amber-500 font-mono truncate">@{u.callsign}</p>
                          {u.bureau ? (
                            <p className={`text-[11px] mt-0.5 truncate ${subTextThemeClass}`}>{u.bureau}</p>
                          ) : null}
                        </div>
                      </div>

                      {reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {reasons.map((r) => (
                            <span
                              key={r}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => sendCohortRequest(u.id)}
                          disabled={cohortActionPendingId === u.id}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition cursor-pointer disabled:opacity-60"
                        >
                          {cohortActionPendingId === u.id ? "Sending..." : "Request Cohort"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 5. THE PERFECT PRESSIE BUILDER MODAL (CORRESPONDS DIRECTLY TO IMAGE 2)    */}
      {/*    With Image Generation Prompt Box + Hybrid Preview + Media Tray         */}
      {/* ========================================================================= */}
      {showPressieBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            
            {/* Modal Header matching Image 2 */}
            <div className="flex-shrink-0 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-mono">
                <Send className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-base">
                  {editingPublishedId
                    ? "Editing Published Dispatch"
                    : editingDraftId
                    ? "New Field Dispatch or Press Roll • Editing Staged Draft"
                    : "New Field Dispatch or Press Roll"}
                </h3>
              </div>
              <button 
                onClick={() => setShowPressieBuilderModal(false)}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Body - Scrollable */}
            <form id="pressie-builder-form" className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 font-mono text-xs">
              
              {formValidationError && (
                <div className="p-3 rounded bg-rose-500/10 border border-rose-500/40 text-rose-500 flex items-center gap-2 font-bold">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}

              {/* 1. Headline / Dispatch Title (matching Image 2) */}
              <div>
                <label className={`block font-bold mb-1 ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>
                  Headline / Dispatch Title <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter headline..."
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (formValidationError) setFormValidationError(null);
                  }}
                  className={`w-full rounded px-3 py-2 text-sm focus:outline-none transition ${inputThemeClass}`}
                />
              </div>

              {/* Inherited Reporter Press Pass Provenance & Beat Info */}
              <div className={`p-2.5 rounded border flex flex-wrap items-center justify-between gap-2 font-mono text-xs ${subCardThemeClass}`}>
                <div className="flex items-center gap-2">
                  <span className={subTextThemeClass}>Bureau / Desk:</span>
                  <span className="font-bold text-amber-500">{pressPass.bureau || "Midwest Corridor Dispatch"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                    Field Dispatch
                  </span>
                  {pressPass.provenanceEnabled && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      ✓ Provenance Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Edition Style Model Selector */}
              <div>
                <label className={`block font-bold mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>
                  Edition Style Model
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono">
                  {[
                    { id: "tactical", label: "Tactical", icon: "🛰️", desc: "Monospace Wire" },
                    { id: "newspaper", label: "Old Timey", icon: "📰", desc: "Antique Serif" },
                    { id: "comic", label: "Comic Strip", icon: "💥", desc: "Graphic Novel" },
                    { id: "arcade", label: "8-Bit Arcade", icon: "🕹️", desc: "Pixel CRT" },
                    { id: "magazine", label: "Modern Sleek", icon: "✨", desc: "Editorial Gloss" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setNewEditionStyle(style.id as any)}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                        newEditionStyle === style.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-400 ring-1 ring-amber-400 font-bold shadow-sm"
                          : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      <span className="text-sm">{style.icon}</span>
                      <span className="text-xs font-bold">{style.label}</span>
                      <span className="text-[9px] text-zinc-400 truncate">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Syndication & Forking Rights Selector */}
              <div>
                <label className={`block font-bold mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>
                  Syndication & Collaboration Rights
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {[
                    { id: "fork", label: "Open Fork", icon: "🔀", desc: "Anyone can branch & follow up" },
                    { id: "colab", label: "Colab", icon: "🤝", desc: "Fork with author permission" },
                    { id: "none", label: "Closed Wire", icon: "🔒", desc: "Exclusive reporting only" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNewSharingOption(opt.id as any)}
                      className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                        newSharingOption === opt.id
                          ? "bg-amber-500/20 border-amber-500 text-amber-400 ring-1 ring-amber-400 font-bold shadow-sm"
                          : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      <span className="text-sm">{opt.icon}</span>
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className="text-[9px] text-zinc-400 leading-tight">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. AI Photojournalism Visual Generator with Chicago Midnight Quota (13/day) */}
              <div className={`p-3.5 rounded-lg border space-y-2.5 ${subCardThemeClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-500">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Photojournalism Visual Generator</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded ${dailyGenCount >= 13 ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"} font-bold`}>
                      {Math.max(0, 13 - dailyGenCount)} / 13 remaining today
                    </span>
                    <span className={subTextThemeClass}>(resets midnight CT)</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Visual framing brief (e.g. Autonomous micro-substations along rail line)..."
                    value={visualPrompt}
                    onChange={(e) => setVisualPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (dailyGenCount < 13) generateVisual();
                      }
                    }}
                    className={`flex-1 rounded px-3 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => generateVisual()}
                    disabled={isGeneratingImage || dailyGenCount >= 13}
                    className="px-3.5 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Rendering…</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-3.5 w-3.5" />
                        <span>Gen Visual</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 4. ENHANCEMENT: Hybrid Generated Image Preview & Local/Capture Image Tray */}
              <div className={`p-3.5 rounded-lg border space-y-3 ${subCardThemeClass}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-500">
                    <ImageIcon className="h-4 w-4" />
                    <span>Visual Evidence & Media Tray</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {evidenceGallery.length} {evidenceGallery.length === 1 ? "photo" : "photos"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={imageFileInputRef}
                      onChange={handleUploadImageFile}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1 border border-amber-500/30 transition cursor-pointer"
                      title="Upload or capture photo from device"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload / Capture Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className={`px-2 py-1 rounded text-xs border transition cursor-pointer ${
                        showUrlInput ? "bg-zinc-700 text-white border-zinc-600" : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border-zinc-700"
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {showUrlInput && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)..."
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      className={`flex-1 rounded px-2.5 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                    >
                      Attach
                    </button>
                  </div>
                )}

                {/* Evidence Grid / Thumbnails */}
                {evidenceGallery.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {evidenceGallery.map((item, idx) => {
                        const isActive = item.url === newImageUrl;
                        return (
                          <div
                            key={item.id || idx}
                            className={`group relative rounded-lg overflow-hidden border transition bg-black/40 flex flex-col ${
                              isActive ? "border-amber-500 ring-2 ring-amber-500/30" : "border-zinc-700/80"
                            }`}
                          >
                            <div
                              onClick={() => {
                                setNewImageUrl(item.url);
                                if (item.caption) setNewImageCaption(item.caption);
                              }}
                              className="relative aspect-video w-full cursor-pointer bg-zinc-900"
                              title="Click to set as active cover visual"
                            >
                              <img src={item.url} alt={item.caption || "Evidence visual"} className="w-full h-full object-cover" />
                              {isActive ? (
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 text-[9px] font-black flex items-center gap-1 shadow-md ring-1 ring-amber-400">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                  <span>Headline Image</span>
                                </div>
                              ) : (
                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-zinc-200 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition">
                                  Select for Headline
                                </div>
                              )}
                              <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/70 text-zinc-400 text-[8px]">
                                {item.source === "ai" ? "AI Gen" : "Upload"}
                              </div>
                            </div>

                            <div className="p-1 bg-zinc-900/80 flex items-center justify-between text-[10px]">
                              <span className="truncate flex-1 text-zinc-400">{item.caption || item.timestamp}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadImage(item.url, `fieldpress-visual-${idx + 1}`)}
                                  className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400"
                                  title="Download"
                                >
                                  <Download className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(item.id)}
                                  className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {newImageUrl && (
                      <div className="pt-1 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Photo caption & verification note..."
                          value={newImageCaption}
                          onChange={(e) => setNewImageCaption(e.target.value)}
                          className={`flex-1 rounded px-2.5 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewImageUrl("");
                            setNewImageCaption("");
                          }}
                          className="text-rose-400 hover:underline text-[10px] cursor-pointer flex-shrink-0"
                        >
                          Detach Cover
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => imageFileInputRef.current?.click()}
                    className="p-4 rounded-lg border border-dashed border-zinc-700/80 hover:border-amber-500/50 transition text-center cursor-pointer space-y-1 bg-zinc-900/20"
                  >
                    <div className="flex justify-center text-zinc-400">
                      <ImageIcon className="h-5 w-5 opacity-60" />
                    </div>
                    <p className={`text-xs font-medium ${subTextThemeClass}`}>
                      No media attached yet
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Generate documentary photography above, or click "Upload / Capture Photo" to attach evidence stills.
                    </p>
                  </div>
                )}
              </div>

              {/* 5. Dispatch Body (matching Image 2) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={`font-bold ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>
                    Dispatch Body <span className="text-amber-500">*</span>
                  </label>
                  <span className={`text-[10px] ${subTextThemeClass}`}>
                    {newContent.length} chars • {newContent.trim() ? newContent.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  rows={5}
                  placeholder="Write dispatch copy..."
                  value={newContent}
                  onChange={(e) => {
                    setNewContent(e.target.value);
                    if (formValidationError) setFormValidationError(null);
                  }}
                  className={`w-full rounded p-3 text-sm focus:outline-none leading-relaxed font-sans transition ${inputThemeClass}`}
                />
              </div>

              {/* Byline attribution */}
              <div className={`p-2.5 rounded border text-[11px] ${subCardThemeClass} ${subTextThemeClass}`}>
                <span className="font-bold text-amber-500">Byline:</span> {pressPass.name} (@{pressPass.callsign}) • {pressPass.role}
              </div>
            </form>

            {/* Footer matching Image 2 */}
            <div className={`flex-shrink-0 p-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${
              isDark ? "bg-zinc-950/80" : "bg-zinc-50"
            }`}>
              {/* Stage to Press Roll */}
              <button
                type="button"
                onClick={() => handleSaveDraft()}
                className="px-4 py-2 rounded border border-zinc-700 bg-zinc-800 text-amber-400 hover:bg-zinc-700 hover:border-amber-500/50 transition font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Save this dispatch to your staged Press Roll"
              >
                <FolderLock className="h-4 w-4" />
                <span>Stage to Press Roll</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPressieBuilderModal(false)}
                  className={`px-4 py-2 rounded border transition cursor-pointer ${
                    isDark ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCreatePressie()}
                  disabled={isSubmittingPressie}
                  className="px-5 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title={editingPublishedId ? "Save changes to this dispatch" : "Publish dispatch to Live Feed"}
                >
                  {editingPublishedId ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  <span>{isSubmittingPressie ? "Saving..." : editingPublishedId ? "Save Changes" : "Publish to Live Feed"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DEDICATED PRESS PASS CREDENTIAL & ID MODAL (EXACTLY AS IN IMAGE 1)     */}
      {/*    Opened ONLY when clicking "PRESS PASS: ras.ip" or Settings Profile      */}
      {/* ========================================================================= */}
      {showPressPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            
            {/* Modal Header */}
            <div className="flex-shrink-0 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-base">Press Pass Credential & ID Studio</h3>
              </div>
              <button 
                onClick={() => setShowPressPassModal(false)}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body with exact Image 1 preview & form */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 font-mono text-xs">
              
              {/* Hidden file input for photo upload */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />

              {/* Live ID Badge Card Preview (EXACTLY AS IN IMAGE 1) */}
              <div className="flex flex-col items-center">
                <div className={`w-full max-w-md rounded-xl border-2 p-5 relative overflow-hidden shadow-2xl transition-all duration-300 ${
                  editPreviewAccent.border
                } ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
                  <div className={`absolute top-0 left-0 right-0 h-2.5 ${editPreviewAccent.bar}`} />

                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 pt-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-tight">
                      <span className="text-amber-500">Fp_</span>
                      <img src="/pressie.svg" alt="" className="h-4 w-4 flex-shrink-0" />
                      <span className="font-bold text-zinc-100 ml-0.5">FIELDPRESS</span>
                      <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 ml-1">PRESS CORPS</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-zinc-500 tracking-wider">
                      {editPassForm.badgeId}
                    </span>
                  </div>

                  <div className="flex gap-4 my-4 items-center">
                    {/* Photo Frame with 1-Click Upload */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className={`w-20 h-24 rounded border-2 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group transition hover:border-amber-400 shadow-md ${
                          isDark ? "bg-zinc-900 border-zinc-700" : "bg-zinc-200 border-zinc-300"
                        }`}
                        title="Click photo frame to upload profile image"
                      >
                        {editPassForm.avatarUrl ? (
                          <>
                            <img
                              src={editPassForm.avatarUrl}
                              alt={editPassForm.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition text-[9px] font-mono font-bold">
                              <Camera className="h-4 w-4 mb-0.5 text-amber-400" />
                              <span>CHANGE</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <User className="h-8 w-8 text-zinc-400 group-hover:text-amber-400 transition mb-1" />
                            <div className="font-mono text-[8px] text-amber-500 font-bold uppercase tracking-tight flex items-center gap-0.5">
                              <Upload className="h-2.5 w-2.5" /> ADD PHOTO
                            </div>
                          </>
                        )}
                      </button>
                      {editPassForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditPassForm({ ...editPassForm, avatarUrl: undefined });
                          }}
                          className="mt-1 text-[10px] font-mono text-zinc-500 hover:text-rose-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        ISSUED CREDENTIAL
                      </div>
                      <div className="font-extrabold text-lg leading-tight">
                        {editPassForm.name || "Reporter Name"}
                      </div>
                      <div className="font-mono text-xs text-amber-500 font-bold">
                        @{editPassForm.callsign || "callsign"}
                      </div>
                      <div className="font-mono text-xs text-zinc-400 pt-0.5">
                        {editPassForm.role}
                      </div>
                      <div className="font-mono text-[11px] text-zinc-500">
                        {editPassForm.bureau}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-zinc-500">VALID: {editPassForm.issueDate}</span>
                    <div className="flex items-center gap-1.5">
                      {authAccount?.verifiedLocal && (
                        <span
                          title="Verified Local Correspondent: identity and local presence manually confirmed by a super admin."
                          className="flex items-center gap-0.5 px-2 py-0.5 rounded font-black tracking-widest text-[9px] uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        >
                          <ShieldCheck className="h-2.5 w-2.5" />
                          Verified Local
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded font-black tracking-widest text-[9px] uppercase ${editPreviewAccent.badge}`}>
                        ACTIVE CREDENTIAL
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-zinc-400 mt-2 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-amber-400" />
                  <span>Click the photo frame on the badge above to add your profile image.</span>
                </p>
              </div>

              {/* Form fields matching Image 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Full Legal / Byline Name</label>
                  <input
                    type="text"
                    value={editPassForm.name}
                    onChange={(e) => setEditPassForm({ ...editPassForm, name: e.target.value })}
                    className={`w-full rounded px-3 py-2 ${inputThemeClass}`}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Reporter Callsign (handle)</label>
                  <input
                    type="text"
                    value={editPassForm.callsign}
                    onChange={(e) => setEditPassForm({ ...editPassForm, callsign: e.target.value })}
                    className={`w-full rounded px-3 py-2 ${inputThemeClass}`}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Role / Clearance Level</label>
                  <select
                    value={editPassForm.role}
                    onChange={(e) => setEditPassForm({ ...editPassForm, role: e.target.value })}
                    className={`w-full rounded px-3 py-2 cursor-pointer ${inputThemeClass}`}
                  >
                    <option value="Bureau Chief & Field Lead">Bureau Chief & Field Lead</option>
                    <option value="Senior Investigative Correspondent">Senior Investigative Correspondent</option>
                    <option value="Field Reporter & Photographer">Field Reporter & Photographer</option>
                    <option value="Independent Wire Dispatcher">Independent Wire Dispatcher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Bureau / Outlet Affiliation & Corridor</label>
                  <input
                    type="text"
                    value={editPassForm.bureau}
                    onChange={(e) => setEditPassForm({ ...editPassForm, bureau: e.target.value, location: e.target.value })}
                    className={`w-full rounded px-3 py-2 ${inputThemeClass}`}
                  />

                  {/* Corridor / Desk Quick Selectors */}
                  <div className="pt-2">
                    <span className="text-[10px] text-zinc-400 font-mono block mb-1">Select Corridor / Desk:</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { name: "Midwest Corridor Dispatch", loc: "Midwest Corridor", coords: [-87.6298, 40.1245] },
                        { name: "Danville, IL • Vermilion Line", loc: "Danville, IL", coords: [-87.6298, 40.1245] },
                        { name: "Danville Junction Spur", loc: "Danville Junction", coords: [-87.615, 40.132] },
                        { name: "Champaign-Urbana Transit Line", loc: "Champaign, IL", coords: [-88.2434, 40.1164] },
                        { name: "Lafayette, IN • Tippecanoe Desk", loc: "Lafayette, IN", coords: [-86.8753, 40.4173] },
                        { name: "Covington, IN • Wabash Corridor", loc: "Covington, IN", coords: [-87.3928, 40.1406] }
                      ].map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => {
                            setEditPassForm({
                              ...editPassForm,
                              bureau: item.name,
                              location: item.loc,
                              coordinates: item.coords as [number, number]
                            });
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition cursor-pointer ${
                            editPassForm.bureau === item.name
                              ? "bg-amber-500/20 text-amber-400 border-amber-500 font-bold"
                              : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                          }`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Provenance Area Ping Option */}
                  <div className="pt-2.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              const lat = Math.round(pos.coords.latitude * 100) / 100;
                              const lon = Math.round(pos.coords.longitude * 100) / 100;
                              setEditPassForm({
                                ...editPassForm,
                                coordinates: [lon, lat],
                                provenanceEnabled: true,
                                location: editPassForm.location || "General Area Station"
                              });
                              setSavedSuccessToast("General provenance ping attached.");
                              setTimeout(() => setSavedSuccessToast(""), 2500);
                            },
                            () => {
                              setEditPassForm({
                                ...editPassForm,
                                coordinates: [-87.63, 40.12],
                                provenanceEnabled: true,
                                location: editPassForm.location || "Midwest Corridor"
                              });
                              setSavedSuccessToast("General area provenance locked.");
                              setTimeout(() => setSavedSuccessToast(""), 2500);
                            },
                            { enableHighAccuracy: false, timeout: 5000 }
                          );
                        } else {
                          setEditPassForm({
                            ...editPassForm,
                            coordinates: [-87.63, 40.12],
                            provenanceEnabled: true
                          });
                          setSavedSuccessToast("General area provenance locked.");
                          setTimeout(() => setSavedSuccessToast(""), 2500);
                        }
                      }}
                      className={`px-2.5 py-1 rounded border text-xs font-mono transition flex items-center gap-1.5 cursor-pointer ${
                        editPassForm.provenanceEnabled
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold"
                          : "bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      <Radio className="h-3.5 w-3.5" />
                      <span>{editPassForm.provenanceEnabled ? "✓ Provenance Ping Active" : "Attach Provenance (Area Ping)"}</span>
                    </button>
                    {editPassForm.provenanceEnabled && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Vicinity Lock Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Badge Accent Trim matching Image 1 */}
              <div>
                <label className="block text-zinc-400 mb-2">Badge Accent Trim</label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "amber", label: "Amber Gold", class: "bg-amber-500" },
                    { id: "emerald", label: "Emerald Press", class: "bg-emerald-500" },
                    { id: "cyan", label: "Cyber Cyan", class: "bg-cyan-500" },
                    { id: "rose", label: "Wire Crimson", class: "bg-rose-500" },
                    { id: "zinc", label: "Monoprint", class: "bg-zinc-400" }
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setEditPassForm({ ...editPassForm, accentColor: col.id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] transition cursor-pointer ${
                        editPassForm.accentColor === col.id
                          ? "border-white bg-zinc-800 text-white font-bold"
                          : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${col.class}`} />
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className={`flex-shrink-0 p-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${
              isDark ? "bg-zinc-950/80" : "bg-zinc-50"
            }`}>
              <button
                type="button"
                onClick={() => setShowPressPassModal(false)}
                className="px-4 py-2 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  savePass(editPassForm);
                  setShowPressPassModal(false);
                }}
                className="px-5 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Save Press Pass Credentials</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 6b. ACCOUNT SIGN IN / SIGN UP MODAL                                        */}
      {/*     Cross-device account access. Separate from the local Press Pass ID.   */}
      {/* ========================================================================= */}
      {authModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-sm rounded-xl border shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                {authModalMode === "signup" ? (
                  <UserPlus className="h-5 w-5 text-cyan-500" />
                ) : (
                  <Lock className="h-5 w-5 text-cyan-500" />
                )}
                <h3 className="font-bold text-base">
                  {authModalMode === "signup" ? "Create Account" : "Sign In"}
                </h3>
              </div>
              <button
                onClick={() => { setAuthModalMode(null); setAuthError(""); }}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={submitAuthForm} className="p-5 sm:p-6 space-y-4 font-mono text-xs">
              <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                {authModalMode === "signup"
                  ? "Sign up to sync your Press Pass and dispatches across devices."
                  : "Sign in to access your account on this device."}
              </p>

              {authModalMode === "signup" && (
                <>
                  <div className="space-y-1">
                    <label className={`block font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Name</label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                      className={`w-full px-3 py-2 rounded border text-xs font-mono ${inputThemeClass}`}
                      placeholder="Jane Reporter"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Callsign</label>
                    <input
                      type="text"
                      value={authCallsign}
                      onChange={(e) => setAuthCallsign(e.target.value)}
                      required
                      pattern="[A-Za-z0-9._]{3,32}"
                      title="3-32 characters: letters, numbers, dots, underscores"
                      className={`w-full px-3 py-2 rounded border text-xs font-mono ${inputThemeClass}`}
                      placeholder="jreporter"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`block font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Profile Photo (optional)</label>
                    <input
                      ref={authAvatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAuthAvatarFile(e.target.files?.[0] || null)}
                      className={`w-full text-xs ${inputThemeClass}`}
                    />
                    {authAvatarFile && <p className={`text-[11px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Selected: {authAvatarFile.name}</p>}
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className={`block font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded border text-xs font-mono ${inputThemeClass}`}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className={`block font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  minLength={8}
                  className={`w-full px-3 py-2 rounded border text-xs font-mono ${inputThemeClass}`}
                  placeholder="••••••••"
                />
                {authModalMode === "signin" && (
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode("forgot"); setAuthError(""); setAuthResetSent(false); }}
                    className={`text-[11px] underline underline-offset-2 cursor-pointer ${
                      isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {authError && (
                <div className="flex items-start gap-1.5 text-rose-500 text-[11px]">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full px-4 py-2.5 rounded bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {authModalMode === "signup" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                <span>{authLoading ? "Please wait..." : authModalMode === "signup" ? "Create account" : "Sign in"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthModalMode(authModalMode === "signup" ? "signin" : "signup");
                  setAuthError("");
                }}
                className={`w-full text-center text-[11px] underline underline-offset-2 cursor-pointer ${
                  isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {authModalMode === "signup"
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Forgot-password modal */}
      {authModalMode === "forgot" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-sm rounded-xl border shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <Mail className="h-5 w-5 text-cyan-500" />
                <h3 className="font-bold text-base">Reset Password</h3>
              </div>
              <button
                onClick={() => { setAuthModalMode(null); setAuthError(""); setAuthResetSent(false); }}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 font-mono text-xs">
              {authResetSent ? (
                <>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                      If that email is registered, a reset link is on its way. Check your inbox — the link expires in 30 minutes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode("signin"); setAuthError(""); setAuthResetSent(false); }}
                    className="w-full px-4 py-2.5 rounded bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to sign in</span>
                  </button>
                </>
              ) : (
                <form onSubmit={submitForgotPassword} className="space-y-4">
                  <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Enter the email on your account and we'll send you a link to reset your password.
                  </p>
                  <div className="space-y-1">
                    <label className={`block font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>Email</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      className={`w-full px-3 py-2 rounded border text-xs font-mono ${inputThemeClass}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {authError && (
                    <div className="flex items-start gap-1.5 text-rose-500 text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full px-4 py-2.5 rounded bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{authLoading ? "Sending..." : "Send reset link"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode("signin"); setAuthError(""); }}
                    className={`w-full text-center text-[11px] underline underline-offset-2 cursor-pointer ${
                      isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    Back to sign in
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset-password modal (reached via emailed link) */}
      {authModalMode === "reset" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-sm rounded-xl border shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <Lock className="h-5 w-5 text-cyan-500" />
                <h3 className="font-bold text-base">Set New Password</h3>
              </div>
              <button
                onClick={() => { setAuthModalMode(null); setAuthError(""); setAuthResetDone(false); }}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 font-mono text-xs">
              {authResetDone ? (
                <>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                      Your password has been reset. Sign in with your new password below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setAuthModalMode("signin"); setAuthError(""); setAuthResetDone(false); }}
                    className="w-full px-4 py-2.5 rounded bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Sign in</span>
                  </button>
                </>
              ) : (
                <form onSubmit={submitResetPassword} className="space-y-4">
                  <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    Choose a new password for your account.
                  </p>
                  <div className="space-y-1">
                    <label className={`block font-bold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>New password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      minLength={8}
                      className={`w-full px-3 py-2 rounded border text-xs font-mono ${inputThemeClass}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {authError && (
                    <div className="flex items-start gap-1.5 text-rose-500 text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full px-4 py-2.5 rounded bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{authLoading ? "Saving..." : "Set new password"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. IMMERSIVE FULL-PAGE PRESSIE READER WITH REACTS & COMMENTS              */}
      {/* ========================================================================= */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-md overflow-y-auto font-mono">
          <div className={`w-full max-w-4xl mx-auto my-4 sm:my-8 rounded-2xl border shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            {/* Sticky Header Navigation */}
            <div className={`sticky top-0 z-20 px-6 py-4 border-b flex items-center justify-between backdrop-blur-md ${
              isDark ? "bg-zinc-900/95 border-zinc-800" : "bg-white/95 border-zinc-200"
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedStory(null)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  ← Back to Feed
                </button>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[11px] font-bold uppercase">
                  {selectedStory.category}
                </span>
                <span className="text-zinc-400 text-xs">[{selectedStory.location}]</span>
                <span className="font-mono text-[10px] text-zinc-500 tracking-wide">{selectedStory.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareStory(selectedStory)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-10 space-y-6">
              {/* Evidence Photo Banner */}
              {selectedStory.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 relative aspect-video max-h-[480px] bg-black shadow-lg">
                  <img src={selectedStory.imageUrl} alt={selectedStory.title} className="w-full h-full object-cover" />
                  {selectedStory.imageCaption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs p-3 text-xs text-zinc-300 border-t border-zinc-800">
                      <span className="text-amber-400 font-bold">EVIDENCE STILL:</span> {selectedStory.imageCaption}
                    </div>
                  )}
                </div>
              )}

              {/* Headline & Metadata */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  {selectedStory.title}
                </h1>
                <div className={`pb-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${borderThemeClass} ${subTextThemeClass}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-200">Byline:</span>
                    <span>{selectedStory.author} (@{selectedStory.callsign})</span>
                    <span>•</span>
                    <span>{selectedStory.bureau}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{selectedStory.timestamp}</span>
                    {wasDispatchEdited(selectedStory) && (
                      <span className="italic" title="This dispatch was edited after it was first published">(edited)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Body Narrative */}
              <div className="text-base sm:text-lg leading-relaxed font-serif whitespace-pre-wrap py-2">
                {selectedStory.content}
              </div>

              {/* Telemetry Footer */}
              {selectedStory.coordinates && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${subCardThemeClass}`}>
                  <MapPin className="h-4 w-4 text-amber-500" />
                  <span>Vicinity: <strong>{selectedStory.location || "Regional dispatch area"}</strong></span>
                </div>
              )}

              {/* ========================================================= */}
              {/* REACTION BAR (COMPACT & ACCURATE IN FULL PAGE ONLY)       */}
              {/* ========================================================= */}
              <div className={`pt-5 border-t ${borderThemeClass} space-y-2.5`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <span>⚡</span> Correspondent Reacts
                  </span>
                  <span className={`text-[11px] ${subTextThemeClass}`}>
                    Verified reacts
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: "frontpage", emoji: "📰", label: "Front Page", count: getReactsForDispatch(selectedStory.id).frontpage },
                    { key: "signal", emoji: "⚡", label: "Signal", count: getReactsForDispatch(selectedStory.id).signal },
                    { key: "investigate", emoji: "🔍", label: "Investigate", count: getReactsForDispatch(selectedStory.id).investigate },
                    { key: "solidarity", emoji: "🤝", label: "Solidarity", count: getReactsForDispatch(selectedStory.id).solidarity },
                    { key: "broadcast", emoji: "📡", label: "Broadcast", count: getReactsForDispatch(selectedStory.id).broadcast },
                    { key: "dispute", emoji: "🔻", label: "Disputed", count: getReactsForDispatch(selectedStory.id).dispute, isNegative: true },
                  ].map((r) => {
                    const isSelected = !!getUserReactsForDispatch(selectedStory.id)[r.key];
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => handleToggleReaction(selectedStory.id, r.key as keyof StoryReactions)}
                        className={`px-2 py-1 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer select-none shadow-2xs ${
                          isSelected
                            ? r.isNegative
                              ? "bg-rose-500/20 border-rose-500 text-rose-300 font-bold ring-1 ring-rose-400"
                              : "bg-amber-500/20 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-400"
                            : r.isNegative
                              ? "bg-zinc-800/40 hover:bg-rose-500/10 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 border-zinc-700/50"
                              : "bg-zinc-800/40 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border-zinc-700/50"
                        }`}
                        title={r.isNegative ? "Disputed: Safe scrutiny / fact-check flag" : r.label}
                      >
                        <span className="text-xs">{r.emoji}</span>
                        <span>{r.label}</span>
                        <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${
                          isSelected
                            ? r.isNegative ? "bg-rose-500 text-white" : "bg-amber-500 text-zinc-950"
                            : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {r.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleReportDispatch(selectedStory.id)}
                    disabled={reportInFlightId === selectedStory.id}
                    className="px-2 py-1 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer select-none bg-zinc-800/40 hover:bg-rose-500/10 hover:border-rose-500/40 text-zinc-500 hover:text-rose-400 border-zinc-700/50 disabled:opacity-50"
                    title="Report this dispatch to admins"
                  >
                    <span className="text-xs">🚩</span>
                    <span>{reportSubmittedId === selectedStory.id ? "Reported" : "Report"}</span>
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* FIELD COMMENTS SECTION (BELOW REACTIONS)                 */}
              {/* ========================================================= */}
              <div className={`pt-5 border-t ${borderThemeClass} space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Field Commentary & Dispatch Notes ({getCommentsForDispatch(selectedStory.id).length})
                  </span>
                </div>

                {/* New Comment Input Box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCommentText.trim()) return;
                    addCommentToDispatch(selectedStory.id, newCommentText);
                    setNewCommentText("");
                  }}
                  className="space-y-2"
                >
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={`Add field commentary or verification update as @${pressPass.callsign || "ras.ip"}...`}
                    className={`w-full rounded-lg p-3 text-xs focus:outline-none transition ${inputThemeClass}`}
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newCommentText.trim()}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Dispatch Field Note</span>
                    </button>
                  </div>

                  {/* Reader Quick Emoji Ribbon */}
                  <div className="flex flex-wrap items-center gap-1 pt-1 text-xs">
                    <span className="text-[10px] text-zinc-400 font-mono mr-1">Insert Emoji:</span>
                    {["📰", "⚡", "🔍", "💬", "🤝", "🔥", "🔻", "📡", "👍", "❤️"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setNewCommentText((prev) => prev + " " + em)}
                        className="px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-700 text-xs border border-zinc-700/50 transition cursor-pointer select-none"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </form>

                {/* Comment Feed */}
                <div className="space-y-2.5 pt-2">
                  {getCommentsForDispatch(selectedStory.id).length === 0 ? (
                    <p className={`text-xs italic ${subTextThemeClass}`}>No commentary filed yet. Be the first correspondent to comment.</p>
                  ) : (
                    getCommentsForDispatch(selectedStory.id).map((c) => (
                      <div key={c.id} className={`p-3.5 rounded-lg border space-y-1.5 ${subCardThemeClass}`}>
                        <div className="flex items-center justify-between text-xs">
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
                            onClick={() => openCorrespondentFromComment(c.author, c.callsign)}
                          >
                            <span className="font-bold text-zinc-200">{c.author}</span>
                            <span className="text-amber-500 font-semibold text-[11px]">@{c.callsign}</span>
                          </div>
                          <span className={`text-[10px] ${subTextThemeClass}`}>{c.timestamp}</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                          {c.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7B. FRONT-PAGE DISPATCH CLIPPING & SOCIAL MEDIA DIRECT SHARE HUB          */}
      {/* ========================================================================= */}
      {shareModalStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
          <div className={`w-full max-w-xl rounded-xl border-2 shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            {/* Header */}
            <div className={`flex-shrink-0 p-4 border-b flex items-center justify-between text-xs ${borderThemeClass}`}>
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-amber-500" />
                <span className="font-bold uppercase tracking-wider">Share Pressie & Export Visual Card</span>
              </div>
              <button
                onClick={() => setShareModalStory(null)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Mode Toggle: Visual Social Graphic vs Broadsheet */}
              <div className={`grid grid-cols-2 p-1 rounded-lg border text-xs font-mono ${
                isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-200 border-zinc-300"
              }`}>
                <button
                  type="button"
                  onClick={() => setShareViewMode("card")}
                  className={`py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    shareViewMode === "card"
                      ? "bg-amber-500 text-zinc-950 shadow-xs"
                      : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Social Graphic (1200×675)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShareViewMode("broadsheet")}
                  className={`py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    shareViewMode === "broadsheet"
                      ? "bg-amber-500 text-zinc-950 shadow-xs"
                      : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Broadsheet Text Clipping</span>
                </button>
              </div>

              {/* View 1: High-Res Social Graphic Card */}
              {shareViewMode === "card" && (
                <div className="space-y-2">
                  <div className="rounded-xl overflow-hidden border border-zinc-700 bg-black relative aspect-video flex items-center justify-center shadow-lg">
                    {pressieCardUrl ? (
                      <img
                        src={pressieCardUrl}
                        alt="Rendered Social Pressie Card"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs font-mono text-zinc-400 gap-2 p-6">
                        <RefreshCw className="h-5 w-5 text-amber-500 animate-spin" />
                        <span>Rendering 1200×675 Pressie Graphic...</span>
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/80 text-amber-400 border border-amber-500/30">
                      {shareModalStory.editionStyle ? `${shareModalStory.editionStyle.toUpperCase()} EDITION` : 'HD PRESSIE CLIPPING'}
                    </span>
                  </div>

                  {/* Primary Media Actions */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      disabled={!pressieCardBlob}
                      onClick={async () => {
                        if (!pressieCardBlob) return;
                        const shareUrl = `${buildDispatchShareUrl(shareModalStory.id)}`;
                        const shareText = `📰 FIELDPRESS DISPATCH: "${shareModalStory.title}" [${shareModalStory.location}] by ${shareModalStory.author} (@${shareModalStory.callsign})

${shareUrl}`;
                        try {
                          const file = new File([pressieCardBlob], `fieldpress-${shareModalStory.id}.png`, { type: "image/png" });
                          if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                              title: `FieldPress: ${shareModalStory.title}`,
                              text: shareText,
                              files: [file]
                            });
                            return;
                          }
                        } catch {}
                        if (typeof navigator !== "undefined" && navigator.share) {
                          navigator.share({ title: `FieldPress: ${shareModalStory.title}`, text: shareText, url: shareUrl }).catch(() => {});
                        }
                      }}
                      className="p-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      title="Attach image to Twitter, iMessage, WhatsApp, Slack"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share Image</span>
                    </button>

                    <button
                      type="button"
                      disabled={!pressieCardBlob}
                      onClick={async () => {
                        if (!pressieCardBlob) return;
                        try {
                          if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
                            await navigator.clipboard.write([
                              new ClipboardItem({ "image/png": pressieCardBlob })
                            ]);
                            setSavedSuccessToast("Pressie image copied to clipboard! Paste directly into X, Reddit, or Discord.");
                            setTimeout(() => setSavedSuccessToast(""), 3000);
                          }
                        } catch {
                          setSavedSuccessToast("Could not copy image directly; use Download PNG.");
                          setTimeout(() => setSavedSuccessToast(""), 2500);
                        }
                      }}
                      className="p-2 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Copy PNG image to clipboard to paste into tweets, discord, reddit"
                    >
                      <Copy className="h-3.5 w-3.5 text-amber-400" />
                      <span>Copy Image</span>
                    </button>

                    <button
                      type="button"
                      disabled={!pressieCardUrl}
                      onClick={() => {
                        if (!pressieCardUrl) return;
                        const a = document.createElement("a");
                        a.href = pressieCardUrl;
                        a.download = `fieldpress-${shareModalStory.id}.png`;
                        a.click();
                        setSavedSuccessToast("Pressie PNG graphic downloaded.");
                        setTimeout(() => setSavedSuccessToast(""), 2500);
                      }}
                      className="p-2 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Download PNG</span>
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Broadsheet Clipping */}
              {shareViewMode === "broadsheet" && (
                <div className={`p-4 rounded-lg border ${
                  isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                } shadow-sm space-y-3`}>
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-amber-500 font-black">Fp_</span>
                      <span>FIELDPRESS SYNDICATED WIRE</span>
                    </div>
                    <span>{shareModalStory.timestamp}</span>
                  </div>

                  {shareModalStory.imageUrl && (
                    <div className="rounded-md overflow-hidden border border-zinc-800 relative aspect-video bg-black shadow-sm">
                      <img
                        src={shareModalStory.imageUrl}
                        alt={shareModalStory.title}
                        className="w-full h-full object-cover"
                      />
                      {shareModalStory.imageCaption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1.5 text-[10px] text-zinc-300">
                          {shareModalStory.imageCaption}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold uppercase">
                        {shareModalStory.category}
                      </span>
                      <span className="text-zinc-400 font-bold">[{shareModalStory.location}]</span>
                    </div>
                    <h3 className="text-base font-bold leading-snug">
                      {shareModalStory.title}
                    </h3>
                    <p className={`text-xs font-serif leading-relaxed line-clamp-3 ${
                      isDark ? "text-zinc-300" : "text-zinc-700"
                    }`}>
                      {shareModalStory.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Byline: {shareModalStory.author} (@{shareModalStory.callsign})</span>
                    <span className="text-emerald-500 font-bold">VERIFIED DISPATCH</span>
                  </div>
                </div>
              )}

              {/* Share to Wire: Facebook-style repost with attribution preserved */}
              {shareModalStory.author !== pressPass.name && shareModalStory.callsign !== pressPass.callsign && (
                <div>
                  <button
                    type="button"
                    onClick={() => handleRepostToWire(shareModalStory)}
                    className="w-full p-2.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition flex items-center justify-center gap-2 font-bold cursor-pointer"
                    title="Repost to your Wire feed with original byline preserved"
                  >
                    <span>🔁</span>
                    <span>Share to Wire (keeps @{shareModalStory.callsign}'s byline)</span>
                  </button>
                </div>
              )}

              {/* Direct Social Channels with Rich Story Prefill */}
              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-400">
                  Broadcast Direct to Social Networks:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`📰 FieldPress Dispatch: "${shareModalStory.title}" [${shareModalStory.location}]\n\n"${shareModalStory.content.slice(0, 110)}..."\n\nBy @${shareModalStory.callsign}`)}&url=${encodeURIComponent(`${buildDispatchShareUrl(shareModalStory.id)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-zinc-700 bg-black text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2 font-bold cursor-pointer"
                  >
                    <span>𝕏</span>
                    <span>X (Twitter)</span>
                  </a>

                  <a
                    href={`https://bsky.app/intent/compose?text=${encodeURIComponent(`📰 FieldPress: "${shareModalStory.title}" [${shareModalStory.location}]\nBy @${shareModalStory.callsign}\n\n${buildDispatchShareUrl(shareModalStory.id)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-sky-500/40 bg-sky-600/10 text-sky-400 hover:bg-sky-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>🦋</span>
                    <span>Bluesky</span>
                  </a>

<a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${buildDispatchShareUrl(shareModalStory.id)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-blue-600/40 bg-[#1877F2]/15 text-[#1877F2] hover:bg-[#1877F2]/25 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span className="font-serif font-black text-sm">f</span>
                    <span>Facebook</span>
                  </a>

                  <a
                    href={`https://www.reddit.com/submit?url=${encodeURIComponent(`${buildDispatchShareUrl(shareModalStory.id)}`)}&title=${encodeURIComponent(`[FieldPress] ${shareModalStory.title} (${shareModalStory.location})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-orange-500/40 bg-orange-600/10 text-orange-500 hover:bg-orange-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>Reddit</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`📰 *FieldPress Dispatch*: "${shareModalStory.title}"\n📍 [${shareModalStory.location}] By ${shareModalStory.author} (@${shareModalStory.callsign})\n\n"${shareModalStory.content.slice(0, 140)}..."\n\n${buildDispatchShareUrl(shareModalStory.id)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(`${buildDispatchShareUrl(shareModalStory.id)}`)}&text=${encodeURIComponent(`📰 FieldPress Dispatch: "${shareModalStory.title}" [${shareModalStory.location}]`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-cyan-500/40 bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>Telegram</span>
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${buildDispatchShareUrl(shareModalStory.id)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-blue-500/40 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* Auxiliary Copy Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${buildDispatchShareUrl(shareModalStory.id)}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareUrl);
                    }
                    setSavedSuccessToast("Deep link copied to clipboard.");
                    setTimeout(() => setSavedSuccessToast(""), 2500);
                  }}
                  className="px-3 py-2 rounded border border-zinc-700 hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer font-bold text-zinc-200"
                >
                  <Share2 className="h-3.5 w-3.5 text-amber-400" />
                  <span>Copy Web Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${buildDispatchShareUrl(shareModalStory.id)}`;
                    const text = `📰 FIELDPRESS WIRE DISPATCH: "${shareModalStory.title}"\n📍 Location: [${shareModalStory.location}] | Category: [${shareModalStory.category}]\n✍️ Byline: ${shareModalStory.author} (@${shareModalStory.callsign})\n\n"${shareModalStory.content}"\n\n🔗 Verified Dispatch Link: ${shareUrl}`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(text);
                      setSavedSuccessToast("Full pressie text & citation copied.");
                      setTimeout(() => setSavedSuccessToast(""), 2500);
                    }
                  }}
                  className="px-3 py-2 rounded border border-zinc-700 hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 cursor-pointer font-bold text-zinc-200"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Copy Full Text</span>
                </button>
              </div>
            </div>

            <div className={`p-4 border-t flex justify-end text-xs ${borderThemeClass} ${
              isDark ? "bg-zinc-950/80" : "bg-zinc-50"
            }`}>
              <button
                type="button"
                onClick={() => setShareModalStory(null)}
                className="px-4 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* 8. POST COMMUNITY NOTICE MODAL (CLASSIFIEDS)                               */}
      {/* ========================================================================= */}
      {showPostNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-xl border shadow-2xl p-6 font-mono text-xs ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <h3 className="font-bold text-sm">Post Community Bulletin Notice</h3>
              <button onClick={() => setShowPostNoticeModal(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Notice Category</label>
                <select
                  value={noticeTag}
                  onChange={(e) => setNoticeTag(e.target.value)}
                  className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
                >
                  <option value="NOTICE">NOTICE</option>
                  <option value="EQUIPMENT">EQUIPMENT</option>
                  <option value="TRANSIT">TRANSIT</option>
                  <option value="ALERT">ALERT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Route 1 Volunteer Packet Check-in"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                  className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Notice Details</label>
                <textarea
                  rows={3}
                  placeholder="Details, venue, requirements..."
                  value={noticeDetails}
                  onChange={(e) => setNoticeDetails(e.target.value)}
                  required
                  className={`w-full rounded px-2.5 py-1.5 font-sans ${inputThemeClass}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Contact Coordinate</label>
                <input
                  type="text"
                  placeholder="Email, packet frequency, or signal handle"
                  value={noticeContact}
                  onChange={(e) => setNoticeContact(e.target.value)}
                  className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostNoticeModal(false)}
                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400"
                >
                  Post Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8B. INSTANT MESSAGING DRAWER / MODAL (FIELD COMMS WIRE: DMs & GROUPS)     */}
      {/* ========================================================================= */}
            {/* 8D. COHORT REQUEST & PROPOSAL MODAL */}
{showCohortRequestModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs">
          <div className={`w-full max-w-lg max-h-[80vh] rounded-2xl border shadow-2xl p-6 space-y-4 flex flex-col ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-zinc-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm">Find Cohorts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCohortRequestModal(false)}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className={`text-[11px] leading-relaxed flex-shrink-0 ${subTextThemeClass}`}>
              Search real registered correspondents by name or callsign. Send a cohort request — once they accept, you're both linked and can message directly.
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={cohortDirectoryQuery}
                onChange={(e) => {
                  setCohortDirectoryQuery(e.target.value);
                  searchCohortDirectory(e.target.value);
                }}
                placeholder="Search by name or callsign..."
                className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 min-h-[200px]">
              {cohortDirectoryLoading ? (
                <p className={`text-[11px] text-center py-8 ${subTextThemeClass}`}>Searching...</p>
              ) : cohortDirectoryResults.length === 0 ? (
                <p className={`text-[11px] text-center py-8 ${subTextThemeClass}`}>
                  {cohortDirectoryQuery.trim() ? "No correspondents found." : "Start typing to search the correspondent directory."}
                </p>
              ) : (
                cohortDirectoryResults.map((u) => (
                  <div
                    key={u.id}
                    className={`p-2.5 rounded-xl flex items-center gap-2.5 border ${subCardThemeClass}`}
                  >
                    <img
                      src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(u.callsign)}`}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{u.name}</p>
                      <p className={`text-xs truncate ${subTextThemeClass}`}>@{u.callsign} · {u.bureau}</p>
                    </div>
                    {u.relation === "cohort" ? (
                      <span className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[11px] font-bold flex-shrink-0">
                        Cohort
                      </span>
                    ) : u.relation === "pending_sent" ? (
                      <span className="px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-[11px] font-bold flex-shrink-0">
                        Requested
                      </span>
                    ) : u.relation === "pending_received" ? (
                      <span className="px-2.5 py-1.5 rounded-lg border border-amber-500/40 text-amber-400 text-[11px] font-bold flex-shrink-0">
                        Check Requests
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={cohortActionPendingId === u.id}
                        onClick={() => sendCohortRequest(u.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition text-[11px] flex-shrink-0 cursor-pointer disabled:opacity-60"
                      >
                        {cohortActionPendingId === u.id ? "Sending..." : "Request"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      {showMessengerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
          <div className={`w-full max-w-5xl h-[85vh] max-h-[720px] rounded-2xl border shadow-2xl flex flex-col md:flex-row overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            {/* Left Column: User Directory Index & Linked Users List */}
            <div className={`w-full md:w-80 border-b md:border-b-0 md:border-r flex flex-col flex-shrink-0 ${
              isDark ? "bg-zinc-950/70 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            }`}>
              {/* Directory Header */}
              <div className={`p-3.5 border-b flex items-center justify-between ${borderThemeClass}`}>
                <span className="font-bold text-sm">Messages</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMessengerModal(false);
                      setActiveTab("discover");
                    }}
                    className={`p-1.5 rounded-lg border transition cursor-pointer relative ${
                      isDark ? "border-zinc-700/60 hover:bg-zinc-800 text-zinc-400" : "border-zinc-300 hover:bg-zinc-200 text-zinc-500"
                    }`}
                    title="Discover people to connect with"
                  >
                    <Users className="h-4 w-4" />
                    {suggestedCohorts.length > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-500 text-zinc-950 text-[8px] font-bold flex items-center justify-center">
                        {suggestedCohorts.length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCohortRequestModal(true)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isDark ? "border-zinc-700/60 hover:bg-zinc-800 text-zinc-400" : "border-zinc-300 hover:bg-zinc-200 text-zinc-500"
                    }`}
                    title="Find cohorts to connect with"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pending Cohort Requests — someone wants to connect */}
              {incomingCohortRequests.length > 0 && (
                <div className="px-3 pb-2 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500 px-1">
                    Cohort Requests ({incomingCohortRequests.length})
                  </p>
                  {incomingCohortRequests.map((r) => (
                    <div key={r.requestId} className={`p-2.5 rounded-xl flex items-center gap-2.5 border ${subCardThemeClass}`}>
                      <img
                        src={r.user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(r.user.callsign)}`}
                        alt={r.user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{r.user.name}</p>
                        <p className={`text-[10px] truncate ${subTextThemeClass}`}>@{r.user.callsign}</p>
                      </div>
                      <button
                        type="button"
                        disabled={cohortActionPendingId === r.requestId}
                        onClick={() => respondToCohortRequest(r.requestId, "accept")}
                        className="px-2 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-[10px] cursor-pointer disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={cohortActionPendingId === r.requestId}
                        onClick={() => respondToCohortRequest(r.requestId, "decline")}
                        className="px-2 py-1 rounded-lg border border-zinc-700 text-zinc-400 font-bold text-[10px] cursor-pointer disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Simple search */}
              <div className="px-3 pt-3 pb-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${
                  isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-500"
                }`}>
                  <Search className="h-3.5 w-3.5 flex-shrink-0" />
                  <input
                    type="text"
                    value={messengerSearchQuery}
                    onChange={(e) => setMessengerSearchQuery(e.target.value)}
                    placeholder="Search"
                    className="bg-transparent flex-1 outline-none placeholder:text-zinc-500 text-xs"
                  />
                </div>
              </div>

              {/* Group Channel Quick Link */}
              <div className="px-3 pb-1">
                <div
                  onClick={() => setActiveChatId("midwest-bureau")}
                  className={`p-2.5 rounded-xl transition flex items-center gap-2.5 cursor-pointer ${
                    activeChatId === "midwest-bureau"
                      ? isDark ? "bg-amber-500/15 text-amber-200" : "bg-amber-50 text-amber-950"
                      : isDark ? "hover:bg-zinc-800/60 text-zinc-300" : "hover:bg-zinc-100 text-zinc-800"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    #
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">Everyone</p>
                    <p className={`text-xs truncate ${subTextThemeClass}`}>Group chat</p>
                  </div>
                </div>
              </div>

              {/* Conversation list — real cohorts only, one thread per accepted
                  cohort request. Blocked cohorts are already excluded
                  server-side in /api/messenger/threads. */}
              <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-2">
                {messengerThreads
                  .filter((t) =>
                    !messengerSearchQuery.trim() ||
                    t.user.name.toLowerCase().includes(messengerSearchQuery.toLowerCase()) ||
                    t.user.callsign.toLowerCase().includes(messengerSearchQuery.toLowerCase())
                  )
                  .map((t) => {
                  const u = t.user;
                  const isSelected = activeChatId === u.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => setActiveChatId(u.id)}
                      className={`p-2.5 rounded-xl transition cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? isDark ? "bg-amber-500/15 text-amber-200" : "bg-amber-50 text-amber-950"
                          : isDark ? "hover:bg-zinc-800/60 text-zinc-300" : "hover:bg-zinc-100 text-zinc-800"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(u.callsign)}`}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold truncate">{u.name}</span>
                          {t.unreadCount > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-bold flex-shrink-0">
                              {t.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${subTextThemeClass}`}>
                          {t.lastMessage ? t.lastMessage.body : `@${u.callsign}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {messengerThreads.length === 0 && (
                  <p className={`text-xs text-center px-2 py-6 ${subTextThemeClass}`}>
                    No cohorts yet. Find one from the Discover tab to start a conversation.
                  </p>
                )}
              </div>

              {/* Your Press Pass Identity Footer */}
              <div className={`p-3 border-t flex items-center justify-between text-xs font-mono ${borderThemeClass} ${subTextThemeClass}`}>
                <div className="flex items-center gap-2 truncate">
                  <img src={pressPass.avatarUrl || "/pressyo-icon.jpg"} alt={pressPass.callsign || "Guest"} className="w-5 h-5 rounded-full object-cover border border-amber-500/50" />
                  <span className="truncate">
                    @{pressPass.callsign || "guest"}
                    {authAccount?.role === "super_admin" && " (Bureau Chief)"}
                  </span>
                </div>
                {authAccount?.role === "super_admin" && (
                  <span className="text-[10px] text-amber-400 font-bold">ADMIN</span>
                )}
              </div>
            </div>

            {/* Right Column: Real Messenger Conversation Stream */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Active Conversation Header */}
              {(() => {
                const isGroup = activeChatId === GROUP_CHAT_ID;
                const activeThread = messengerThreads.find((t) => t.user.id === activeChatId);
                const activeUser = activeThread?.user;

                return (
                  <div className={`p-4 border-b flex items-center justify-between flex-shrink-0 ${borderThemeClass} ${
                    isDark ? "bg-zinc-900/90" : "bg-white/90"
                  }`}>
                    <div className="flex items-center gap-3">
                      {isGroup ? (
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-sm">
                          #
                        </div>
                      ) : activeUser ? (
                        <img
                          src={activeUser.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(activeUser.callsign)}`}
                          alt={activeUser.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-amber-500/60 shadow-xs"
                        />
                      ) : null}
                      <div>
                        <h2 className="text-sm font-semibold">
                          {isGroup ? "Everyone" : activeUser ? activeUser.name : "Messages"}
                        </h2>
                        <p className={`text-xs mt-0.5 ${subTextThemeClass}`}>
                          {isGroup
                            ? "Group chat"
                            : activeUser
                              ? `@${activeUser.callsign}${activeUser.bureau ? " • " + activeUser.bureau : ""}`
                              : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {activeUser && (
                        <button
                          type="button"
                          onClick={() => handleToggleBlock(activeUser.id)}
                          disabled={blockActionPendingId === activeUser.id}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono transition cursor-pointer disabled:opacity-50 ${
                            blockedUserIds.has(activeUser.id)
                              ? "border-rose-500 bg-rose-500/10 text-rose-300"
                              : "border-zinc-700/60 hover:bg-rose-500/10 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400"
                          }`}
                          title={blockedUserIds.has(activeUser.id) ? "Unblock this correspondent" : "Block this correspondent"}
                        >
                          {blockedUserIds.has(activeUser.id) ? "Unblock" : "Block"}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowMessengerModal(false)}
                        className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
                        title="Close messages"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Message Stream — group chat stays on the old fake/local
                  system (explicitly out of scope for this rewire); real
                  DMs load from the server, cohort-gated, text-only for v1. */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeChatId === GROUP_CHAT_ID ? (
                  messengerMessages.filter((m) => m.chatId === activeChatId).length === 0 ? (
                    <div className={`p-8 rounded-lg border text-center text-xs ${subCardThemeClass} ${subTextThemeClass} max-w-sm mx-auto my-auto space-y-2.5`}>
                      <MessageCircle className="h-8 w-8 text-amber-500 mx-auto" />
                      <p className="font-semibold text-sm">No messages yet</p>
                      <p className="text-[11px] leading-relaxed text-zinc-400">
                        Send a message or share a photo below.
                      </p>
                    </div>
                  ) : (
                    messengerMessages
                      .filter((m) => m.chatId === activeChatId)
                      .map((m) => {
                        const isMe = m.callsign === (pressPass.callsign || "ViBiR") || m.sender === pressPass.name;
                        const senderAvatar = isMe ? pressPass.avatarUrl : m.avatarUrl;

                        return (
                          <div
                            key={m.id}
                            className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"} items-start`}
                          >
                            {senderAvatar ? (
                              <img
                                src={senderAvatar}
                                alt={m.sender}
                                className="w-8 h-8 rounded-lg object-cover border border-amber-500/40 flex-shrink-0 mt-0.5"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-300 border border-zinc-600 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                                {m.sender[0]}
                              </div>
                            )}

                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                              <div className="flex items-center gap-1 text-[10px] font-mono mb-1.5 text-zinc-500 px-1.5">
                                <span className="font-bold text-zinc-300">{m.sender}</span>
                                <span className="text-amber-600">@{m.callsign}</span>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-600">{m.timestamp}</span>
                              </div>

                              <div className={`rounded-xl p-3 text-xs sm:text-sm leading-relaxed border space-y-2 ${
                                isMe
                                  ? "bg-amber-600 border-amber-600 text-white rounded-tr-none"
                                  : isDark
                                    ? "bg-zinc-800 border-zinc-700 text-zinc-100 rounded-tl-none"
                                    : "bg-zinc-100 border-zinc-200 text-zinc-900 rounded-tl-none"
                              }`}>
                                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}

                                {m.imageUrl && (
                                  <div className="rounded-lg overflow-hidden border border-zinc-700/50 aspect-video max-h-40 bg-black">
                                    <img src={m.imageUrl} alt="Shared still" className="w-full h-full object-cover" />
                                  </div>
                                )}

                                {m.linkUrl && (
                                  <a
                                    href={m.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                                      isMe
                                        ? "bg-amber-700/80 text-amber-100 hover:bg-amber-700"
                                        : isDark
                                          ? "bg-zinc-950/60 text-cyan-400 hover:text-cyan-300"
                                          : "bg-zinc-200 text-blue-600 hover:text-blue-700"
                                    }`}
                                  >
                                    <Link2 className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{m.linkUrl}</span>
                                    <ExternalLink className="h-3 w-3 ml-auto flex-shrink-0 opacity-70" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )
                ) : realThreadLoading ? (
                  <p className={`text-xs text-center py-8 ${subTextThemeClass}`}>Loading conversation...</p>
                ) : realMessages.length === 0 ? (
                  <div className={`p-8 rounded-lg border text-center text-xs ${subCardThemeClass} ${subTextThemeClass} max-w-sm mx-auto my-auto space-y-2.5`}>
                    <MessageCircle className="h-8 w-8 text-amber-500 mx-auto" />
                    <p className="font-semibold text-sm">
                      Start a conversation with {messengerThreads.find((t) => t.user.id === activeChatId)?.user.name || "this cohort"}
                    </p>
                    <p className="text-[11px] leading-relaxed text-zinc-400">
                      Send a message below.
                    </p>
                  </div>
                ) : (
                  realMessages.map((m) => {
                    const isMe = m.senderId === authAccount?.id;
                    const activeUser = messengerThreads.find((t) => t.user.id === activeChatId)?.user;
                    const senderAvatar = isMe ? pressPass.avatarUrl : activeUser?.avatarUrl;
                    const senderName = isMe ? (pressPass.name || "You") : (activeUser?.name || "them");
                    const senderCallsign = isMe ? (pressPass.callsign || "") : (activeUser?.callsign || "");
                    const timeLabel = new Date(m.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"} items-start`}
                      >
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            className="w-8 h-8 rounded-lg object-cover border border-amber-500/40 flex-shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-zinc-700 text-zinc-300 border border-zinc-600 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                            {senderName[0]}
                          </div>
                        )}

                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                          <div className="flex items-center gap-1 text-[10px] font-mono mb-1.5 text-zinc-500 px-1.5">
                            <span className="font-bold text-zinc-300">{senderName}</span>
                            <span className="text-amber-600">@{senderCallsign}</span>
                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-600">{timeLabel}</span>
                          </div>

                          <div className={`rounded-xl p-3 text-xs sm:text-sm leading-relaxed border ${
                            isMe
                              ? "bg-amber-600 border-amber-600 text-white rounded-tr-none"
                              : isDark
                                ? "bg-zinc-800 border-zinc-700 text-zinc-100 rounded-tl-none"
                                : "bg-zinc-100 border-zinc-200 text-zinc-900 rounded-tl-none"
                          }`}>
                            <p className="whitespace-pre-wrap">{m.body}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Real Message Composer */}
              <div className={`p-3 sm:p-4 border-t space-y-2 flex-shrink-0 ${borderThemeClass} ${
                isDark ? "bg-zinc-950/90" : "bg-zinc-50"
              }`}>
                {/* Expandable Image Attachment Box */}
                {activeChatId === GROUP_CHAT_ID && showAttachImage && (
                  <div className={`p-2.5 rounded-lg border space-y-2 text-xs font-mono ${subCardThemeClass}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-500 flex items-center gap-1">
                        <ImageIcon className="h-3.5 w-3.5" /> Attach Shared Image
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAttachImage(false)}
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="text"
                      value={messengerImageUrl}
                      onChange={(e) => setMessengerImageUrl(e.target.value)}
                      placeholder="Paste image URL (https://images.unsplash.com/...)..."
                      className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                  </div>
                )}

                {/* Expandable Link Attachment Box */}
                {activeChatId === GROUP_CHAT_ID && showAttachLink && (
                  <div className={`p-2.5 rounded-lg border space-y-2 text-xs font-mono ${subCardThemeClass}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-400 flex items-center gap-1">
                        <Link2 className="h-3.5 w-3.5" /> Attach Shared Link
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAttachLink(false)}
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        ✕
                      </button>
                    </div>
                    <input
                      type="text"
                      value={messengerLinkUrl}
                      onChange={(e) => setMessengerLinkUrl(e.target.value)}
                      placeholder="Paste link URL (e.g. https://fieldpress.studio/#dispatch-d-1)..."
                      className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                  </div>
                )}

                {/* Messenger-style composer row: attach, emoji, input, send.
                    Real DMs are text-only for v1 (no attachment columns in
                    the messenger schema), so the attach menu is hidden
                    outside the group chat rather than offered and silently
                    dropped. */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (activeChatId === GROUP_CHAT_ID) {
                      handleSendMessengerMessage(e);
                    } else {
                      sendRealMessage(activeChatId, messengerInput);
                    }
                  }}
                  className="flex items-center gap-1.5"
                >
                  {/* Attach menu (Photo / Link), consolidated behind one "+" — group chat only */}
                  {activeChatId === GROUP_CHAT_ID && (
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(!showAttachMenu);
                        setShowEmojiPicker(false);
                      }}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                        showAttachImage || showAttachLink || messengerImageUrl || messengerLinkUrl
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : isDark
                            ? "border-zinc-700/60 hover:bg-zinc-800 text-zinc-400"
                            : "border-zinc-300 hover:bg-zinc-200 text-zinc-500"
                      }`}
                      title="Attach"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </button>
                    {showAttachMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowAttachMenu(false)} />
                        <div className={`absolute bottom-10 left-0 w-40 rounded-xl border shadow-xl z-50 overflow-hidden ${
                          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                        }`}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachImage(!showAttachImage);
                              setShowAttachLink(false);
                              setShowAttachMenu(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono transition cursor-pointer ${
                              isDark ? "hover:bg-zinc-800 text-zinc-200" : "hover:bg-zinc-100 text-zinc-800"
                            }`}
                          >
                            <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
                            <span>Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachLink(!showAttachLink);
                              setShowAttachImage(false);
                              setShowAttachMenu(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono border-t transition cursor-pointer ${
                              isDark ? "hover:bg-zinc-800 text-zinc-200 border-zinc-800" : "hover:bg-zinc-100 text-zinc-800 border-zinc-100"
                            }`}
                          >
                            <Link2 className="h-3.5 w-3.5 text-amber-500" />
                            <span>Link</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  )}

                  {/* Emoji picker */}
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowAttachMenu(false);
                      }}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition cursor-pointer ${
                        showEmojiPicker
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : isDark
                            ? "border-zinc-700/60 hover:bg-zinc-800 text-zinc-400"
                            : "border-zinc-300 hover:bg-zinc-200 text-zinc-500"
                      }`}
                      title="Emoji"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                    {showEmojiPicker && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                        <div className={`absolute bottom-10 left-0 p-2 rounded-xl border shadow-xl z-50 grid grid-cols-5 gap-0.5 ${
                          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                        }`}>
                          {["📰", "⚡", "🔍", "💬", "🤝", "🔥", "🔻", "📡", "👍", "❤️"].map((em) => (
                            <button
                              key={em}
                              type="button"
                              onClick={() => setMessengerInput((prev) => prev + " " + em)}
                              className={`w-8 h-8 rounded-lg text-base transition cursor-pointer ${
                                isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                              }`}
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <input
                    type="text"
                    value={messengerInput}
                    onChange={(e) => setMessengerInput(e.target.value)}
                    placeholder="Message..."
                    className={`flex-1 rounded-full px-4 py-2 text-xs sm:text-sm focus:outline-none transition ${inputThemeClass}`}
                  />
                  <button
                    type="submit"
                    disabled={
                      (!messengerInput.trim() && !messengerImageUrl.trim() && !messengerLinkUrl.trim()) ||
                      (activeChatId !== GROUP_CHAT_ID && realMessageSending)
                    }
                    className="w-9 h-9 flex-shrink-0 rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition flex items-center justify-center cursor-pointer disabled:opacity-40 shadow-xs"
                    title="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Correspondent Card: opens when a commenter's identity is clicked anywhere in the app */}
      {correspondentPopover && (() => {
        const cs = correspondentPopover.callsign;
        const relation = correspondentResolved?.relation;
        const isCohort = relation === "cohort";
        const isPending = relation === "pending_sent" || relation === "pending_received";
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setCorrespondentPopover(null)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-xs rounded-2xl border shadow-2xl p-5 space-y-4 ${
                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={correspondentResolved?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cs)}`}
                  alt={correspondentPopover.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/50 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold truncate">{correspondentPopover.name}</p>
                  <p className="font-mono text-xs text-amber-500 truncate">@{cs}</p>
                  {correspondentResolved?.bureau && (
                    <p className={`font-mono text-[11px] truncate ${subTextThemeClass}`}>{correspondentResolved.bureau}</p>
                  )}
                </div>
              </div>
              {correspondentResolveState === "not_found" ? (
                <p className={`font-mono text-[11px] text-center ${subTextThemeClass}`}>
                  No FieldPress account found for @{cs}.
                </p>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={requestCohortFromPopover}
                    disabled={correspondentResolveState === "loading" || isCohort || isPending}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60 ${
                      isCohort
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                    }`}
                  >
                    {isCohort ? <Check className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                    <span>{isCohort ? "Cohort" : isPending ? "Request Pending" : "Request Cohort"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={messageFromPopover}
                    disabled={!isCohort}
                    title={isCohort ? "" : "Only cohorts can be messaged"}
                    className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer disabled:opacity-40 ${
                      isDark ? "border-zinc-700 hover:bg-zinc-800 text-zinc-200" : "border-zinc-300 hover:bg-zinc-100 text-zinc-800"
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setCorrespondentPopover(null)}
                className={`w-full text-center font-mono text-[11px] ${subTextThemeClass}`}
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 8D. PRESSY'O AUTONOMOUS NEWSROOM COPILOT CHAT MODAL                       */}
      {/* ========================================================================= */}
      {showPressyoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
          <div className={`w-full max-w-2xl h-[85vh] max-h-[720px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-amber-500/50 text-zinc-100" : "bg-white border-amber-500/40 text-zinc-900"
          }`}>
            {/* Pressy'o Header — large, clear crest + New Chat / Close */}
            <div className={`p-4 border-b flex items-center justify-between flex-shrink-0 ${borderThemeClass} ${
              isDark ? "bg-zinc-950/80" : "bg-amber-50/60"
            }`}>
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src="/pressyo-icon.jpg"
                    alt="Pressy'O Crest"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg bg-white"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-zinc-950" title="Online" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono text-base font-bold text-amber-500 truncate">
                      Pressy'o
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex-shrink-0">
                      COPILOT
                    </span>
                  </div>
                  <p className={`text-xs font-mono ${subTextThemeClass}`}>Autonomous Field Editor</p>
                  <p className={`text-[11px] mt-0.5 truncate ${subTextThemeClass}`}>
                    Story drafting, Pollinations prompts &amp; telemetry checks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleNewPressyoChat}
                  title="Start a new chat"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold transition cursor-pointer ${
                    isDark ? "border-zinc-700/60 hover:bg-zinc-800 text-zinc-300" : "border-zinc-300 hover:bg-zinc-100 text-zinc-700"
                  }`}
                >
                  <SquarePen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPressyoModal(false)}
                  className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick Draft — only shown for a fresh chat, so it doesn't
                clutter an in-progress conversation */}
            {pressyoChat.length <= 1 && (
              <div className={`p-3 border-b grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono ${borderThemeClass} ${
                isDark ? "bg-zinc-950/40" : "bg-zinc-100"
              }`}>
                {[
                  { emoji: "📰", label: "Broadsheet Story", query: "Draft a 1920s Broadsheet newspaper dispatch about regional railroad electrification" },
                  { emoji: "💥", label: "Comic Strip", query: "Draft a superhero Comic Strip dispatch about defeating signal jammers" },
                  { emoji: "🕹️", label: "8-Bit Arcade", query: "Draft an 8-bit arcade telemetry story about optical fiber splice rings" },
                  { emoji: "🛰️", label: "Tactical Intel", query: "Compile a tactical intelligence reconnaissance report on autonomous micro-substations" },
                  { emoji: "🎨", label: "Visual Prompt", query: "Generate a high-detail Pollinations visual prompt for an infrastructure photojournalism still" }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handlePressyoSend(chip.query)}
                    disabled={isPressyoLoading}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark ? "bg-zinc-900 border-zinc-800 hover:border-amber-500/40 hover:bg-amber-500/5" : "bg-white border-zinc-200 hover:border-amber-400/60 hover:bg-amber-50"
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{chip.emoji}</span>
                    <span className="text-amber-500 font-semibold text-[11px] leading-tight">{chip.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pressyoChat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} items-start`}
                >
                  {msg.sender === "pressyo" ? (
                    <img src="/pressyo-icon.jpg" alt="Pressy'O" className="w-9 h-9 rounded-xl object-cover border border-amber-500/50 shadow-xs flex-shrink-0 bg-white" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-zinc-700">
                      You
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed border shadow-xs space-y-2.5 ${
                    msg.sender === "user"
                      ? "bg-amber-500/20 border-amber-500/40 text-zinc-100 rounded-tr-xs"
                      : isDark
                        ? "bg-zinc-800/90 border-zinc-700 text-zinc-200 rounded-tl-xs"
                        : "bg-zinc-100 border-zinc-300 text-zinc-900 rounded-tl-xs"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* 1-Click Send to Pressie Builder Card */}
                    {msg.actionData && (
                      <div className={`p-3 rounded-xl border space-y-2 font-mono text-xs ${subCardThemeClass}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-500 uppercase">{msg.actionData.style} Edition Draft</span>
                          <span className="text-[10px] text-zinc-400">Ready to Publish</span>
                        </div>
                        <h4 className="font-bold text-zinc-200">{msg.actionData.title}</h4>
                        <p className={`text-[11px] line-clamp-3 ${subTextThemeClass}`}>{msg.actionData.content}</p>

                        <button
                          type="button"
                          onClick={() => {
                            if (msg.actionData) {
                              openCreatePressie();
                              setNewTitle(msg.actionData.title);
                              setNewContent(msg.actionData.content);
                              setNewEditionStyle(msg.actionData.style);
                              if (msg.actionData.prompt) setVisualPrompt(msg.actionData.prompt);
                              setShowPressyoModal(false);
                            }
                          }}
                          className="w-full py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>🚀 Send to Pressie Builder</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isPressyoLoading && (
                <div className="flex gap-3 items-start">
                  <img
                    src="/pressyo-icon.jpg"
                    alt="Pressy'O drafting"
                    className="w-9 h-9 rounded-xl object-cover border border-amber-500/80 shadow-md bg-white animate-pulse flex-shrink-0"
                  />
                  <div className={`rounded-2xl p-3.5 text-xs sm:text-sm border shadow-xs rounded-tl-xs ${
                    isDark ? "bg-zinc-800/90 border-zinc-700 text-zinc-400" : "bg-zinc-100 border-zinc-300 text-zinc-500"
                  }`}>
                    Pressy'o is drafting...
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Composer */}
            <div className={`p-3 sm:p-4 border-t ${borderThemeClass} ${isDark ? "bg-zinc-950/80" : "bg-zinc-50"}`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePressyoSend();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={pressyoInput}
                  onChange={(e) => setPressyoInput(e.target.value)}
                  placeholder="Ask Pressy'o to draft a story, refine prompts, or suggest headlines..."
                  disabled={isPressyoLoading}
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none transition disabled:opacity-50 ${inputThemeClass}`}
                />
                <button
                  type="submit"
                  disabled={!pressyoInput.trim() || isPressyoLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs sm:text-sm hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-xs whitespace-nowrap"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      

      {/* ========================================================================= */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md h-full flex flex-col border-l shadow-2xl transition ${
            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            
            {/* Drawer Header */}
            <div className={`p-4 border-b flex items-center justify-between font-mono ${borderThemeClass}`}>
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm">Workstation Configuration</h3>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-zinc-800 font-mono text-xs overflow-x-auto">
              {([
                "quicklinks", "profile", "drafts", "bookmarks", "archives", "appearance", "system",
                ...(authAccount?.role === "super_admin" ? ["admin" as const, "moderation" as const] : [])
              ] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setSettingsActiveTab(tab);
                    if (tab === "admin") loadAdminUsers();
                    if (tab === "moderation") loadModerationData();
                  }}
                  className={`px-3 py-2 transition capitalize flex-shrink-0 cursor-pointer ${
                    settingsActiveTab === tab
                      ? "border-b-2 border-amber-500 text-amber-400 font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab === "quicklinks" ? "Quick Links" : tab}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
              
              {/* TAB: QUICK LINKS — one-click access to everything */}
              {settingsActiveTab === "quicklinks" && (
                <div className="space-y-4">
                  <div>
                    <p className={`font-bold uppercase text-[10px] mb-2 ${subTextThemeClass}`}>Sections</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Daily Edition", icon: Newspaper, action: () => setActiveTab("edition") },
                        { label: "Live Wire", icon: Radio, action: () => setActiveTab("wire") },
                        { label: "Map Radar", icon: MapPin, action: () => setActiveTab("map") },
                        { label: "Classifieds", icon: Tag, action: () => setActiveTab("classifieds") },
                        { label: "Discover", icon: Users, action: () => setActiveTab("discover") }
                      ].map(({ label, icon: Icon, action }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => { setShowSettingsDrawer(false); action(); }}
                          className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                        >
                          <Icon className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="font-bold">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className={`font-bold uppercase text-[10px] mb-2 ${subTextThemeClass}`}>Tools</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowSettingsDrawer(false); setShowPressyoModal(true); }}
                        className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                      >
                        <img src="/pressyo-icon.jpg" alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0" />
                        <span className="font-bold">Pressy'O</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowSettingsDrawer(false); setShowMessengerModal(true); }}
                        className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                      >
                        <MessageCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="font-bold">Messages</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowSettingsDrawer(false); openCreatePressie(); }}
                        className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                      >
                        <Send className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="font-bold">New Dispatch</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowSettingsDrawer(false); openPressPassEditor(); }}
                        className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                      >
                        <ShieldCheck className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <span className="font-bold">Press Pass</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className={`font-bold uppercase text-[10px] mb-2 ${subTextThemeClass}`}>Account</p>
                    <div className="grid grid-cols-2 gap-2">
                      {authAccount ? (
                        <button
                          type="button"
                          onClick={() => { setShowSettingsDrawer(false); logOutAccount(); }}
                          className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                        >
                          <LogOut className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="font-bold">Sign Out</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setShowSettingsDrawer(false); setAuthModalMode("signin"); setAuthError(""); }}
                          className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                        >
                          <LogIn className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="font-bold">Sign In</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className={`p-3 rounded-lg border flex items-center gap-2 text-left transition cursor-pointer ${subCardThemeClass} hover:border-amber-500/50`}
                      >
                        {isDark ? <Sun className="h-4 w-4 text-amber-500 flex-shrink-0" /> : <Moon className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                        <span className="font-bold">{isDark ? "Light Mode" : "Dark Mode"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB A: PROFILE */}
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
                      setShowSettingsDrawer(false);
                      openPressPassEditor();
                    }}
                    className="w-full py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Edit Press Pass Credential & Photo</span>
                  </button>
                </div>
              )}

              {/* TAB B: DRAFTS / PRESS ROLL */}
              {settingsActiveTab === "drafts" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Staged Press Roll ({pressRoll.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSettingsDrawer(false);
                        openCreatePressie();
                      }}
                      className="text-amber-500 hover:underline font-bold"
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
                              setShowSettingsDrawer(false);
                              openCreatePressie(p);
                            }}
                            className="text-amber-400 hover:underline font-bold"
                          >
                            Edit in Builder →
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDraft(p.id)}
                            className="text-rose-400 hover:underline text-[10px]"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB C: SAVED BOOKMARKS */}
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
                              setShowSettingsDrawer(false);
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
                                setShowSettingsDrawer(false);
                                setSelectedStory(d);
                              }}
                              className="text-amber-400 hover:underline text-[10px]"
                            >
                              Read Story →
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleBookmark(d.id)}
                              className="text-rose-400 hover:underline text-[10px]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {/* TAB D: ARCHIVES */}
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
                      className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition"
                    >
                      Download JSON Archive
                    </button>
                  </div>

                  <div className={`p-4 rounded-lg border space-y-2 border-rose-900/40 bg-rose-950/10`}>
                    <h5 className="font-bold text-rose-400">Reset Local Cache</h5>
                    <p className={`text-xs ${subTextThemeClass}`}>
                      Clear local device preferences and re-sync dispatches from the server (your published content and drafts are unaffected — they live in your account, not this browser).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        refreshPublicFeed();
                        setSavedSuccessToast("Local cache cleared and re-synced.");
                        setTimeout(() => setSavedSuccessToast(""), 2500);
                      }}
                      className="px-3 py-1.5 rounded border border-rose-800 text-rose-400 hover:bg-rose-900/40 transition"
                    >
                      Purge & Reset
                    </button>
                  </div>
                </div>
              )}

              {/* TAB E: APPEARANCE */}
              {settingsActiveTab === "appearance" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded border border-zinc-800">
                    <span>Dark / Light Theme</span>
                    <button
                      type="button"
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    >
                      Toggle ({theme})
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded border border-zinc-800">
                    <span>Background Watermark</span>
                    <button
                      type="button"
                      onClick={() => setWatermarkVisible(!watermarkVisible)}
                      className={`px-3 py-1 rounded ${watermarkVisible ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {watermarkVisible ? "Visible" : "Hidden"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB F: SYSTEM */}
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
                      className={`px-3 py-1 rounded ${offlineCacheEnabled ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}
                    >
                      {offlineCacheEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: ADMIN — role management, super_admin only. The tab itself
                  is only rendered into the tab bar when authAccount.role is
                  super_admin (see tab list above), and every mutation is
                  re-checked server-side in /api/admin/*, so this panel being
                  hidden client-side is a UX nicety, not the security boundary. */}
              {settingsActiveTab === "admin" && authAccount?.role === "super_admin" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold uppercase text-[10px] ${subTextThemeClass}`}>Correspondent Accounts</p>
                    <button
                      type="button"
                      onClick={loadAdminUsers}
                      disabled={adminUsersLoading}
                      className="text-[10px] underline underline-offset-2 text-amber-400 hover:text-amber-300 disabled:opacity-50 cursor-pointer"
                    >
                      {adminUsersLoading ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>

                  {adminUsersError && (
                    <div className="flex items-start gap-1.5 text-rose-500 text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <span>{adminUsersError}</span>
                    </div>
                  )}

                  {adminUsersLoading && adminUsers.length === 0 ? (
                    <p className={subTextThemeClass}>Loading accounts...</p>
                  ) : adminUsers.length === 0 ? (
                    <p className={subTextThemeClass}>No accounts found.</p>
                  ) : (
                    <div className="space-y-2">
                      {adminUsers.map((u) => {
                        const isSuper = u.role === "super_admin";
                        const isSelf = u.id === authAccount.id;
                        const busy = adminRoleUpdatingId === u.id;
                        const verifiedBusy = adminVerifiedUpdatingId === u.id;
                        return (
                          <div
                            key={u.id}
                            className={`p-3 rounded-lg border flex items-center gap-3 ${subCardThemeClass}`}
                          >
                            <img
                              src={u.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(u.callsign)}`}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-zinc-700"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold truncate">{u.name} <span className="text-zinc-500">@{u.callsign}</span></p>
                              <p className={`truncate ${subTextThemeClass}`}>{u.email}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isSuper ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400"
                              }`}>
                                {isSuper ? "Super Admin" : "Correspondent"}
                              </span>
                              <button
                                type="button"
                                disabled={busy || isSelf}
                                title={isSelf ? "Use another super admin account to change this account's role" : undefined}
                                onClick={() => updateUserRole(u.id, isSuper ? "correspondent" : "super_admin")}
                                className={`text-[10px] underline underline-offset-2 cursor-pointer disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed ${
                                  isSuper ? "text-rose-400 hover:text-rose-300" : "text-emerald-400 hover:text-emerald-300"
                                }`}
                              >
                                {busy ? "Updating..." : isSuper ? "Demote" : "Promote"}
                              </button>
                              <button
                                type="button"
                                disabled={verifiedBusy}
                                onClick={() => toggleVerifiedLocal(u.id, !u.verified_local)}
                                title="Toggle the Verified Local Correspondent badge (independent of role)"
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed ${
                                  u.verified_local
                                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                                }`}
                              >
                                <ShieldCheck className="h-3 w-3" />
                                {verifiedBusy ? "Updating..." : u.verified_local ? "Verified Local" : "Mark Verified Local"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className={`text-[10px] leading-relaxed ${subTextThemeClass}`}>
                    Role changes take effect immediately and are enforced server-side. FieldPress always keeps at least one super admin — the last one can't be demoted.
                  </p>
                </div>
              )}

              {/* TAB: MODERATION — reports queue + disputed dispatches,
                  super_admin only. Both signals are server-backed and
                  re-checked server-side, same trust boundary as ADMIN. */}
              {settingsActiveTab === "moderation" && authAccount?.role === "super_admin" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold uppercase text-[10px] ${subTextThemeClass}`}>Moderation Queue</p>
                    <button
                      type="button"
                      onClick={loadModerationData}
                      disabled={modLoading}
                      className="text-[10px] underline underline-offset-2 text-amber-400 hover:text-amber-300 disabled:opacity-50 cursor-pointer"
                    >
                      {modLoading ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>

                  {modError && (
                    <div className="flex items-start gap-1.5 text-rose-500 text-[11px]">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                      <span>{modError}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className={`font-bold uppercase text-[10px] ${subTextThemeClass}`}>Open Reports ({modReports.length})</p>
                    {modLoading && modReports.length === 0 ? (
                      <p className={subTextThemeClass}>Loading reports...</p>
                    ) : modReports.length === 0 ? (
                      <p className={subTextThemeClass}>No open reports.</p>
                    ) : (
                      modReports.map((r) => {
                        const busy = modResolvingId === r.id;
                        return (
                          <div key={r.id} className={`p-3 rounded-lg border space-y-1.5 ${subCardThemeClass}`}>
                            <div className="flex items-center justify-between">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 uppercase">
                                {r.target_type}
                              </span>
                              <span className={`text-[10px] ${subTextThemeClass}`}>@{r.reporter_callsign}</span>
                            </div>
                            <p className="font-bold">{r.reason}</p>
                            {r.details && <p className={subTextThemeClass}>{r.details}</p>}
                            <p className={`text-[10px] ${subTextThemeClass}`}>Target: {r.target_id}</p>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => resolveReport(r.id, "reviewed")}
                                className="text-[10px] underline underline-offset-2 text-emerald-400 hover:text-emerald-300 disabled:opacity-40 cursor-pointer"
                              >
                                {busy ? "Working..." : "Mark Reviewed"}
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => resolveReport(r.id, "dismissed")}
                                className="text-[10px] underline underline-offset-2 text-zinc-400 hover:text-zinc-300 disabled:opacity-40 cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className={`font-bold uppercase text-[10px] ${subTextThemeClass}`}>Disputed Dispatches ({modDisputed.length})</p>
                    {modLoading && modDisputed.length === 0 ? (
                      <p className={subTextThemeClass}>Loading...</p>
                    ) : modDisputed.length === 0 ? (
                      <p className={subTextThemeClass}>No dispatches over the dispute threshold.</p>
                    ) : (
                      modDisputed.map((d) => {
                        const disp = dispatches.find((x) => x.id === d.dispatch_id);
                        return (
                          <button
                            key={d.dispatch_id}
                            type="button"
                            onClick={() => {
                              if (disp) {
                                setSelectedStory(disp);
                                setShowSettingsDrawer(false);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-lg border flex items-center justify-between gap-2 ${subCardThemeClass}`}
                          >
                            <span className="truncate font-bold">{disp ? disp.title : d.dispatch_id}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 flex-shrink-0">
                              🔻 {d.dispute_count}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  <p className={`text-[10px] leading-relaxed ${subTextThemeClass}`}>
                    Reports are user-filed flags on a dispatch, comment, or user. Disputed dispatches are surfaced automatically once the "Disputed" reaction crosses a threshold. Neither takes automated action on the content itself.
                  </p>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className={`p-4 border-t font-mono text-xs flex justify-between items-center ${borderThemeClass} ${
              isDark ? "bg-zinc-950/80" : "bg-zinc-50"
            }`}>
              <span className={subTextThemeClass}>FieldPress v2.5.0-master</span>
              <button
                type="button"
                onClick={() => setShowSettingsDrawer(false)}
                className="px-3 py-1 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Rail — thumb-zone tab bar for small screens.
          Mirrors the four primary content tabs hidden from the top nav above. */}
      <nav
        className={`sm:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-md ${
          isDark ? "bg-zinc-950/95 border-zinc-800" : "bg-white/95 border-zinc-200"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4">
          {([
            { tab: "edition" as const, label: "Edition", Icon: Newspaper },
            { tab: "wire" as const, label: "Wire", Icon: Radio },
            { tab: "map" as const, label: "Map", Icon: MapPin },
            { tab: "classifieds" as const, label: "Classifieds", Icon: Tag }
          ]).map(({ tab, label, Icon }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2.5 font-mono text-[10px] transition cursor-pointer ${
                  isActive
                    ? isDark ? "text-amber-400" : "text-amber-700"
                    : isDark ? "text-zinc-500" : "text-zinc-500"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className={isActive ? "font-bold" : ""}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
};

export default FieldPressMaster;
