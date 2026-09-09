import React, { useState, useEffect } from "react";
import { Plus, Tag, MessageSquare, Briefcase, Camera, Repeat, Home, Bell } from "lucide-react";
import { useLocation } from "wouter";
import { ClassifiedsStudioModal } from "../components/ClassifiedsStudioModal";

export interface ClassifiedListing {
  id: string;
  title: string;
  category: "gigs" | "gear" | "barter" | "space" | "notices";
  corridor_sector: string;
  price_cents: number;
  is_trade: boolean;
  description: string;
  contact_handle: string;
  photo_url?: string;
  created_at: string;
}

const CATEGORIES = [
  { id: "all", label: "All Classifieds", icon: "📰" },
  { id: "gigs", label: "Help Wanted & Gigs", icon: "💼" },
  { id: "gear", label: "Field Gear & Hardware", icon: "📸" },
  { id: "barter", label: "Buy, Sell & Barter", icon: "🤝" },
  { id: "space", label: "Desks & Space", icon: "🏛️" },
  { id: "notices", label: "Community Notices", icon: "📢" },
] as const;

export const ClassifiedsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [listings, setListings] = useState<ClassifiedListing[]>([
    {
      id: "cl-1",
      title: "Field Driver & Fixer Needed: Vermilion Rail Stakeout",
      category: "gigs",
      corridor_sector: "Danville Junction Spur",
      price_cents: 15000,
      is_trade: false,
      description: "Seeking local fixer with 4WD vehicle for half-day access to rail spur rights-of-way. Gas provided plus day rate.",
      contact_handle: "ras.ip",
      created_at: "Today",
    },
    {
      id: "cl-2",
      title: "RTL-SDR V4 Radio Tuner + Dipole Antenna Kit (Like New)",
      category: "gear",
      corridor_sector: "Champaign-Urbana Transit Line",
      price_cents: 4500,
      is_trade: true,
      description: "Barely used software-defined radio receiver. Open to cash or trade for handheld field battery pack.",
      contact_handle: "glitterpop",
      created_at: "Yesterday",
    },
  ]);

  const fetchClassifieds = async () => {
    try {
      const res = await fetch(`/api/classifieds?category=${activeCategory}`);
      if (res.ok) {
        const data = await res.json();
        if (data.listings && data.listings.length > 0) {
          setListings(data.listings);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchClassifieds();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground font-mono pt-20 sm:pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b-4 border-double border-border pb-4 text-center">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest border-b border-border pb-1 mb-2">
            <span>PEER-TO-PEER CORRIDOR MARKET</span>
            <span>ZERO ALGORITHM • NO TRACKING • DIRECT COHORT DMs</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif uppercase tracking-tight text-foreground">
            THE FIELDPRESS CLASSIFIEDS
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-serif italic max-w-xl mx-auto">
            Help wanted, gear exchange, studio desks, and local notices for independent newsrooms and communities.
          </p>
        </header>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl border-2 border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsPostModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider shadow-sm flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Place a Classified Ad</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(item => {
            const priceDisplay = item.price_cents > 0 ? `$${(item.price_cents / 100).toFixed(0)}` : item.is_trade ? "TRADE / BARTER" : "FREE / INQUIRE";
            return (
              <article
                key={item.id}
                className="p-5 rounded-xl border-2 border-border bg-card flex flex-col justify-between space-y-3 shadow-sm hover:border-primary/50 transition relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-border pb-2 text-[10px] uppercase font-bold text-muted-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">📍 {item.corridor_sector}</span>
                    <span className="px-2 py-0.5 rounded border border-border bg-muted/60 text-foreground font-black">
                      {priceDisplay}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-serif text-foreground mt-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-foreground/80 font-serif leading-relaxed mt-2 line-clamp-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <div className="text-[10px] text-muted-foreground">
                    By <strong className="text-foreground">@{item.contact_handle}</strong> • {item.created_at}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/wire")}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[11px] font-bold"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>DM Cohort</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <ClassifiedsStudioModal
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          onListingCreated={() => fetchClassifieds()}
        />
      </div>
    </div>
  );
};

export default ClassifiedsPage;
