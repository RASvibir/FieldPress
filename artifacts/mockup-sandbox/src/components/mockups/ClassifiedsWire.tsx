import React, { useState } from "react";
import {
  Tag,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  X,
  Filter,
  CheckCircle2,
} from "lucide-react";

export interface ClassifiedListing {
  id: string;
  category: "Gear & Tools" | "Gigs & Collabs" | "Community & Trades" | "Pop-ups";
  title: string;
  priceOrTrade: string;
  location: string;
  timestamp: string;
  author: string;
  body: string;
  badge?: string;
  imageUrl?: string;
}

const SAMPLE_LISTINGS: ClassifiedListing[] = [
  {
    id: "cl-1",
    category: "Gear & Tools",
    title: "Vintage Fender Bass Amp (Working Condition)",
    priceOrTrade: "$220 Cash / Trade for Synth",
    location: "Danville, IL",
    timestamp: "2h ago",
    author: "DanvilleAudio",
    badge: "Verified Fieldy",
    body: "Solid state vintage bass amplifier from local rehearsal hall. Tested last night, clean channels. Local pickup only downtown.",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "cl-2",
    category: "Gigs & Collabs",
    title: "Field Audio Engineer Seeking Podcast Co-Host",
    priceOrTrade: "Collaboration / Rev-Share",
    location: "Indianapolis, IN",
    timestamp: "4h ago",
    author: "ElenaPress",
    badge: "Edition Curator",
    body: "Setting up a weekly 30-minute street audio series covering independent music hubs and rail history. Looking for a passionate local speaker.",
  },
  {
    id: "cl-3",
    category: "Community & Trades",
    title: "Sunday Vinyl & Print Swap Meet",
    priceOrTrade: "Free Admission / Open Trade",
    location: "Evansville, IN",
    timestamp: "1d ago",
    author: "RiverfrontCollector",
    body: "Bring your old crates, zines, and field prints to the south riverfront pavilion this Sunday 11am-3pm. Tables provided.",
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80",
  },
];

export const ClassifiedsWire: React.FC = () => {
  const [listings, setListings] = useState<ClassifiedListing[]>(SAMPLE_LISTINGS);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [inquiryListing, setInquiryListing] = useState<ClassifiedListing | null>(null);
  const [inquiryText, setInquiryText] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  const categories = ["All", "Gear & Tools", "Gigs & Collabs", "Community & Trades"];

  const filteredListings =
    activeCategory === "All"
      ? listings
      : listings.filter((item) => item.category === activeCategory);

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquiryText("");
      setInquiryListing(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-stone-100/70 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 antialiased p-4 sm:p-6 transition-colors">
      <div className="mx-auto max-w-2xl">
        {/* Newspaper Back Page Header */}
        <header className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-3 mb-4">
          <div className="flex items-center justify-between text-2xs font-mono uppercase text-zinc-500 mb-1">
            <span>THE BACK PAGE · VOL. 4</span>
            <span>COMMUNITY BULLETIN & TRADES</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-tight">
              Classified Wire
            </h1>
            <span className="rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-2 py-0.5 text-xs font-mono font-bold uppercase">
              Notice Board
            </span>
          </div>
        </header>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3.5 py-1 text-xs font-mono transition shrink-0 ${
                activeCategory === cat
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Structured Listing Feed */}
        <div className="space-y-3.5">
          {filteredListings.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-4 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              {/* Category & Price/Trade Bar */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-2xs font-mono font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                  {item.category}
                </span>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {item.priceOrTrade}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif text-base sm:text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50 mb-1.5">
                {item.title}
              </h3>

              {/* Body */}
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mb-3">
                {item.body}
              </p>

              {/* Optional Photo */}
              {item.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-44 w-full object-cover"
                  />
                </div>
              )}

              {/* Footer Meta & Inquiry CTA */}
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <div className="flex items-center gap-3 text-2xs font-mono text-zinc-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-500" />
                    <span>{item.location}</span>
                  </div>
                  <span>·</span>
                  <span>@{item.author}</span>
                </div>

                <button
                  onClick={() => setInquiryListing(item)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Inquiry Modal */}
        {inquiryListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3">
                <div>
                  <span className="text-2xs font-mono uppercase text-amber-500 font-bold">
                    Classified Inquiry Relay
                  </span>
                  <h4 className="font-serif text-sm font-bold truncate max-w-xs">
                    Re: {inquiryListing.title}
                  </h4>
                </div>
                <button
                  onClick={() => setInquiryListing(null)}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {inquirySent ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold">Message Relayed to @{inquiryListing.author}</p>
                  <p className="text-xs text-zinc-500">Connected through your secure Press Pass.</p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-3">
                  <textarea
                    autoFocus
                    required
                    rows={3}
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder={`Write a direct note to @${inquiryListing.author}...`}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent p-3 text-xs focus:outline-hidden"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-2xs font-mono text-zinc-400">
                      Off-platform links filtered
                    </span>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassifiedsWire;
