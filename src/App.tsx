
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
  coverPhotoUrl?: string;
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
  isAnonymous?: boolean;
  decoupleLocationPin?: boolean;
  vicinityPinOnly?: boolean;
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  gallery?: Array<{
    id: string;
    url: string;
    source?: "ai" | "search" | "upload" | "url" | "lead" | string;
    caption?: string;
    timestamp?: string;
  }>;
  isLead?: boolean;
  isPressRoll?: boolean;
  editionStyle?: "tactical" | "newspaper" | "comic" | "arcade" | "magazine" | "fieldnote" | "almanac" | "curio" | "wire";
  sharingOption?: "fork" | "colab" | "none";
  parentDispatchId?: string;
  sourceUrl?: string;
  embedType?: "youtube" | "reddit" | "x" | "facebook_video" | "instagram" | "tiktok" | "vimeo" | "video" | "link_card" | string;
  embedData?: {
    html?: string | null;
    iframe_url?: string | null;
    video_url?: string | null;
    hd_video_url?: string | null;
    sd_video_url?: string | null;
    url?: string | null;
    description?: string | null;
    thumbnail_url?: string | null;
    title?: string;
    provider_name?: string;
    gallery?: Array<{
      id: string;
      url: string;
      source?: string;
      caption?: string;
      timestamp?: string;
    }>;
    useThemePhotoFilter?: boolean;
  };
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


// Every dispatch share link gets a fresh cache-busting query param.
export const buildDispatchShareUrl = (id: string): string => {
  const origin = "https://fieldpress.studio";
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
    case "fieldnote":
      return {
        card: isDark
          ? "bg-emerald-950/40 border-l-4 border border-emerald-500/50 shadow-md rounded-xl text-emerald-50"
          : "bg-emerald-50/60 border-l-4 border border-emerald-700/40 shadow-sm rounded-xl text-zinc-900",
        badge: "bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-mono uppercase tracking-widest text-[10px] font-bold px-2 py-0.5 rounded",
        headline: "font-serif text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight hover:text-emerald-500 transition",
        body: "font-serif text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-emerald-100/90",
        tag: "🌿 Field Note Edition",
        accentBorder: "border-emerald-500/40",
        subtleBadge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded"
      };
    case "almanac":
      return {
        card: isDark
          ? "bg-stone-900/95 border-y-4 border border-amber-600/50 shadow-md text-amber-50"
          : "bg-orange-50/80 border-y-4 border border-amber-800/40 shadow-sm text-stone-900",
        badge: "bg-amber-700/20 text-amber-800 dark:text-amber-300 border border-amber-600/40 font-serif uppercase tracking-widest text-[10px] font-bold px-2 py-0.5",
        headline: "font-serif text-2xl sm:text-3xl font-black tracking-tight leading-snug hover:text-amber-500 transition",
        body: "font-serif text-sm sm:text-base leading-relaxed text-stone-700 dark:text-amber-100/85",
        tag: "🧭 Heritage Almanac Edition",
        accentBorder: "border-amber-600/40",
        subtleBadge: "bg-amber-700/15 text-amber-300 border border-amber-600/30"
      };
    case "curio":
      return {
        card: isDark
          ? "bg-fuchsia-950/30 border-2 border-dashed border-fuchsia-400/60 shadow-[4px_4px_0px_0px_rgba(217,70,239,0.45)] rounded-xl text-zinc-100"
          : "bg-fuchsia-50/50 border-2 border-dashed border-fuchsia-700/50 shadow-[4px_4px_0px_0px_rgba(162,28,175,0.3)] rounded-xl text-zinc-900",
        badge: "bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-500/40 font-mono uppercase font-black tracking-wider text-[10px] px-2.5 py-0.5 rounded",
        headline: "font-sans text-2xl sm:text-3xl font-black tracking-tight leading-snug hover:text-fuchsia-400 transition",
        body: "font-sans text-sm leading-relaxed text-zinc-700 dark:text-zinc-200",
        tag: "🎪 Americana Curio Edition",
        accentBorder: "border-fuchsia-500/40",
        subtleBadge: "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 rounded"
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

export function decodeEntitiesClient(str?: string | null): string {
  if (!str) return "";
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return _;
      }
    })
    .replace(/&#0*(\d+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return _;
      }
    })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function hasPlayableSourceMedia(dispatch?: Dispatch | null): boolean {
  if (!dispatch) return false;
  const ed = dispatch.embedData;
  if (ed?.video_url || ed?.hd_video_url || ed?.sd_video_url || ed?.iframe_url || ed?.html) {
    return true;
  }
  const t = (dispatch.embedType || "").toLowerCase();
  if (["youtube", "facebook_video", "instagram", "tiktok", "vimeo", "video", "reddit", "x"].includes(t)) {
    return true;
  }
  const u = dispatch.sourceUrl || ed?.url || "";
  if (
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)/i.test(u) ||
    /(?:facebook\.com\/(?:share\/[rv]\/|reel\/|watch\/?|[\w.]+\/videos\/)|fb\.watch\/)/i.test(u) ||
    /instagram\.com\/(?:p|reel|reels|tv)\//i.test(u) ||
    /tiktok\.com\/@[\w.-]+\/video\//i.test(u) ||
    /vimeo\.com\/\d+/i.test(u) ||
    /\.(?:mp4|webm|mov)(?:\?.*)?$/i.test(u)
  ) {
    return true;
  }
  return false;
}

