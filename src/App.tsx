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

  Image as ImageIcon

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

  role: string;

  bureau: string;

  badgeId: string;

  issueDate: string;

  accentColor: string;

  avatarUrl?: string;

  bio: string;

  pgpKey: string;

  contactSignal: string;

}

  

export const DEFAULT_PRESS_PASS: PressPassData = {

  name: "Victor Birkle",

  callsign: "ras.ip",

  role: "Bureau Chief & Field Lead",

  bureau: "Midwest Corridor Dispatch",

  badgeId: "FP-8492-X",

  issueDate: "2026-2027",

  accentColor: "amber",

  bio: "Independent field journalist covering regional infrastructure, autonomous tech, and community affairs along the IL/IN corridor.",

  pgpKey: "4A8F 90B2 31CD E840 92F1",

  contactSignal: "@rasip.01"

};

  

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

}

  

export const INITIAL_DISPATCHES: Dispatch[] = [

  {

    id: "d-1",

    title: "Regional Grid Resiliency: Autonomous Micro-Substations Go Live Across Wabash Valley",

    category: "Infrastructure",

    author: "Victor Birkle",

    callsign: "ras.ip",

    bureau: "Midwest Corridor",

    timestamp: "12m ago",

    location: "Danville, IL",

    coordinates: [-87.6298, 40.1245],

    content: "Local cooperative power authorities today commissioned three self-healing modular distribution nodes along the central rail corridor, securing redundant municipal telemetry against severe autumn weather fronts. Operating on decentralised edge microcontrollers, the stations balance loads autonomously without relying on central switching networks.",

    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",

    imageCaption: "Automated distribution node and telemetry array on the Danville corridor.",

    isLead: true

  },

  {

    id: "d-2",

    title: "County Open Data Initiative Publishes Full Historical Drainage & Watershed Maps",

    category: "Civic Wire",

    author: "Elena Rostova",

    callsign: "elena.wire",

    bureau: "Tippecanoe Desk",

    timestamp: "48m ago",

    location: "Lafayette, IN",

    coordinates: [-86.8753, 40.4173],

    content: "Over 80 years of high-resolution watershed topographical surveys were digitized and released under public domain archives this morning, opening critical environmental data to citizen hydrologists and agricultural planners across the Wabash basin.",

    imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",

    imageCaption: "Digitized watershed survey cartography from Tippecanoe basin."

  },

  {

    id: "d-3",

    title: "Independent Transit Co-op Tests Battery-Electric Shuttles on State Route 63",

    category: "Transit",

    author: "Marcus Vance",

    callsign: "mvance",

    bureau: "Wabash Valley",

    timestamp: "2h ago",

    location: "Covington, IN",

    coordinates: [-87.3928, 40.1406],

    content: "Early metrics from the 100-day freight and commuter corridor pilot show a 68% drop in fleet operating expenses, paving the way for expanded multi-county commuter routes next spring connecting rural factory hubs."

  },

  {

    id: "d-4",

    title: "Community Fiber Exchange Deploys Optical Splice Ring Across Vermilion County",

    category: "Telecom",

    author: "Victor Birkle",

    callsign: "ras.ip",

    bureau: "Midwest Corridor",

    timestamp: "4h ago",

    location: "Catlin, IL",

    coordinates: [-87.7056, 40.0664],

    content: "A volunteer-backed telecommunications collective has completed the final segment of a 40-mile dark fiber loop connecting municipal emergency shelters and public library networks with gigabit uplinks."

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

  

export const FieldPressMaster: React.FC = () => {

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

  const [showPressieBuilderModal, setShowPressieBuilderModal] = useState(false);

  const [showPressPassModal, setShowPressPassModal] = useState(false);

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  const [selectedStory, setSelectedStory] = useState<Dispatch | null>(null);

  const [showPostNoticeModal, setShowPostNoticeModal] = useState(false);

  

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

          caption: file.name.replace(/\\.[^/.]+$/, ""),

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

  

      let editorialFallback = `https://picsum.photos/seed/${seed}/1200/675`;

      if (lower.includes("rail") || lower.includes("train") || lower.includes("transit") || lower.includes("track")) {

        editorialFallback = "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&h=675&q=80";

      } else if (lower.includes("power") || lower.includes("grid") || lower.includes("substation") || lower.includes("electric")) {

        editorialFallback = "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&h=675&q=80";

      } else if (lower.includes("fiber") || lower.includes("telecom") || lower.includes("network") || lower.includes("cable")) {

        editorialFallback = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&h=675&q=80";

      } else if (lower.includes("water") || lower.includes("drainage") || lower.includes("river") || lower.includes("basin")) {

        editorialFallback = "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&h=675&q=80";

      } else {

        editorialFallback = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=675&q=80";

      }

  

      const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(

        cleanPrompt + ", authentic documentary photojournalism, 35mm film grain, editorial lighting, Reuters Pulitzer style"

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

        }, 3200);

        img.src = aiUrl;

      });

  

      const newItem = {

        id: "ai-" + Date.now(),

        url: resolvedUrl,

        source: "ai" as const,

        caption: `Visual documentation: ${cleanPrompt.slice(0, 60)}...`,

        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

      };

  

      setEvidenceGallery((prev) => [newItem, ...prev.slice(0, 8)]);

      setNewImageUrl(resolvedUrl);

      setNewImageCaption(newItem.caption);

      setSavedSuccessToast("Editorial visual rendered & added to gallery.");

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

      setNewTitle(draftToEdit.title.replace(/^Draft:\\s*/i, ""));

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

    if (!newContent.trim()) {

      setFormValidationError("Please write dispatch copy before publishing.");

      return;

    }

  

    let parsedCoords: [number, number] | undefined = undefined;

    if (newCoordinates.includes(",")) {

      const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));

      if (!isNaN(parts[0]) && !isNaN(parts[1])) {

        parsedCoords = [parts[0], parts[1]];

      }

    }

  

    const pressieItem: Dispatch = {

      id: `disp-${Date.now()}`,

      title: newTitle.trim(),

      category: newCategory,

      author: pressPass.name,

      callsign: pressPass.callsign,

      bureau: pressPass.bureau,

      timestamp: "Just now",

      location: newLocation.trim() || "Midwest Corridor",

      coordinates: parsedCoords,

      content: newContent.trim(),

      imageUrl: newImageUrl || undefined,

      imageCaption: newImageCaption || undefined,

      isPressRoll: false

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

    setSavedSuccessToast("Dispatch published to Live Feed!");

    setActiveTab("wire");

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

    const shareUrl = `${window.location.origin}/#dispatch-${disp.id}`;

    const text = `${disp.title}\\n[${disp.location}] By ${disp.author} (@${disp.callsign})\\n${shareUrl}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {

      navigator.clipboard.writeText(text).catch(() => {});

    }

    setSavedSuccessToast("Story link & dateline copied to clipboard.");

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

  

            {/* DEDICATED BUTTON: CREATE PRESSIE (EXACTLY WIRED TO OPEN THE PRESSIE BUILDER!) */}

            <button

              onClick={() => openCreatePressie()}

              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition font-bold shadow-xs hover:border-emerald-400 flex-shrink-0 cursor-pointer ml-1"

              title="Open Pressie Builder (New Field Dispatch / Press Roll)"

            >

              <Send className="h-3.5 w-3.5" />

              <span>Dispatch Pressie</span>

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

            {dispatches[0] && (

              <article className={`p-6 sm:p-8 rounded-xl border transition ${cardThemeClass}`}>

                {dispatches[0].imageUrl && (

                  <div

                    onClick={() => setSelectedStory(dispatches[0])}

                    className="mb-5 rounded-lg overflow-hidden border border-zinc-800 shadow-md relative aspect-video max-h-[360px] bg-black cursor-pointer group"

                  >

                    <img

                      src={dispatches[0].imageUrl}

                      alt={dispatches[0].title}

                      className="w-full h-full object-cover transition duration-300 group-hover:scale-102"

                    />

                    {dispatches[0].imageCaption && (

                      <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-xs p-2.5 font-mono text-[11px] text-zinc-300 border-t border-zinc-800">

                        <span className="text-amber-400 font-bold">EVIDENCE STILL:</span> {dispatches[0].imageCaption}

                      </div>

                    )}

                  </div>

                )}

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs mb-3">

                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold uppercase tracking-wider text-[10px]">

                    {dispatches[0].category}

                  </span>

                  <span className={subTextThemeClass}>•</span>

                  <span className="font-bold flex items-center gap-1 text-zinc-400">

                    <MapPin className="h-3 w-3 text-amber-500" /> {dispatches[0].location}

                  </span>

                  <span className={subTextThemeClass}>•</span>

                  <span className={subTextThemeClass}>{dispatches[0].timestamp}</span>

                </div>

  

                <h2

                  onClick={() => setSelectedStory(dispatches[0])}

                  className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-4 hover:text-amber-500 transition cursor-pointer"

                  title="Click to read full dispatch"

                >

                  {dispatches[0].title}

                </h2>

  

                <p className={`text-sm sm:text-base leading-relaxed mb-6 font-serif max-w-4xl ${

                  isDark ? "text-zinc-300" : "text-zinc-700"

                }`}>

                  {dispatches[0].content}

                </p>

  

                <div className={`pt-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${subTextThemeClass}`}>

                  <div className="flex items-center gap-2">

                    <span className="font-bold text-zinc-300">Byline:</span>

                    <span>{dispatches[0].author} (@{dispatches[0].callsign})</span>

                  </div>

                  <div className="flex items-center gap-3">

                    <button

                      onClick={() => toggleBookmark(dispatches[0].id)}

                      className={`hover:text-amber-500 transition flex items-center gap-1 cursor-pointer ${

                        bookmarks.includes(dispatches[0].id) ? "text-amber-500 font-bold" : ""

                      }`}

                    >

                      <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(dispatches[0].id) ? "fill-amber-500 text-amber-500" : ""}`} />

                      <span>{bookmarks.includes(dispatches[0].id) ? "Saved" : "Save"}</span>

                    </button>

                    <button

                      onClick={() => handleShareStory(dispatches[0])}

                      className="hover:text-amber-500 transition flex items-center gap-1 cursor-pointer"

                    >

                      <Share2 className="h-3.5 w-3.5" /> Share

                    </button>

                    <button

                      onClick={() => setSelectedStory(dispatches[0])}

                      className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500/20 font-bold transition cursor-pointer flex items-center gap-1"

                    >

                      <Eye className="h-3.5 w-3.5" /> Read

                    </button>

                  </div>

                </div>

              </article>

            )}

  

            {/* Grid of Secondary Dispatches */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {dispatches.slice(1).map((disp) => (

                <article

                  key={disp.id}

                  className={`p-5 rounded-lg border flex flex-col justify-between transition hover:border-amber-500/50 ${cardThemeClass}`}

                >

                  <div>

                    {disp.imageUrl && (

                      <div

                        onClick={() => setSelectedStory(disp)}

                        className="mb-3 rounded overflow-hidden border border-zinc-800 aspect-video max-h-[140px] bg-black cursor-pointer group"

                      >

                        <img src={disp.imageUrl} alt={disp.title} className="w-full h-full object-cover transition group-hover:scale-105" />

                      </div>

                    )}

                    <div className="flex items-center justify-between text-[11px] font-mono mb-2">

                      <span className="text-amber-500 font-semibold">{disp.category}</span>

                      <span className={subTextThemeClass}>{disp.timestamp}</span>

                    </div>

                    <h3

                      onClick={() => setSelectedStory(disp)}

                      className="font-mono text-base font-bold leading-snug mb-2.5 hover:text-amber-500 transition cursor-pointer line-clamp-2"

                      title="Click to read full dispatch"

                    >

                      {disp.title}

                    </h3>

                    <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>

                      {disp.content}

                    </p>

                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between text-[11px] font-mono ${borderThemeClass} ${subTextThemeClass}`}>

                    <span>{disp.location}</span>

                    <div className="flex items-center gap-2">

                      <button

                        onClick={() => toggleBookmark(disp.id)}

                        className={`hover:text-amber-500 p-1 rounded transition cursor-pointer ${

                          bookmarks.includes(disp.id) ? "text-amber-500" : ""

                        }`}

                        title="Bookmark dispatch"

                      >

                        <Bookmark className={`h-3.5 w-3.5 ${bookmarks.includes(disp.id) ? "fill-amber-500 text-amber-500" : ""}`} />

                      </button>

                      <button

                        onClick={() => setSelectedStory(disp)}

                        className="hover:text-amber-400 p-1 rounded transition cursor-pointer"

                        title="Read full story"

                      >

                        <Eye className="h-3.5 w-3.5" />

                      </button>

                    </div>

                  </div>

                </article>

              ))}

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

                    <div className="space-y-1.5 flex-1">

                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">

                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 font-bold text-[10px]">

                          {d.category}

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

                        <button

                          type="button"

                          onClick={(e) => {

                            e.stopPropagation();

                            handleShareStory(d);

                          }}

                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition"

                          title="Share link"

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

  

              {/* 2. Category & Location / Beat Anchor (matching Image 2) */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div>

                  <label className={`block font-bold mb-1 ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>

                    Category

                  </label>

                  <select

                    value={newCategory}

                    onChange={(e) => setNewCategory(e.target.value)}

                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none transition cursor-pointer ${inputThemeClass}`}

                  >

                    <option value="Field Dispatch">Field Dispatch</option>

                    <option value="Breaking Wire">Breaking Wire</option>

                    <option value="Infrastructure">Infrastructure</option>

                    <option value="Civic Wire">Civic Wire</option>

                    <option value="Transit">Transit</option>

                    <option value="Telecom">Telecom</option>

                    <option value="Editorial">Editorial</option>

                  </select>

                </div>

  

                <div>

                  <label className={`block font-bold mb-1 ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>

                    Location / Beat Anchor

                  </label>

                  <input

                    type="text"

                    placeholder="e.g. Danville, IL"

                    value={newLocation}

                    onChange={(e) => setNewLocation(e.target.value)}

                    className={`w-full rounded px-3 py-2 text-xs focus:outline-none transition ${inputThemeClass}`}

                  />

                </div>

              </div>

  

              {/* Regional Corridor Quick-Snap Presets */}

              <div className="pt-0.5">

                <div className="flex flex-wrap gap-1">

                  {CORRIDOR_DATELINES.slice(0, 5).map((loc) => (

                    <button

                      key={loc}

                      type="button"

                      onClick={() => {

                        setNewLocation(loc);

                        if (loc.includes("Danville")) setNewCoordinates("-87.6298, 40.1245");

                        else if (loc.includes("Lafayette")) setNewCoordinates("-86.8753, 40.4173");

                        else if (loc.includes("Covington")) setNewCoordinates("-87.3928, 40.1406");

                        else if (loc.includes("Catlin")) setNewCoordinates("-87.7056, 40.0664");

                        else if (loc.includes("Champaign")) setNewCoordinates("-88.2434, 40.1164");

                      }}

                      className={`px-2 py-0.5 rounded text-[10px] border transition cursor-pointer ${

                        newLocation === loc

                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold"

                          : "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 border-zinc-700"

                      }`}

                    >

                      {loc}

                    </button>

                  ))}

                </div>

              </div>

  

              {/* 3. ENHANCEMENT: AI Photojournalism Prompt Box */}

              <div className={`p-3.5 rounded-lg border space-y-2.5 ${subCardThemeClass}`}>

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-1.5 font-bold text-amber-500">

                    <Sparkles className="h-4 w-4" />

                    <span>AI Photojournalism Visual Generator</span>

                  </div>

                  <span className={`text-[10px] ${subTextThemeClass}`}>

                    Documentary 35mm Reuters standard

                  </span>

                </div>

  

                <div className="flex gap-2">

                  <input

                    type="text"

                    placeholder="Visual framing brief (e.g. Substation telemetry array along rural rail lines)..."

                    value={visualPrompt}

                    onChange={(e) => setVisualPrompt(e.target.value)}

                    onKeyDown={(e) => {

                      if (e.key === "Enter") {

                        e.preventDefault();

                        generateVisual();

                      }

                    }}

                    className={`flex-1 rounded px-3 py-1.5 text-xs focus:outline-none ${inputThemeClass}`}

                  />

                  <button

                    type="button"

                    onClick={() => generateVisual()}

                    disabled={isGeneratingImage}

                    className="px-3.5 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 flex-shrink-0"

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

  

                <div className="flex items-center justify-between text-[11px]">

                  <div className="flex items-center gap-1 overflow-x-auto">

                    <span className={subTextThemeClass}>Presets:</span>

                    {["Rail Corridor", "Power Grid", "Dark Fiber", "River Basin"].map((preset) => (

                      <button

                        key={preset}

                        type="button"

                        onClick={() => {

                          setVisualPrompt(preset);

                          generateVisual(preset);

                        }}

                        className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] border border-zinc-700 cursor-pointer"

                      >

                        {preset}

                      </button>

                    ))}

                  </div>

  

                  <button

                    type="button"

                    onClick={autoDraftVisualBrief}

                    disabled={isGeneratingImage || !newTitle.trim()}

                    className="text-amber-500 hover:underline flex items-center gap-1 font-bold cursor-pointer disabled:opacity-40"

                  >

                    <Sparkles className="h-3 w-3" />

                    <span>Prompt from Title</span>

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

                                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 text-[9px] font-bold flex items-center gap-1">

                                  <Check className="h-2.5 w-2.5" /> Active Cover

                                </div>

                              ) : (

                                <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 text-zinc-300 text-[8px] opacity-0 group-hover:opacity-100 transition">

                                  Set Cover

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

                    {newContent.length} chars • {newContent.trim() ? newContent.trim().split(/\\s+/).length : 0} words

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

                  <label className="block text-zinc-400 mb-1">Bureau / Outlet Affiliation</label>

                  <input

                    type="text"

                    value={editPassForm.bureau}

                    onChange={(e) => setEditPassForm({ ...editPassForm, bureau: e.target.value })}

                    className={`w-full rounded px-3 py-2 ${inputThemeClass}`}

                  />

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

      {/* 7. INTERACTIVE STORY DETAIL / READER MODAL                                 */}

      {/* ========================================================================= */}

      {selectedStory && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">

          <div className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden transition ${

            isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"

          }`}>

            <div className={`flex-shrink-0 p-4 border-b flex items-center justify-between ${borderThemeClass}`}>

              <div className="flex items-center gap-2 font-mono text-xs">

                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase">

                  {selectedStory.category}

                </span>

                <span className="text-zinc-400">[{selectedStory.location}]</span>

              </div>

              <button

                onClick={() => setSelectedStory(null)}

                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"

              >

                <X className="h-5 w-5" />

              </button>

            </div>

  

            <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono">

              {selectedStory.imageUrl && (

                <div className="rounded-lg overflow-hidden border border-zinc-800 aspect-video max-h-[300px] bg-black">

                  <img src={selectedStory.imageUrl} alt={selectedStory.title} className="w-full h-full object-cover" />

                  {selectedStory.imageCaption && (

                    <div className="bg-black/80 p-2 text-[11px] text-zinc-300 border-t border-zinc-800">

                      {selectedStory.imageCaption}

                    </div>

                  )}

                </div>

              )}

  

              <h2 className="text-xl sm:text-2xl font-black font-mono leading-snug">{selectedStory.title}</h2>

              <div className={`text-xs pb-3 border-b flex items-center justify-between ${borderThemeClass} ${subTextThemeClass}`}>

                <span>By {selectedStory.author} (@{selectedStory.callsign}) • {selectedStory.bureau}</span>

                <span>{selectedStory.timestamp}</span>

              </div>

  

              <div className="text-sm leading-relaxed font-serif whitespace-pre-wrap pt-2">

                {selectedStory.content}

              </div>

  

              {selectedStory.coordinates && (

                <div className={`p-3 rounded border text-xs flex items-center gap-2 ${subCardThemeClass}`}>

                  <MapPin className="h-4 w-4 text-amber-500" />

                  <span>Telemetry Anchor: <strong>{selectedStory.coordinates[0]}, {selectedStory.coordinates[1]}</strong> ({selectedStory.location})</span>

                </div>

              )}

            </div>

  

            <div className={`flex-shrink-0 p-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${

              isDark ? "bg-zinc-950/80" : "bg-zinc-50"

            }`}>

              <div className="flex items-center gap-2">

                <button

                  type="button"

                  onClick={() => toggleBookmark(selectedStory.id)}

                  className={`px-3 py-1.5 rounded border transition flex items-center gap-1 cursor-pointer ${

                    bookmarks.includes(selectedStory.id) ? "bg-amber-500 text-zinc-950 font-bold border-amber-500" : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"

                  }`}

                >

                  <Bookmark className="h-3.5 w-3.5" />

                  <span>{bookmarks.includes(selectedStory.id) ? "Saved" : "Bookmark"}</span>

                </button>

                <button

                  type="button"

                  onClick={() => handleShareStory(selectedStory)}

                  className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"

                >

                  <Share2 className="h-3.5 w-3.5" />

                  <span>Share</span>

                </button>

              </div>

  

              <button

                type="button"

                onClick={() => setSelectedStory(null)}

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

      {/* 9. WORKSTATION SETTINGS DRAWER                                             */}

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

  