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
  Eye,
  PlusCircle,
  Clock,
  Layers,
  FileText,
  AlertCircle,
  Edit3,
  Sparkles,
  Search,
  Volume2,
  ExternalLink,
  Tag,
  Image as ImageIcon,
  MessageSquare,
  Users,
  Link2,
  Smile,
  Paperclip,
  Bot
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

export const DEFAULT_PRESS_PASS: PressPassData = {
  name: "Victor Birkle",
  callsign: "ViBiR",
  email: "vibir@fieldpress.studio",
  role: "Bureau Chief & Master Admin",
  bureau: "Midwest Corridor Dispatch",
  location: "Danville, IL",
  coordinates: [-87.6298, 40.1245],
  provenanceEnabled: false,
  badgeId: "FP-8492-X",
  issueDate: "2026-2027",
  accentColor: "amber",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  bio: "Independent field journalist and sole bureau administrator covering regional infrastructure, autonomous tech, and community affairs along the IL/IN corridor.",
  pgpKey: "4A8F 90B2 31CD E840 92F1",
  contactSignal: "@vibir.01",
  isAdmin: true
};

export interface CorrespondentUser {
  id: string;
  name: string;
  callsign: string;
  email: string;
  role: string;
  bureau: string;
  location: string;
  pressPassAvatar: string;
  isLinked: boolean;
  isAdmin: boolean;
}

export interface Dispatch {
  id: string;
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
}

export const INITIAL_DISPATCHES: Dispatch[] = [
  {
    id: "d-1",
    title: "Regional Grid Resiliency: Autonomous Micro-Substations Go Live Across Wabash Valley",
    category: "Infrastructure",
    author: "Pressy'o",
    callsign: "pressyo",
    bureau: "FieldPress Syndicate",
    timestamp: "12m ago",
    location: "Danville, IL",
    coordinates: [-87.6298, 40.1245],
    content: "Local cooperative power authorities today commissioned three self-healing modular distribution nodes along the central rail corridor, securing redundant municipal telemetry against severe autumn weather fronts. Operating on decentralised edge microcontrollers, the stations balance loads autonomously without relying on central switching networks.",
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Automated distribution node and telemetry array on the Danville corridor.",
    isLead: true,
    editionStyle: "newspaper",
    sharingOption: "fork"
  },
  {
    id: "d-2",
    title: "County Open Data Initiative Publishes Full Historical Drainage & Watershed Maps",
    category: "Civic Wire",
    author: "Pressy'o",
    callsign: "pressyo",
    bureau: "FieldPress Syndicate",
    timestamp: "48m ago",
    location: "Lafayette, IN",
    coordinates: [-86.8753, 40.4173],
    content: "Over 80 years of high-resolution watershed topographical surveys were digitized and released under public domain archives this morning, opening critical environmental data to citizen hydrologists and agricultural planners across the Wabash basin.",
    imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
    imageCaption: "Digitized watershed survey cartography from Tippecanoe basin.",
    editionStyle: "tactical",
    sharingOption: "fork"
  },
  {
    id: "d-3",
    title: "Independent Transit Co-op Tests Battery-Electric Shuttles on State Route 63",
    category: "Transit",
    author: "Pressy'o",
    callsign: "pressyo",
    bureau: "FieldPress Syndicate",
    timestamp: "2h ago",
    location: "Covington, IN",
    coordinates: [-87.3928, 40.1406],
    content: "Early metrics from the 100-day freight and commuter corridor pilot show a 68% drop in fleet operating expenses, paving the way for expanded multi-county commuter routes next spring connecting rural factory hubs.",
    editionStyle: "magazine",
    sharingOption: "fork"
  },
  {
    id: "d-4",
    title: "Community Fiber Exchange Deploys Optical Splice Ring Across Vermilion County",
    category: "Telecom",
    author: "Pressy'o",
    callsign: "pressyo",
    bureau: "FieldPress Syndicate",
    timestamp: "4h ago",
    location: "Catlin, IL",
    coordinates: [-87.7056, 40.0664],
    content: "A volunteer-backed telecommunications collective has completed the final segment of a 40-mile dark fiber loop connecting municipal emergency shelters and public library networks with gigabit uplinks.",
    editionStyle: "comic",
    sharingOption: "fork"
  }
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
  {
    id: "c-1",
    tag: "NOTICE",
    tagColor: "amber",
    title: "Municipal Solar Siting Public Hearing",
    details: "County Board Room B • Discussion on rural solar easement standards and community battery storage.",
    contact: "clerk@vermilioncounty.gov",
    timestamp: "Sep 18, 6:00 PM"
  },
  {
    id: "c-2",
    tag: "EQUIPMENT",
    tagColor: "emerald",
    title: "Mobile Broadcast Transceiver Testing",
    details: "Volunteer field operators wanted for 2-meter packet radio emergency mesh check-in along Route 1.",
    contact: "radio@midwestcorridor.org",
    timestamp: "Weekly Tue 19:00"
  },
  {
    id: "c-3",
    tag: "TRANSIT",
    tagColor: "cyan",
    title: "Shared Route 63 Commuter Shuttle Feedback",
    details: "Seeking survey responses from second-shift manufacturing commuters traveling between Danville and Covington.",
    contact: "transit@wabashcoop.net",
    timestamp: "Open through Oct 1"
  }
];