// Renders a wire/regular pressie's resolved link embed (Direct MP4 / Facebook Reel & Video /
// YouTube / Instagram / TikTok / Vimeo / Reddit / X rich embeds, or Open Graph link card).
function WireEmbed({ dispatch }: { dispatch: Dispatch }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [liveEmbedData, setLiveEmbedData] = useState<any>(null);
  const ed = { ...(dispatch.embedData || {}), ...(liveEmbedData || {}) };
  const sourceUrl = dispatch.sourceUrl || ed.url || "";
  const directVideoUrl = ed.video_url || ed.hd_video_url || ed.sd_video_url || (
    /\.(?:mp4|webm|mov)(?:\?.*)?$/i.test(sourceUrl) ? sourceUrl : null
  );

  // Auto-resolve fresh stream/embed metadata if this is a video URL missing video_url
  useEffect(() => {
    setLiveEmbedData(null);
    if (!sourceUrl) return;
    const isVideoSource =
      /(?:facebook\.com\/(?:share\/[rv]\/|reel\/|watch\/?|[\w.]+\/videos\/)|fb\.watch\/)/i.test(sourceUrl) ||
      /instagram\.com\/(?:p|reel|reels|tv)\//i.test(sourceUrl) ||
      /tiktok\.com\/@[\w.-]+\/video\//i.test(sourceUrl) ||
      /vimeo\.com\/\d+/i.test(sourceUrl);
    if (isVideoSource && !dispatch.embedData?.video_url && !dispatch.embedData?.iframe_url) {
      let cancelled = false;
      fetch(`/api/resolve-url?url=${encodeURIComponent(sourceUrl)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data?.embedData) {
            setLiveEmbedData(data.embedData);
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }
  }, [dispatch.id, sourceUrl]);

  // Determine official iframe embed URL if available (or synthesize for Facebook/YouTube/Instagram/TikTok/Vimeo)
  let iframeUrl: string | null = ed.iframe_url || null;
  if (!iframeUrl && sourceUrl) {
    const ytMatch = sourceUrl.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/i);
    if (ytMatch) {
      iframeUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else if (/(?:facebook\.com\/(?:share\/[rv]\/|reel\/|watch\/?|[\w.]+\/videos\/)|fb\.watch\/)/i.test(sourceUrl)) {
      const targetFbUrl = ed.url || sourceUrl;
      iframeUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(targetFbUrl)}&show_text=false`;
    } else {
      const igMatch = sourceUrl.match(/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/i);
      if (igMatch) {
        iframeUrl = `https://www.instagram.com/p/${igMatch[1]}/embed/`;
      } else {
        const ttMatch = sourceUrl.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/i);
        if (ttMatch) {
          iframeUrl = `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
        } else {
          const vmMatch = sourceUrl.match(/vimeo\.com\/(\d+)/i);
          if (vmMatch) {
            iframeUrl = `https://player.vimeo.com/video/${vmMatch[1]}`;
          }
        }
      }
    }
  }

  const [playerMode, setPlayerMode] = useState<"native" | "iframe">(directVideoUrl ? "native" : "iframe");
  const [videoQuality, setVideoQuality] = useState<"hd" | "sd">(ed.hd_video_url ? "hd" : "sd");

  useEffect(() => {
    setPlayerMode(directVideoUrl ? "native" : "iframe");
  }, [dispatch.id, directVideoUrl]);

  useEffect(() => {
    if (dispatch.embedType === "reddit" && !document.getElementById("reddit-embed-widget-script")) {
      const s = document.createElement("script");
      s.id = "reddit-embed-widget-script";
      s.src = "https://embed.reddit.com/widgets.js";
      s.async = true;
      document.body.appendChild(s);
    }
    if (dispatch.embedType === "x") {
      const w = window as any;
      if (w.twttr?.widgets && containerRef.current) {
        w.twttr.widgets.load(containerRef.current);
      } else if (!document.getElementById("x-embed-widget-script")) {
        const s = document.createElement("script");
        s.id = "x-embed-widget-script";
        s.src = "https://platform.x.com/widgets.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }, [dispatch.id, dispatch.embedType]);

  const activeMp4Url =
    videoQuality === "hd"
      ? ed.hd_video_url || ed.video_url || ed.sd_video_url || directVideoUrl
      : ed.sd_video_url || ed.video_url || ed.hd_video_url || directVideoUrl;

  if (activeMp4Url && playerMode === "native") {
    return (
      <div className="space-y-2">
        <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black relative shadow-xl">
          <video
            key={activeMp4Url}
            src={activeMp4Url}
            poster={ed.thumbnail_url || dispatch.imageUrl || undefined}
            controls
            playsInline
            preload="metadata"
            onError={() => {
              if (iframeUrl || ed.html) setPlayerMode("iframe");
            }}
            className="w-full max-h-[560px] object-contain bg-black mx-auto"
          />
          <div className="px-3 py-2 bg-zinc-950/95 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                ▶ Original Source Video ({ed.provider_name || "Direct Stream"})
              </span>
              {ed.hd_video_url && ed.sd_video_url && (
                <button
                  type="button"
                  onClick={() => setVideoQuality(videoQuality === "hd" ? "sd" : "hd")}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 font-bold cursor-pointer"
                >
                  Quality: {videoQuality.toUpperCase()}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(iframeUrl || ed.html) && (
                <button
                  type="button"
                  onClick={() => setPlayerMode("iframe")}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold cursor-pointer"
                >
                  🌐 Switch to Embedded Source Player
                </button>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold"
                >
                  ↗ Open Original Source
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (iframeUrl) {
    const isVerticalReel =
      /facebook\.com.*(?:reel|\/r\/)/i.test(sourceUrl) ||
      /instagram\.com/i.test(sourceUrl) ||
      /tiktok\.com/i.test(sourceUrl);
    return (
      <div className="space-y-2">
        <div className={`rounded-xl overflow-hidden border border-zinc-800 bg-black relative shadow-xl ${
          isVerticalReel ? "min-h-[540px] flex flex-col justify-center" : "aspect-video"
        }`}>
          <iframe
            src={iframeUrl}
            title={decodeEntitiesClient(ed.title || dispatch.title)}
            className={`w-full ${isVerticalReel ? "h-[540px]" : "h-full"} border-0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className="px-3 py-2 bg-zinc-950/95 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold">
              🌐 Official {ed.provider_name || "Source"} Embedded Player
            </span>
            <div className="flex items-center gap-2">
              {activeMp4Url && (
                <button
                  type="button"
                  onClick={() => setPlayerMode("native")}
                  className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-bold cursor-pointer"
                >
                  🎬 Switch to Native HD Video Stream
                </button>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-bold"
                >
                  ↗ Open Original Source
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (ed.html) {
    if (dispatch.embedType === "reddit" || dispatch.embedType === "x") {
      return (
        <div
          ref={containerRef}
          className="rounded-xl overflow-hidden border border-zinc-800 bg-white p-2 [&>blockquote]:m-0"
          dangerouslySetInnerHTML={{ __html: ed.html }}
        />
      );
    }
    return (
      <div
        className="rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video [&_iframe]:!w-full [&_iframe]:!h-full"
        dangerouslySetInnerHTML={{ __html: ed.html }}
      />
    );
  }

  if (!dispatch.embedType && !ed.title && !ed.thumbnail_url) return null;

  return (
    <a
      href={sourceUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl overflow-hidden border border-zinc-800 hover:border-amber-500/60 transition group"
    >
      {ed.thumbnail_url && (
        <div className="aspect-video bg-black overflow-hidden">
          <img
            src={ed.thumbnail_url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      )}
      <div className="p-3">
        <div className="text-sm font-bold line-clamp-2">{decodeEntitiesClient(ed.title || dispatch.title)}</div>
        {ed.provider_name && (
          <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">{ed.provider_name}</div>
        )}
      </div>
    </a>
  );
}

export async function generatePressieCardBlob(disp: Dispatch): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Wire pressies have no dedicated share-card theme (they're auto-generated
  // system content, never user-styled) — render their share card as newspaper.
  const style = (disp.editionStyle && disp.editionStyle !== "wire" ? disp.editionStyle : "newspaper");

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

  const themes: Record<"newspaper" | "comic" | "arcade" | "tactical" | "magazine" | "fieldnote" | "almanac" | "curio", EditionTheme> = {
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
    },
    fieldnote: {
      bg: "#041612",
      border: "#14b8a6",
      innerBorder: "rgba(20, 184, 166, 0.3)",
      accentBar: "#14b8a6",
      headerTitle: "FIELD EXPEDITION LOG • ECOLOGICAL & WATERSHED DISPATCH",
      headerColor: "#5eead4",
      badgeText: "FIELD SPECIMEN VERIFIED",
      badgeColor: "#14b8a6",
      titleColor: "#f0fdfa",
      bodyColor: "#ccfbf1",
      fontTitle: "bold 32px Georgia, serif",
      fontBody: "18px ui-monospace, 'Courier New', monospace",
      fontHeader: "bold 13px ui-monospace, 'Courier New', monospace",
      frameWidth: 2,
      scanlines: false
    },
    almanac: {
      bg: "#17140d",
      border: "#84cc16",
      innerBorder: "rgba(132, 204, 22, 0.3)",
      accentBar: "#84cc16",
      headerTitle: "THE PRAIRIE & CORRIDOR ALMANAC • HERITAGE LEDGER",
      headerColor: "#bef264",
      badgeText: "ALMANAC ARCHIVE",
      badgeColor: "#84cc16",
      titleColor: "#fefce8",
      bodyColor: "#ecfccb",
      fontTitle: "bold 33px Georgia, 'Times New Roman', serif",
      fontBody: "19px Georgia, 'Times New Roman', serif",
      fontHeader: "bold 14px Georgia, serif",
      frameWidth: 2,
      scanlines: false
    },
    curio: {
      bg: "#13071e",
      border: "#e879f9",
      innerBorder: "rgba(232, 121, 249, 0.3)",
      accentBar: "#d946ef",
      headerTitle: "CABINET OF WONDERS • FIELDPRESS CURIO ARCHIVE",
      headerColor: "#f0abfc",
      badgeText: "VERIFIED ANOMALY",
      badgeColor: "#e879f9",
      titleColor: "#fdf4ff",
      bodyColor: "#f5d0fe",
      fontTitle: "bold 33px Georgia, serif",
      fontBody: "18px system-ui, sans-serif",
      fontHeader: "bold 14px ui-monospace, monospace",
      frameWidth: 3,
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
  // Pressy'o AI Newsroom Copilot State (3-Tier LLM Cascade: Ollama -> Groq -> Gemini)
  const PRESSYO_GREETING = "Greetings Bureau Chief! I am Pressy'o v3.0, your autonomous field newsroom copilot powered by a 3-tier LLM engine (Ollama → Groq LPU → Gemini). I now draft and live-rewrite dispatches across all 8 Pressie Edition Archetypes (Tactical, Broadsheet, Field Note, Almanac, Curio, Comic, Arcade, and Sleek Magazine), support Hybrid Visual Workflows (real archival/web photo verification + Pollinations AI photojournalism prompts), and include 1-click Uplift Angle & 15s Broadcast Read tools.";
  type PressyoEdition = "newspaper" | "comic" | "arcade" | "tactical" | "magazine" | "fieldnote" | "almanac" | "curio";
  type PressyoMessage = {
    sender: "user" | "pressyo";
    text: string;
    source?: "ollama" | "groq" | "gemini";
    model?: string;
    visualOnlyPrompt?: string;
    actionData?: {
      title: string;
      content: string;
      style: PressyoEdition;
      prompt?: string;
    };
  };
  const [showPressyoModal, setShowPressyoModal] = useState(false);
  const [pressyoInput, setPressyoInput] = useState("");
  const [isPressyoLoading, setIsPressyoLoading] = useState(false);
  const [pressyoLastSource, setPressyoLastSource] = useState<"ollama" | "groq" | "gemini" | null>(null);
  const [pressyoLastModel, setPressyoLastModel] = useState<string | null>(null);
  const [pressyoRemainingQuota, setPressyoRemainingQuota] = useState<number | null>(null);

  // In-Editor Pressy'o Copilot State (inside Pressie Builder Modal)
  const [isPressyoEditorBusy, setIsPressyoEditorBusy] = useState(false);
  const [pressyoEditorActionLabel, setPressyoEditorActionLabel] = useState<string>("");
  const [pressyoCustomInstruction, setPressyoCustomInstruction] = useState("");
  const [pressyoEditorStatus, setPressyoEditorStatus] = useState<string | null>(null);
  const [pressyoEditorUndo, setPressyoEditorUndo] = useState<{
    title: string;
    content: string;
    editionStyle: PressyoEdition;
    visualPrompt: string;
  } | null>(null);

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

  const inferEditionStyle = (text: string, fallback: PressyoEdition = "tactical"): PressyoEdition => {
    const lower = text.toLowerCase();
    if (lower.includes("comic") || lower.includes("kapow") || lower.includes("hero")) return "comic";
    if (lower.includes("broadsheet") || lower.includes("1920") || lower.includes("paper") || lower.includes("old")) return "newspaper";
    if (lower.includes("arcade") || lower.includes("pixel") || lower.includes("8-bit")) return "arcade";
    if (lower.includes("field") || lower.includes("nature") || lower.includes("park") || lower.includes("wildlife")) return "fieldnote";
    if (lower.includes("almanac") || lower.includes("heritage") || lower.includes("vintage")) return "almanac";
    if (lower.includes("curio") || lower.includes("oddity") || lower.includes("weird")) return "curio";
    if (lower.includes("tactical") || lower.includes("intel") || lower.includes("recon")) return "tactical";
    if (lower.includes("sleek") || lower.includes("magazine") || lower.includes("modern")) return "magazine";
    return fallback;
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
  const [newEditionStyle, setNewEditionStyle] = useState<PressyoEdition>("tactical");
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
  type GroupMessage = {
    id: string;
    senderId: string;
    senderName: string;
    senderCallsign: string;
    senderAvatarUrl?: string;
    body: string | null;
    imageUrl: string | null;
    linkUrl: string | null;
    createdAt: string;
  };
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [groupMessagesLoading, setGroupMessagesLoading] = useState(false);
  const [groupMessageSending, setGroupMessageSending] = useState(false);

  const loadGroupMessages = async () => {
    setGroupMessagesLoading(true);
    try {
      const res = await fetch("/api/messenger/group");
      if (res.ok) {
        const data = await res.json();
        setGroupMessages(data.messages || []);
      }
    } catch {}
    setGroupMessagesLoading(false);
  };

  const handleSendMessengerMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanBody = messengerInput.trim();
    const cleanImageUrl = messengerImageUrl.trim();
    const cleanLinkUrl = messengerLinkUrl.trim();
    if (!cleanBody && !cleanImageUrl && !cleanLinkUrl) return;

    setGroupMessageSending(true);
    try {
      const res = await fetch("/api/messenger/groupSend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: cleanBody, imageUrl: cleanImageUrl || undefined, linkUrl: cleanLinkUrl || undefined })
      });
      const data = await res.json();
      if (!res.ok) {
        setSavedSuccessToast(data.error || "Couldn't send that message.");
        setTimeout(() => setSavedSuccessToast(""), 2500);
      } else {
        setGroupMessages((prev) => [...prev, data.message]);
        setMessengerInput("");
        setMessengerImageUrl("");
        setMessengerLinkUrl("");
        setShowAttachImage(false);
        setShowAttachLink(false);
      }
    } catch {
      setSavedSuccessToast("Network error sending message.");
      setTimeout(() => setSavedSuccessToast(""), 2500);
    }
    setGroupMessageSending(false);
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
    id: string; email: string; callsign: string; name: string; bureau: string; avatarUrl: string; coverPhotoUrl?: string; role: string; verifiedLocal?: boolean;
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

  const applyAccountToPressPass = (account: { callsign: string; name: string; bureau: string; avatarUrl: string; coverPhotoUrl?: string; email: string; accentColor?: string }) => {
    setPressPass((prev) => {
      const next = { ...prev, name: account.name, callsign: account.callsign, bureau: account.bureau, avatarUrl: account.avatarUrl, coverPhotoUrl: account.coverPhotoUrl, email: account.email, accentColor: account.accentColor || prev.accentColor };
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
  // bureau") now lives in fieldpress_group_messages, not cohort-gated
  // (any authenticated account can post/read), loaded below.
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

  useEffect(() => {
    if (authAccount && activeChatId === GROUP_CHAT_ID) {
      loadGroupMessages();
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
    let cancelled = false;
    const openFromHash = async () => {
      const hash = window.location.hash;
      const match = hash.match(/^#dispatch-(.+)$/);
      if (!match) return;
      const targetId = decodeURIComponent(match[1]).split("?")[0];
      const found = dispatches.find((d) => d.id === targetId) || pressRoll.find((d) => d.id === targetId);
      if (found) {
        setActiveTab("edition");
        setSelectedStory(found);
        return;
      }
      try {
        const res = await fetch(`/api/dispatches?id=${encodeURIComponent(targetId)}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (data?.dispatch) {
            setDispatches((prev) => (prev.some((d) => d.id === data.dispatch.id) ? prev : [data.dispatch, ...prev]));
            setActiveTab("edition");
            setSelectedStory(data.dispatch);
            return;
          }
        }
      } catch {
        // fall through if offline
      }
      if (dispatchesLoaded && !cancelled) {
        setSavedSuccessToast("That dispatch link couldn't be found — it may have expired.");
        setTimeout(() => setSavedSuccessToast(""), 3000);
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", openFromHash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatches, dispatchesLoaded]);

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
  const [newCoordinates, setNewCoordinates] = useState<string>("-87.63, 40.12");
  const [newIsAnonymous, setNewIsAnonymous] = useState<boolean>(false);
  const [newDecoupleLocationPin, setNewDecoupleLocationPin] = useState<boolean>(false);
  const [newVicinityPinOnly, setNewVicinityPinOnly] = useState<boolean>(true);
  const [mapSignalFilter, setMapSignalFilter] = useState<"ALL" | "ANON_DECOUPLED" | "NAMED">("ALL");
  const [mapRegionPreset, setMapRegionPreset] = useState<"NATIONAL" | "MIDWEST" | "GLOBAL">("NATIONAL");
  const [activeReaderImageIdx, setActiveReaderImageIdx] = useState<number>(0);
  const [readerLightboxUrl, setReaderLightboxUrl] = useState<string | null>(null);
  const [isUnfurlingTitleUrl, setIsUnfurlingTitleUrl] = useState<boolean>(false);
  const [unfurlTitleStatus, setUnfurlTitleStatus] = useState<string>("");
  const [builderUseThemePhotoFilter, setBuilderUseThemePhotoFilter] = useState<boolean>(true);
  // Maps dispatch.id -> boolean (true = theme photo filter active, false = raw unfiltered color photo)
  const [editionPhotoFilterOverrides, setEditionPhotoFilterOverrides] = useState<Record<string, boolean>>({});

  const isThemePhotoFilterActive = (dispatch?: Dispatch | null): boolean => {
    if (!dispatch) return true;
    if (typeof editionPhotoFilterOverrides[dispatch.id] === "boolean") {
      return editionPhotoFilterOverrides[dispatch.id];
    }
    if (typeof dispatch.embedData?.useThemePhotoFilter === "boolean") {
      return dispatch.embedData.useThemePhotoFilter;
    }
    if (dispatch.imageCaption && dispatch.imageCaption.includes("[RAW COLOR]")) {
      return false;
    }
    return true;
  };

  const toggleThemePhotoFilter = (dispatchId: string, currentVal: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditionPhotoFilterOverrides((prev) => ({
      ...prev,
      [dispatchId]: !currentVal
    }));
  };

  const getEditionThemeConfig = (rawStyle?: string) => {
    const s = (rawStyle || "newspaper").toLowerCase();
    if (s === "newspaper") {
      return {
        id: "newspaper",
        name: "1910 Broadsheet",
        title: "1910 Printing-Press Broadsheet",
        masthead: "THE FIELDPRESS DAILY GAZETTE",
        mastheadTitle: "THE FIELDPRESS DAILY GAZETTE",
        subhead: "ALL THE VERIFIED TELEMETRY FIT TO PRINT • MORNING PRESS EDITION",
        mastheadSub: "ALL THE VERIFIED TELEMETRY FIT TO PRINT • MORNING PRESS EDITION",
        earLeft: "WEATHER: FAIR & BRISK • WIND NW 8 MPH",
        mastheadLeftEar: "WEATHER: FAIR & BRISK • WIND NW 8 MPH",
        earRight: "PRICE TWO CENTS • VOL. XCIV NO. 142",
        mastheadRightEar: "PRICE TWO CENTS • VOL. XCIV NO. 142",
        datelinePrefix: "BY TELEGRAPH",
        filterBadge: "🗞️ 1910 Halftone B&W",
        filterLabel: "1910 Halftone B&W",
        filterDesc: "Monochrome silver-gelatin black & white with early rotary printing-press halftone ink dots.",
        imgFilterClass: "grayscale contrast-[1.58] brightness-[0.94] filter",
        isOldTimey: true,
        paperBg: "bg-[#f3ead8]",
        paperText: "text-[#18120c]",
        paperBorder: "border-[#1e160e]",
        paperBgClass: "bg-[#f3ead8] text-[#18120c] border-4 border-double border-[#1e160e] shadow-[0_12px_36px_rgba(0,0,0,0.45)]",
        plateFrameClass: "border-2 border-[#1e160e] p-1.5 bg-[#e6d8be] shadow-inner rounded-none"
      };
    }
    if (s === "almanac") {
      return {
        id: "almanac",
        name: "Heritage Almanac",
        title: "1880s Farmer's & Naturalist Almanac",
        masthead: "THE OLD CORRIDOR FARMER'S ALMANAC",
        mastheadTitle: "THE OLD CORRIDOR FARMER'S ALMANAC",
        subhead: "CALCULATED FOR THE MERIDIAN OF THE HEARTLAND • ASTRONOMICAL & FIELD REGISTER",
        mastheadSub: "CALCULATED FOR THE MERIDIAN OF THE HEARTLAND • ASTRONOMICAL & FIELD REGISTER",
        earLeft: "MOON PHASE: WAXING GIBBOUS • RISES 4:18 PM",
        mastheadLeftEar: "MOON PHASE: WAXING GIBBOUS • RISES 4:18 PM",
        earRight: "ESTABLISHED 1884 • YEARLY COMPENDIUM",
        mastheadRightEar: "ESTABLISHED 1884 • YEARLY COMPENDIUM",
        datelinePrefix: "ALMANAC REGISTER",
        filterBadge: "🕰️ 1880s Sepia Plate",
        filterLabel: "1880s Sepia Plate",
        filterDesc: "Warm copperplate daguerreotype sepia etching with archival parchment toning.",
        imgFilterClass: "grayscale sepia-[0.85] contrast-[1.36] brightness-[0.91] filter",
        isOldTimey: true,
        paperBg: "bg-[#EFE2C6]",
        paperText: "text-[#24180B]",
        paperBorder: "border-[#3D2812]",
        paperBgClass: "bg-[#EFE2C6] text-[#24180B] border-4 border-double border-[#3D2812] shadow-[0_12px_36px_rgba(0,0,0,0.45)]",
        plateFrameClass: "border-2 border-[#3D2812] p-1.5 bg-[#dfcfa9] shadow-inner rounded-none"
      };
    }
    if (s === "curio") {
      return {
        id: "curio",
        name: "Penny Curio",
        title: "1895 Penny Curio & Marvel Broadside",
        masthead: "WONDER & CURIO ILLUSTRATED GAZETTE",
        mastheadTitle: "WONDER & CURIO ILLUSTRATED GAZETTE",
        subhead: "A CABINET OF REMARKABLE DISCOVERIES, ODDITIES & SCIENTIFIC MARVELS",
        mastheadSub: "A CABINET OF REMARKABLE DISCOVERIES, ODDITIES & SCIENTIFIC MARVELS",
        earLeft: "AUTHENTICATED BY FIELD WITNESSES",
        mastheadLeftEar: "AUTHENTICATED BY FIELD WITNESSES",
        earRight: "SPECIAL ILLUSTRATED SUPPLEMENT • ONE PENNY",
        mastheadRightEar: "SPECIAL ILLUSTRATED SUPPLEMENT • ONE PENNY",
        datelinePrefix: "CURIO DISPATCH",
        filterBadge: "🎪 Tin-Type Lithograph",
        filterLabel: "Tin-Type Lithograph",
        filterDesc: "Victorian wet-collodion tin-type plate with high-contrast antique brass & Prussian ink.",
        imgFilterClass: "grayscale-[0.88] sepia-[0.55] hue-rotate-[-15deg] contrast-[1.45] saturate-[1.35] brightness-[0.93] filter",
        isOldTimey: true,
        paperBg: "bg-[#f5ebd6]",
        paperText: "text-[#1c130b]",
        paperBorder: "border-[#4a2511]",
        paperBgClass: "bg-[#f5ebd6] text-[#1c130b] border-4 border-double border-[#4a2511] shadow-[0_12px_36px_rgba(0,0,0,0.45)]",
        plateFrameClass: "border-2 border-[#4a2511] p-1.5 bg-[#e8d9b8] shadow-inner rounded-none"
      };
    }
    if (s === "fieldnote") {
      return {
        id: "fieldnote",
        name: "Field Note",
        title: "1974 Expedition Field Journal",
        masthead: "FIELD STATION ECOLOGICAL LOGBOOK",
        mastheadTitle: "FIELD STATION ECOLOGICAL LOGBOOK",
        subhead: "WATERSHED & BIODIVERSITY SURVEY • DIRECT OBSERVATION RECORD",
        mastheadSub: "WATERSHED & BIODIVERSITY SURVEY • DIRECT OBSERVATION RECORD",
        earLeft: "SPECIMEN LOG: VERIFIED",
        mastheadLeftEar: "SPECIMEN LOG: VERIFIED",
        earRight: "ARCHIVAL KODACHROME PLATE",
        mastheadRightEar: "ARCHIVAL KODACHROME PLATE",
        datelinePrefix: "FIELD SURVEY LOG",
        filterBadge: "🌿 Kodachrome 64 Film",
        filterLabel: "Kodachrome 64 Film",
        filterDesc: "Warm 1970s National Geographic Kodachrome 64 analog slide film grain & color profile.",
        imgFilterClass: "contrast-[1.18] saturate-[1.38] sepia-[0.22] brightness-[1.02] filter",
        isOldTimey: false,
        paperBg: "bg-[#eef2eb]",
        paperText: "text-[#18281e]",
        paperBorder: "border-[#2d5a40]",
        paperBgClass: "",
        plateFrameClass: "border-2 border-emerald-700/60 p-1 bg-emerald-950/20 rounded-lg"
      };
    }
    if (s === "comic") {
      return {
        id: "comic",
        name: "Comic Strip",
        title: "Sunday Pulp Graphic Strip",
        masthead: "💥 FIELDPRESS PULP ACTION COMICS",
        mastheadTitle: "💥 FIELDPRESS PULP ACTION COMICS",
        subhead: "FOUR-COLOR PRINTING PRESS EDITION",
        mastheadSub: "FOUR-COLOR PRINTING PRESS EDITION",
        earLeft: "APPROVED BY THE PRESS CODE",
        mastheadLeftEar: "APPROVED BY THE PRESS CODE",
        earRight: "10¢ • ALL-NEW TRUE STORY!",
        mastheadRightEar: "10¢ • ALL-NEW TRUE STORY!",
        datelinePrefix: "ACTION PANEL",
        filterBadge: "💥 Pulp Ben-Day Ink",
        filterLabel: "Pulp Ben-Day Ink",
        filterDesc: "Hyper-saturated four-color pulp comic ink with classic Ben-Day halftone dots.",
        imgFilterClass: "contrast-[1.5] saturate-[2.1] brightness-[1.04] filter",
        isOldTimey: false,
        paperBg: "bg-[#fffdf0]",
        paperText: "text-black",
        paperBorder: "border-black",
        paperBgClass: "",
        plateFrameClass: "border-4 border-black dark:border-yellow-400 rounded-2xl shadow-[5px_5px_0px_0px_#000]"
      };
    }
    if (s === "arcade") {
      return {
        id: "arcade",
        name: "8-Bit Arcade",
        title: "1984 Green Phosphor CRT Terminal",
        masthead: "■ 1-PLAYER TELEMETRY TERMINAL",
        mastheadTitle: "■ 1-PLAYER TELEMETRY TERMINAL",
        subhead: "8-BIT VECTOR & RASTER CRT DISPLAY",
        mastheadSub: "8-BIT VECTOR & RASTER CRT DISPLAY",
        earLeft: "BAUD: 9600 • PARITY: NONE",
        mastheadLeftEar: "BAUD: 9600 • PARITY: NONE",
        earRight: "HIGH SCORE: 994,200",
        mastheadRightEar: "HIGH SCORE: 994,200",
        datelinePrefix: "CRT TERMINAL",
        filterBadge: "🕹️ Green CRT Matrix",
        filterLabel: "Green CRT Matrix",
        filterDesc: "Monochrome 1984 green phosphor CRT monitor matrix with horizontal scanlines.",
        imgFilterClass: "grayscale contrast-[1.65] brightness-90 sepia hue-rotate-[85deg] saturate-[380%] filter",
        isOldTimey: false,
        paperBg: "bg-black",
        paperText: "text-[#00ff66]",
        paperBorder: "border-[#00ff66]",
        paperBgClass: "",
        plateFrameClass: "border-2 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.4)] rounded-none bg-black"
      };
    }
    if (s === "tactical") {
      return {
        id: "tactical",
        name: "Tactical Recon",
        title: "Tactical Recon Telemetry Wire",
        masthead: "RECON PROTOCOL // FREQ: 144.390 MHZ",
        mastheadTitle: "RECON PROTOCOL // FREQ: 144.390 MHZ",
        subhead: "GEOSPATIAL SATELLITE & FIELD TELEMETRY",
        mastheadSub: "GEOSPATIAL SATELLITE & FIELD TELEMETRY",
        earLeft: "SIGNAL LOCK: CONFIRMED",
        mastheadLeftEar: "SIGNAL LOCK: CONFIRMED",
        earRight: "VICINITY RING ±5 KM",
        mastheadRightEar: "VICINITY RING ±5 KM",
        datelinePrefix: "RECON WIRE",
        filterBadge: "🛰️ FLIR Night-Vision",
        filterLabel: "FLIR Night-Vision",
        filterDesc: "High-contrast phosphor-cyan optical recon telemetry filter with HUD targeting grid.",
        imgFilterClass: "grayscale-[0.72] contrast-[1.32] brightness-[0.95] sepia-[0.35] hue-rotate-[145deg] saturate-[210%] filter",
        isOldTimey: false,
        paperBg: "bg-[#030a12]",
        paperText: "text-cyan-300",
        paperBorder: "border-cyan-500/80",
        paperBgClass: "",
        plateFrameClass: "border border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-lg bg-zinc-950"
      };
    }
    return {
      id: "magazine",
      name: "Modern Sleek",
      title: "Modern Sleek Editorial Gloss",
      masthead: "FIELDPRESS MAGAZINE • FEATURE REPORT",
      mastheadTitle: "FIELDPRESS MAGAZINE • FEATURE REPORT",
      subhead: "CONTEMPORARY LONGFORM PHOTOJOURNALISM",
      mastheadSub: "CONTEMPORARY LONGFORM PHOTOJOURNALISM",
      earLeft: "NATIONAL DESK",
      mastheadLeftEar: "NATIONAL DESK",
      earRight: "COLLECTOR'S ISSUE",
      mastheadRightEar: "COLLECTOR'S ISSUE",
      datelinePrefix: "FEATURE DESK",
      filterBadge: "✨ Cinema Bleach-Bypass",
      filterLabel: "Cinema Bleach-Bypass",
      filterDesc: "High-contrast Leica cinema bleach-bypass editorial color grade with studio vignette.",
      imgFilterClass: "contrast-[1.18] saturate-[1.24] brightness-[1.02] filter",
      isOldTimey: false,
      paperBg: "bg-zinc-950",
      paperText: "text-zinc-100",
      paperBorder: "border-purple-500/40",
      paperBgClass: "",
      plateFrameClass: "border border-purple-500/40 rounded-2xl shadow-lg bg-purple-950/20"
    };
  };

  const renderThemePhotoOverlay = (rawStyle?: string, isFilterActive = true) => {
    if (!isFilterActive) return null;
    const s = (rawStyle || "newspaper").toLowerCase();
    if (s === "newspaper") {
      // Early 1900s rotary printing-press halftone dot screen + aged ink grain
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-35 mix-blend-multiply"
            style={{
              backgroundImage: "radial-gradient(#0f0b07 0.9px, transparent 0.9px)",
              backgroundSize: "3px 3px"
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-t from-[#2b1d0f]/35 via-transparent to-[#2b1d0f]/20 mix-blend-multiply border border-[#1e160e]/40" />
        </>
      );
    }
    if (s === "almanac") {
      // 1880s Daguerreotype sepia vignette + fine woodcut horizontal line screen
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-25 mix-blend-multiply"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(45,26,10,0.35) 0px, rgba(45,26,10,0.35) 1px, transparent 1px, transparent 3px)"
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_40px_rgba(36,20,6,0.65)]" />
        </>
      );
    }
    if (s === "curio") {
      // Victorian Tin-Type corner brass vignette + stipple screen
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-multiply"
            style={{
              backgroundImage: "radial-gradient(#2a1408 0.8px, transparent 0.8px)",
              backgroundSize: "4px 4px"
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_45px_rgba(20,10,4,0.75)] border-2 border-amber-700/40" />
        </>
      );
    }
    if (s === "comic") {
      // Classic Sunday-funnies Ben-Day halftone dots
      return (
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-25 mix-blend-multiply"
          style={{
            backgroundImage: "radial-gradient(#000 1.1px, transparent 1.1px)",
            backgroundSize: "5px 5px"
          }}
        />
      );
    }
    if (s === "arcade") {
      // 1984 CRT horizontal phosphor scanlines
      return (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.55)_50%)] bg-[length:100%_4px] opacity-80 z-10" />
      );
    }
    if (s === "tactical") {
      // HUD optical targeting reticle + telemetry scanlines
      return (
        <>
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(6,182,212,0)_50%,rgba(6,182,212,0.08)_50%)] bg-[length:100%_3px] z-10" />
          <div className="absolute top-1.5 left-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">┌</div>
          <div className="absolute top-1.5 right-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">┐</div>
          <div className="absolute bottom-7 left-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">└</div>
          <div className="absolute bottom-7 right-1.5 text-[10px] font-mono text-cyan-400 font-bold leading-none pointer-events-none z-10">┘</div>
        </>
      );
    }
    if (s === "fieldnote") {
      return (
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_25px_rgba(20,40,20,0.35)] border border-emerald-500/20" />
      );
    }
    return (
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]" />
    );
  };

  const [newImageUrl, setNewImageUrl] = useState<string>("");
  // Optional embed link (YouTube/Reddit/X/any URL) -- resolved server-side
  // into embedType/embedData on save; see api/_lib/resolveEmbed.mjs.
  const [newSourceUrl, setNewSourceUrl] = useState<string>("");
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

  // =========================================================================
  // PRESSY'O COPILOT HANDLERS (3-Tier Ollama -> Groq -> Gemini + In-Editor)
  // =========================================================================
  const formatSourceLabel = (src?: string | null, model?: string | null) => {
    if (src === "ollama") return `🟢 Ollama (${model || "local"})`;
    if (src === "groq") return `⚡ Groq LPU (${model || "llama-3.3-70b"})`;
    if (src === "gemini") return `✨ Gemini (${model || "flash"})`;
    return "Pressy'o AI";
  };

  const handleUndoPressyoEdit = () => {
    if (!pressyoEditorUndo) return;
    setNewTitle(pressyoEditorUndo.title);
    setNewContent(pressyoEditorUndo.content);
    setNewEditionStyle(pressyoEditorUndo.editionStyle);
    setVisualPrompt(pressyoEditorUndo.visualPrompt);
    setPressyoEditorUndo(null);
    setPressyoEditorStatus("↩ Restored previous draft state.");
  };

  const handlePressyoEditorAction = async (
    action: "rewrite_voice" | "expand" | "shorten" | "headlines" | "factcheck_polish" | "visual_prompt" | "draft_from_topic" | "uplift_angle" | "social_thread" | "custom_edit",
    targetStyle?: PressyoEdition,
    customInstructionText?: string
  ) => {
    if (isPressyoEditorBusy) return;

    const effectiveStyle: PressyoEdition = targetStyle || newEditionStyle || "tactical";
    const hasDraftText = Boolean(newTitle.trim() || newContent.trim());

    if (!hasDraftText && action !== "draft_from_topic" && action !== "custom_edit") {
      setPressyoEditorStatus("⚠️ Enter a headline, topic, or rough notes first so Pressy'o has material to work with.");
      return;
    }

    const actionPrompts: Record<string, string> = {
      rewrite_voice: `Rewrite the active dispatch into the ${effectiveStyle.toUpperCase()} edition voice while preserving all core facts and corridor telemetry.`,
      expand: `Expand the active dispatch in the ${effectiveStyle.toUpperCase()} edition voice with richer reporting, sensory detail, and infrastructure context.`,
      shorten: `Condense and tighten the active dispatch into crisp, high-signal wire copy in the ${effectiveStyle.toUpperCase()} edition voice.`,
      headlines: `Craft a sharper, high-impact headline in the ${effectiveStyle.toUpperCase()} edition voice and polish the opening lede.`,
      factcheck_polish: `Polish the active dispatch for flow, grammar, and authentic telemetry phrasing in the ${effectiveStyle.toUpperCase()} edition voice.`,
      uplift_angle: `Reframe and enrich the active dispatch in the ${effectiveStyle.toUpperCase()} edition voice to foreground constructive human ingenuity, community resilience, and verified real-world impact without losing journalistic rigor.`,
      social_thread: `Keep the core dispatch intact and append a punchy [SYNDICATION & 15s BROADCAST READ] footer block with a 15-second radio script and a 3-bullet social distribution thread.`,
      visual_prompt: `Generate a vivid, photojournalistic Pollinations visual framing prompt for this dispatch (${newTitle || newContent.slice(0, 120) || "Midwest Corridor infrastructure"}).`,
      draft_from_topic: `Draft a full dispatch in the ${effectiveStyle.toUpperCase()} edition voice about: ${customInstructionText || newTitle || newContent || "Midwest Corridor field telemetry"}.`,
      custom_edit: customInstructionText || pressyoCustomInstruction.trim() || "Refine and improve this dispatch."
    };

    const actionLabels: Record<string, string> = {
      rewrite_voice: `Switching voice to ${effectiveStyle}…`,
      expand: "Expanding field dispatch…",
      shorten: "Condensing wire copy…",
      headlines: "Sharpening headline & lede…",
      factcheck_polish: "Polishing prose & telemetry…",
      uplift_angle: "Amplifying constructive human angle…",
      social_thread: "Generating 15s read & syndication thread…",
      visual_prompt: "Crafting visual prompt…",
      draft_from_topic: "Drafting full dispatch…",
      custom_edit: "Applying custom edit…"
    };

    setIsPressyoEditorBusy(true);
    setPressyoEditorActionLabel(actionLabels[action] || "Pressy'o working…");
    setPressyoEditorStatus(null);

    // Save undo snapshot before mutating builder state
    setPressyoEditorUndo({
      title: newTitle,
      content: newContent,
      editionStyle: newEditionStyle,
      visualPrompt
    });

    try {
      const resp = await fetch("/api/pressyo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: actionPrompts[action] || actionPrompts.custom_edit,
          editionStyle: effectiveStyle,
          editorAction: action === "draft_from_topic" && hasDraftText && newContent.trim().length > 80 ? "expand" : action,
          draftContext: {
            title: newTitle,
            content: newContent,
            editionStyle: effectiveStyle,
            visualPrompt,
            location: newLocation,
            category: newCategory
          },
          history: pressyoChat.slice(-6)
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || `Request failed (${resp.status})`);
      }

      if (data.source) setPressyoLastSource(data.source);
      if (data.model) setPressyoLastModel(data.model);
      if (typeof data.remainingQuota === "number") setPressyoRemainingQuota(data.remainingQuota);

      if (action === "visual_prompt" || data.type === "visual") {
        const nextVisual = data.visualPrompt || data.text || "";
        if (nextVisual) setVisualPrompt(nextVisual);
        setPressyoEditorStatus(`✓ Visual prompt crafted via ${formatSourceLabel(data.source, data.model)}`);
      } else {
        if (targetStyle) setNewEditionStyle(targetStyle);
        if (data.title && data.title !== "Untitled Dispatch") setNewTitle(data.title);
        if (data.text) setNewContent(data.text);
        if (data.visualPrompt && (!visualPrompt.trim() || action === "draft_from_topic")) {
          setVisualPrompt(data.visualPrompt);
        }
        if (action === "custom_edit") setPressyoCustomInstruction("");
        if (formValidationError) setFormValidationError(null);
        setPressyoEditorStatus(`✓ Updated (${effectiveStyle.toUpperCase()}) via ${formatSourceLabel(data.source, data.model)}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Pressy'o couldn't complete the edit.";
      setPressyoEditorStatus(`⚠️ ${errorMessage}`);
    } finally {
      setIsPressyoEditorBusy(false);
      setPressyoEditorActionLabel("");
    }
  };

  const handlePressyoSend = async (customPrompt?: string) => {
    const userText = customPrompt || pressyoInput.trim();
    if (!userText || isPressyoLoading) return;

    const newChat = [...pressyoChat, { sender: "user" as const, text: userText }];
    setPressyoChat(newChat);
    setPressyoInput("");
    setIsPressyoLoading(true);

    const editionStyle = inferEditionStyle(userText, newEditionStyle || "tactical");

    try {
      const resp = await fetch("/api/pressyo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          editionStyle,
          draftContext: (newTitle.trim() || newContent.trim())
            ? {
                title: newTitle,
                content: newContent,
                editionStyle: newEditionStyle,
                visualPrompt,
                location: newLocation,
                category: newCategory
              }
            : undefined,
          history: pressyoChat.slice(-8)
        })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || `Request failed (${resp.status})`);
      }

      if (data.source) setPressyoLastSource(data.source);
      if (data.model) setPressyoLastModel(data.model);
      if (typeof data.remainingQuota === "number") setPressyoRemainingQuota(data.remainingQuota);

      const pressyoMessage: PressyoMessage = data.type === "draft"
        ? {
            sender: "pressyo",
            text: data.text,
            source: data.source,
            model: data.model,
            actionData: {
              title: data.title || `Pressy'o Dispatch (${data.style || editionStyle})`,
              content: data.text,
              style: (data.style || editionStyle) as PressyoEdition,
              prompt: data.visualPrompt
            }
          }
        : data.type === "visual"
        ? {
            sender: "pressyo",
            text: data.text || `Visual Prompt: ${data.visualPrompt}`,
            source: data.source,
            model: data.model,
            visualOnlyPrompt: data.visualPrompt
          }
        : {
            sender: "pressyo",
            text: data.text,
            source: data.source,
            model: data.model
          };

      const finalized = [...newChat, pressyoMessage];
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

  // Cover Photo Handler — same pattern as handlePhotoSelect above: upload
  // immediately to durable storage and persist server-side rather than
  // holding a local-only preview.
  const coverPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [coverPhotoUploading, setCoverPhotoUploading] = useState(false);
  const handleCoverPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) setEditPassForm((prev) => ({ ...prev, coverPhotoUrl: result }));
    };
    reader.readAsDataURL(file);

    if (!authAccount) {
      // Guest editing a local-only press pass: local preview only, same
      // as avatar upload's guest path.
      return;
    }

    setCoverPhotoUploading(true);
    try {
      const uploadRes = await fetch("/api/upload-cover-photo", {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type }
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        setEditPassForm((prev) => ({ ...prev, coverPhotoUrl: uploadData.url }));
        setAuthAccount((prev) => (prev ? { ...prev, coverPhotoUrl: uploadData.url } : prev));
      } else {
        setSavedSuccessToast("Cover photo upload failed. Please try again.");
        setTimeout(() => setSavedSuccessToast(""), 3000);
      }
    } catch {
      setSavedSuccessToast("Cover photo upload failed. Please try again.");
      setTimeout(() => setSavedSuccessToast(""), 3000);
    }
    setCoverPhotoUploading(false);
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

  // Fuzzes any coordinate to a coarse ~5 km regional sector (2 decimal places, ~0.04 deg grid)
  // so exact street/building GPS coordinates are NEVER stored or transmitted.
  const fuzzVicinityClient = (val: number): number => {
    const grid = Math.round(val * 25) / 25;
    const jitter = ((Math.floor(Math.abs(val * 1000)) % 9) - 4) * 0.002;
    return Number((grid + jitter).toFixed(2));
  };

  const handlePinMyVicinity = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const fuzzyLon = fuzzVicinityClient(pos.coords.longitude);
          const fuzzyLat = fuzzVicinityClient(pos.coords.latitude);
          setNewCoordinates(`${fuzzyLon}, ${fuzzyLat}`);
          setNewVicinityPinOnly(true);
          if (!newLocation.trim() || newLocation === "Midwest Corridor") {
            setNewLocation(`Sector ${fuzzyLat.toFixed(1)}°N, ${Math.abs(fuzzyLon).toFixed(1)}°W (Vicinity)`);
          }
          setSavedSuccessToast(`📍 Vicinity pinned (~5km fuzzy sector: ${fuzzyLat}°, ${fuzzyLon}° — exact GPS stripped).`);
          setTimeout(() => setSavedSuccessToast(""), 3500);
        },
        () => {
          // If browser geolocation permission is declined, fuzz the currently entered coordinates
          const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));
          const lon = !isNaN(parts[0]) ? fuzzVicinityClient(parts[0]) : -87.63;
          const lat = !isNaN(parts[1]) ? fuzzVicinityClient(parts[1]) : 40.12;
          setNewCoordinates(`${lon}, ${lat}`);
          setNewVicinityPinOnly(true);
          setSavedSuccessToast(`📍 Coordinates quantized to ~5km fuzzy vicinity (${lat}°, ${lon}°).`);
          setTimeout(() => setSavedSuccessToast(""), 3500);
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    }
  };

  // Helper that returns all valid gallery frames for any dispatch (combining d.gallery + d.imageUrl)
  const getGalleryForDispatch = (d?: Dispatch | null) => {
    if (!d) return [];
    const list: Array<{ id: string; url: string; caption?: string; source?: string; timestamp?: string }> = [];
    const seen = new Set<string>();
    const addFrame = (url?: string, caption?: string, source?: string, timestamp?: string, id?: string) => {
      if (!url || typeof url !== "string" || !url.trim()) return;
      const clean = url.trim();
      if (seen.has(clean)) return;
      seen.add(clean);
      list.push({
        id: id || `frame-${list.length + 1}`,
        url: clean,
        caption: caption || d.imageCaption || "",
        source: source || "upload",
        timestamp: timestamp || "Verified Frame"
      });
    };
    if (d.imageUrl) {
      addFrame(d.imageUrl, d.imageCaption, "lead", "Lead Frame", "frame-lead");
    }
    if (Array.isArray(d.gallery)) {
      for (const item of d.gallery) {
        if (item && item.url) {
          addFrame(item.url, item.caption, item.source, item.timestamp, item.id);
        }
      }
    }
    if (d.embedData && typeof d.embedData === "object" && Array.isArray((d.embedData as any).gallery)) {
      for (const item of (d.embedData as any).gallery) {
        if (item && item.url) {
          addFrame(item.url, item.caption, item.source, item.timestamp, item.id);
        }
      }
    }
    return list;
  };

  // Re-encodes uploaded images (single or multiple) through an offscreen HTML5 <canvas>
  // to scrub 100% of embedded EXIF headers (exact GPS coordinates, camera serial numbers, timestamps).
  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.slice(0, 8).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target?.result as string;
        if (!rawDataUrl) return;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1400;
          let w = img.width || 1200;
          let h = img.height || 675;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
          }
          // Exporting from canvas produces a pure RGB stream with ZERO EXIF/GPS/Camera metadata
          const scrubbedDataUrl = ctx ? canvas.toDataURL("image/jpeg", 0.9) : rawDataUrl;
          const cleanCaption = newIsAnonymous
            ? `[🛡️ EXIF & GPS Metadata Stripped] Field Evidence Frame #${idx + 1}`
            : `[🛡️ EXIF Scrubbed] ${file.name.replace(/\.[^/.]+$/, "")}`;
          const item = {
            id: `upload-${Date.now()}-${idx}`,
            url: scrubbedDataUrl,
            source: "upload" as const,
            caption: cleanCaption,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          };
          setEvidenceGallery((prev) => [item, ...prev.slice(0, 11)]);
          if (idx === 0) {
            setNewImageUrl((curr) => curr || scrubbedDataUrl);
            setNewImageCaption((curr) => curr || cleanCaption);
          }
          setSavedSuccessToast(`🛡️ ${files.length > 1 ? `${files.length} photos` : "Photo"} attached with 100% EXIF, GPS & device metadata stripped.`);
          setTimeout(() => setSavedSuccessToast(""), 3500);
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const extractYoutubeVideoId = (rawUrl?: string | null): string | null => {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    const m = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|i\.ytimg\.com\/vi\/)([\w-]{11})/i);
    return m ? m[1] : null;
  };

  // Unfurls a URL dropped/pasted directly into the Pressie Builder Title bar:
  // extracts the article/video headline into newTitle, attaches the source URL,
  // drops any preview image into the Visual Evidence & Media Tray (allowing more photos),
  // and pre-fills the Dispatch Body with the source excerpt if empty.
  const handleUnfurlUrlFromTitle = async (rawUrl: string, customPrefix = "") => {
    const cleanUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) return;
    setNewSourceUrl(cleanUrl);
    setIsUnfurlingTitleUrl(true);
    setUnfurlTitleStatus("🔗 Pulling headline, summary & photos from source URL…");

    // Immediate YouTube frame extraction if it's a YouTube URL
    const ytId = extractYoutubeVideoId(cleanUrl);
    if (ytId) {
      const ytFrame = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      setNewImageUrl((curr) => curr || ytFrame);
      setNewImageCaption((curr) => curr || "[🎥 Shared Broadcast Footage] Verified Video Still");
      setEvidenceGallery((prev) => [
        {
          id: `yt-drop-${Date.now()}`,
          url: ytFrame,
          source: "upload" as const,
          caption: "[🎥 Shared Broadcast Footage] Verified Video Still",
          timestamp: "Source URL"
        },
        ...prev.filter((p) => p.url !== ytFrame).slice(0, 10)
      ]);
    }

    try {
      const res = await fetch(`/api/resolve-url?url=${encodeURIComponent(cleanUrl)}`);
      if (res.ok) {
        const data = await res.json();
        const resolvedTitle = (data.title || "").trim();
        if (resolvedTitle) {
          setNewTitle(customPrefix ? `${customPrefix} — ${resolvedTitle}` : resolvedTitle);
        } else if (!customPrefix) {
          let host = "External Source";
          try {
            host = new URL(cleanUrl).hostname.replace(/^www\./, "");
          } catch {
            // ignore
          }
          setNewTitle(`Shared Dispatch via ${host}`);
        }

        if (data.image && typeof data.image === "string" && data.image.startsWith("http")) {
          const imgItem = {
            id: `unfurl-${Date.now()}`,
            url: data.image,
            source: "upload" as const,
            caption: `[🔗 Source Photo via ${data.siteName || "Web"}] ${resolvedTitle || ""}`.trim(),
            timestamp: "Source URL"
          };
          setEvidenceGallery((prev) => [imgItem, ...prev.filter((p) => p.url !== data.image).slice(0, 10)]);
          setNewImageUrl((curr) => curr || data.image);
          setNewImageCaption((curr) => curr || imgItem.caption);
        }

        const desc = (data.description || "").trim();
        setNewContent((curr) => {
          if (curr && curr.trim().length > 0) {
            return curr.includes(cleanUrl) ? curr : `${curr}\n\n🔗 Shared Source (${data.siteName || "Web"}): ${cleanUrl}`;
          }
          if (desc) {
            return `${desc}\n\n🔗 Shared via ${data.siteName || "External Source"}: ${cleanUrl}\n\n[Add your field notes or commentary here...]`;
          }
          return `Shared from ${data.siteName || "External Source"}: ${resolvedTitle || cleanUrl}\n\n🔗 Source Link: ${cleanUrl}\n\n[Add your field notes or commentary here...]`;
        });

        setUnfurlTitleStatus(`✓ Imported from ${data.siteName || "source"}! You can now edit the title, add notes in the body, or attach more photos below.`);
      } else {
        setUnfurlTitleStatus("✓ Source URL attached! Type your headline above and add notes/photos below.");
      }
    } catch {
      setUnfurlTitleStatus("✓ Source URL attached! Type your headline above and add notes/photos below.");
    } finally {
      setIsUnfurlingTitleUrl(false);
    }
  };

  // Allows 1-click pasting of prepared content (e.g. a URL, or a multi-line article with headline + body)
  const handlePastePreparedContent = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (!clip || !clip.trim()) {
        setUnfurlTitleStatus("Clipboard is empty — copy a URL or prepared article text first, or drop it directly into the title box.");
        return;
      }
      const trimmed = clip.trim();
      const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
      const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

      if (lines.length === 1 && urlMatch && urlMatch[0] === lines[0]) {
        await handleUnfurlUrlFromTitle(urlMatch[0]);
        return;
      }

      if (lines.length >= 1) {
        const firstLine = lines[0].replace(/^#+\s*/, "");
        const restBody = lines.slice(1).join("\n\n");
        if (/^https?:\/\/\S+$/i.test(firstLine)) {
          if (restBody) setNewContent(restBody);
          await handleUnfurlUrlFromTitle(firstLine);
        } else {
          setNewTitle(firstLine.slice(0, 220));
          if (restBody) setNewContent(restBody);
          if (urlMatch) setNewSourceUrl(urlMatch[0]);
          setUnfurlTitleStatus("✓ Prepared headline & body imported! Attach photos or edit below.");
        }
      }
    } catch {
      setUnfurlTitleStatus("Tip: Press Cmd+V / Ctrl+V inside the Title box to drop a URL or prepared headline.");
    }
  };

  const getFallbackImageForDispatch = (d?: Partial<Dispatch> | null): string => {
    if (d?.embedData?.thumbnail_url) return d.embedData.thumbnail_url;
    const ytId = extractYoutubeVideoId(d?.sourceUrl) || extractYoutubeVideoId(d?.imageUrl);
    if (ytId) return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85";
  };

  const handleImgFallbackError = (e: React.SyntheticEvent<HTMLImageElement, Event>, d?: Partial<Dispatch> | null) => {
    const target = e.currentTarget;
    if (target.dataset.fallbackApplied === "1") return;
    target.dataset.fallbackApplied = "1";
    target.src = getFallbackImageForDispatch(d);
  };

  const handleAddImageUrl = () => {
    const raw = manualImageUrl.trim();
    if (!raw) return;
    const ytId = extractYoutubeVideoId(raw);
    const resolvedImgUrl = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : raw;
    const resolvedCaption = ytId ? "[🎥 Real Video Footage Frame] Verified YouTube Broadcast Still" : "[📸 Real Web Photo] Field media link";

    if (ytId && !newSourceUrl.trim()) {
      setNewSourceUrl(`https://www.youtube.com/watch?v=${ytId}`);
    }

    const item = {
      id: "url-" + Date.now(),
      url: resolvedImgUrl,
      source: "upload" as const,
      caption: resolvedCaption,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setEvidenceGallery((prev) => [item, ...prev.slice(0, 8)]);
    setNewImageUrl(resolvedImgUrl);
    setNewImageCaption(resolvedCaption);
    setManualImageUrl("");
    setShowUrlInput(false);
    setSavedSuccessToast(ytId ? "YouTube footage linked + HD video frame attached!" : "Real photo URL linked to evidence tray.");
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
        }, 4500);
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
    setEditingPublishedId(null);
    if (draftToEdit) {
      setEditingDraftId(draftToEdit.id);
      setForkParentId(null);
      setNewTitle(draftToEdit.title.replace(/^Draft:\s*/i, ""));
      setNewCategory(draftToEdit.category || "Field Dispatch");
      setNewLocation(draftToEdit.location || "Midwest Corridor");
      setNewContent(draftToEdit.content || "");
      const isAnon = Boolean(
        draftToEdit.isAnonymous ||
        draftToEdit.callsign === "anon-signal" ||
        draftToEdit.bureau?.includes("Metadata Stripped")
      );
      const isDecoupled = Boolean(
        draftToEdit.decoupleLocationPin ||
        isAnon ||
        draftToEdit.bureau?.includes("Pin Decoupled")
      );
      setNewIsAnonymous(isAnon);
      setNewDecoupleLocationPin(isDecoupled);
      setNewVicinityPinOnly(true);
      const validEdition = (draftToEdit.editionStyle && draftToEdit.editionStyle !== "wire"
        ? draftToEdit.editionStyle
        : "tactical") as PressyoEdition;
      setNewEditionStyle(validEdition);
      const safeImg =
        draftToEdit.imageUrl && !draftToEdit.imageUrl.includes("pollinations.ai") && !draftToEdit.imageUrl.includes("/wikipedia/commons/thumb/")
          ? draftToEdit.imageUrl
          : getFallbackImageForDispatch(draftToEdit);
      setNewImageUrl(safeImg || "");
      setNewImageCaption(draftToEdit.imageCaption || "");
      setNewSourceUrl(draftToEdit.sourceUrl || "");
      setVisualPrompt(draftToEdit.title || "");
      const existingFrames = getGalleryForDispatch(draftToEdit);
      if (existingFrames.length > 0) {
        setEvidenceGallery(
          existingFrames.map((f, idx) => ({
            id: f.id || `init-${Date.now()}-${idx}`,
            url: f.url,
            source: (f.source as any) || "upload",
            caption: f.caption || "",
            timestamp: f.timestamp || "Original"
          }))
        );
      } else if (safeImg) {
        setEvidenceGallery([{
          id: "init-" + Date.now(),
          url: safeImg,
          source: "upload",
          caption: draftToEdit.imageCaption || "",
          timestamp: "Original"
        }]);
      } else {
        setEvidenceGallery([]);
      }
      if (draftToEdit.coordinates) {
        setNewCoordinates(`${fuzzVicinityClient(draftToEdit.coordinates[0])}, ${fuzzVicinityClient(draftToEdit.coordinates[1])}`);
      }
    } else {
      setEditingDraftId(null);
      setForkParentId(null);
      setNewTitle("");
      setNewCategory("Field Dispatch");
      setNewLocation("Midwest Corridor (Vicinity)");
      setNewContent("");
      setNewEditionStyle("tactical");
      setNewIsAnonymous(false);
      setNewDecoupleLocationPin(false);
      setNewVicinityPinOnly(true);
      setNewImageUrl("");
      setNewImageCaption("");
      setNewSourceUrl("");
      setVisualPrompt("");
      setEvidenceGallery([]);
      setShowUrlInput(false);
      setManualImageUrl("");
      setNewCoordinates("-87.63, 40.12");
    }
    setFormValidationError(null);
    setShowPressPassModal(false); // ENSURE PRESS PASS IS NOT OPEN
    setShowPressieBuilderModal(true); // OPEN EXACT PRESSIE BUILDER
  };

  const openEditPublished = (dispatch: Dispatch) => {
    openCreatePressie(dispatch);
    setEditingDraftId(null);
    setEditingPublishedId(dispatch.id);
  };

  const openPressPassEditor = () => {
    setEditPassForm(pressPass);
    setShowPressieBuilderModal(false);
    setShowPressPassModal(true);
  };

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
        parsedCoords = newVicinityPinOnly
          ? [fuzzVicinityClient(parts[0]), fuzzVicinityClient(parts[1])]
          : [parts[0], parts[1]];
      }
    }

    const effectiveAuthor = newIsAnonymous ? "Anonymous Field Source" : pressPass.name;
    const effectiveCallsign = newIsAnonymous ? "anon-signal" : pressPass.callsign;
    const effectiveBureau = newIsAnonymous
      ? (newDecoupleLocationPin ? "Metadata Stripped • Pin Decoupled" : "Metadata Stripped • Vicinity Signal")
      : (newDecoupleLocationPin ? `${pressPass.bureau || "Field Bureau"} • Pin Decoupled` : pressPass.bureau);

    const draftItem: Dispatch = {
      id: editingDraftId || generateDispatchId(),
      title: finalTitle,
      category: newCategory || "Field Dispatch",
      author: effectiveAuthor,
      callsign: effectiveCallsign,
      bureau: effectiveBureau,
      timestamp: "Staged Draft",
      location: newLocation.trim() || "Midwest Corridor (Vicinity)",
      coordinates: parsedCoords,
      isAnonymous: newIsAnonymous,
      decoupleLocationPin: newDecoupleLocationPin,
      vicinityPinOnly: newVicinityPinOnly,
      content: newContent.trim(),
      imageUrl: newImageUrl || (evidenceGallery[0]?.url ?? undefined),
      imageCaption: newImageCaption || (evidenceGallery[0]?.caption ?? undefined),
      gallery: evidenceGallery.length > 0 ? evidenceGallery : undefined,
      embedData: {
        gallery: evidenceGallery,
        useThemePhotoFilter: builderUseThemePhotoFilter
      },
      sourceUrl: newSourceUrl.trim() || undefined,
      editionStyle: newEditionStyle,
      isPressRoll: true
    };

    try {
      const res = await fetch("/api/dispatches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draftItem,
          gallery: evidenceGallery,
          embedData: {
            gallery: evidenceGallery,
            useThemePhotoFilter: builderUseThemePhotoFilter
          },
          isPressRoll: true,
          isAnonymous: newIsAnonymous,
          decoupleLocationPin: newDecoupleLocationPin,
          vicinityPinOnly: newVicinityPinOnly
        })
      });
      if (!res.ok) throw new Error("save failed");
      const { dispatch: saved } = await res.json();

      const updated: Dispatch[] = editingDraftId
        ? pressRoll.map((p) => (p.id === editingDraftId ? saved : p))
        : [saved, ...pressRoll];
      setPressRoll(updated);

      setShowPressieBuilderModal(false);
      setFormValidationError(null);
      setSavedSuccessToast("Dispatch staged to Press Roll with privacy & vicinity settings.");
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

    const effectiveAuthor = newIsAnonymous ? "Anonymous Field Source" : pressPass.name;
    const effectiveCallsign = newIsAnonymous ? "anon-signal" : pressPass.callsign;
    const effectiveBureau = newIsAnonymous
      ? (newDecoupleLocationPin ? "Metadata Stripped • Pin Decoupled" : "Metadata Stripped • Vicinity Signal")
      : (newDecoupleLocationPin ? `${pressPass.bureau || "Field Bureau"} • Pin Decoupled` : pressPass.bureau);

    const fallbackContent = newContent.trim() || visualPrompt.trim() || `Field dispatch filed from ${newLocation || "Regional Vicinity"} by ${effectiveAuthor}.`;

    let parsedCoords: [number, number] | undefined = pressPass.coordinates || [-87.63, 40.12];
    if (newCoordinates.includes(",")) {
      const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedCoords = newVicinityPinOnly
          ? [fuzzVicinityClient(parts[0]), fuzzVicinityClient(parts[1])]
          : [parts[0], parts[1]];
      }
    }

    const chosenImage = newImageUrl || (evidenceGallery.length > 0 ? evidenceGallery[0].url : undefined);
    const chosenCaption = newImageCaption || (evidenceGallery.length > 0 ? evidenceGallery[0].caption : undefined);
    const rawLoc = newLocation.trim() || pressPass.location || pressPass.bureau || "Midwest Corridor";
    const finalLocation = newVicinityPinOnly && !rawLoc.toLowerCase().includes("vicinity")
      ? `${rawLoc} (Vicinity)`
      : rawLoc;

    const pressieItem: Dispatch = {
      id: editingPublishedId || generateDispatchId(),
      title: newTitle.trim(),
      category: newCategory || "Field Dispatch",
      author: effectiveAuthor,
      callsign: effectiveCallsign,
      bureau: effectiveBureau,
      timestamp: "Just now",
      location: finalLocation,
      coordinates: parsedCoords,
      isAnonymous: newIsAnonymous,
      decoupleLocationPin: newDecoupleLocationPin,
      vicinityPinOnly: newVicinityPinOnly,
      content: fallbackContent,
      imageUrl: chosenImage,
      imageCaption: chosenCaption,
      gallery: evidenceGallery.length > 0 ? evidenceGallery : undefined,
      embedData: {
        gallery: evidenceGallery,
        useThemePhotoFilter: builderUseThemePhotoFilter
      },
      sourceUrl: newSourceUrl.trim() || undefined,
      isPressRoll: false,
      editionStyle: newEditionStyle,
      sharingOption: newSharingOption,
      parentDispatchId: forkParentId || undefined
    };

    setForkParentId(null);
    try {
      const payload = {
        ...pressieItem,
        gallery: evidenceGallery,
        embedData: {
          gallery: evidenceGallery,
          useThemePhotoFilter: builderUseThemePhotoFilter
        },
        isPressRoll: false,
        isAnonymous: newIsAnonymous,
        decoupleLocationPin: newDecoupleLocationPin,
        vicinityPinOnly: newVicinityPinOnly
      };
      const res = editingPublishedId
        ? await fetch(`/api/dispatches/${editingPublishedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
        : await fetch("/api/dispatches", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
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

  // Removing a *published* dispatch is a bigger deal than clearing an
  // unpublished draft (deleteDraft above) — it's already live, possibly
  // bookmarked/forked/reacted-to by other people. Confirm before doing it,
  // and use the same DELETE /api/dispatches/:id the owner-only server
  // handler already supports (it was never exposed in the UI for
  // published dispatches, only for Press Roll drafts).
  const deletePublishedDispatch = async (id: string) => {
    if (!window.confirm("Permanently remove this dispatch from the Live Feed? This can't be undone.")) {
      return;
    }
    const previousDispatches = dispatches;
    setDispatches((prev) => prev.filter((d) => d.id !== id));
    setSavedSuccessToast("Dispatch removed.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
    try {
      const res = await fetch(`/api/dispatches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      setDispatches(previousDispatches);
      setSavedSuccessToast("Couldn't remove the dispatch — try again.");
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
    // Forking a wire pressie produces a regular user-authored pressie —
    // "wire" isn't a selectable edition style in the editor, so fall back.
    setNewEditionStyle(parent.editionStyle && parent.editionStyle !== "wire" ? parent.editionStyle : "tactical");
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

  const isDispatchAnonOrDecoupled = (d: Dispatch): boolean => {
    return Boolean(
      d.isAnonymous ||
      d.decoupleLocationPin ||
      d.callsign === "anon-signal" ||
      d.author?.toLowerCase().includes("anonymous") ||
      d.bureau?.includes("Metadata Stripped") ||
      d.bureau?.includes("Pin Decoupled")
    );
  };

  // MapLibre Global & National Vicinity Interaction Radar
  useEffect(() => {
    if (activeTab !== "map" || !mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const presetView =
      mapRegionPreset === "MIDWEST"
        ? { center: [-87.63, 40.12] as [number, number], zoom: 6.5 }
        : mapRegionPreset === "GLOBAL"
        ? { center: [-40.0, 32.0] as [number, number], zoom: 2.2 }
        : { center: [-96.5, 38.5] as [number, number], zoom: 3.7 };

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
        center: presetView.center,
        zoom: presetView.zoom
      });

      const visibleMapDispatches = dispatches.filter((d) => {
        if (!d.coordinates) return false;
        const isAnonOrDec = isDispatchAnonOrDecoupled(d);
        if (mapSignalFilter === "ANON_DECOUPLED") return isAnonOrDec;
        if (mapSignalFilter === "NAMED") return !isAnonOrDec;
        return true;
      });

      map.on("load", () => {
        // Add translucent Vicinity Sector Radar Rings (~5-10km fuzzy vicinity halos, NEVER exact street pins)
        const features = visibleMapDispatches.map((d) => {
          const isAnonOrDec = isDispatchAnonOrDecoupled(d);
          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [
                fuzzVicinityClient(d.coordinates![0]),
                fuzzVicinityClient(d.coordinates![1])
              ]
            },
            properties: {
              id: d.id,
              color: isAnonOrDec ? "#10b981" : "#f59e0b"
            }
          };
        });

        map.addSource("vicinity-zones", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features
          }
        });

        map.addLayer({
          id: "vicinity-outer-halo",
          type: "circle",
          source: "vicinity-zones",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 14, 5, 24, 10, 42],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.22,
            "circle-stroke-width": 2,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-opacity": 0.75
          }
        });
      });

      visibleMapDispatches.forEach((d) => {
        if (!d.coordinates) return;
        const fuzzyCoords: [number, number] = [
          fuzzVicinityClient(d.coordinates[0]),
          fuzzVicinityClient(d.coordinates[1])
        ];
        const isAnon = Boolean(d.isAnonymous || d.callsign === "anon-signal" || d.bureau?.includes("Metadata Stripped"));
        const isDecoupled = isDispatchAnonOrDecoupled(d);
        const markerColor = isDecoupled ? "#10b981" : "#f59e0b";
        const signalBadge = isAnon
          ? "🕵️ ANONYMOUS VICINITY SIGNAL (METADATA STRIPPED)"
          : isDecoupled
          ? "🔀 VICINITY SIGNAL (IDENTITY DECOUPLED FROM PIN)"
          : "📡 CORRESPONDENT VICINITY SIGNAL";
        const senderDisplay = isDecoupled
          ? "Unattributed Vicinity Node (Identity Protected)"
          : `${d.author} (@${d.callsign})`;

        const marker = new maplibregl.Marker({ color: markerColor })
          .setLngLat(fuzzyCoords)
          .setPopup(
            new maplibregl.Popup({ offset: 25 }).setHTML(
              `<div style="font-family: monospace; font-size: 11px; color: #09090b; padding: 6px; max-width: 240px;">
                <div style="font-weight: 900; color: ${isDecoupled ? "#059669" : "#d97706"}; font-size: 9px; margin-bottom: 3px;">
                  ${signalBadge}
                </div>
                <strong style="font-size: 12px;">${d.title}</strong><br/>
                <span style="color:#0284c7; font-weight: bold;">📍 Vicinity (~5km Sector): ${d.location}</span><br/>
                <span style="color:#52525b;">Coordinate Ring: ${fuzzyCoords[1]}°N, ${Math.abs(fuzzyCoords[0])}°W (Exact GPS Stripped)</span><br/>
                <span style="color:#18181b; font-weight: 600;">Source: ${senderDisplay}</span>
              </div>`
            )
          )
          .addTo(map);

        marker.getElement().addEventListener("click", () => {
          setSelectedStory(d);
        });
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.warn("MapLibre fallback:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, dispatches, mapSignalFilter, mapRegionPreset]);

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
            {/* Edition Theme Photo Filter Legend & Master Quick-Toggle Strip */}
            <div className={`px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 font-mono text-xs ${
              isDark ? "bg-zinc-900/90 border-zinc-800 text-zinc-300" : "bg-[#f6efe2] border-[#c8b396] text-[#2c2014]"
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40 font-black text-[10px] uppercase tracking-wider">
                  🖨️ Edition Printing Press & Darkroom Filters
                </span>
                <span className="text-[11px] opacity-85">
                  Each of the 8 Edition Themes includes its own signature darkroom/press photo filter toggle (1910 Halftone B&amp;W, 1880s Sepia Plate, Tin-Type, Kodachrome, FLIR, Ben-Day, CRT, Cinema). Click the filter badge on any photo to switch between Theme Filter &amp; Original Color.
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const nextMap: Record<string, boolean> = {};
                    dispatches.forEach((item) => { nextMap[item.id] = true; });
                    setEditionPhotoFilterOverrides(nextMap);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold text-[10px] hover:bg-amber-400 transition cursor-pointer"
                >
                  🎨 All Theme Filters ON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMap: Record<string, boolean> = {};
                    dispatches.forEach((item) => { nextMap[item.id] = false; });
                    setEditionPhotoFilterOverrides(nextMap);
                  }}
                  className="px-2.5 py-1 rounded border border-zinc-600 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] transition cursor-pointer"
                >
                  📸 All Original Color
                </button>
              </div>
            </div>

            {dispatches[0] && (() => {
              const d = dispatches[0];
              const style = d.editionStyle || "newspaper";
              const themeCfg = getEditionThemeConfig(style);
              const filterActive = isThemePhotoFilterActive(d);
              const isComic = themeCfg.id === "comic";
              const isOldTimey = themeCfg.isOldTimey; // newspaper, almanac, curio
              const isFieldnote = themeCfg.id === "fieldnote";
              const isArcade = themeCfg.id === "arcade";
              const isTactical = themeCfg.id === "tactical";

              return (
                <article
                  onClick={() => setSelectedStory(d)}
                  className={`transition cursor-pointer relative overflow-hidden select-none ${
                    isComic
                      ? "bg-[#fffdf0] dark:bg-[#18181b] border-4 border-black dark:border-yellow-400 shadow-[8px_8px_0px_0px_#000] dark:shadow-[8px_8px_0px_0px_#facc15] rounded-3xl p-6 sm:p-8"
                      : isOldTimey
                        ? `${themeCfg.paperBg} ${themeCfg.paperText} border-4 border-double ${themeCfg.paperBorder} shadow-[0_14px_38px_rgba(0,0,0,0.45)] p-5 sm:p-10 rounded-none`
                        : isFieldnote
                          ? `${themeCfg.paperBg} ${themeCfg.paperText} border-2 ${themeCfg.paperBorder} shadow-xl p-6 sm:p-9 rounded-xl`
                          : isArcade
                            ? "bg-black border-4 border-[#00ff66] shadow-[0_0_30px_rgba(0,255,102,0.35)] text-[#00ff66] p-6 sm:p-8 rounded-none font-['VT323']"
                            : isTactical
                              ? "bg-[#030a12] border-2 border-cyan-500/80 shadow-[0_0_25px_rgba(6,182,212,0.2)] text-cyan-300 p-6 sm:p-8 rounded-xl font-mono"
                              : "bg-gradient-to-br from-zinc-950 via-zinc-900 to-purple-950/40 border border-purple-500/40 shadow-2xl rounded-3xl p-6 sm:p-10 text-zinc-100"
                  }`}
                >
                  {/* Subtle Cotton Newsprint Grain Texture for Old-Timey Editions */}
                  {isOldTimey && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.055] mix-blend-multiply"
                      style={{
                        backgroundImage:
                          "radial-gradient(#1a1108 0.75px, transparent 0.75px), radial-gradient(#3d2712 0.5px, transparent 0.5px)",
                        backgroundSize: "12px 12px, 7px 7px",
                        backgroundPosition: "0 0, 3px 3px",
                      }}
                    />
                  )}

                  {/* Authentic Early Printing-Press Newspaper / Almanac / Curio Masthead */}
                  {isOldTimey && (
                    <div className="relative z-10 mb-6 select-none">
                      {/* Top Fine Rule + Dateline Strip */}
                      <div className="border-t-2 border-b border-[#1f160d] py-1 flex flex-wrap items-center justify-between text-[10px] font-serif uppercase tracking-[0.22em] font-bold text-[#3b2917]">
                        <span>{themeCfg.earLeft}</span>
                        <span>{themeCfg.subhead}</span>
                        <span>{themeCfg.earRight}</span>
                      </div>

                      {/* Grand Early Printing-Press Masthead Banner with Left & Right Ear-Boxes */}
                      <div className="py-3 sm:py-4 border-b-4 border-double border-[#1f160d] grid grid-cols-12 items-center gap-2">
                        <div className="hidden sm:flex sm:col-span-2 flex-col justify-center border-2 border-[#1f160d] p-2 text-center font-serif bg-[#ebe0c9]/70">
                          <span className="text-[9px] font-black uppercase tracking-widest border-b border-[#1f160d]/40 pb-0.5 mb-0.5">
                            TELEGRAPH WIRE
                          </span>
                          <span className="text-[9px] italic leading-tight text-[#2b1e10]">
                            Direct Copper Line &amp; Rotary Press
                          </span>
                        </div>

                        <div className="col-span-12 sm:col-span-8 text-center px-2">
                          <div className="font-serif text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-[#140e08] leading-none">
                            {themeCfg.masthead}
                          </div>
                          <div className="mt-1.5 text-[10px] sm:text-xs font-serif italic tracking-widest text-[#3b2917]">
                            “All The Verified Field Telemetry Fit To Print — Set In Lead Type &amp; Halftone Plate”
                          </div>
                        </div>

                        <div className="hidden sm:flex sm:col-span-2 flex-col justify-center border-2 border-[#1f160d] p-2 text-center font-serif bg-[#ebe0c9]/70">
                          <span className="text-[9px] font-black uppercase tracking-widest border-b border-[#1f160d]/40 pb-0.5 mb-0.5">
                            DARKROOM PLATE
                          </span>
                          <span className="text-[9px] font-bold leading-tight text-[#2b1e10]">
                            {filterActive ? themeCfg.filterLabel : "Original Color"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Edition Decorative Headers */}
                  {isFieldnote && (
                    <div className="border-b-2 border-[#2d5a40] pb-2 mb-4 flex flex-wrap items-center justify-between font-mono text-[11px] uppercase tracking-widest font-bold text-[#1f422d]">
                      <span>🌿 {themeCfg.masthead}</span>
                      <span>{themeCfg.earLeft}</span>
                      <span>{themeCfg.earRight}</span>
                    </div>
                  )}

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

                  {themeCfg.id === "magazine" && (
                    <div className="border-b border-white/10 pb-2.5 mb-4 flex items-center justify-between text-[11px] font-sans tracking-widest text-purple-300 uppercase">
                      <span>FIELDPRESS MAGAZINE • AUTONOMOUS SYSTEMS REPORT</span>
                      <span className="text-zinc-400">ISSUE NO. 24</span>
                    </div>
                  )}

                  {/* Juxtaposition of Image and Editorial Headline & Body */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-6 relative z-10">
                    {/* Juxtaposed Image with Interactive Edition Theme Filter Toggle */}
                    {d.imageUrl && (
                      <div className="md:col-span-5 lg:col-span-5 space-y-2">
                        <div
                          className={`relative aspect-[4/3] max-h-[265px] sm:max-h-[285px] overflow-hidden ${
                            isComic
                              ? "border-4 border-black dark:border-yellow-400 rounded-2xl shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#facc15] bg-yellow-400"
                              : isOldTimey
                                ? "border-2 border-[#1f160d] p-1.5 bg-[#e5d7bc] shadow-[3px_3px_0px_rgba(31,22,13,0.85)] rounded-none"
                                : isFieldnote
                                  ? "border-2 border-[#2d5a40] p-1 bg-[#e4ecdf] shadow-md rounded-lg"
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
                            onError={(e) => handleImgFallbackError(e, d)}
                            className={`w-full h-full object-cover transition duration-300 group-hover:scale-103 ${
                              filterActive ? themeCfg.imgFilterClass : "filter-none"
                            }`}
                          />

                          {/* Unique Edition Halftone / Sepia / Tin-Type / Kodachrome / FLIR / Ben-Day / CRT Overlay */}
                          {renderThemePhotoOverlay(style, filterActive)}

                          {/* Interactive Per-Edition Theme Photo Filter Toggle Button */}
                          <button
                            type="button"
                            onClick={(e) => toggleThemePhotoFilter(d.id, filterActive, e)}
                            title={`Toggle between ${themeCfg.filterLabel} (${themeCfg.filterDesc}) and Original Color`}
                            className={`absolute top-2 left-2 z-30 px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition cursor-pointer ${
                              filterActive
                                ? isOldTimey
                                  ? "bg-[#18120c] text-[#f5ecd9] border border-[#c8b396] hover:bg-[#2c2014]"
                                  : "bg-amber-500 text-zinc-950 border border-amber-300 hover:bg-amber-400"
                                : "bg-black/80 text-white border border-white/30 hover:bg-black"
                            }`}
                          >
                            <span>{filterActive ? themeCfg.filterBadge : "📸 Original Color"}</span>
                            <span className="text-[8px] opacity-80 px-1 py-0.2 rounded bg-black/25">
                              {filterActive ? "ON" : "RAW"}
                            </span>
                          </button>

                          {(d.embedType === "youtube" || extractYoutubeVideoId(d.sourceUrl)) && (
                            <div className="absolute bottom-9 left-2 z-20 px-2 py-0.5 rounded bg-red-600/95 text-white text-[10px] font-black tracking-wider flex items-center gap-1 shadow-lg border border-red-400/50">
                              <span>▶</span>
                              <span>REAL FOOTAGE</span>
                            </div>
                          )}
                          {getGalleryForDispatch(d).length > 1 && (
                            <div className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded bg-black/85 text-amber-400 text-[10px] font-black tracking-wider flex items-center gap-1 shadow-lg border border-amber-500/50">
                              <span>📸</span>
                              <span>{getGalleryForDispatch(d).length} PHOTOS</span>
                            </div>
                          )}

                          {d.imageCaption && (
                            <div
                              className={`absolute bottom-0 inset-x-0 p-2 text-xs z-20 ${
                                isComic
                                  ? "bg-yellow-400 text-black border-t-2 border-black font-black uppercase text-[10px]"
                                  : isOldTimey
                                    ? "bg-[#efe4ce]/95 text-[#18120c] font-serif italic border-t border-[#1f160d] text-[11px]"
                                    : isFieldnote
                                      ? "bg-[#eef2eb]/95 text-[#18281e] font-mono text-[10px] border-t border-[#2d5a40]"
                                      : isArcade
                                        ? "bg-black/90 text-[#00ff66] font-['VT323'] text-sm border-t border-[#00ff66]"
                                        : isTactical
                                          ? "bg-zinc-950/85 text-cyan-300 font-mono text-[10px] border-t border-cyan-500/40"
                                          : "bg-black/60 backdrop-blur-xs text-zinc-200 font-sans text-[10px]"
                              }`}
                            >
                              <span>{isOldTimey ? `FIG. 1 — ${d.imageCaption}` : d.imageCaption}</span>
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
                              : isOldTimey
                                ? "bg-[#18120c] text-[#f3ead8] border border-[#18120c] font-serif rounded-none tracking-widest"
                                : isFieldnote
                                  ? "bg-[#2d5a40] text-[#eef2eb] font-mono"
                                  : isArcade
                                    ? "bg-black text-[#00ff66] border border-[#00ff66] font-['VT323'] text-sm tracking-wider"
                                    : isTactical
                                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono"
                                      : "bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full font-sans"
                          }`}
                        >
                          {d.category}
                        </span>
                        <span className={isOldTimey ? "text-[#5c4328]" : "text-zinc-400"}>•</span>
                        <span className={`font-bold flex items-center gap-1 ${isOldTimey ? "text-[#2b1d0e] font-serif uppercase tracking-wider" : isFieldnote ? "text-[#1f422d]" : "text-zinc-400"}`}>
                          <MapPin className={`h-3 w-3 ${isOldTimey ? "text-[#7a2016]" : "text-amber-500"}`} /> {d.location}
                        </span>
                        <span className={isOldTimey ? "text-[#5c4328]" : "text-zinc-400"}>•</span>
                        <span className={isOldTimey ? "text-[#44301b] font-serif italic" : "text-zinc-400"}>{d.timestamp}</span>
                        {wasDispatchEdited(d) && (
                          <>
                            <span className={isOldTimey ? "text-[#5c4328]" : "text-zinc-400"}>•</span>
                            <span className="italic text-zinc-500" title="This dispatch was edited after it was first published">(edited)</span>
                          </>
                        )}
                        <span className={isOldTimey ? "text-[#5c4328]" : "text-zinc-400"}>•</span>
                        <span className={`font-mono text-[10px] tracking-wide ${isOldTimey ? "text-[#5c4328]" : "text-zinc-500"}`}>{d.id}</span>
                      </div>

                      {/* Headline with Heavy Authentic Edition Character */}
                      <h2
                        onClick={() => setSelectedStory(d)}
                        className={`cursor-pointer transition ${
                          isComic
                            ? "font-['Bangers'] text-4xl sm:text-6xl font-black uppercase tracking-wider text-black dark:text-yellow-400 drop-shadow-[2px_2px_0px_rgba(255,255,255,1)] dark:drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] leading-none my-2 hover:text-rose-600"
                            : isOldTimey
                              ? "font-serif text-3xl sm:text-5xl font-black tracking-tight uppercase leading-[1.02] text-[#140e08] my-2 border-b-2 border-[#1f160d] pb-2.5 hover:text-[#6e1c14]"
                              : isFieldnote
                                ? "font-serif text-3xl sm:text-4xl font-black tracking-tight text-[#14241b] my-2 hover:text-[#2d5a40]"
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

                      {/* Sub-deck Deckhead for Old-Timey Newspapers */}
                      {isOldTimey && (
                        <div className="font-serif text-xs sm:text-sm font-bold italic text-[#2c2014] border-b border-[#1f160d]/40 pb-2">
                          SPECIAL DISPATCH TO {themeCfg.masthead} — Verified Telemetry &amp; Eye-Witness Account Filed From {d.location}.
                        </div>
                      )}

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
                      ) : isOldTimey ? (
                        /* Early 1900s Printing-Press Multi-Column Newsprint with Dateline & Engraved Drop Cap */
                        <div className="font-serif text-xs sm:text-[13.5px] leading-[1.65] text-[#18120c] text-justify sm:columns-2 gap-7 sm:[column-rule:1px_solid_rgba(31,22,13,0.35)] my-3">
                          <span className="float-left text-5xl font-serif font-black mr-3 leading-none text-[#18120c] border-2 border-[#18120c] px-2 py-1 bg-[#e5d7bc] shadow-[2px_2px_0px_#18120c]">
                            {d.content[0]}
                          </span>
                          <span className="font-black uppercase tracking-widest text-[11px] text-[#2b1d0e]">
                            {d.location.toUpperCase()} ({themeCfg.datelinePrefix}) —{" "}
                          </span>
                          <span>{d.content.slice(1)}</span>
                        </div>
                      ) : isFieldnote ? (
                        <div className="font-serif text-xs sm:text-sm leading-relaxed text-[#18281e] border-l-4 border-[#2d5a40] pl-4 py-1 my-2 bg-[#e1eadc]/70">
                          <span className="font-mono font-bold text-[11px] uppercase text-[#1f422d] block mb-1">
                            {themeCfg.datelinePrefix} • {d.location}
                          </span>
                          <p>{d.content}</p>
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
                      <div className={`pt-2 flex items-center justify-between text-xs font-mono ${isOldTimey ? "text-[#3b2917] border-t border-[#1f160d]/30" : isFieldnote ? "text-[#1f422d]" : "text-zinc-400"}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">Byline:</span>
                          <span>{d.author} (@{d.callsign})</span>
                          <span>•</span>
                          <span>{d.bureau}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono relative z-10 ${
                    isOldTimey ? "border-[#1f160d]" : "border-zinc-700/40"
                  }`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] ${isOldTimey ? "text-[#3b2917] font-bold" : "text-zinc-400"}`}>Edition Model:</span>
                      <span className={`font-bold uppercase px-2 py-0.5 rounded ${
                        isOldTimey ? "bg-[#18120c] text-[#f3ead8]" : "text-amber-500 bg-amber-500/10"
                      }`}>
                        {themeCfg.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleThemePhotoFilter(d.id, filterActive, e)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                          filterActive
                            ? isOldTimey
                              ? "bg-[#2c2014] text-[#f3ead8] border-[#18120c]"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/50"
                            : isOldTimey
                              ? "bg-white/70 text-[#18120c] border-[#18120c]"
                              : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}
                        title={`Switch photo rendering between ${themeCfg.filterLabel} and Original Color`}
                      >
                        <span>{filterActive ? themeCfg.filterBadge : "📸 Original Color"}</span>
                        <span className="text-[9px] opacity-75">({filterActive ? "Filter ON" : "Filter OFF"})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(d.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                          isOldTimey ? "border-[#1f160d] bg-[#e5d7bc] text-[#18120c] hover:bg-[#d8c6a4]" : "border-zinc-700 hover:bg-zinc-800"
                        }`}
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
                      {authAccount && d.accountId === authAccount.id && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePublishedDispatch(d.id);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 transition font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Delete this dispatch"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
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
                        className={`px-3 py-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                          isOldTimey ? "border-[#1f160d] bg-[#e5d7bc] text-[#18120c] hover:bg-[#d8c6a4]" : "border-zinc-700 hover:bg-zinc-800"
                        }`}
                      >
                        <Share2 className="h-3.5 w-3.5 text-amber-500" />
                        <span>Share</span>
                      </button>

                      <button
                        onClick={() => setSelectedStory(d)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer shadow-xs ${
                          isOldTimey
                            ? "bg-[#18120c] text-[#f3ead8] hover:bg-[#2c2014]"
                            : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Read Full Page</span>
                      </button>
                    </div>
                  </div>

                  {/* Field Commentary Under Feed */}
                  <div className={`mt-5 pt-4 border-t space-y-3 relative z-10 ${isOldTimey ? "border-[#1f160d]" : "border-zinc-700/40"}`} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${isOldTimey ? "text-[#18120c]" : "text-amber-500"}`}>
                        <MessageSquare className="h-3.5 w-3.5" /> Field Notes &amp; Commentary ({getCommentsForDispatch(d.id).length})
                      </span>
                      <span className={`text-[11px] ${isOldTimey ? "text-[#44301b]" : "text-zinc-400"}`}>Live dispatches under feed</span>
                    </div>

                    {getCommentsForDispatch(d.id).length > 0 ? (
                      <div className="space-y-2">
                        {getCommentsForDispatch(d.id).map((c) => (
                          <div key={c.id} className={`p-2.5 rounded-lg border space-y-1 ${isOldTimey ? "bg-[#e7dac1] border-[#1f160d]/40 text-[#18120c]" : subCardThemeClass}`}>
                            <div className="flex items-center justify-between text-[11px]">
                              <div
                                className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition"
                                onClick={() => openCorrespondentFromComment(c.author, c.callsign)}
                              >
                                <span className="font-bold">{c.author}</span>
                                <span className="text-amber-600 font-semibold">@{c.callsign}</span>
                              </div>
                              <span className="opacity-75">{c.timestamp}</span>
                            </div>
                            <p className="text-xs leading-relaxed">
                              {c.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs italic opacity-75">No commentary filed yet. Dispatch a note below.</p>
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
                        className={`flex-1 rounded-lg px-3 py-1.5 text-xs focus:outline-none transition ${
                          isOldTimey ? "bg-[#faf5ea] border border-[#1f160d] text-[#18120c]" : inputThemeClass
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!(feedCommentInputs[d.id] || "").trim()}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-40 shadow-xs whitespace-nowrap ${
                          isOldTimey ? "bg-[#18120c] text-[#f3ead8] hover:bg-[#2c2014]" : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                        }`}
                      >
                        <Send className="h-3 w-3" />
                        <span>Dispatch Note</span>
                      </button>
                    </form>
                  </div>
                </article>
              );
            })()}

            {/* Grid of Secondary Dispatches with All 8 Edition Themes & Theme Photo Filter Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dispatches.slice(1).map((disp, idx) => {
                const fallbackStyles: Array<PressyoEdition> = ["newspaper", "almanac", "curio", "fieldnote", "tactical", "comic", "arcade", "magazine"];
                const sStyle = (disp.editionStyle || fallbackStyles[idx % fallbackStyles.length]) as PressyoEdition;
                const sTheme = getEditionThemeConfig(sStyle);
                const sFilterActive = isThemePhotoFilterActive(disp);
                const isSecComic = sTheme.id === "comic";
                const isSecOldTimey = sTheme.isOldTimey;
                const isSecFieldnote = sTheme.id === "fieldnote";
                const isSecArcade = sTheme.id === "arcade";
                const isSecTactical = sTheme.id === "tactical";

                return (
                  <article
                    key={disp.id}
                    onClick={() => setSelectedStory(disp)}
                    className={`p-5 border flex flex-col justify-between transition cursor-pointer relative overflow-hidden ${
                      isSecComic
                        ? "rounded-2xl bg-[#fffdf0] dark:bg-[#18181b] border-3 border-black dark:border-yellow-400 shadow-[5px_5px_0px_0px_#000] dark:shadow-[5px_5px_0px_0px_#facc15]"
                        : isSecOldTimey
                          ? `rounded-none ${sTheme.paperBg} ${sTheme.paperText} border-2 border-double ${sTheme.paperBorder} shadow-[4px_4px_0px_rgba(24,18,12,0.85)]`
                          : isSecFieldnote
                            ? `rounded-xl ${sTheme.paperBg} ${sTheme.paperText} border-2 ${sTheme.paperBorder} shadow-md`
                            : isSecArcade
                              ? "rounded-none bg-black border-2 border-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.25)] text-[#00ff66] font-['VT323']"
                              : isSecTactical
                                ? "rounded-2xl bg-[#030a12] border border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-cyan-300 font-mono"
                                : "rounded-2xl bg-gradient-to-br from-zinc-950 to-purple-950/30 border border-purple-500/30 shadow-md text-zinc-100"
                    }`}
                  >
                    <div>
                      {/* Mini Printing-Press Masthead Strip for Old-Timey Secondary Cards */}
                      {isSecOldTimey && (
                        <div className="mb-2.5 pb-1.5 border-b-2 border-double border-[#1f160d] text-center font-serif">
                          <div className="text-[11px] font-black uppercase tracking-widest text-[#140e08]">
                            {sTheme.masthead}
                          </div>
                          <div className="text-[8px] uppercase tracking-[0.18em] text-[#3b2917] flex items-center justify-between border-t border-[#1f160d]/30 pt-0.5 mt-0.5">
                            <span>{sTheme.datelinePrefix}</span>
                            <span>{sTheme.earRight}</span>
                          </div>
                        </div>
                      )}

                      {/* Secondary Thumbnail with Interactive Theme Filter Toggle */}
                      {disp.imageUrl && (
                        <div
                          onClick={() => setSelectedStory(disp)}
                          className={`mb-3 overflow-hidden aspect-[16/10] max-h-[155px] bg-black cursor-pointer group relative ${
                            isSecComic
                              ? "rounded-lg border-2 border-black dark:border-yellow-400 shadow-[3px_3px_0px_0px_#000]"
                              : isSecOldTimey
                                ? "rounded-none border-2 border-[#1f160d] p-1 bg-[#e5d7bc]"
                                : isSecFieldnote
                                  ? "rounded-lg border border-[#2d5a40]"
                                  : isSecArcade
                                    ? "rounded-none border border-[#00ff66]"
                                    : isSecTactical
                                      ? "rounded-lg border border-cyan-500/50"
                                      : "rounded-lg border border-purple-500/30"
                          }`}
                        >
                          <img
                            src={disp.imageUrl}
                            alt={disp.title}
                            onError={(e) => handleImgFallbackError(e, disp)}
                            className={`w-full h-full object-cover transition group-hover:scale-105 ${
                              sFilterActive ? sTheme.imgFilterClass : "filter-none"
                            }`}
                          />
                          {renderThemePhotoOverlay(sStyle, sFilterActive)}

                          {/* Interactive Theme Photo Filter Toggle Badge */}
                          <button
                            type="button"
                            onClick={(e) => toggleThemePhotoFilter(disp.id, sFilterActive, e)}
                            title={`Switch between ${sTheme.filterLabel} and Original Color`}
                            className={`absolute top-1.5 left-1.5 z-30 px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wide flex items-center gap-1 shadow transition cursor-pointer ${
                              sFilterActive
                                ? isSecOldTimey
                                  ? "bg-[#18120c] text-[#f3ead8] border border-[#c8b396]"
                                  : "bg-amber-500 text-zinc-950 border border-amber-300"
                                : "bg-black/80 text-white border border-white/30"
                            }`}
                          >
                            <span>{sFilterActive ? sTheme.filterBadge : "📸 Color"}</span>
                          </button>

                          {getGalleryForDispatch(disp).length > 1 && (
                            <div className="absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 rounded bg-black/85 text-amber-400 border border-amber-500/40 text-[9px] font-black tracking-wider flex items-center gap-1 shadow">
                              <span>📸</span>
                              <span>{getGalleryForDispatch(disp).length}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {getGalleryForDispatch(disp).length > 1 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto mb-2.5 pb-0.5">
                          {getGalleryForDispatch(disp).slice(0, 4).map((frame, fIdx) => (
                            <img
                              key={frame.id || fIdx}
                              src={frame.url}
                              alt={frame.caption || `Frame ${fIdx + 1}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveReaderImageIdx(fIdx);
                                setSelectedStory(disp);
                              }}
                              className={`h-9 w-14 rounded object-cover border border-zinc-700 hover:border-amber-400 transition flex-shrink-0 ${
                                sFilterActive ? sTheme.imgFilterClass : ""
                              }`}
                              title={`View Frame #${fIdx + 1}: ${frame.caption || ""}`}
                            />
                          ))}
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
                        <span className={`font-bold uppercase ${isSecOldTimey ? "text-[#18120c] font-serif" : isSecFieldnote ? "text-[#1f422d]" : "text-amber-500"}`}>
                          {disp.category}
                        </span>
                        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                          isSecOldTimey
                            ? "bg-[#18120c] text-[#f3ead8] border-[#18120c] font-serif rounded-none"
                            : "opacity-80 border-zinc-700/50"
                        }`}>
                          {sTheme.name}
                        </span>
                      </div>

                      <h3
                        onClick={() => setSelectedStory(disp)}
                        className={`text-base sm:text-lg font-bold leading-snug mb-2 hover:opacity-80 transition line-clamp-2 cursor-pointer ${
                          isSecComic
                            ? "font-['Bangers'] text-xl tracking-wide uppercase text-black dark:text-yellow-400"
                            : isSecOldTimey
                              ? "font-serif text-lg font-black uppercase tracking-tight text-[#140e08] border-b border-[#1f160d]/40 pb-1"
                              : isSecFieldnote
                                ? "font-serif text-lg font-bold text-[#14241b]"
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

                      <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${
                        isSecOldTimey ? "font-serif text-[#261b10] text-justify" : "opacity-90"
                      }`}>
                        {isSecOldTimey ? `${disp.location.toUpperCase()} — ${disp.content}` : disp.content}
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
                          {authAccount && disp.accountId === authAccount.id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePublishedDispatch(disp.id);
                              }}
                              className="hover:text-rose-400 p-1 rounded transition cursor-pointer"
                              title="Delete this dispatch"
                            >
                              <Trash2 className="h-3 w-3" />
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
                filteredDispatches.map((d) => {
                  const cardGallery = getGalleryForDispatch(d);
                  return (
                  <div
                    key={d.id}
                    onClick={() => {
                      setActiveReaderImageIdx(0);
                      setSelectedStory(d);
                    }}
                    className={`p-4 rounded-lg border transition hover:border-amber-500/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer group ${cardThemeClass}`}
                  >
                    {(d.imageUrl || cardGallery.length > 0) && (
                      <div className="w-full sm:w-44 flex-shrink-0 space-y-1.5">
                        <div className="relative w-full aspect-video sm:h-24 rounded-md overflow-hidden bg-black/50 border border-zinc-800">
                          <img
                            src={d.imageUrl || cardGallery[0]?.url}
                            alt={d.title}
                            onError={(e) => handleImgFallbackError(e, d)}
                            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          {(d.embedType === "youtube" || extractYoutubeVideoId(d.sourceUrl)) && (
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-red-600/95 text-white text-[8px] font-black tracking-wider flex items-center gap-0.5 shadow">
                              <span>▶</span>
                              <span>FOOTAGE</span>
                            </div>
                          )}
                          {cardGallery.length > 1 && (
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-amber-400 border border-amber-500/40 text-[8px] font-black tracking-wider flex items-center gap-0.5 shadow">
                              <span>📸</span>
                              <span>{cardGallery.length} PHOTOS</span>
                            </div>
                          )}
                        </div>
                        {cardGallery.length > 1 && (
                          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                            {cardGallery.slice(0, 4).map((frame, fIdx) => (
                              <img
                                key={frame.id || fIdx}
                                src={frame.url}
                                alt={frame.caption || `Frame ${fIdx + 1}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReaderImageIdx(fIdx);
                                  setSelectedStory(d);
                                }}
                                className="h-8 w-11 rounded object-cover border border-zinc-700 hover:border-amber-400 transition flex-shrink-0"
                                title={`Click to open Frame ${fIdx + 1}: ${frame.caption || ""}`}
                              />
                            ))}
                          </div>
                        )}
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
                          d.editionStyle === "fieldnote" ? "bg-teal-500/20 text-teal-400 border border-teal-500/40" :
                          d.editionStyle === "almanac" ? "bg-lime-500/20 text-lime-400 border border-lime-500/40 font-serif" :
                          d.editionStyle === "curio" ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40" :
                          d.editionStyle === "wire" ? "bg-sky-500/20 text-sky-400 border border-sky-500/40" :
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
                        <div className="font-bold flex items-center sm:justify-end gap-1 flex-wrap">
                          {(d.isAnonymous || d.callsign === "anon-signal") && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black uppercase">
                              🕵️ ANON SOURCE
                            </span>
                          )}
                          {(d.decoupleLocationPin || (d.bureau && d.bureau.includes("Pin Decoupled"))) && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-black uppercase" title="Location pin is decoupled from the author's public identity">
                              🔀 PIN DECOUPLED
                            </span>
                          )}
                          <span>{d.author}</span>
                        </div>
                        <div className={`${(d.isAnonymous || d.callsign === "anon-signal") ? "text-emerald-400" : "text-amber-500"} font-semibold`}>
                          @{d.callsign}
                        </div>
                        <div className={`text-[10px] ${subTextThemeClass}`}>{d.bureau}</div>
                        {Array.isArray(d.coordinates) && d.coordinates.length === 2 && (
                          <div className="text-[9px] text-emerald-400/90 mt-0.5">
                            📍 ~5 km Vicinity ({d.coordinates[1].toFixed(2)}°N, {Math.abs(d.coordinates[0]).toFixed(2)}°W)
                          </div>
                        )}
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
                        {authAccount && d.accountId === authAccount.id && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePublishedDispatch(d.id);
                            }}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition"
                            title="Delete this dispatch"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
                  );
                })
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

        {/* TAB 3: GEOSPATIAL BEAT RADAR & VICINITY SIGNAL LEDGER */}
        {activeTab === "map" && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${cardThemeClass}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold">Global & Regional Vicinity Signal Radar (~5 km Fuzzy Sector Pinning)</span>
                  </div>
                  <p className={`text-[11px] ${subTextThemeClass}`}>
                    Exact street/building GPS coordinates are automatically quantized to ~5 km regional rings. Senders can decouple their location pin from their identity or strip all metadata.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Region Presets */}
                  <div className="flex items-center rounded border border-zinc-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMapRegionPreset("NATIONAL")}
                      className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition ${
                        mapRegionPreset === "NATIONAL" ? "bg-amber-500 text-zinc-950" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      🌎 National Radar
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapRegionPreset("MIDWEST")}
                      className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition ${
                        mapRegionPreset === "MIDWEST" ? "bg-amber-500 text-zinc-950" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      🌽 Midwest Corridor
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapRegionPreset("GLOBAL")}
                      className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition ${
                        mapRegionPreset === "GLOBAL" ? "bg-amber-500 text-zinc-950" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      🌐 Global View
                    </button>
                  </div>

                  {/* Signal Identity Filters */}
                  <div className="flex items-center rounded border border-zinc-700 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMapSignalFilter("ALL")}
                      className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition ${
                        mapSignalFilter === "ALL" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      All Signals
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapSignalFilter("ANON_DECOUPLED")}
                      className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition ${
                        mapSignalFilter === "ANON_DECOUPLED" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-900 text-emerald-400 hover:bg-zinc-800"
                      }`}
                    >
                      🕵️ Anon & Decoupled
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapSignalFilter("NAMED")}
                      className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition ${
                        mapSignalFilter === "NAMED" ? "bg-amber-500 text-zinc-950" : "bg-zinc-900 text-amber-400 hover:bg-zinc-800"
                      }`}
                    >
                      📡 Named Bylines
                    </button>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mb-3 px-2.5 py-1.5 rounded bg-zinc-950/60 border border-zinc-800/80 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <span className="text-emerald-300 font-bold">Emerald Halo:</span>
                  <span className="text-zinc-400">Anonymous / Identity-Decoupled Vicinity Signal (Someone near the event shared without linking personal location)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-amber-300 font-bold">Amber Halo:</span>
                  <span className="text-zinc-400">Named Correspondent Vicinity Sector (~5 km Fuzzy Ring)</span>
                </div>
              </div>

              <div
                ref={mapContainerRef}
                className={`w-full h-[540px] rounded-lg border overflow-hidden relative shadow-inner ${
                  isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-300 bg-zinc-100"
                }`}
              />
            </div>

            {/* Live Vicinity Signal Interaction Ledger */}
            <div className={`p-4 rounded-lg border font-mono ${cardThemeClass}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>📡 Live Vicinity Signal Interaction Ledger</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                      {dispatches.filter((d) => Array.isArray(d.coordinates) && d.coordinates.length === 2).length} Regional Sectors Active
                    </span>
                  </h3>
                  <p className={`text-[11px] mt-0.5 ${subTextThemeClass}`}>
                    Track regional interactions safely: see where witnesses and correspondents are dispatching from without exposing exact street addresses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openCreatePressie()}
                  className="px-3 py-1.5 rounded bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 transition cursor-pointer"
                >
                  + Pin Vicinity Dispatch
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dispatches
                  .filter((d) => Array.isArray(d.coordinates) && d.coordinates.length === 2)
                  .filter((d) => {
                    const isAnonOrDecoupled =
                      Boolean(d.isAnonymous) ||
                      Boolean(d.decoupleLocationPin) ||
                      d.callsign === "anon-signal" ||
                      d.author === "Anonymous Field Source" ||
                      (d.bureau && d.bureau.includes("Pin Decoupled"));
                    if (mapSignalFilter === "ANON_DECOUPLED") return isAnonOrDecoupled;
                    if (mapSignalFilter === "NAMED") return !isAnonOrDecoupled;
                    return true;
                  })
                  .slice(0, 12)
                  .map((sig) => {
                    const isAnon = Boolean(sig.isAnonymous) || sig.callsign === "anon-signal" || sig.author === "Anonymous Field Source";
                    const isDecoupled = Boolean(sig.decoupleLocationPin) || (sig.bureau && sig.bureau.includes("Pin Decoupled")) || isAnon;
                    const coords = sig.coordinates || [39.46, -87.41];
                    return (
                      <div
                        key={sig.id}
                        onClick={() => setSelectedStory(sig)}
                        className={`p-3 rounded-lg border cursor-pointer transition hover:border-emerald-500/50 ${
                          isDecoupled
                            ? isDark
                              ? "bg-emerald-950/15 border-emerald-500/30"
                              : "bg-emerald-50/70 border-emerald-300"
                            : subCardThemeClass
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] mb-1.5">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${
                            isDecoupled
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}>
                            {isAnon ? "🕵️ ANON VICINITY SIGNAL" : isDecoupled ? "🔀 PIN DECOUPLED" : "📡 NAMED VICINITY PIN"}
                          </span>
                          <span className="text-zinc-400">
                            ~{Number(coords[1]).toFixed(2)}°N, {Math.abs(Number(coords[0])).toFixed(2)}°W
                          </span>
                        </div>
                        <div className="text-xs font-bold line-clamp-1 mb-1">{sig.title}</div>
                        <div className="text-[11px] text-amber-500 font-semibold mb-1">📍 {sig.location}</div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                          <span>
                            {isAnon ? "Source: @anon-signal (Stripped)" : `By @${sig.callsign} (Pin Decoupled)`}
                          </span>
                          <span className="text-emerald-400 font-bold">Inspect →</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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

              {/* 1. Headline / Dispatch Title + Drop-URL-to-Share Studio */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className={`font-bold flex items-center gap-1.5 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    <span>Headline / Dispatch Title <span className="text-amber-500">*</span></span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      🔗 Drop URL in title to share content
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handlePastePreparedContent}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                    title="Paste a URL or prepared multi-line article from your clipboard to auto-fill Headline, Source Link & Body"
                  >
                    <span>📋</span>
                    <span>Paste Prepared Content / URL</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Drop URL in title to share content (or type your headline here)..."
                    value={newTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTitle(val);
                      if (formValidationError) setFormValidationError(null);
                      const urlMatch = val.match(/^(.*?)(https?:\/\/[^\s]+)\s*$/i);
                      if (urlMatch && urlMatch[2].length > 10) {
                        const prefix = (urlMatch[1] || "").trim();
                        handleUnfurlUrlFromTitle(urlMatch[2], prefix);
                      }
                    }}
                    className={`w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none transition placeholder:text-zinc-500/75 placeholder:italic ${inputThemeClass}`}
                  />
                  {isUnfurlingTitleUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-zinc-900/90 px-2 py-0.5 rounded">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Importing URL…</span>
                    </div>
                  )}
                </div>

                <p className={`text-[10px] leading-snug ${subTextThemeClass}`}>
                  💡 <strong>Sharing a source or prepared article?</strong> Paste any link (news site, YouTube, Substack, Reddit, X) right into the title bar above—we'll automatically pull its headline, summary &amp; lead image, while letting you add your own commentary in the body and extra photos in the Media Tray below.
                </p>

                {unfurlTitleStatus && (
                  <div className="px-2.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center justify-between gap-2">
                    <span>{unfurlTitleStatus}</span>
                    <button
                      type="button"
                      onClick={() => setUnfurlTitleStatus("")}
                      className="text-zinc-400 hover:text-white text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* 🛡️ PRIVACY, METADATA SCRUBBER & VICINITY PINNING STUDIO */}
              <div className={`p-3.5 rounded-xl border space-y-3 font-mono text-xs ${
                newIsAnonymous || newDecoupleLocationPin
                  ? "bg-emerald-950/25 border-emerald-500/50"
                  : subCardThemeClass
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{newIsAnonymous ? "🕵️" : "🛡️"}</span>
                    <div>
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <span>Identity, EXIF Scrubber & Vicinity Pin Shield</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black">
                          ~5 KM FUZZY VICINITY ACTIVE
                        </span>
                      </div>
                      <p className={`text-[10px] ${subTextThemeClass}`}>
                        Pins show the general vicinity where dispatches are sent from (never exact GPS). Strip your identity/metadata or decouple your map pin below.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handlePinMyVicinity}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                    title="Detect current area and automatically quantize to a safe ~5km fuzzy vicinity ring (never exact GPS)"
                  >
                    <span>🛰️</span>
                    <span>Pin My Current Vicinity (~5km Fuzzy)</span>
                  </button>
                </div>

                {/* 3 Privacy & Location Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !newIsAnonymous;
                      setNewIsAnonymous(next);
                      if (next) setNewDecoupleLocationPin(true);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                      newIsAnonymous
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400"
                        : "bg-zinc-900/60 border-zinc-700/80 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>🕵️ Anonymous Mode</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40">
                        {newIsAnonymous ? "ON (STRIPPED)" : "OFF"}
                      </span>
                    </div>
                    <p className="text-[9px] opacity-80 mt-1 leading-snug">
                      Strips your name, @callsign, bureau &amp; photo EXIF metadata publicly.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDecoupleLocationPin(!newDecoupleLocationPin)}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                      newDecoupleLocationPin
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400"
                        : "bg-zinc-900/60 border-zinc-700/80 text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>🔀 Decouple Map Pin</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40">
                        {newDecoupleLocationPin ? "DECOUPLED" : "LINKED"}
                      </span>
                    </div>
                    <p className="text-[9px] opacity-80 mt-1 leading-snug">
                      Pins the area on the global map without tying the location pin to your identity.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));
                      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
                        setNewCoordinates(`${fuzzVicinityClient(parts[0])}, ${fuzzVicinityClient(parts[1])}`);
                      }
                      setNewVicinityPinOnly(true);
                      setSavedSuccessToast("📍 Vicinity coordinates quantized to ~5km sector (exact GPS stripped).");
                      setTimeout(() => setSavedSuccessToast(""), 2500);
                    }}
                    className="p-2.5 rounded-lg border text-left transition cursor-pointer bg-amber-500/15 border-amber-500/50 text-amber-300"
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>📍 Fuzzy Vicinity Ring</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40">±5 KM ONLY</span>
                    </div>
                    <p className="text-[9px] opacity-80 mt-1 leading-snug">
                      Quantizes coordinates to a ~5km sector halo. Never pins exact buildings.
                    </p>
                  </button>
                </div>

                {/* Editable Vicinity Sector Name + Fuzzy Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className={`block text-[10px] font-bold mb-1 ${subTextThemeClass}`}>
                      📍 Approximate Area / Vicinity Label
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Lewis County, TN (Vicinity)"
                      className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold mb-1 ${subTextThemeClass}`}>
                      🧭 Fuzzy Sector Coordinates (Lon, Lat • Rounded ±5km)
                    </label>
                    <input
                      type="text"
                      value={newCoordinates}
                      onChange={(e) => setNewCoordinates(e.target.value)}
                      placeholder="-87.63, 40.12"
                      className={`w-full rounded px-2.5 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                  </div>
                </div>

                {/* Live Public Attribution vs. Map Pin Preview */}
                <div className="p-2 rounded bg-black/30 border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <div>
                    <span className="text-zinc-400">Public Story Byline: </span>
                    {newIsAnonymous ? (
                      <span className="text-emerald-400 font-bold">🕵️ Anonymous Field Source (@anon-signal) • Metadata Stripped</span>
                    ) : (
                      <span className="text-amber-400 font-bold">{pressPass.name} (@{pressPass.callsign})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-zinc-400">Global Radar Pin: </span>
                    {newIsAnonymous || newDecoupleLocationPin ? (
                      <span className="text-cyan-400 font-bold">🔀 Unattributed Vicinity Signal in [{newLocation || "Regional Sector"}]</span>
                    ) : (
                      <span className="text-amber-300 font-bold">📡 Linked Vicinity Ring in [{newLocation || "Regional Sector"}]</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Edition Style Model Selector */}
              <div className="space-y-2.5">
                <label className={`block font-bold mb-1 ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>
                  Edition Style Model (8 Pressie Archetypes + Signature Photo Filters)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono">
                  {[
                    { id: "tactical", label: "Tactical", icon: "🛰️", desc: "FLIR Night-Vision" },
                    { id: "newspaper", label: "Broadsheet", icon: "📰", desc: "1910 Halftone B&W" },
                    { id: "fieldnote", label: "Field Note", icon: "🌿", desc: "Kodachrome 64 Film" },
                    { id: "almanac", label: "Almanac", icon: "🧭", desc: "1880s Sepia Plate" },
                    { id: "curio", label: "Curio Zine", icon: "🎪", desc: "Tin-Type Lithograph" },
                    { id: "comic", label: "Comic Strip", icon: "💥", desc: "Pulp Ben-Day Ink" },
                    { id: "arcade", label: "8-Bit Arcade", icon: "🕹️", desc: "Green CRT Matrix" },
                    { id: "magazine", label: "Modern Sleek", icon: "✨", desc: "Cinema Bleach-Bypass" },
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

                {/* Per-Edition Theme Photo Filter Toggle Bar */}
                {(() => {
                  const activeBuilderTheme = getEditionThemeConfig(newEditionStyle);
                  return (
                    <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 font-mono text-xs transition ${
                      builderUseThemePhotoFilter
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                        : "bg-zinc-900/60 border-zinc-700/80 text-zinc-300"
                    }`}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-amber-400">{activeBuilderTheme.filterBadge}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 uppercase">
                            {builderUseThemePhotoFilter ? "Theme Filter Enabled" : "Original Color"}
                          </span>
                        </div>
                        <p className={`text-[10px] ${subTextThemeClass}`}>
                          {activeBuilderTheme.filterDesc}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBuilderUseThemePhotoFilter(true)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                            builderUseThemePhotoFilter
                              ? "bg-amber-500 text-zinc-950 border-amber-400 shadow"
                              : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                          }`}
                        >
                          {activeBuilderTheme.filterBadge} ON
                        </button>
                        <button
                          type="button"
                          onClick={() => setBuilderUseThemePhotoFilter(false)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] border transition cursor-pointer ${
                            !builderUseThemePhotoFilter
                              ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow"
                              : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                          }`}
                        >
                          📸 Original Color
                        </button>
                      </div>
                    </div>
                  );
                })()}
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

                <div className="flex flex-wrap sm:flex-nowrap gap-2">
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
                    className={`flex-1 min-w-[180px] rounded px-3 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                  />
                  <button
                    type="button"
                    onClick={() => handlePressyoEditorAction("visual_prompt")}
                    disabled={isPressyoEditorBusy}
                    title="Have Pressy'o craft a tailored Pollinations visual prompt from your headline & draft"
                    className="px-2.5 py-1.5 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50 flex-shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Pressy'o Prompt</span>
                  </button>
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

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
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
                    </button>
                    <input
                      type="file"
                      ref={imageFileInputRef}
                      onChange={handleUploadImageFile}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs flex items-center gap-1 border border-amber-500/30 transition cursor-pointer"
                      title="Upload one or multiple photos from device (EXIF & GPS automatically stripped)"
                    >
                      <Upload className="h-3 w-3" />
                      <span>Upload Photo(s)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                        showUrlInput ? "bg-amber-500/20 text-amber-300 border-amber-500/60" : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border-zinc-700"
                      }`}
                      title="Paste a direct image URL from Wikimedia, NASA, NPS, Unsplash, or news archives"
                    >
                      🔗 Paste Real Photo URL
                    </button>
                  </div>
                </div>

                {showUrlInput && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="Paste real web photo URL (Wikimedia, NASA, Unsplash, https://...)..."
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      className={`flex-1 rounded px-2.5 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                    >
                      Attach Real Photo
                    </button>
                  </div>
                )}

                {/* Evidence Grid / Thumbnails */}
                {evidenceGallery.length > 0 ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {evidenceGallery.map((item, idx) => {
                        const isActive = item.url === newImageUrl;
                        const builderThemeCfg = getEditionThemeConfig(newEditionStyle);
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
                              className="relative aspect-video w-full cursor-pointer bg-zinc-900 overflow-hidden"
                              title="Click to set as active cover visual"
                            >
                              <img
                                src={item.url}
                                alt={item.caption || "Evidence visual"}
                                className={`w-full h-full object-cover transition ${
                                  builderUseThemePhotoFilter ? builderThemeCfg.imgFilterClass : "filter-none"
                                }`}
                              />
                              {renderThemePhotoOverlay(newEditionStyle, builderUseThemePhotoFilter)}
                              {isActive ? (
                                <div className="absolute top-1 left-1 z-20 px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 text-[9px] font-black flex items-center gap-1 shadow-md ring-1 ring-amber-400">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                  <span>Headline Image</span>
                                </div>
                              ) : (
                                <div className="absolute top-1 left-1 z-20 px-1.5 py-0.5 rounded bg-black/80 text-zinc-200 text-[8px] font-bold opacity-0 group-hover:opacity-100 transition">
                                  Select for Headline
                                </div>
                              )}
                              <div className="absolute top-1 right-1 z-20 px-1 py-0.5 rounded bg-black/70 text-zinc-400 text-[8px]">
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

              {/* Link (optional) -- resolved server-side into a YouTube/Reddit/X
                  embed or a generic link card on save. See WireEmbed. */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`font-bold block ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>
                    🎥 Real Video Footage / Source Link <span className="font-normal text-[10px] normal-case tracking-normal text-zinc-500">(YouTube, Reddit, X, or official source URL)</span>
                  </label>
                  {extractYoutubeVideoId(newSourceUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        const vid = extractYoutubeVideoId(newSourceUrl);
                        if (!vid) return;
                        const frameUrl = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
                        setNewImageUrl(frameUrl);
                        if (!newImageCaption.trim()) {
                          setNewImageCaption("[🎥 Real Video Footage Frame] Verified Broadcast Still");
                        }
                        setEvidenceGallery((prev) => [
                          {
                            id: "yt-" + Date.now(),
                            url: frameUrl,
                            source: "upload" as const,
                            caption: "[🎥 Real Video Footage Frame]",
                            timestamp: "Footage"
                          },
                          ...prev.filter((p) => p.url !== frameUrl).slice(0, 7)
                        ]);
                        setSavedSuccessToast("HD frame captured from YouTube footage as cover photo!");
                        setTimeout(() => setSavedSuccessToast(""), 3000);
                      }}
                      className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 text-[10px] font-bold transition cursor-pointer"
                    >
                      📸 Use Video Frame as Cover Photo
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Paste YouTube video URL (https://www.youtube.com/watch?v=...) or source article link..."
                  value={newSourceUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewSourceUrl(val);
                    const vid = extractYoutubeVideoId(val);
                    if (vid && !newImageUrl.trim()) {
                      const frameUrl = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
                      setNewImageUrl(frameUrl);
                      setNewImageCaption("[🎥 Real Video Footage Frame] Verified Broadcast Still");
                      setEvidenceGallery((prev) => [
                        {
                          id: "yt-auto-" + Date.now(),
                          url: frameUrl,
                          source: "upload" as const,
                          caption: "[🎥 Real Video Footage Frame]",
                          timestamp: "Footage"
                        },
                        ...prev.slice(0, 7)
                      ]);
                    }
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition ${inputThemeClass}`}
                />
                {extractYoutubeVideoId(newSourceUrl) && (
                  <div className="rounded-xl overflow-hidden border border-red-500/40 bg-black aspect-video max-h-56 w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYoutubeVideoId(newSourceUrl)}`}
                      title="Real Footage Preview"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* 4B. PRESSY'O IN-EDITOR COPILOT STUDIO (OLLAMA -> GROQ -> GEMINI)  */}
              {/* ================================================================= */}
              <div className={`p-3.5 rounded-xl border space-y-3 ${
                isDark
                  ? "bg-zinc-950/80 border-amber-500/40 shadow-inner"
                  : "bg-amber-50/50 border-amber-500/40"
              }`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src="/pressyo-icon.jpg"
                      alt="Pressy'o"
                      className="w-6 h-6 rounded-lg object-cover border border-amber-500 bg-white"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-500 text-xs">Pressy'o In-Editor Copilot</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                          {pressyoLastSource ? formatSourceLabel(pressyoLastSource, pressyoLastModel) : "Ollama → Groq → Gemini"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {pressyoEditorUndo && (
                      <button
                        type="button"
                        onClick={handleUndoPressyoEdit}
                        className="px-2 py-1 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold transition cursor-pointer"
                        title="Restore draft before last Pressy'o edit"
                      >
                        ↩ Undo Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPressyoModal(true)}
                      className={`px-2 py-1 rounded border text-[10px] font-bold transition cursor-pointer ${
                        isDark
                          ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                          : "border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      💬 Open Copilot Chat
                    </button>
                  </div>
                </div>

                {/* Row 1: 1-Click Draft & Transform Actions */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "draft_from_topic", label: "✨ Draft from Headline", tip: "Write a full dispatch + visual prompt from your headline or topic" },
                    { id: "expand", label: "📐 Expand Copy", tip: "Enrich with deeper field reporting & corridor context" },
                    { id: "shorten", label: "✂️ Tighten / Shorten", tip: "Condense into crisp, high-signal wire copy" },
                    { id: "headlines", label: "📰 Sharpen Headline", tip: "Generate a punchy headline and tighten the opening lede" },
                    { id: "uplift_angle", label: "🌟 Uplift Angle", tip: "Foreground constructive human ingenuity, solutions, and real-world impact" },
                    { id: "social_thread", label: "📣 Social + 15s Read", tip: "Append a 15-second radio read and 3-bullet social distribution thread" },
                    { id: "factcheck_polish", label: "🛡️ Polish & Check", tip: "Polish grammar, flow, and telemetry consistency" },
                    { id: "visual_prompt", label: "🎨 Craft Visual Prompt", tip: "Generate a tailored Pollinations photojournalism prompt" }
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      disabled={isPressyoEditorBusy}
                      onClick={() => handlePressyoEditorAction(act.id as any)}
                      title={act.tip}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition cursor-pointer disabled:opacity-40 ${
                        isDark
                          ? "bg-zinc-900 border-zinc-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-zinc-200"
                          : "bg-white border-zinc-200 hover:border-amber-500/50 hover:bg-amber-50 text-zinc-800"
                      }`}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>

                {/* Row 2: 1-Click Live Voice Switcher (Rewrites Active Draft on the Fly across all 8 Pressie Archetypes) */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className={`text-[10px] font-bold ${subTextThemeClass}`}>Rewrite Voice (8 Models):</span>
                  {[
                    { id: "tactical", label: "🛰️ Tactical" },
                    { id: "newspaper", label: "📰 Broadsheet" },
                    { id: "fieldnote", label: "🌿 Field Note" },
                    { id: "almanac", label: "🌾 Almanac" },
                    { id: "curio", label: "🔮 Curio" },
                    { id: "comic", label: "💥 Comic" },
                    { id: "arcade", label: "🕹️ Arcade" },
                    { id: "magazine", label: "✨ Sleek" }
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isPressyoEditorBusy}
                      onClick={() => handlePressyoEditorAction("rewrite_voice", v.id as PressyoEdition)}
                      title={`Rewrite headline & body in ${v.label} voice`}
                      className={`px-2 py-1 rounded border text-[10px] font-bold transition cursor-pointer disabled:opacity-40 ${
                        newEditionStyle === v.id
                          ? "border-amber-500/60 bg-amber-500/20 text-amber-400"
                          : isDark
                          ? "border-zinc-800 bg-zinc-900/70 hover:border-amber-500/40 text-zinc-400 hover:text-zinc-200"
                          : "border-zinc-200 bg-white hover:border-amber-400 text-zinc-600"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Row 3: Custom In-Editor Instruction */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={pressyoCustomInstruction}
                    onChange={(e) => setPressyoCustomInstruction(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && pressyoCustomInstruction.trim()) {
                        e.preventDefault();
                        handlePressyoEditorAction("custom_edit", undefined, pressyoCustomInstruction.trim());
                      }
                    }}
                    placeholder="Custom edit instruction (e.g. 'add a quote from the substation lead', 'emphasize winter grid load')..."
                    disabled={isPressyoEditorBusy}
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none ${inputThemeClass}`}
                  />
                  <button
                    type="button"
                    disabled={isPressyoEditorBusy || !pressyoCustomInstruction.trim()}
                    onClick={() => handlePressyoEditorAction("custom_edit", undefined, pressyoCustomInstruction.trim())}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-[11px] hover:bg-amber-400 transition cursor-pointer disabled:opacity-40 flex-shrink-0"
                  >
                    Apply Edit
                  </button>
                </div>

                {(isPressyoEditorBusy || pressyoEditorStatus) && (
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    {isPressyoEditorBusy ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>{pressyoEditorActionLabel || "Pressy'o editing draft…"}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">{pressyoEditorStatus}</span>
                    )}
                    {typeof pressyoRemainingQuota === "number" && (
                      <span className="text-[10px] text-zinc-500">{pressyoRemainingQuota} copilot credits left today</span>
                    )}
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
              <div className={`p-2.5 rounded border text-[11px] flex flex-wrap items-center justify-between gap-2 ${subCardThemeClass} ${subTextThemeClass}`}>
                <div>
                  <span className="font-bold text-amber-500">Byline:</span>{" "}
                  {newIsAnonymous ? (
                    <span className="text-emerald-400 font-bold">Anonymous Field Source (@anon-signal) • Metadata Stripped</span>
                  ) : (
                    <span>
                      {pressPass.name} (@{pressPass.callsign}) • {pressPass.role}
                      {newDecoupleLocationPin ? " • Pin Decoupled" : ""}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  📍 ~5 km Fuzzy Vicinity Pin ({newCoordinates || "39.46, -87.41"})
                </span>
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

              {/* Hidden file input for cover photo upload */}
              <input
                ref={coverPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoSelect}
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

                      {/* Cover Photo — minimal upload/remove, no live preview frame */}
                      <div className="mt-2 flex flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => coverPhotoInputRef.current?.click()}
                          disabled={coverPhotoUploading}
                          className="text-[9px] font-mono text-amber-500 hover:text-amber-400 uppercase tracking-tight flex items-center gap-0.5 disabled:opacity-50"
                          title="Upload a cover photo for your press pass"
                        >
                          <Upload className="h-2.5 w-2.5" />
                          {coverPhotoUploading ? "Uploading..." : editPassForm.coverPhotoUrl ? "Change cover" : "Add cover"}
                        </button>
                        {editPassForm.coverPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditPassForm({ ...editPassForm, coverPhotoUrl: undefined })}
                            className="text-[10px] font-mono text-zinc-500 hover:text-rose-400"
                          >
                            Remove cover
                          </button>
                        )}
                      </div>
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
      {selectedStory && (() => {
        const readerGallery = getGalleryForDispatch(selectedStory);
        const safeIdx = readerGallery.length > 0 ? Math.min(activeReaderImageIdx, readerGallery.length - 1) : 0;
        const activeFrame = readerGallery[safeIdx] || (selectedStory.imageUrl ? {
          id: "lead",
          url: selectedStory.imageUrl,
          caption: selectedStory.imageCaption || "",
          source: "lead",
          timestamp: "Lead Frame"
        } : null);
        const readerStyle = (selectedStory.editionStyle || "newspaper") as PressyoEdition;
        const readerThemeCfg = getEditionThemeConfig(readerStyle);
        const readerFilterActive = isThemePhotoFilterActive(selectedStory);
        const isReaderOldTimey = readerThemeCfg.isOldTimey;

        return (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedStory(null);
          }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto overscroll-contain font-mono py-4 sm:py-8 px-2 sm:px-4"
        >
          <div className={`w-full max-w-4xl mx-auto mb-12 border shadow-2xl transition relative ${
            isReaderOldTimey
              ? `rounded-none ${readerThemeCfg.paperBg} ${readerThemeCfg.paperText} border-4 border-double ${readerThemeCfg.paperBorder}`
              : isDark
                ? "rounded-2xl bg-zinc-900 border-zinc-700 text-zinc-100"
                : "rounded-2xl bg-white border-zinc-300 text-zinc-900"
          }`}>
            {/* Sticky Header Navigation with Edition Theme Photo Filter Toggle */}
            <div className={`sticky top-0 z-30 px-4 sm:px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-2 backdrop-blur-md ${
              isReaderOldTimey
                ? "rounded-none bg-[#e8dcc4]/95 border-b-2 border-[#1f160d] text-[#18120c]"
                : isDark
                  ? "rounded-t-2xl bg-zinc-900/95 border-zinc-800"
                  : "rounded-t-2xl bg-white/95 border-zinc-200"
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedStory(null)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isReaderOldTimey
                      ? "border-[#1f160d] bg-[#18120c] text-[#f3ead8] hover:bg-[#2c2014] rounded-none font-serif"
                      : "border-zinc-700 hover:bg-zinc-800"
                  }`}
                >
                  ← Back to Feed
                </button>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                  isReaderOldTimey
                    ? "bg-[#18120c] text-[#f3ead8] rounded-none font-serif"
                    : "bg-amber-500/20 text-amber-400"
                }`}>
                  {readerThemeCfg.name} • {selectedStory.category}
                </span>
                {/* Interactive Per-Edition Theme Photo Filter Toggle in Sticky Header */}
                <button
                  type="button"
                  onClick={(e) => toggleThemePhotoFilter(selectedStory.id, readerFilterActive, e)}
                  title={`Switch between ${readerThemeCfg.filterLabel} (${readerThemeCfg.filterDesc}) and Original Color`}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                    readerFilterActive
                      ? isReaderOldTimey
                        ? "bg-[#2b1d0e] text-[#f3ead8] border-[#18120c] rounded-none"
                        : "bg-amber-500 text-zinc-950 border-amber-300 shadow"
                      : isReaderOldTimey
                        ? "bg-white text-[#18120c] border-[#18120c] rounded-none"
                        : "bg-zinc-800 text-zinc-200 border-zinc-600"
                  }`}
                >
                  <span>{readerFilterActive ? readerThemeCfg.filterBadge : "📸 Original Color"}</span>
                  <span className="text-[9px] opacity-80">({readerFilterActive ? "ON" : "RAW"})</span>
                </button>
                {readerGallery.length > 1 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 text-[10px] font-bold">
                    📸 {readerGallery.length} Photos
                  </span>
                )}
                {(selectedStory.embedType === "youtube" || extractYoutubeVideoId(selectedStory.sourceUrl)) && (
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/40 text-[10px] font-bold">
                    🎥 Broadcast Video
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareStory(selectedStory)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isReaderOldTimey ? "border-[#1f160d] bg-[#dfd0b4] text-[#18120c] rounded-none" : "border-zinc-700 hover:bg-zinc-800"
                  }`}
                >
                  <Share2 className="h-3.5 w-3.5 text-amber-500" />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800/30 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Article Body */}
            <div className="p-5 sm:p-10 space-y-6">
              {/* Authentic Early Printing-Press Newspaper Masthead Header when viewing Old-Timey Editions */}
              {isReaderOldTimey && (
                <div className="mb-4 select-none">
                  <div className="border-t-2 border-b border-[#1f160d] py-1 flex flex-wrap items-center justify-between text-[10px] font-serif uppercase tracking-[0.22em] font-bold text-[#3b2917]">
                    <span>{readerThemeCfg.earLeft}</span>
                    <span>{readerThemeCfg.subhead}</span>
                    <span>{readerThemeCfg.earRight}</span>
                  </div>
                  <div className="py-3 border-b-4 border-double border-[#1f160d] text-center">
                    <div className="font-serif text-3xl sm:text-5xl font-black tracking-tight uppercase text-[#140e08] leading-none">
                      {readerThemeCfg.masthead}
                    </div>
                    <div className="mt-1 text-[11px] font-serif italic tracking-widest text-[#3b2917]">
                      “Printed by Rotary Halftone Press • {readerFilterActive ? readerThemeCfg.filterLabel : "Original Color Plate"}”
                    </div>
                  </div>
                </div>
              )}

              {/* Playable Original Source Video & Media Stage (featured at top whenever original video/embed exists) */}
              {hasPlayableSourceMedia(selectedStory) && (
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <span>🎬</span>
                      <span>Original Source Video &amp; Media ({selectedStory.embedData?.provider_name || "Verified Source"})</span>
                    </div>
                    {selectedStory.sourceUrl && (
                      <a
                        href={selectedStory.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                      >
                        ↗ View Original on {selectedStory.embedData?.provider_name || "Source"}
                      </a>
                    )}
                  </div>
                  <WireEmbed dispatch={selectedStory} />
                </div>
              )}

              {/* Interactive Multi-Image Evidence Stage & Filmstrip */}
              {activeFrame && (
                <div className="space-y-2.5">
                  {hasPlayableSourceMedia(selectedStory) && (
                    <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pt-1">
                      <span className="font-bold uppercase tracking-wider text-amber-400">
                        🖼️ Attached Still Frame &amp; Darkroom Filter Preview
                      </span>
                      <span>Toggle Edition Theme Filter on still frame below</span>
                    </div>
                  )}
                  <div className={`overflow-hidden relative aspect-video max-h-[520px] bg-black shadow-lg group ${
                    isReaderOldTimey
                      ? "rounded-none border-2 border-[#1f160d] p-1.5 bg-[#e5d7bc]"
                      : "rounded-xl border border-zinc-800"
                  }`}>
                    <img
                      src={activeFrame.url}
                      alt={decodeEntitiesClient(activeFrame.caption || selectedStory.title)}
                      onError={(e) => handleImgFallbackError(e, selectedStory)}
                      onClick={() => setReaderLightboxUrl(activeFrame.url)}
                      className={`w-full h-full object-cover cursor-zoom-in transition ${
                        readerFilterActive ? readerThemeCfg.imgFilterClass : "filter-none"
                      }`}
                    />
                    {renderThemePhotoOverlay(readerStyle, readerFilterActive)}

                    {/* Top-Left Frame Counter + Theme Filter Toggle & Top-Right Fullscreen Button */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-30 pointer-events-none">
                      <div className="flex items-center gap-1.5 pointer-events-auto">
                        <span className="px-2.5 py-1 rounded-full bg-black/80 text-amber-400 border border-amber-500/40 text-[11px] font-bold backdrop-blur-xs">
                          📸 Frame {safeIdx + 1} of {Math.max(1, readerGallery.length)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleThemePhotoFilter(selectedStory.id, readerFilterActive, e)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer shadow-lg ${
                            readerFilterActive
                              ? "bg-amber-500 text-zinc-950 border-amber-300 hover:bg-amber-400"
                              : "bg-black/85 text-white border-white/40 hover:bg-black"
                          }`}
                          title="Click to toggle between Edition Theme Photo Filter and Original Color"
                        >
                          {readerFilterActive ? `${readerThemeCfg.filterBadge}: ON` : "📸 Original Color"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReaderLightboxUrl(activeFrame.url)}
                        className="pointer-events-auto px-2.5 py-1 rounded-full bg-black/80 hover:bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px] font-bold cursor-pointer transition"
                      >
                        🔍 Expand Fullscreen
                      </button>
                    </div>

                    {/* Prev / Next Carousel Controls when multiple images exist */}
                    {readerGallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActiveReaderImageIdx((safeIdx - 1 + readerGallery.length) % readerGallery.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/80 hover:bg-amber-500 hover:text-zinc-950 text-white border border-zinc-700 flex items-center justify-center font-black text-sm cursor-pointer transition shadow-lg"
                          title="Previous photo"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveReaderImageIdx((safeIdx + 1) % readerGallery.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/80 hover:bg-amber-500 hover:text-zinc-950 text-white border border-zinc-700 flex items-center justify-center font-black text-sm cursor-pointer transition shadow-lg"
                          title="Next photo"
                        >
                          ›
                        </button>
                      </>
                    )}

                    {(activeFrame.caption || selectedStory.imageCaption) && (
                      <div className={`absolute bottom-0 inset-x-0 z-20 p-3 text-xs border-t ${
                        isReaderOldTimey
                          ? "bg-[#efe4ce]/95 text-[#18120c] font-serif italic border-[#1f160d]"
                          : "bg-black/85 backdrop-blur-xs text-zinc-200 border-zinc-800"
                      }`}>
                        <span className={isReaderOldTimey ? "font-black not-italic" : "text-amber-400 font-bold"}>
                          {isReaderOldTimey ? `ENGRAVED PLATE #${safeIdx + 1}:` : `EVIDENCE FRAME #${safeIdx + 1}:`}
                        </span>{" "}
                        {decodeEntitiesClient(activeFrame.caption || selectedStory.imageCaption)}
                      </div>
                    )}
                  </div>

                  {/* Clickable Multi-Image Filmstrip */}
                  {readerGallery.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5">
                      {readerGallery.map((frame, idx) => {
                        const isSelected = idx === safeIdx;
                        return (
                          <button
                            key={frame.id || idx}
                            type="button"
                            onClick={() => setActiveReaderImageIdx(idx)}
                            className={`relative rounded-lg overflow-hidden border-2 transition flex-shrink-0 cursor-pointer ${
                              isSelected
                                ? "border-amber-500 ring-2 ring-amber-500/40 scale-[1.02]"
                                : "border-zinc-700/80 opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={frame.url}
                              alt={frame.caption || `Frame ${idx + 1}`}
                              className={`h-14 w-24 object-cover ${
                                readerFilterActive ? readerThemeCfg.imgFilterClass : ""
                              }`}
                            />
                            <span className="absolute bottom-0.5 right-1 px-1 rounded bg-black/80 text-[9px] text-white font-bold">
                              #{idx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Headline & Metadata */}
              <div className="space-y-3">
                <h1 className={isReaderOldTimey
                  ? "font-serif text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.03] text-[#140e08] border-b-2 border-[#1f160d] pb-3"
                  : "text-2xl sm:text-4xl font-black tracking-tight leading-tight"
                }>
                  {decodeEntitiesClient(selectedStory.title)}
                </h1>
                <div className={`pb-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
                  isReaderOldTimey ? "border-[#1f160d] text-[#3b2917] font-serif" : `${borderThemeClass} ${subTextThemeClass}`
                }`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">Byline:</span>
                    {(selectedStory.isAnonymous || selectedStory.callsign === "anon-signal") && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 text-[10px] font-black uppercase">
                        🕵️ ANONYMOUS SOURCE • METADATA STRIPPED
                      </span>
                    )}
                    {(selectedStory.decoupleLocationPin || (selectedStory.bureau && selectedStory.bureau.includes("Pin Decoupled"))) && (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-500 border border-cyan-500/40 text-[10px] font-black uppercase">
                        🔀 VICINITY PIN DECOUPLED FROM IDENTITY
                      </span>
                    )}
                    <span>{selectedStory.author} (@{selectedStory.callsign})</span>
                    <span>•</span>
                    <span>{selectedStory.bureau}</span>
                    {Array.isArray(selectedStory.coordinates) && selectedStory.coordinates.length === 2 && (
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        📍 ~5 km Vicinity Sector ({selectedStory.coordinates[1].toFixed(2)}°N, {Math.abs(selectedStory.coordinates[0]).toFixed(2)}°W)
                      </span>
                    )}
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
              {isReaderOldTimey ? (
                <div className="font-serif text-base sm:text-lg leading-[1.75] text-[#18120c] text-justify sm:columns-2 gap-8 sm:[column-rule:1px_solid_rgba(31,22,13,0.35)] py-2">
                  <span className="float-left text-5xl font-serif font-black mr-3 leading-none text-[#18120c] border-2 border-[#18120c] px-2.5 py-1 bg-[#e5d7bc] shadow-[2px_2px_0px_#18120c]">
                    {decodeEntitiesClient(selectedStory.content)[0]}
                  </span>
                  <span className="font-black uppercase tracking-widest text-xs text-[#2b1d0e]">
                    {selectedStory.location.toUpperCase()} ({readerThemeCfg.datelinePrefix}) —{" "}
                  </span>
                  <span>{decodeEntitiesClient(selectedStory.content).slice(1)}</span>
                </div>
              ) : (
                <div className="text-base sm:text-lg leading-relaxed font-serif whitespace-pre-wrap py-2">
                  {decodeEntitiesClient(selectedStory.content)}
                </div>
              )}

              {/* Complete Multi-Photo Visual Evidence Gallery Grid (shown when >1 photo) */}
              {readerGallery.length > 1 && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isReaderOldTimey ? "rounded-none bg-[#e6d8bd] border-2 border-[#1f160d]" : subCardThemeClass
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                      isReaderOldTimey ? "text-[#18120c] font-serif" : "text-amber-400"
                    }`}>
                      <span>🖼️</span>
                      <span>Attached Visual Evidence Roll ({readerGallery.length} Verified Frames)</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => toggleThemePhotoFilter(selectedStory.id, readerFilterActive, e)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                        readerFilterActive
                          ? "bg-amber-500 text-zinc-950 border-amber-300"
                          : "bg-zinc-800 text-zinc-200 border-zinc-700"
                      }`}
                    >
                      {readerFilterActive ? `${readerThemeCfg.filterBadge}: ON` : "📸 Original Color"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {readerGallery.map((frame, idx) => (
                      <div
                        key={frame.id || idx}
                        onClick={() => {
                          setActiveReaderImageIdx(idx);
                          setReaderLightboxUrl(frame.url);
                        }}
                        className={`overflow-hidden border transition cursor-zoom-in flex flex-col ${
                          isReaderOldTimey
                            ? "rounded-none border-[#1f160d] bg-[#f3ead8]"
                            : "rounded-lg border-zinc-800 bg-black/50 hover:border-amber-500/60"
                        }`}
                      >
                        <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                          <img
                            src={frame.url}
                            alt={frame.caption || `Evidence frame ${idx + 1}`}
                            className={`w-full h-full object-cover ${
                              readerFilterActive ? readerThemeCfg.imgFilterClass : ""
                            }`}
                          />
                          {renderThemePhotoOverlay(readerStyle, readerFilterActive)}
                          <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-black/80 text-amber-400 text-[10px] font-bold">
                            Frame #{idx + 1}
                          </span>
                        </div>
                        {frame.caption && (
                          <div className={`p-2.5 text-[11px] leading-snug border-t ${
                            isReaderOldTimey
                              ? "text-[#18120c] font-serif italic border-[#1f160d]/40"
                              : "text-zinc-300 border-zinc-800/80"
                          }`}>
                            {decodeEntitiesClient(frame.caption)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source attribution footer link when video is already rendered at top */}
              {selectedStory.sourceUrl && !hasPlayableSourceMedia(selectedStory) && (
                <div className="space-y-2 pt-2">
                  <WireEmbed dispatch={selectedStory} />
                  <a
                    href={selectedStory.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-500 hover:text-amber-400 hover:underline inline-block"
                  >
                    Watch / Read original at source →
                  </a>
                </div>
              )}

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
        );
      })()}

      {/* Fullscreen Image Lightbox Modal */}
      {readerLightboxUrl && (
        <div
          onClick={() => setReaderLightboxUrl(null)}
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setReaderLightboxUrl(null)}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-200 border border-zinc-700 hover:bg-zinc-800 font-mono text-xs font-bold cursor-pointer"
          >
            ✕ Close Fullscreen
          </button>
          <img
            src={readerLightboxUrl}
            alt="Fullscreen Evidence Frame"
            className="max-w-full max-h-[88vh] object-contain rounded-xl border border-zinc-800 shadow-2xl"
          />
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

              {/* Message Stream — group chat now loads from the server
                  (fieldpress_group_messages), same as real DMs below. */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeChatId === GROUP_CHAT_ID ? (
                  groupMessagesLoading ? (
                    <p className={`text-xs text-center py-8 ${subTextThemeClass}`}>Loading conversation...</p>
                  ) : groupMessages.length === 0 ? (
                    <div className={`p-8 rounded-lg border text-center text-xs ${subCardThemeClass} ${subTextThemeClass} max-w-sm mx-auto my-auto space-y-2.5`}>
                      <MessageCircle className="h-8 w-8 text-amber-500 mx-auto" />
                      <p className="font-semibold text-sm">No messages yet</p>
                      <p className="text-[11px] leading-relaxed text-zinc-400">
                        Send a message or share a photo below.
                      </p>
                    </div>
                  ) : (
                    groupMessages.map((m) => {
                      const isMe = m.senderId === authAccount?.id;
                      const senderAvatar = isMe ? pressPass.avatarUrl : m.senderAvatarUrl;
                      const senderName = isMe ? (pressPass.name || m.senderName) : m.senderName;
                      const senderCallsign = isMe ? (pressPass.callsign || m.senderCallsign) : m.senderCallsign;
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

                            <div className={`rounded-xl p-3 text-xs sm:text-sm leading-relaxed border space-y-2 ${
                              isMe
                                ? "bg-amber-600 border-amber-600 text-white rounded-tr-none"
                                : isDark
                                  ? "bg-zinc-800 border-zinc-700 text-zinc-100 rounded-tl-none"
                                  : "bg-zinc-100 border-zinc-200 text-zinc-900 rounded-tl-none"
                            }`}>
                              {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}

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
                      (activeChatId === GROUP_CHAT_ID ? groupMessageSending : realMessageSending)
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-mono text-base font-bold text-amber-500 truncate">
                      Pressy'o
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex-shrink-0">
                      COPILOT
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex-shrink-0">
                      {pressyoLastSource ? formatSourceLabel(pressyoLastSource, pressyoLastModel) : "Ollama → Groq → Gemini"}
                    </span>
                  </div>
                  <p className={`text-xs font-mono ${subTextThemeClass}`}>Autonomous Field Editor • 3-Tier LLM Cascade</p>
                  <p className={`text-[11px] mt-0.5 truncate ${subTextThemeClass}`}>
                    In-editor rewrites, voice switching, Pollinations prompts &amp; telemetry checks
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

            {/* Active Builder Draft Context Bar (shown whenever the reporter has a draft in Pressie Builder) */}
            {(newTitle.trim() || newContent.trim()) && (
              <div className={`px-3.5 py-2 border-b flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono ${borderThemeClass} ${
                isDark ? "bg-amber-500/10" : "bg-amber-50"
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <span className="text-amber-400 font-bold truncate">
                    Builder Draft Connected: "{newTitle || newContent.slice(0, 40)}"
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: "✨ Rewrite", q: `Rewrite my active draft in ${newEditionStyle} voice and sharpen the headline` },
                    { label: "📐 Expand", q: "Expand my active draft with richer field reporting and corridor context" },
                    { label: "📰 3 Headlines", q: "Suggest 3 punchy alternative headlines for my active draft" },
                    { label: "🎨 Visual Prompt", q: "Generate a Pollinations photojournalism visual prompt for my active draft" }
                  ].map((act) => (
                    <button
                      key={act.label}
                      type="button"
                      disabled={isPressyoLoading}
                      onClick={() => handlePressyoSend(act.q)}
                      className="px-2 py-0.5 rounded border border-amber-500/40 bg-zinc-900/80 hover:bg-amber-500/20 text-amber-300 text-[10px] font-bold transition cursor-pointer disabled:opacity-40"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    {msg.sender === "pressyo" && msg.source && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pb-0.5">
                        <span>{formatSourceLabel(msg.source, msg.model)}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Visual Prompt-Only Card */}
                    {msg.visualOnlyPrompt && (
                      <div className={`p-2.5 rounded-xl border space-y-2 font-mono text-xs ${subCardThemeClass}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-400">🎨 AI Visual Framing Prompt</span>
                        </div>
                        <p className={`text-[11px] italic ${subTextThemeClass}`}>"{msg.visualOnlyPrompt}"</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!showPressieBuilderModal) openCreatePressie();
                            if (msg.visualOnlyPrompt) setVisualPrompt(msg.visualOnlyPrompt);
                            setShowPressyoModal(false);
                          }}
                          className="w-full py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                        >
                          ✨ Apply Visual Prompt in Pressie Builder
                        </button>
                      </div>
                    )}

                    {/* 1-Click Send to Pressie Builder Card */}
                    {msg.actionData && (
                      <div className={`p-3 rounded-xl border space-y-2 font-mono text-xs ${subCardThemeClass}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-500 uppercase">{msg.actionData.style} Edition Draft</span>
                          <span className="text-[10px] text-zinc-400">Ready to Publish</span>
                        </div>
                        <h4 className="font-bold text-zinc-200">{msg.actionData.title}</h4>
                        <p className={`text-[11px] line-clamp-3 ${subTextThemeClass}`}>{msg.actionData.content}</p>
                        {msg.actionData.prompt && (
                          <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800 text-[10px] text-amber-300/90">
                            <span className="font-bold text-amber-500">Visual Prompt: </span>
                            {msg.actionData.prompt}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (msg.actionData) {
                              if (!showPressieBuilderModal) openCreatePressie();
                              setNewTitle(msg.actionData.title);
                              setNewContent(msg.actionData.content);
                              setNewEditionStyle(msg.actionData.style);
                              if (msg.actionData.prompt) setVisualPrompt(msg.actionData.prompt);
                              setShowPressyoModal(false);
                            }
                          }}
                          className="w-full py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>{showPressieBuilderModal ? "✨ Apply to Active Builder Draft" : "🚀 Send Full Package to Pressie Builder"}</span>
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
