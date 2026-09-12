// FieldPress Core Data Models & Schemas

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
  editorialStatus?: "staged" | "submitted" | "reviewed" | "verified" | "lead" | "archived";
}

export interface ClassifiedItem {
  id: string;
  tag: string;
  tagColor: "amber" | "emerald" | "cyan" | "rose";
  title: string;
  details: string;
  contact: string;
  timestamp: string;
}

export interface PopularBeatPhoto {
  id: string;
  label: string;
  category: string;
  url: string;
  caption: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  source: "ai" | "upload" | "url";
  caption?: string;
  timestamp: string;
}

export type EditionFormat = "broadsheet" | "tactical" | "photo" | "civic";
export type ActiveTab = "edition" | "wire" | "map" | "classifieds" | "desk";

export interface BylineAuthor {
  name: string;
  callsign: string;
  badgeId: string;
  bureau: string;
}

export interface TelemetryData {
  location: string;
  coordinates?: [number, number];
  timestamp: string;
}

export interface DispatchSubmission {
  id: string;
  title: string;
  category: string;
  content: string;
  byline: BylineAuthor;
  telemetry: TelemetryData;
  imageUrl?: string;
  imageCaption?: string;
  signature?: string;
  status: "staged" | "submitted";
}

export interface EditorialReview {
  dispatchId: string;
  editorBadgeId: string;
  status: "staged" | "reviewed" | "verified" | "lead" | "archived";
  editorNotes?: string;
  factCheckPassed: boolean;
  reviewedAt: string;
}

export const POPULAR_BEAT_PHOTOS: PopularBeatPhoto[] = [
  {
    id: "pop-1",
    label: "Autonomous Grid Substation",
    category: "Infrastructure",
    url: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
    caption: "Automated distribution node and telemetry array along the regional corridor."
  },
  {
    id: "pop-2",
    label: "Rail Freight & Signaling",
    category: "Transit",
    url: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
    caption: "Active freight rail corridor and automated telemetry junction."
  },
  {
    id: "pop-3",
    label: "River Basin Watershed Topo",
    category: "Civic Wire",
    url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
    caption: "Digitized watershed survey cartography and environmental monitoring."
  },
  {
    id: "pop-4",
    label: "Optical Fiber Splice Vault",
    category: "Telecom",
    url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    caption: "Field optical splice vault installation connecting rural dark fiber loop."
  },
  {
    id: "pop-5",
    label: "Electric Transit Shuttle",
    category: "Transit",
    url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
    caption: "Battery-electric commuter shuttle pilot along State Route 63."
  },
  {
    id: "pop-6",
    label: "Nocturnal Beat & Field Mesh",
    category: "Field Notes",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    caption: "Overnight field telemetry monitoring and packet mesh station."
  }
];

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
    isLead: true,
    editorialStatus: "lead"
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
    imageCaption: "Digitized watershed survey cartography from Tippecanoe basin.",
    editorialStatus: "verified"
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
    content: "Early metrics from the 100-day freight and commuter corridor pilot show a 68% drop in fleet operating expenses, paving the way for expanded multi-county commuter routes next spring connecting rural factory hubs.",
    imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Battery-electric transit shuttle operating along the Route 63 corridor test run.",
    editorialStatus: "verified"
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
    content: "A volunteer-backed telecommunications collective has completed the final segment of a 40-mile dark fiber loop connecting municipal emergency shelters and public library networks with gigabit uplinks.",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Field optical splice vault installation connecting the Vermilion dark fiber loop.",
    editorialStatus: "verified"
  },
  {
    id: "d-5",
    title: "Nocturnal Beat: Autonomous Micro-Grid Telemetry Logs Clean Transition Along Central Rail",
    category: "Field Notes",
    author: "Victor Birkle",
    callsign: "ras.ip",
    bureau: "Midwest Corridor",
    timestamp: "6h ago",
    location: "Danville Junction Spur",
    coordinates: [-87.6189, 40.1325],
    content: "Night shift monitoring confirmed seamless automated battery peak-shaving as overnight freight operations peaked. Zero packet loss recorded on the 915MHz LoRa mesh telemetry link.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "Night field telemetry monitoring setup along the rail spur.",
    editorialStatus: "verified"
  }
];

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

export const CORRIDOR_DATELINES = [
  "Danville, IL • Vermilion Line",
  "Danville Junction Spur",
  "Champaign-Urbana Transit Line",
  "Lafayette, IN • Tippecanoe Desk",
  "Covington, IN • Wabash Corridor",
  "Catlin, IL • Fiber Loop Beat",
  "Evansville Crossing Line",
  "Chicago Loop Core"
];