const CORRIDOR_DATELINES = [
  "Danville, IL • Vermilion Line",
  "Danville Junction Spur",
  "Champaign-Urbana Transit Line",
  "Lafayette, IN • Tippecanoe Desk",
  "Covington, IN • Wabash Corridor",
  "Catlin, IL • Fiber Loop Beat",
  "Evansville Crossing Line",
  "Chicago Loop Core"
];

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

export const FieldPressMaster: React.FC = () => {
  // Pressy'o AI Newsroom Copilot State
  const [showPressyoModal, setShowPressyoModal] = useState(false);
  const [pressyoInput, setPressyoInput] = useState("");
  const [pressyoChat, setPressyoChat] = useState<Array<{ sender: "user" | "pressyo"; text: string; actionData?: { title: string; content: string; style: "newspaper" | "comic" | "arcade" | "tactical" | "magazine"; prompt?: string } }>>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_pressyo_chat");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        sender: "pressyo",
        text: "Greetings Bureau Chief! I am Pressy'o, your autonomous field newsroom assistant. I can draft dispatches across all 5 edition styles (Broadsheet, Comic, Arcade, Tactical, Sleek), generate Pollinations visual prompts, or fact-check your corridor telemetry. How can I assist your reporting today?"
      }
    ];
  });

  // User Registration State for Genuine Field Correspondents
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState("");
  const [regCallsign, setRegCallsign] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regBureau, setRegBureau] = useState("Midwest Corridor");
  const [regLocation, setRegLocation] = useState("Danville, IL");
  const [regAvatar, setRegAvatar] = useState("");

  // Real Registered User Database: Seeded strictly with Victor Birkle as the sole admin
  const [registeredUsers, setRegisteredUsers] = useState<CorrespondentUser[]>(() => {
    const adminUser: CorrespondentUser = {
      id: "usr-vibir",
      name: "Victor Birkle",
      callsign: "ViBiR",
      email: "vibir@fieldpress.studio",
      role: "Bureau Chief & Master Admin",
      bureau: "Midwest Corridor Dispatch",
      location: "Danville, IL",
      pressPassAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      isLinked: true,
      isAdmin: true
    };
    try {
      const saved = localStorage.getItem("fieldpress_registered_users");
      if (saved) {
        const parsed = JSON.parse(saved) as CorrespondentUser[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee Victor remains the sole admin
          return parsed.map((u) => ({
            ...u,
            isAdmin: (u.email === "vibir@fieldpress.studio" || u.callsign.toLowerCase() === "vibir" || u.callsign.toLowerCase() === "ras.ip")
          }));
        }
      }
    } catch {}
    return [adminUser];
  });

  const handleRegisterCorrespondent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regCallsign.trim() || !regEmail.trim()) {
      setFormValidationError("Please provide name, callsign, and email.");
      return;
    }

    const cleanCallsign = regCallsign.trim().replace(/^@/, "");
    // Strictly prevent non-Victor accounts from claiming admin
    const isAdminUser = (regEmail.trim() === "vibir@fieldpress.studio" || cleanCallsign.toLowerCase() === "vibir" || cleanCallsign.toLowerCase() === "ras.ip");

    const newUser: CorrespondentUser = {
      id: `usr-${Date.now()}`,
      name: regName.trim(),
      callsign: cleanCallsign,
      email: regEmail.trim(),
      role: isAdminUser ? "Bureau Chief & Master Admin" : "Field Correspondent",
      bureau: regBureau.trim() || "Midwest Corridor",
      location: regLocation.trim() || "Danville, IL",
      pressPassAvatar: regAvatar.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isLinked: true,
      isAdmin: isAdminUser
    };

    const updated = [...registeredUsers.filter((u) => u.email !== newUser.email), newUser];
    setRegisteredUsers(updated);
    try {
      localStorage.setItem("fieldpress_registered_users", JSON.stringify(updated));
    } catch {}

    setRegName("");
    setRegCallsign("");
    setRegEmail("");
    setRegAvatar("");
    setShowRegisterModal(false);
    setSavedSuccessToast(`Correspondent @${cleanCallsign} registered & linked.`);
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const handlePressyoSend = (customPrompt?: string) => {
    const userText = customPrompt || pressyoInput.trim();
    if (!userText) return;

    const newChat = [...pressyoChat, { sender: "user" as const, text: userText }];
    setPressyoChat(newChat);
    setPressyoInput("");

    // Autonomous Pressy'o Intelligence response
    setTimeout(() => {
      let botResponse = "";
      let actionData: { title: string; content: string; style: "newspaper" | "comic" | "arcade" | "tactical" | "magazine"; prompt?: string } | undefined = undefined;

      const lower = userText.toLowerCase();
      if (lower.includes("comic") || lower.includes("kapow") || lower.includes("hero")) {
        botResponse = "💥 BAM! Here is a high-octane Comic Strip dispatch ready for the wire:";
        actionData = {
          title: "!ZAP! The Signal Wire Strikes Back",
          content: "SuperPressie scanned the frequencies as corporate scramblers attempted to jam the community microwave link. 'NOT ON MY WATCH!' cried the correspondent, rerouting 5.8 GHz packets through the water tower relay.",
          style: "comic",
          prompt: "Comic book pop art illustration: superhero journalist deflecting radar beams on a broadcast antenna tower, vibrant halftone dots, heavy inks"
        };
      } else if (lower.includes("broadsheet") || lower.includes("1920") || lower.includes("paper") || lower.includes("old")) {
        botResponse = "📰 Splendid! Here is a vintage 1920s Broadsheet dispatch:";
        actionData = {
          title: "CORRIDOR TELEGRAPH HOOKS EXPAND ACROSS WABASH BASIN",
          content: "In an extraordinary exhibition of civic coordination, regional cooperators yesterday joined telegraphic conduits along the rail right-of-way, securing unbroken freight communications for three counties.",
          style: "newspaper",
          prompt: "Vintage 1920s rotogravure newspaper photo: newsboy holding early telegraph paper, aged newsprint grain, sepia tones"
        };
      } else if (lower.includes("arcade") || lower.includes("pixel") || lower.includes("8-bit")) {
        botResponse = "🕹️ LEVEL UP! 8-Bit Arcade Telemetry generated:";
        actionData = {
          title: "■ MISSION 04: OPTICAL RING DEPLOYED ■",
          content: "PLAYER 1 ENTERED THE FIBER SHED. TELEMETRY PACKETS SYNCED AT 1000 MBPS. SUBSTATION NODES ONLINE. BOSS LEVEL THREAT: POWER SURGE NEUTRALIZED.",
          style: "arcade",
          prompt: "Pixel art green phosphor CRT screen: arcade telemetry monitor displaying retro digital rail map, 8-bit aesthetic"
        };
      } else if (lower.includes("tactical") || lower.includes("intel") || lower.includes("recon")) {
        botResponse = "🛰️ ENCRYPTED INTEL: Tactical reconnaissance report compiled:";
        actionData = {
          title: "SURVEILLANCE REPORT // VERMILION EDGE ARRAY",
          content: "Recon telemetry indicates all three modular distribution nodes are operating autonomously on edge batteries. Signal strength steady across 144.390 MHz backup carrier.",
          style: "tactical",
          prompt: "Satellite telemetry night vision photograph: thermal surveillance of power substation corridor, cyan crosshairs and coordinate HUD"
        };
      } else {
        botResponse = "⚡ Field analysis complete. I can generate complete dispatches, visual prompts, or assist with your reporter press pass. Choose an edition style or ask me to draft a headline!";
      }

      const finalized = [...newChat, { sender: "pressyo" as const, text: botResponse, actionData }];
      setPressyoChat(finalized);
      try {
        localStorage.setItem("fieldpress_pressyo_chat", JSON.stringify(finalized));
      } catch {}
    }, 600);
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
  const [activeTab, setActiveTab] = useState<"edition" | "wire" | "map" | "classifieds">("edition");

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
  const [showPostNoticeModal, setShowPostNoticeModal] = useState(false);
  const [newEditionStyle, setNewEditionStyle] = useState<"tactical" | "newspaper" | "comic" | "arcade" | "magazine">("tactical");
  const [newSharingOption, setNewSharingOption] = useState<"fork" | "colab" | "none">("fork");
  
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
  };

  // Instant Messaging (Field Comms Wire: DMs & Groups)
  const [showMessengerModal, setShowMessengerModal] = useState(false);
  const [activeChatId, setActiveChatId] = useState("midwest-bureau");
  const [activeChatTab, setActiveChatTab] = useState<"groups" | "dms">("groups");
  const [messengerInput, setMessengerInput] = useState("");
  const [messengerImageUrl, setMessengerImageUrl] = useState("");
  const [messengerLinkUrl, setMessengerLinkUrl] = useState("");
  const [showAttachImage, setShowAttachImage] = useState(false);
  const [showAttachLink, setShowAttachLink] = useState(false);
  const [messengerMessages, setMessengerMessages] = useState<FieldMessage[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_messenger_messages");
      if (saved) return JSON.parse(saved);
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
  const [settingsActiveTab, setSettingsActiveTab] = useState<"profile" | "drafts" | "bookmarks" | "archives" | "appearance" | "system">("profile");

  // Press Pass State
  const [pressPass, setPressPass] = useState<PressPassData>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_press_pass");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRESS_PASS;
  });

  // Admin Governance: Strictly Victor Birkle (vibir@fieldpress.studio / @ViBiR) ONLY
  const isCurrentUserAdmin = (pressPass.email === "vibir@fieldpress.studio" || pressPass.callsign?.toLowerCase() === "vibir" || pressPass.callsign?.toLowerCase() === "ras.ip");

  const [editPassForm, setEditPassForm] = useState<PressPassData>(pressPass);
  const [savedSuccessToast, setSavedSuccessToast] = useState("");

  // Live Dispatches & Press Roll (Staged Drafts)
  const [dispatches, setDispatches] = useState<Dispatch[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_dispatches");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DISPATCHES;
  });

  // Deep-link routing: shared URLs point to `#dispatch-<id>`. Open the
  // matching dispatch on load and whenever the hash changes (e.g. the
  // person navigates back/forward, or opens a second share link in the
  // same tab). Falls back to a toast if the dispatch can't be found
  // (e.g. it was a demo dispatch that never persisted for this visitor).
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

  const [pressRoll, setPressRoll] = useState<Dispatch[]>(() => {
    try {
      const saved = localStorage.getItem("fieldpress_pressroll");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "pr-1",
        title: "Draft: Vermilion River Silt Deposition Analysis Following August Rains",
        category: "Field Notes",
        author: "Victor Birkle",
        callsign: "ras.ip",
        bureau: "Midwest Corridor Dispatch",
        timestamp: "Staged Draft",
        location: "Danville, IL",
        content: "Field telemetry samples indicate a 14% elevation in suspended solids along the northern drainage junction. Follow-up turbidity inspection scheduled with county water board.",
        isPressRoll: true
      }
    ];
  });

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

  // Syncing Indicator State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  // Pressie Builder Form State
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
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

  // Photo Avatar Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditPassForm((prev) => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Press Pass Credentials
  const savePass = (newData: PressPassData) => {
    setPressPass(newData);
    try {
      localStorage.setItem("fieldpress_press_pass", JSON.stringify(newData));
    } catch {}
    setSavedSuccessToast("Press Pass credentials & badge updated.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
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
    if (draftToEdit) {
      setEditingDraftId(draftToEdit.id);
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

  // =========================================================================
  // PRESS PASS EDITOR HANDLER (OPENS THE ID BADGE CUSTOMIZER - IMAGE 1)
  // =========================================================================
  const openPressPassEditor = () => {
    setEditPassForm(pressPass);
    setShowPressieBuilderModal(false); // Close Pressie Builder
    setShowPressPassModal(true); // Open Press Pass Credential Studio
  };

  // Save Draft Handler (Stage to Press Roll)
  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      id: editingDraftId || `pr-${Date.now()}`,
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

    let updated: Dispatch[];
    if (editingDraftId) {
      updated = pressRoll.map((p) => (p.id === editingDraftId ? draftItem : p));
    } else {
      updated = [draftItem, ...pressRoll];
    }

    setPressRoll(updated);
    try {
      localStorage.setItem("fieldpress_pressroll", JSON.stringify(updated));
    } catch {}

    setShowPressieBuilderModal(false);
    setFormValidationError(null);
    setSavedSuccessToast("Dispatch staged to Press Roll.");
    setTimeout(() => setSavedSuccessToast(""), 3500);
  };

  // Publish to Live Feed Handler
  const handleCreatePressie = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) {
      setFormValidationError("Please enter a headline for your dispatch.");
      return;
    }

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
      id: `disp-${Date.now()}`,
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
      sharingOption: newSharingOption
    };

    if (editingDraftId) {
      const updatedRoll = pressRoll.filter((p) => p.id !== editingDraftId);
      setPressRoll(updatedRoll);
      try {
        localStorage.setItem("fieldpress_pressroll", JSON.stringify(updatedRoll));
      } catch {}
    }

    const updatedDispatches = [pressieItem, ...dispatches];
    setDispatches(updatedDispatches);
    try {
      localStorage.setItem("fieldpress_dispatches", JSON.stringify(updatedDispatches));
    } catch {}

    setShowPressieBuilderModal(false);
    setFormValidationError(null);
    setSavedSuccessToast("Dispatch published to Front-Page Feed!");
    setActiveTab("edition"); // Immediately show at top of front-page edition!
    setTimeout(() => setSavedSuccessToast(""), 3500);
  };

  const deleteDraft = (id: string) => {
    const updated = pressRoll.filter((p) => p.id !== id);
    setPressRoll(updated);
    try {
      localStorage.setItem("fieldpress_pressroll", JSON.stringify(updated));
    } catch {}
    setSavedSuccessToast("Draft removed from Press Roll.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
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
    const shareUrl = `${window.location.origin}/#dispatch-${disp.id}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setSavedSuccessToast("Pressie link copied & social hub opened.");
    setTimeout(() => setSavedSuccessToast(""), 2500);
  };

  const handleForkPressie = (parent: Dispatch) => {
    openCreatePressie();
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

  const filteredDispatches = dispatches.filter((d) => {
    const matchesCategory = wireCategoryFilter === "ALL" || d.category.toLowerCase() === wireCategoryFilter.toLowerCase();
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
            <PressieMark className="h-[420px] w-[420px] mb-2" />
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

            {/* Pressy'o Newsroom Copilot Button */}
            <button
              onClick={() => setShowPressyoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition font-bold shadow-xs hover:border-amber-400 flex-shrink-0 cursor-pointer ml-1 text-xs font-mono"
              title="Open Pressy'o Autonomous Newsroom Copilot"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Pressy'o</span>
            </button>

            {/* Field Comms Instant Messaging Trigger */}
            <button
              onClick={() => setShowMessengerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-500/30 transition font-bold shadow-xs hover:border-cyan-400 flex-shrink-0 cursor-pointer ml-1 text-xs font-mono relative"
              title="Open Field Comms Messenger (Direct Messages & Group Wire)"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Field Comms</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </button>
          </nav>

          {/* Action Tools: Header Press Pass Trigger, Settings, Theme */}
          <div className="flex items-center gap-2 flex-shrink-0">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        
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
                              <div className="flex items-center gap-1.5">
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
                                  <span className="font-bold text-zinc-300">@{c.callsign}</span>
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
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter wire dispatches by keyword, reporter, or location..."
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
                  No dispatches match the active search or category filter.
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
                    </div>
                    <div className="sm:text-right font-mono text-xs flex-shrink-0 flex sm:flex-col justify-between items-end gap-2">
                      <div>
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
                  {editingDraftId ? "New Field Dispatch or Press Roll • Editing Staged Draft" : "New Field Dispatch or Press Roll"}
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
                  className="px-5 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  title="Publish dispatch to Live Feed"
                >
                  <Send className="h-4 w-4" />
                  <span>Publish to Live Feed</span>
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
                  currentAccent.border
                } ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
                  <div className={`absolute top-0 left-0 right-0 h-2.5 ${currentAccent.bar}`} />

                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 pt-1">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-tight">
                      <span className="text-amber-500">FP_</span>
                      <PressieMark className="h-4 w-4" />
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
                    <span className={`px-2 py-0.5 rounded font-black tracking-widest text-[9px] uppercase ${currentAccent.badge}`}>
                      ACTIVE CREDENTIAL
                    </span>
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
                        Ping: {editPassForm.coordinates ? `${editPassForm.coordinates[0]}, ${editPassForm.coordinates[1]}` : "Active"}
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
                  <span>{selectedStory.timestamp}</span>
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
                  <span>Telemetry Anchor: <strong>{selectedStory.coordinates[0]}, {selectedStory.coordinates[1]}</strong> ({selectedStory.location})</span>
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
                          <div className="flex items-center gap-2">
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
          <div className={`w-full max-w-lg rounded-xl border-2 shadow-2xl overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className={`flex-shrink-0 p-4 border-b flex items-center justify-between text-xs ${borderThemeClass}`}>
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-amber-500" />
                <span className="font-bold uppercase tracking-wider">Share Pressie to Social Media</span>
              </div>
              <button
                onClick={() => setShareModalStory(null)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className={`p-4 rounded-lg border ${
                isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
              } shadow-sm space-y-3`}>
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-amber-500 font-black">FP_</span>
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
                  <p className={`text-xs font-serif leading-relaxed line-clamp-2 ${
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

              <div>
                <label className="block text-xs font-bold mb-2 text-zinc-400">
                  Direct Share to Social Media:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`FieldPress Dispatch: "${shareModalStory.title}" [${shareModalStory.location}]`)}&url=${encodeURIComponent(`${window.location.origin}/#dispatch-${shareModalStory.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-zinc-700 bg-black text-white hover:bg-zinc-800 transition flex items-center justify-center gap-2 font-bold cursor-pointer"
                  >
                    <span>𝕏</span>
                    <span>X (Twitter)</span>
                  </a>

                  <a
                    href={`https://www.reddit.com/submit?url=${encodeURIComponent(`${window.location.origin}/#dispatch-${shareModalStory.id}`)}&title=${encodeURIComponent(`FieldPress: ${shareModalStory.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-orange-500/40 bg-orange-600/10 text-orange-500 hover:bg-orange-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>Reddit</span>
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/#dispatch-${shareModalStory.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-blue-500/40 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/#dispatch-${shareModalStory.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-blue-600/40 bg-blue-700/10 text-blue-500 hover:bg-blue-700/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>Facebook</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`FieldPress Dispatch: "${shareModalStory.title}" ${window.location.origin}/#dispatch-${shareModalStory.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/#dispatch-${shareModalStory.id}`)}&text=${encodeURIComponent(`FieldPress Dispatch: "${shareModalStory.title}"`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-cyan-500/40 bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20 transition flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                  >
                    <span>Telegram</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/#dispatch-${shareModalStory.id}`;
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(shareUrl);
                    }
                    setSavedSuccessToast("Direct share URL copied to clipboard.");
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
                    const shareUrl = `${window.location.origin}/#dispatch-${shareModalStory.id}`;
                    const text = `📰 FIELDPRESS DISPATCH: "${shareModalStory.title}"\n📍 [${shareModalStory.location}] By ${shareModalStory.author} (@${shareModalStory.callsign})\n${shareModalStory.imageUrl ? `📷 Still: ${shareModalStory.imageUrl}\n` : ""}${shareUrl}`;
                    if (navigator.share) {
                      navigator.share({
                        title: `FieldPress: ${shareModalStory.title}`,
                        text: text,
                        url: shareUrl
                      }).catch(() => {});
                    } else if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(text);
                      setSavedSuccessToast("Broadcast text copied to clipboard.");
                      setTimeout(() => setSavedSuccessToast(""), 2500);
                    }
                  }}
                  className="px-3 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{typeof navigator !== "undefined" && navigator.share ? "System Share Sheet" : "Copy Broadcast Wire"}</span>
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
              <div className={`p-4 border-b flex items-center justify-between ${borderThemeClass}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-sm font-black tracking-tight text-amber-500">
                    FIELD DIRECTORY
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer shadow-xs"
                  title="Register a genuine new correspondent account"
                >
                  + Register
                </button>
              </div>

              {/* Directory Tabs: Linked Users vs Complete Directory Index */}
              <div className={`grid grid-cols-2 p-1.5 m-3 rounded-lg border text-xs font-mono ${
                isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-200 border-zinc-300"
              }`}>
                <button
                  type="button"
                  onClick={() => setMessengerDirectoryTab("linked")}
                  className={`py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    messengerDirectoryTab === "linked"
                      ? "bg-amber-500 text-zinc-950 shadow-xs"
                      : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Linked ({registeredUsers.filter((c) => c.isLinked).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMessengerDirectoryTab("directory")}
                  className={`py-1.5 rounded-md font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    messengerDirectoryTab === "directory"
                      ? "bg-amber-500 text-zinc-950 shadow-xs"
                      : isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Index ({registeredUsers.length})</span>
                </button>
              </div>

              {/* Group Channel Quick Link */}
              <div className="px-3 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveChatId("bureau-wire")}
                  className={`w-full p-2 rounded-lg border text-left transition flex items-center gap-2 cursor-pointer font-mono text-xs ${
                    activeChatId === "bureau-wire"
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-xs font-bold"
                      : "border-zinc-800 hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Radio className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate"># Midwest Bureau Wire (All)</span>
                </button>
              </div>

              {/* Real Registered Users List */}
              <div className="flex-1 overflow-y-auto px-3 space-y-1.5 pb-2">
                {(messengerDirectoryTab === "linked"
                  ? registeredUsers.filter((u) => u.isLinked)
                  : registeredUsers
                ).map((u) => {
                  const isSelected = activeChatId === u.id;
                  const isUserAdminAccount = u.isAdmin || u.email === "vibir@fieldpress.studio" || u.callsign.toLowerCase() === "vibir";

                  return (
                    <div
                      key={u.id}
                      onClick={() => setActiveChatId(u.id)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? isDark
                            ? "bg-amber-500/15 border-amber-500 text-amber-200 shadow-xs"
                            : "bg-amber-50 border-amber-400 text-amber-950 shadow-xs"
                          : isDark
                            ? "border-zinc-800/80 hover:bg-zinc-800/60 text-zinc-300"
                            : "border-zinc-200 hover:bg-zinc-100 text-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Press Pass Avatar Badge */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={u.pressPassAvatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-lg object-cover border border-amber-500/50 shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold truncate">{u.name}</span>
                            {isUserAdminAccount && (
                              <span className="text-[9px] font-mono px-1 rounded bg-amber-500 text-zinc-950 font-black">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-500 font-mono truncate">
                            @{u.callsign}
                          </p>
                          <p className={`text-[10px] truncate ${subTextThemeClass}`}>
                            {u.bureau}
                          </p>
                        </div>
                      </div>

                      {/* Link Status Toggle */}
                      {u.id !== "usr-vibir" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = registeredUsers.map((x) => (x.id === u.id ? { ...x, isLinked: !x.isLinked } : x));
                            setRegisteredUsers(updated);
                            try {
                              localStorage.setItem("fieldpress_registered_users", JSON.stringify(updated));
                            } catch {}
                          }}
                          className={`text-[10px] font-mono px-2 py-1 rounded border transition cursor-pointer flex-shrink-0 ${
                            u.isLinked
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300"
                              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-amber-500/20 hover:border-amber-500 hover:text-amber-300"
                          }`}
                        >
                          {u.isLinked ? "Linked" : "+ Link"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Your Press Pass Identity Footer */}
              <div className={`p-3 border-t flex items-center justify-between text-xs font-mono ${borderThemeClass} ${subTextThemeClass}`}>
                <div className="flex items-center gap-2 truncate">
                  <img src={pressPass.avatarUrl || DEFAULT_PRESS_PASS.avatarUrl} alt="Victor" className="w-5 h-5 rounded-full object-cover border border-amber-500/50" />
                  <span className="truncate">@{pressPass.callsign || "ViBiR"} (Master Admin)</span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">ADMIN</span>
              </div>
            </div>

            {/* Right Column: Real Messenger Conversation Stream */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Active Conversation Header */}
              {(() => {
                const isGroup = activeChatId === "bureau-wire";
                const activeUser = registeredUsers.find((u) => u.id === activeChatId);

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
                          src={activeUser.pressPassAvatar}
                          alt={activeUser.name}
                          className="w-10 h-10 rounded-xl object-cover border-2 border-amber-500/60 shadow-xs"
                        />
                      ) : null}
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-mono text-sm font-bold">
                            {isGroup ? "Midwest Bureau All-Hands Wire" : activeUser ? activeUser.name : "Field Messenger"}
                          </h2>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            🔒 Encrypted Wire
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${subTextThemeClass}`}>
                          {isGroup
                            ? "Public dispatch frequency for all linked correspondents"
                            : activeUser
                              ? `@${activeUser.callsign} • ${activeUser.role} • ${activeUser.bureau} (${activeUser.location})`
                              : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMessengerModal(false)}
                      className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
                      title="Close Field Comms"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })()}

              {/* Real Messages Stream (Zero Fake Simulated Dialogue!) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {messengerMessages.filter((m) => m.chatId === activeChatId).length === 0 ? (
                  <div className={`p-8 rounded-xl border text-center font-mono text-xs ${subCardThemeClass} ${subTextThemeClass} max-w-md mx-auto my-8 space-y-2`}>
                    <Radio className="h-6 w-6 text-amber-500 mx-auto" />
                    <p className="font-bold text-zinc-300">
                      {activeChatId === "bureau-wire"
                        ? "Midwest Bureau All-Hands Wire Open"
                        : `Direct encrypted wire established with ${
                            registeredUsers.find((u) => u.id === activeChatId)?.name || "@callsign"
                          }`}
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      No communications recorded. Transmit a live message, evidence still, or dispatch link below.
                    </p>
                  </div>
                ) : (
                  messengerMessages
                    .filter((m) => m.chatId === activeChatId)
                    .map((m) => {
                      const isMe = m.callsign === (pressPass.callsign || "ViBiR") || m.sender === pressPass.name;
                      const senderUser = registeredUsers.find((u) => u.callsign === m.callsign);
                      const senderAvatar = isMe ? pressPass.avatarUrl : (m.avatarUrl || senderUser?.pressPassAvatar);

                      return (
                        <div
                          key={m.id}
                          className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"} items-start group`}
                        >
                          {/* Press Pass Avatar next to message */}
                          {senderAvatar ? (
                            <img
                              src={senderAvatar}
                              alt={m.sender}
                              className="w-7 h-7 rounded-full object-cover border border-amber-500/50 flex-shrink-0 mt-1"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-1">
                              {m.sender[0]}
                            </div>
                          )}

                          <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono mb-1 text-zinc-400 px-1">
                              <span className="font-bold text-zinc-300">{m.sender}</span>
                              <span className="text-amber-500">@{m.callsign}</span>
                              <span>•</span>
                              <span>{m.timestamp}</span>
                            </div>

                            <div className={`rounded-2xl p-3 text-xs sm:text-sm leading-relaxed border shadow-xs space-y-2 ${
                              isMe
                                ? "bg-amber-500/20 border-amber-500/40 text-zinc-100 rounded-tr-xs"
                                : isDark
                                  ? "bg-zinc-800/80 border-zinc-700/60 text-zinc-200 rounded-tl-xs"
                                  : "bg-zinc-100 border-zinc-300 text-zinc-800 rounded-tl-xs"
                            }`}>
                              {/* Message Text with Respectful Sizing */}
                              {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}

                              {/* Shared Image Attachment */}
                              {m.imageUrl && (
                                <div className="rounded-lg overflow-hidden border border-zinc-700/80 aspect-video max-h-48 bg-black">
                                  <img src={m.imageUrl} alt="Shared still" className="w-full h-full object-cover" />
                                </div>
                              )}

                              {/* Shared Link Attachment */}
                              {m.linkUrl && (
                                <a
                                  href={m.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-zinc-950/60 border border-zinc-700/80 text-cyan-400 hover:text-cyan-300 text-xs font-mono transition"
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
                )}
              </div>

              {/* Bottom Real Message Composer */}
              <div className={`p-3 sm:p-4 border-t space-y-2 flex-shrink-0 ${borderThemeClass} ${
                isDark ? "bg-zinc-950/90" : "bg-zinc-50"
              }`}>
                {/* Expandable Image Attachment Box */}
                {showAttachImage && (
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
                {showAttachLink && (
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

                {/* Quick Emoji Bar & Tool Controls */}
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-mono mr-1">Emoji:</span>
                    {["📰", "⚡", "🔍", "💬", "🤝", "🔥", "🔻", "📡", "👍", "❤️"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setMessengerInput((prev) => prev + " " + em)}
                        className="px-1.5 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-700 text-xs border border-zinc-700/40 select-none cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachImage(!showAttachImage);
                        setShowAttachLink(false);
                      }}
                      className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 border transition cursor-pointer ${
                        showAttachImage || messengerImageUrl
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : "border-zinc-700/60 hover:bg-zinc-800 text-zinc-400"
                      }`}
                      title="Attach Image"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachLink(!showAttachLink);
                        setShowAttachImage(false);
                      }}
                      className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 border transition cursor-pointer ${
                        showAttachLink || messengerLinkUrl
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                          : "border-zinc-700/60 hover:bg-zinc-800 text-zinc-400"
                      }`}
                      title="Attach Link"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Link</span>
                    </button>
                  </div>
                </div>

                {/* Input Field & Send Button */}
                <form onSubmit={handleSendMessengerMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messengerInput}
                    onChange={(e) => setMessengerInput(e.target.value)}
                    placeholder={`Transmit message as @${pressPass.callsign || "ViBiR"}...`}
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none transition ${inputThemeClass}`}
                  />
                  <button
                    type="submit"
                    disabled={!messengerInput.trim() && !messengerImageUrl.trim() && !messengerLinkUrl.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs sm:text-sm hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-xs whitespace-nowrap"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Transmit</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8C. GENUINE CORRESPONDENT REGISTRATION MODAL                              */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-zinc-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm">Register Field Correspondent</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs ${subTextThemeClass}`}>
              Register a genuine correspondent account to link to the Midwest Wire. Note: Admin authority is permanently reserved for Bureau Chief Victor Birkle.
            </p>

            <form onSubmit={handleRegisterCorrespondent} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  required
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Callsign / Handle</label>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 rounded-l bg-zinc-800 border border-r-0 border-zinc-700 text-zinc-400 text-xs">@</span>
                  <input
                    type="text"
                    value={regCallsign}
                    onChange={(e) => setRegCallsign(e.target.value)}
                    placeholder="elena.wire"
                    required
                    className={`w-full rounded-r px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="elena@midwestwire.org"
                  required
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">Bureau Desk</label>
                  <input
                    type="text"
                    value={regBureau}
                    onChange={(e) => setRegBureau(e.target.value)}
                    placeholder="Tippecanoe Desk"
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Location</label>
                  <input
                    type="text"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    placeholder="Lafayette, IN"
                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Press Pass Photo URL (Optional)</label>
                <input
                  type="text"
                  value={regAvatar}
                  onChange={(e) => setRegAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                />
              </div>

              <div className="p-2 rounded bg-zinc-800/40 border border-zinc-700 text-[11px] text-zinc-400">
                <span>Account Tier: <strong>Field Correspondent</strong> (Standard Access)</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-700">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-1.5 rounded border border-zinc-700 hover:bg-zinc-800 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 shadow-xs"
                >
                  Register Correspondent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8D. PRESSY'O AUTONOMOUS NEWSROOM COPILOT CHAT MODAL                       */}
      {/* ========================================================================= */}
      {showPressyoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md font-sans">
          <div className={`w-full max-w-2xl h-[80vh] max-h-[660px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition ${
            isDark ? "bg-zinc-900 border-amber-500/50 text-zinc-100" : "bg-white border-amber-500/40 text-zinc-900"
          }`}>
            {/* Pressy'o Header */}
            <div className={`p-4 border-b flex items-center justify-between flex-shrink-0 ${borderThemeClass} ${
              isDark ? "bg-zinc-950/80" : "bg-amber-50/60"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xl shadow-md border-2 border-black">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono text-sm font-bold text-amber-500">
                      Pressy'o • Autonomous Field Editor
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                      COPILOT
                    </span>
                  </div>
                  <p className={`text-[11px] ${subTextThemeClass}`}>
                    AI assistant for story drafting, Pollinations prompt writing, and telemetry verification.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPressyoModal(false)}
                className="p-1.5 rounded-lg border border-zinc-700/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Pressy'o Quick Action Chips */}
            <div className={`p-2.5 border-b flex flex-wrap gap-1.5 text-xs font-mono ${borderThemeClass} ${
              isDark ? "bg-zinc-950/40" : "bg-zinc-100"
            }`}>
              <span className="text-[10px] text-zinc-400 flex items-center mr-1">Quick Draft:</span>
              {[
                { label: "📰 Broadsheet Story", query: "Draft a 1920s Broadsheet newspaper dispatch about regional railroad electrification" },
                { label: "💥 Comic Strip", query: "Draft a superhero Comic Strip dispatch about defeating signal jammers" },
                { label: "🕹️ 8-Bit Arcade", query: "Draft an 8-bit arcade telemetry story about optical fiber splice rings" },
                { label: "🛰️ Tactical Intel", query: "Compile a tactical intelligence reconnaissance report on autonomous micro-substations" },
                { label: "🎨 Visual Prompt", query: "Generate a high-detail Pollinations visual prompt for an infrastructure photojournalism still" }
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handlePressyoSend(chip.query)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pressyoChat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} items-start`}
                >
                  {msg.sender === "pressyo" ? (
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs border border-black">
                      🤖
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-200 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-zinc-700">
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
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none transition ${inputThemeClass}`}
                />
                <button
                  type="submit"
                  disabled={!pressyoInput.trim()}
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

      {/* Floating Action Button: Ask Pressy'o */}
      <button
        type="button"
        onClick={() => setShowPressyoModal(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3.5 py-2 rounded-full bg-amber-500 text-zinc-950 font-mono font-bold text-xs shadow-2xl hover:bg-amber-400 hover:scale-105 transition cursor-pointer border-2 border-black"
        title="Open Pressy'o Autonomous Newsroom Assistant"
      >
        <span className="text-base leading-none">🤖</span>
        <span>Ask Pressy'o</span>
      </button>

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

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
              
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
                    <h5 className="font-bold text-rose-400">Reset Local Store</h5>
                    <p className={`text-xs ${subTextThemeClass}`}>
                      Restore default broadsheet dispatches and purge local browser cache.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.clear();
                        setDispatches(INITIAL_DISPATCHES);
                        setPressRoll([]);
                        setBookmarks(["d-1"]);
                        setSavedSuccessToast("Local storage reset to default wire.");
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

    </div>
  );
};

export default FieldPressMaster;
