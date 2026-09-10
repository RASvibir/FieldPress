import React, { useState } from 'react';
import { 
  Sparkles, Camera, Plus, Eye, Edit3, Image as ImageIcon, 
  Send, Wand2, MapPin, Users, Lightbulb, Check, X, ShieldAlert, Settings, ChevronDown 
} from 'lucide-react';
import { PressieEdition, PressieArticleRenderer } from './PressieEditions';
import { AnonymousFieldyToggle } from './AnonymousFieldyToggle';
import { ForkPolicySelector, ForkPolicy } from './PressieOwnershipBadge';
import { scanPressieDraft, autoRedactSensitiveData } from '../lib/auditScanner';

export type PhotoArrangement = 'single' | 'split' | 'grid';

const BATCH_SIZES: (1 | 2 | 3)[] = [1, 2, 3];
const PHOTO_LAYOUTS = ['single', 'split', 'grid'] as const;


export interface PressieBuilderStudioProps {
  currentUserHandle: string;
  initialStory?: any;
  mode?: 'create' | 'edit' | 'fork';
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  onStoryPublished: () => void;
}

export const PressieBuilderStudio: React.FC<PressieBuilderStudioProps> = ({
  currentUserHandle,
  initialStory,
  mode = 'create',
  isOpenModal = false,
  onCloseModal,
  onStoryPublished,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialStory?.tags || []);

  // Pressy'O: Celtic News Action Liaison State
  const [showPressyAssistant, setShowPressyAssistant] = useState(false);
  const [pressyCategory, setPressyCategory] = useState<'headlines' | 'ledes' | 'angles'>('headlines');
  const [pressySuggestions, setPressySuggestions] = useState<{ label: string; text: string }[]>([
    { label: 'High Voltage', text: 'Sparks on the Spur: Night Shift Halts Unscheduled Switch at Junction' },
    { label: 'Grassroots Grit', text: 'Beyond the Wire: What the Ground Inspectors Won\'t Put in the Formal Ledger' },
    { label: 'Breaking Alert', text: 'Rail Crossing Hold-Up: Vermilion Switch Crew Reports Unannounced Stoppage' },
  ]);

  const askPressyO = (category: 'headlines' | 'ledes' | 'angles') => {
    setPressyCategory(category);
    const base = (title + ' ' + note).trim();

    if (category === 'headlines') {
      if (!base) {
        setPressySuggestions([
          { label: 'High Voltage', text: 'Sparks on the Spur: Night Shift Halts Unscheduled Switch at Junction' },
          { label: 'Grassroots Grit', text: 'Beyond the Wire: What the Ground Inspectors Won\'t Put in the Formal Ledger' },
          { label: 'Breaking Alert', text: 'Rail Crossing Hold-Up: Vermilion Switch Crew Reports Unannounced Stoppage' },
        ]);
      } else {
        setPressySuggestions([
          { label: 'The Hard Scoop', text: `Aye, Break It Clean: "${title.toUpperCase() || 'UNTITLED'}" — Verified Along the Corridor` },
          { label: 'The Human Angle', text: `Voices From the Ground: How Local Field Observers Are Tracking ${title || 'Today\'s Events'}` },
          { label: 'Investigative Focus', text: `Under the Strobe: What the Physical Evidence Tells Us About ${title || 'This Sector'}` },
        ]);
      }
    } else if (category === 'ledes') {
      const sectorPrefix = location ? location.split('•')[0].trim().toUpperCase() : 'MIDWEST DESK';
      setPressySuggestions([
        {
          label: 'Classic Wire Lede',
          text: `${sectorPrefix} — Ground monitors confirmed an evolving situation early this shift, as local operators reported irregular activities near the rights-of-way that contradict official dispatch schedules.`,
        },
        {
          label: 'Direct Action Lede',
          text: `${sectorPrefix} — When the radio chatter abruptly cut off this morning, fieldies on the ground had already documented the switch hold-up with timestamped telemetry.`,
        },
      ]);
    } else {
      setPressySuggestions([
        { label: 'Follow the Wire', text: 'Who authorized the delay on the municipal frequency before the shift change?' },
        { label: 'Check the Hardware', text: 'Do the serial tags on the switch relay match the regional inspection certificates?' },
        { label: 'Corroborate the Crew', text: 'Can a second verified scout capture photographic evidence of the signal lights?' },
      ]);
    }
  };


  // Core Content State
  const [title, setTitle] = useState(initialStory?.title || '');
  const [note, setNote] = useState(() => {
    return initialStory?.items?.find((i: any) => i.type === 'text' || !i.type)?.content || '';
  });
  const [edition, setEdition] = useState<PressieEdition>(initialStory?.edition || 'tactical');
  const [location, setLocation] = useState('Danville Junction Spur • Vermilion Line');
  const [photos, setPhotos] = useState<string[]>(() => {
    return initialStory?.items?.filter((i: any) => i.type === 'photo' || i.content?.startsWith('data:image') || i.content?.startsWith('http'))?.map((i: any) => i.content) || [];
  });
  const [photoArrangement, setPhotoArrangement] = useState<PhotoArrangement>('single');
  const [forkPolicy, setForkPolicy] = useState<ForkPolicy>('open');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [seekingCollab, setSeekingCollab] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Pressy'o AI Assistant State
  
  const [pressyIdeas, setPressyIdeas] = useState<string[]>([]);

  // AI Image Generator State (13/day Chicago midnight reset)
  const DAILY_CAP = 13;
  const getChicagoDateKey = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  };

  const [todayGensUsed, setTodayGensUsed] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const today = getChicagoDateKey();
      return parseInt(localStorage.getItem(`fp_ai_gens_${today}`) || '0', 10);
    }
    return 0;
  });

  const [showAiGen, setShowAiGen] = useState(false);
  const [aiGenPrompt, setAiGenPrompt] = useState('');
  const [aiBatchSize, setAiBatchSize] = useState<1 | 2 | 3>(1);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiCandidates, setAiCandidates] = useState<string[]>([]);

  // Pre-Flight Audit
  const audit = scanPressieDraft(title, note);

  // 1. Photo Capture / Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotos(prev => [...prev, result]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // 2. Pressy'o AI Idea & Lede Generator
  
  // 3. AI Scene Generator (1-3 gens, 13/day Chicago reset)
  const handleGenerateAiImages = async () => {
    const prompt = aiGenPrompt.trim() || title.trim();
    if (!prompt) return;

    const remaining = DAILY_CAP - todayGensUsed;
    if (remaining <= 0) {
      alert('Daily image generation cap (13/13) reached. Resets at 12:00 AM Chicago time.');
      return;
    }
    const count = Math.min(aiBatchSize, remaining);

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/stories/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count, edition }),
      });
      const data = await res.json();
      
    // Pre-warm generated images so browser downloads pixels before closing loader
    const prewarmImage = (srcUrl: string) => {
      return new Promise<string>((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => resolve(srcUrl), 28000); // 28s timeout allowance
        img.onload = () => { clearTimeout(timer); resolve(srcUrl); };
        img.onerror = () => { clearTimeout(timer); resolve(srcUrl); };
        img.src = srcUrl;
      });
    };

      if (res.ok && data.images) {
        await Promise.all(data.images.map(prewarmImage));
        setAiCandidates(data.images);
        const today = getChicagoDateKey();
        const nextUsed = todayGensUsed + count;
        setTodayGensUsed(nextUsed);
        localStorage.setItem(`fp_ai_gens_${today}`, String(nextUsed));
      }
    } catch {
      alert('Error generating images');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // 4. Publish Submission
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsPublishing(true);

    const isEdit = mode === 'edit' && initialStory?.id;
    const url = isEdit ? `/api/stories/${initialStory.id}` : '/api/stories';
    const method = isEdit ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          lane: 'feed',
          content: note.trim(),
          note: note.trim(),
          photos,
          photoArrangement,
          edition,
          location,
          forkPolicy,
          isAnonymous,
          seekingCollab,
          tags: selectedTags,
        }),
      });

      if (res.ok) {
        if (!isEdit) {
          setTitle('');
          setNote('');
          setPhotos([]);
        }
        onStoryPublished();
        if (onCloseModal) onCloseModal();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save pressie');
      }
    } catch {
      alert('Network error saving pressie');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <form onSubmit={handlePublish} className="p-6 rounded-2xl border-2 border-border bg-[#fdfcf9] dark:bg-zinc-950 shadow-md space-y-5 font-mono text-xs text-foreground">
      {/* Studio Header & View Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="font-bold text-sm uppercase text-foreground font-serif">
            {mode === 'edit' ? 'Edit Verified Pressie Studio' : mode === 'fork' ? 'Fork & Corroborate Studio' : 'Pressie Builder Studio'}
          </h3>
          {isOpenModal && onCloseModal && (
            <button type="button" onClick={onCloseModal} className="p-1 rounded-lg hover:bg-muted text-muted-foreground ml-auto mr-2">
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="text-[10px] text-muted-foreground hidden sm:inline">• Live Verified Wire</span>
        </div>

        {/* Live Preview Toggle */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
              !isPreviewMode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 className="h-3 w-3" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewMode(true)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
              isPreviewMode ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Live Print Preview</span>
          </button>
        </div>
      </div>

      {!isPreviewMode ? (
        <>
          {/* Headline & Pressy'o AI Co-Pilot Toolbar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">
                DISPATCH HEADLINE (EDITORIAL SERIF)
              </label>
              <button
                type="button"
                onClick={() => {
                  askPressyO('headlines');
                  setShowPressyAssistant(!showPressyAssistant);
                }}
                className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center space-x-1"
              >
                <Lightbulb className="h-3 w-3 text-amber-500" />
                <span>Pressy'O — News Action Liaison</span>
              </button>
            </div>

            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Headline or breaking news hook (e.g. Danville switch delay confirmed)..."
              className="w-full bg-background border-2 border-border/80 rounded-xl p-3 text-foreground text-base font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary font-serif shadow-sm"
            />

            {/* Pressy'o Ideas Suggestions Dropdown */}
            
            {/* Pressy'O: Modern Celtic News Action Liaison Drawer */}
            {showPressyAssistant && (
              <div className="p-4 mt-2 rounded-2xl border-2 border-amber-500/50 bg-[#fdfcf5] dark:bg-zinc-900/90 shadow-lg space-y-3.5">
                {/* Greeting & Persona Intro */}
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-start space-x-2.5">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-lg font-black text-amber-600 dark:text-amber-400 shrink-0">
                      ⚡
                    </div>
                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center space-x-1.5">
                        <span className="font-serif">Pressy'O</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500 text-black font-mono font-black uppercase">
                          News Action Liaison
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-serif italic">
                        "Aye, scout! The wire’s hummin' and the ink is eager. Whisper me what ye saw on the ground, and we'll forge a dispatch sharp enough to split flint."
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPressyAssistant(false)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground"
                  >
                    ✕
                  </button>
                </div>

                {/* Liaison Action Selectors */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => askPressyO('headlines')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                      pressyCategory === 'headlines'
                        ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>⚡ Forge Hooks</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => askPressyO('ledes')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                      pressyCategory === 'ledes'
                        ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>📜 Stave the Lede</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => askPressyO('angles')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition flex items-center space-x-1 ${
                      pressyCategory === 'angles'
                        ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>🔍 Probe the Shadows</span>
                  </button>
                </div>

                {/* Liaison Suggestions List */}
                <div className="space-y-2 pt-1">
                  {pressySuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-border bg-card hover:border-amber-500/70 transition flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
                          {item.label}
                        </span>
                        <p className="text-xs font-serif leading-relaxed text-foreground">
                          {item.text}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (pressyCategory === 'headlines') {
                            setTitle(item.text);
                          } else if (pressyCategory === 'ledes') {
                            setNote(item.text + '\n\n' + note);
                          } else {
                            setNote(note + '\n\n[INVESTIGATIVE ANGLE]: ' + item.text);
                          }
                          setShowPressyAssistant(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-700 hover:text-black dark:text-amber-300 dark:hover:text-black font-bold text-[10px] shrink-0 uppercase tracking-wider transition border border-amber-500/30"
                      >
                        Apply ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Top Meta Bar: Fork Appropriations, Edit Status & Settings Dropdown */}
          <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-border">
            <div className="flex items-center space-x-2">
              {mode === "fork" && (
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono font-bold">
                  <span>FORK APPROPRIATION:</span>
                  <span className="text-foreground">@{initialStory?.author_handle || initialStory?.author || "original"} / {initialStory?.title?.slice(0, 24) || "Dispatch"}</span>
                  <span className="text-[9px] bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Lineage Attached</span>
                </div>
              )}
              {mode === "edit" && (
                <div className="px-2.5 py-1 rounded-lg bg-muted border border-border text-xs font-mono text-muted-foreground flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>Editing Dispatch #{initialStory?.id || ""}</span>
                </div>
              )}
              {mode === "create" && (
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">New Dispatch</span>
              )}
            </div>

            {/* Settings Dropdown: Geo Pinpointing, Dateline & Post Config */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(prev => !prev)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition"
              >
                <Settings className="h-3.5 w-3.5 text-amber-500" />
                <span>Settings</span>
                <span className="text-[10px] text-emerald-500 font-bold">• {location ? location.split("•")[0].trim() : "Geo Off"}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card p-4 shadow-2xl z-50 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border">
                    <span className="font-bold uppercase text-[10px] text-muted-foreground">Regional Dateline & Geo</span>
                    <button type="button" onClick={() => setLocation("")} className="text-[10px] text-amber-500 hover:underline">Clear Geo</button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Quick Corridor Snap:</label>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {[
                        "Danville Junction Spur • Vermilion Line",
                        "Vermilion Rail Corridor",
                        "Champaign-Urbana Transit Line",
                        "Chicago Loop Core",
                        "Evansville Crossing Line",
                      ].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setLocation(p)}
                          className={"text-[10px] px-2 py-1 rounded border text-left transition " + (location === p ? "bg-emerald-950/20 border-emerald-500 text-emerald-400 font-bold" : "bg-muted/40 border-border text-muted-foreground hover:text-foreground")}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-border">
                    <label className="text-[10px] text-muted-foreground block">Custom Dateline / Landmark:</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter station, mile marker, or coords..."
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs text-foreground focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Field Copy & Notes */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
              FIELD COPY & GROUND EVIDENCE
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Verified facts, observations, scanner audio transcripts, or ground details..."
              className="w-full bg-background border border-border rounded-xl p-3 text-foreground text-xs leading-relaxed focus:outline-none focus:border-primary font-mono shadow-sm"
            />
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* PHOTO EVIDENCE STUDIO & ARRANGEMENTS                          */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="p-4 rounded-xl border-2 border-border bg-muted/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-foreground block">
                  PHOTO EVIDENCE STUDIO ({photos.length} Attached)
                </label>
                <div className="text-[10px] text-muted-foreground">
                  Attach photos or render scene images via AI
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold transition shadow-sm flex items-center space-x-1">
                  <Camera className="h-3.5 w-3.5" />
                  <span>+ Attach Photo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setAiGenPrompt(title || '');
                    setShowAiGen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition shadow-sm flex items-center space-x-1"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>Gen Image (AI)</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20">
                    {DAILY_CAP - todayGensUsed}/13 left
                  </span>
                </button>
              </div>
            </div>

            {/* Photo Arrangement Options (if 2+ photos) */}
            {photos.length >= 2 && (
              <div className="flex items-center space-x-2 pt-2 border-t border-border">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Photo Arrangement:</span>
                <div className="flex items-center space-x-1">
                  {PHOTO_LAYOUTS.map((arr) => (
                    <button
                      key={arr}
                      type="button"
                      onClick={() => setPhotoArrangement(arr)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border capitalize transition ${
                        photoArrangement === arr
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-card border-border text-muted-foreground'
                      }`}
                    >
                      {arr === 'single' ? '🖼️ Hero' : arr === 'split' ? '👥 Split Diptych' : '📐 Triptych Grid'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Previews Ribbon */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {photos.map((src, i) => (
                  <div key={i} className="relative rounded-xl border border-border overflow-hidden group max-h-28 shadow-sm">
                    <img src={src} alt="Evidence" className="w-full h-28 object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/80 text-white rounded-full p-1 text-[10px] hover:bg-red-600 shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────── */}
          {/* PRINT EDITION SELECTOR (5 DIVERSE STYLES)                     */}
          {/* ───────────────────────────────────────────────────────────── */}
          <div className="p-4 rounded-xl border-2 border-border bg-muted/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-foreground tracking-wider">
                SELECT PRINT EDITION:
              </label>
              <span className="text-[10px] text-muted-foreground uppercase font-bold font-mono">
                Active: <strong className="text-foreground">{edition}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'tactical', label: 'Tactical Wire', icon: '⚡', desc: 'Standard Broadsheet' },
                { id: 'vintage', label: '1920s Gazette', icon: '📰', desc: 'Aged Newsprint Paper' },
                { id: 'comic', label: 'Graphic Novel', icon: '💥', desc: 'Pop-Art Comic Tabloid' },
                { id: 'pixel', label: '8-Bit DOS CRT', icon: '👾', desc: 'Green Phosphor Teletype' },
                { id: 'sleek', label: 'Sleek Magazine', icon: '✨', desc: 'Swiss Glass Minimalist' },
              ].map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEdition(e.id as PressieEdition)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                    edition === e.id
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-1 font-bold text-xs">
                    <span>{e.icon}</span>
                    <span className="truncate">{e.label}</span>
                  </div>
                  <div className="text-[9px] opacity-80">{e.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Pre-Flight Audit Warning Rails */}
          {(audit.isClassified || audit.hasSensitiveData) && (
            <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2 text-xs">
              {audit.isClassified && (
                <div className="flex items-center justify-between gap-2 text-amber-700 dark:text-amber-300 font-bold">
                  <span>🏷️ Classified Intent: ({audit.classifiedMatches.join(', ')})</span>
                  <a href="/classifieds" className="underline text-[11px]">Post to Classifieds ↗</a>
                </div>
              )}
              {audit.hasSensitiveData && (
                <div className="flex items-center justify-between gap-2 text-red-600 dark:text-red-400 font-bold">
                  <span>🛡️ Security Alert: Unredacted {audit.sensitiveTypes.join(', ')} detected</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(autoRedactSensitiveData(title));
                      setNote(autoRedactSensitiveData(note));
                    }}
                    className="px-2.5 py-1 rounded bg-black text-white text-[10px] font-bold"
                  >
                    Auto-Redact ████
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Seeking Collab / Classifieds Cross-Post Toggle */}
          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <div className="font-bold text-xs text-foreground">Seeking Co-Reporter / Field Fixer</div>
                <div className="text-[10px] text-muted-foreground">
                  Cross-lists this dispatch into The Classifieds under Help Wanted / Gigs.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={seekingCollab}
              onChange={(e) => setSeekingCollab(e.target.checked)}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
          </div>
        </>
      ) : (
        /* Real-Time Live Edition Print Preview */
        <div className="p-4 rounded-xl border-2 border-border bg-card space-y-3">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold border-b border-border pb-2">
            <span>LIVE PRINT PREVIEW ({edition.toUpperCase()})</span>
            <span>Ready for Newsstand Publication</span>
          </div>
          <PressieArticleRenderer
            story={{
              id: 'draft-preview',
              title: title || 'Untitled Breaking Dispatch',
              author: isAnonymous ? 'Anonymous Fieldy' : currentUserHandle,
              location,
              formattedDate: 'Just Now (Preview)',
              lane: 'feed',
              items: [
                { id: 'prev-1', type: 'text', content: note || 'No field copy entered yet.' },
                ...photos.map((src, idx) => ({ id: `prev-p-${idx}`, type: 'photo', content: src })),
              ],
            }}
            initialEdition={edition}
          />
        </div>
      )}

      {/* Toggles, Actions & Publication Rail */}
      <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <AnonymousFieldyToggle
          isAnonymous={isAnonymous}
          onChange={setIsAnonymous}
          currentUserHandle={currentUserHandle}
        />

        <button
          type="submit"
          disabled={isPublishing || !title.trim()}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{isPublishing ? 'Saving...' : mode === 'edit' ? 'SAVE & UPDATE PRESSIE' : mode === 'fork' ? 'FORK & DISPATCH' : 'POST PRESSIE TO NEWSSTAND'}</span>
        </button>
      </div>

      {/* Fork Governance Policy */}
      <div className="pt-2">
        <ForkPolicySelector
          selectedPolicy={forkPolicy}
          onChange={setForkPolicy}
        />
      </div>

      {/* AI Image Generation Studio Modal */}
      {showAiGen && (
        <div className="fixed inset-0 z-[10008] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono text-xs text-foreground">
          <div className="w-full max-w-xl rounded-2xl border-2 border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <Wand2 className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm uppercase text-foreground font-serif">
                  AI Scene Image Generator
                </h3>
              </div>
              <button type="button" onClick={() => setShowAiGen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/40">
              <span className="text-muted-foreground text-[11px]">DAILY QUOTA (RESETS 12:00 AM CHICAGO TIME):</span>
              <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                {todayGensUsed} / {DAILY_CAP} used today ({DAILY_CAP - todayGensUsed} remaining)
              </span>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Scene Description</label>
              <input
                type="text"
                value={aiGenPrompt}
                onChange={(e) => setAiGenPrompt(e.target.value)}
                placeholder="Scene to render (e.g. Danville railyard switch crew in rain)..."
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                VARIATIONS TO GENERATE (1-3 GENS)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BATCH_SIZES.map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={todayGensUsed + num > DAILY_CAP}
                    onClick={() => setAiBatchSize(num as 1 | 2 | 3)}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                      aiBatchSize === num ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background border-border text-muted-foreground'
                    }`}
                  >
                    {num} {num === 1 ? 'Gen' : 'Gens'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isGeneratingAi || todayGensUsed >= DAILY_CAP || (!aiGenPrompt.trim() && !title.trim())}
                onClick={handleGenerateAiImages}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-md"
              >
                {isGeneratingAi ? 'Generating variations...' : `Generate ${aiBatchSize} ${aiBatchSize === 1 ? 'Image' : 'Images'}`}
              </button>
            </div>

            {aiCandidates.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Click image to add to dispatch:</div>
                <div className={`grid gap-2 ${aiCandidates.length === 1 ? 'grid-cols-1' : aiCandidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {aiCandidates.map((src, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setPhotos(prev => [...prev, src]);
                        setShowAiGen(false);
                      }}
                      className="relative cursor-pointer border-2 border-border hover:border-primary rounded-xl overflow-hidden group shadow-sm"
                    >
                      <img src={src} alt="Variation" className="w-full h-28 object-cover" />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-white text-[11px]">
                        Attach Image ✓
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default PressieBuilderStudio;
