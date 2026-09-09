import React, { useState } from 'react';

export type PressieEdition = 'tactical' | 'vintage' | 'comic' | 'pixel' | 'sleek';
export type PressieFont = 'auto' | 'serif' | 'playfair' | 'bangers' | 'vt323' | 'grotesk' | 'mono';

export interface PressieArticleProps {
  story: {
    id: string;
    title: string;
    author: string;
    originalCreatorHandle?: string;
    location?: string;
    formattedDate: string;
    lane?: string;
    items?: Array<{ id: string; type: string; content: string }>;
  };
  inkCounts?: Record<string, number>;
  initialEdition?: PressieEdition;
  onEdit?: () => void;
  canEdit?: boolean;
}

export const EDITIONS: { id: PressieEdition; label: string; icon: string; defaultFont: PressieFont; desc: string }[] = [
  { id: 'tactical', label: 'Tactical Wire', icon: '⚡', defaultFont: 'serif', desc: 'Standard: Field Broadsheet + Ink Stamps' },
  { id: 'vintage', label: '1920s Broadsheet', icon: '📰', defaultFont: 'playfair', desc: 'Aged Newsprint Paper with Columns & Ears' },
  { id: 'comic', label: 'Graphic Novel', icon: '💥', defaultFont: 'bangers', desc: 'Pulp Comic Tabloid with Action Badges' },
  { id: 'pixel', label: '8-Bit CRT', icon: '👾', defaultFont: 'vt323', desc: 'Glowing Green Phosphor Teletype' },
  { id: 'sleek', label: 'Sleek Magazine', icon: '✨', defaultFont: 'grotesk', desc: 'Minimalist Swiss Glass Editorial' },
];

export const FONTS: { id: PressieFont; label: string; family: string }[] = [
  { id: 'auto', label: 'Auto (By Edition)', family: 'inherit' },
  { id: 'serif', label: 'Source Serif 4', family: '"Source Serif 4", serif' },
  { id: 'playfair', label: 'Playfair Broadsheet', family: '"Playfair Display", serif' },
  { id: 'bangers', label: 'Bangers Comic', family: '"Bangers", cursive' },
  { id: 'vt323', label: 'VT323 Pixel', family: '"VT323", monospace' },
  { id: 'grotesk', label: 'Space Grotesk', family: '"Space Grotesk", sans-serif' },
  { id: 'mono', label: 'Terminal Mono', family: 'ui-monospace, monospace' },
];

export function getResolvedFontFamily(font: PressieFont, edition: PressieEdition): string {
  if (font !== 'auto') {
    const found = FONTS.find(f => f.id === font);
    return found ? found.family : 'inherit';
  }
  switch (edition) {
    case 'vintage': return '"Playfair Display", serif';
    case 'comic': return '"Bangers", cursive';
    case 'pixel': return '"VT323", monospace';
    case 'sleek': return '"Space Grotesk", sans-serif';
    case 'tactical':
    default:
      return '"Source Serif 4", serif';
  }
}

export const PressieArticleRenderer: React.FC<PressieArticleProps> = ({
  story,
  inkCounts = {},
  initialEdition = 'vintage',
  onEdit,
  canEdit = true,
}) => {
  const [edition, setEdition] = useState<PressieEdition>(initialEdition);
  const [font, setFont] = useState<PressieFont>('auto');

  const author = story.author || 'Field Reporter';
  const location = story.location || 'Danville Junction Bureau';
  const textItems = story.items?.filter(i => i.type === 'text' || !i.type) || [];
  const photoItems = story.items?.filter(
    i => i.type === 'photo' || i.content?.startsWith('data:image') || i.content?.startsWith('http')
  ) || [];

  const leadText = textItems[0]?.content || '';
  const remainingText = textItems.slice(1);
  const activeFontFamily = getResolvedFontFamily(font, edition);

  return (
    <div className="space-y-4 font-mono">
      {/* Interactive Edition & Typography Toolbar with Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-black/70 border border-zinc-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold px-1">Edition:</span>
          {EDITIONS.map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEdition(e.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-bold transition ${
                edition === e.id
                  ? 'bg-zinc-800 text-cyan-300 border border-cyan-600 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <span>{e.icon}</span>
              <span>{e.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 pt-1 sm:pt-0">
          <select
            value={font}
            onChange={e => setFont(e.target.value as PressieFont)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-[11px] focus:outline-none"
          >
            {FONTS.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>

          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold"
            >
              <span>✏️</span>
              <span>Edit Pressie</span>
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. VINTAGE 1920s BROADSHEET (AUTHENTIC NEWSPRINT ON PAPER)    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'vintage' && (
        <article className="p-8 sm:p-12 border-4 border-[#3d3326] bg-[#f5efe4] text-[#1c1914] font-serif shadow-2xl relative rounded-sm selection:bg-amber-300">
          {/* Authentic Newspaper Ears & Date Header */}
          <div className="flex justify-between items-center border-b-2 border-[#2b241b] pb-1 text-[11px] font-mono tracking-widest text-[#4a3f31] uppercase">
            <span>WEATHER: CLOUDY, 68° • RAILS CLEAR</span>
            <span className="font-bold">FIVE CENTS • NO ALGORITHM</span>
          </div>

          {/* Master Masthead Banner */}
          <div className="text-center py-4 border-b-4 border-double border-[#2b241b] my-2">
            <div className="text-[11px] tracking-[0.35em] uppercase font-mono text-[#5a4c3a] mb-1 font-bold">
              THE VERMILION CORRIDOR INDEPENDENT COURIER
            </div>
            <h1
              className="text-3xl sm:text-5xl font-black tracking-tight text-[#14120e] uppercase leading-tight my-2"
              style={{ fontFamily: activeFontFamily }}
            >
              {story.title}
            </h1>
            <div className="flex justify-between items-center text-xs font-mono border-t border-[#3d3326] pt-1.5 mt-2 text-[#4a3f31]">
              <span>VOL. CIV ... No. 42,918</span>
              <span className="font-bold">DANVILLE JUNCTION BUREAU • {story.formattedDate}</span>
              <span>SPECIAL EDITION</span>
            </div>
          </div>

          {/* Prominent Byline */}
          <div className="my-4 py-2 border-b border-[#3d3326] flex items-center justify-between text-xs font-mono text-[#382f24]">
            <div className="flex items-center space-x-2">
              <span className="font-bold uppercase tracking-wider">FIELDED BY SPECIAL CORRESPONDENT:</span>
              <strong className="text-black font-bold">@{author}</strong>
              <span className="px-1.5 py-0.2 rounded border border-[#5a4c3a] bg-[#e8dfcf] text-[10px] font-bold">
                🎖️ Frontline Scout
              </span>
            </div>
            <span>LOC: {location}</span>
          </div>

          {/* Authentic Multi-Column Newsprint Body */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 text-sm leading-relaxed text-[#1c1914] text-justify">
            <div className="md:col-span-8 space-y-4 border-r-0 md:border-r border-[#d4c7b2] md:pr-6">
              {leadText && (
                <p>
                  <span className="float-left text-5xl leading-none font-black pr-2 pt-1 font-serif text-[#14120e]">
                    {leadText.charAt(0)}
                  </span>
                  <strong className="uppercase tracking-wide font-mono text-xs">
                    {location.split('•')[0].trim().toUpperCase()} —{' '}
                  </strong>
                  {leadText.slice(1)}
                </p>
              )}
              {remainingText.map(t => (
                <p key={t.id}>{t.content}</p>
              ))}
            </div>

            {/* Side Column with Photo & Stamp */}
            <div className="md:col-span-4 space-y-4">
              {photoItems.length > 0 && (
                <div className="border border-[#3d3326] p-1 bg-[#ede4d3]">
                  <img src={photoItems[0].content} alt="" className="w-full max-h-64 object-cover sepia-[0.35] contrast-125" />
                  <div className="p-2 text-center text-xs italic text-[#382f24] border-t border-[#3d3326] mt-1">
                    Fig 1. Photographic evidence captured on scene by @{author}.
                  </div>
                </div>
              )}

              {/* Physical Ink Stamp on Newsprint */}
              <div className="p-3 border-2 border-dashed border-[#852c1e] text-[#852c1e] text-center font-mono font-black text-xs uppercase tracking-widest transform -rotate-2">
                ✓ VERIFIED FIELD REPORT
                <div className="text-[10px] font-normal tracking-normal mt-0.5">
                  ⚡ {inkCounts['signal'] || 42} SIGNALS • 🔥 {inkCounts['heat'] || 12} HEAT
                </div>
              </div>
            </div>
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. THE SIGNATURE TACTICAL WIRE (DEFAULT DARK BROADSHEET)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'tactical' && (
        <article className="p-6 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-200 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-2.5 mb-4 text-[10px] text-emerald-400 tracking-wider font-bold uppercase">
            <span>📍 {location}</span>
            <span>DISPATCH #{story.id.slice(0, 8)} • {story.formattedDate}</span>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-3"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-zinc-900/60 border border-zinc-800/80 mb-5">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-cyan-500/80 flex items-center justify-center font-bold text-cyan-300 text-xs">
                @{author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">FIELDED BY:</span>
                  <span className="font-bold text-white text-xs">@{author}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                    🎖️ Frontline Scout
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Verified On-Scene Corridor Lead • [✦ Immutable Provenance]
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="px-2 py-1 rounded bg-black/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-bold">
                ⚡ {inkCounts['signal'] || 42} SIGNALS
              </div>
              <div className="px-2 py-1 rounded bg-black/80 border border-amber-700/60 text-amber-300 text-[10px] font-bold">
                🔥 {inkCounts['heat'] || 12} HEAT
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-300 leading-relaxed space-y-4">
            <p>
              <strong className="text-zinc-100 uppercase tracking-wide mr-1.5">
                {location.split('•')[0].trim().toUpperCase()} —
              </strong>
              {leadText || 'Field inspection confirmed on-scene relay activities along the corridor.'}
            </p>
            {remainingText.map(t => (
              <p key={t.id}>{t.content}</p>
            ))}
          </div>

          {photoItems.map(p => (
            <div key={p.id} className="my-5 border border-zinc-800 bg-black rounded overflow-hidden">
              <img src={p.content} alt="Field Proof" className="w-full max-h-96 object-contain" />
              <div className="p-2.5 bg-zinc-900/90 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
                <span>📸 Evidence capture attached by reporter @{author}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                  High-Contrast Proof
                </span>
              </div>
            </div>
          ))}

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. MODERN COMIC BOOK TABLOID                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'comic' && (
        <article className="p-6 sm:p-8 border-4 border-black bg-[#fffdf0] text-black font-sans relative shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="inline-block bg-yellow-400 text-black font-black uppercase text-xs px-3 py-1 transform -rotate-1 border-2 border-black mb-3 shadow-[3px_3px_0px_#000]">
            ⚡ FRONT-PAGE BREAKING REPORT!
          </div>

          <h1
            className="text-3xl sm:text-5xl tracking-wider uppercase text-black mb-3 leading-none drop-shadow-[2px_2px_0px_#fde047]"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="bg-cyan-400 text-black border-2 border-black p-2.5 mb-4 flex items-center justify-between font-bold text-xs shadow-[4px_4px_0px_#000]">
            <span>FIELDED BY: @{author}</span>
            <span className="bg-black text-white px-2 py-0.5 text-[10px] uppercase">
              📍 {location.slice(0, 24)}
            </span>
          </div>

          {photoItems.length > 0 && (
            <div className="border-3 border-black bg-black mb-4 relative shadow-[6px_6px_0px_#000]">
              <img src={photoItems[0].content} alt="" className="w-full max-h-80 object-cover contrast-150" />
              <div className="absolute bottom-2 left-2 bg-yellow-300 text-black px-2 py-1 font-black text-xs border border-black transform -rotate-1">
                EVIDENCE PROOF! 📸
              </div>
            </div>
          )}

          <div className="bg-white text-black p-4 border-2 border-black font-medium text-xs leading-relaxed space-y-2 shadow-[4px_4px_0px_#000]">
            <p><strong>{location.toUpperCase()}: </strong>{leadText}</p>
            {remainingText.map(t => (
              <p key={t.id}>{t.content}</p>
            ))}
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. 8-BIT DIGITAL RETRO CRT TELETYPE                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'pixel' && (
        <article className="p-6 border-2 border-emerald-500/80 bg-black text-emerald-400 text-xs relative shadow-[0_0_20px_rgba(16,185,129,0.25)]">
          <div className="text-[11px] text-emerald-500 mb-2 select-none font-mono">
            +=============================================================+<br />
            | [TELETYPE NET] :: CORRIDOR_FREQUENCY_104.2 :: TERMINAL_LIVE  |<br />
            +=============================================================+
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-emerald-300 my-2 leading-tight"
            style={{ fontFamily: activeFontFamily }}
          >
            &gt; {story.title}
          </h1>

          <div className="p-2 border border-emerald-800 bg-emerald-950/30 my-3 text-[12px] font-mono">
            [OPERATOR_CREDENTIAL]: @{author} // SECTOR: {location}
          </div>

          <div className="space-y-3 leading-relaxed text-emerald-200/90 my-4 text-sm sm:text-base" style={{ fontFamily: activeFontFamily }}>
            <p>&gt;&gt; {leadText}</p>
            {remainingText.map(t => (
              <p key={t.id}>&gt;&gt; {t.content}</p>
            ))}
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. SLEEK MODERN MAGAZINE / GLASS EDITORIAL                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'sleek' && (
        <article className="p-8 rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl text-zinc-100 shadow-2xl font-sans">
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-3 tracking-wide">
            <span className="uppercase">FieldPress Journal</span>
            <span>•</span>
            <span className="text-zinc-400">{location}</span>
            <span>•</span>
            <span className="text-zinc-500">{story.formattedDate}</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-normal tracking-tight text-white mb-4 leading-tight"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="flex items-center space-x-3 py-3 border-y border-white/10 mb-6 font-mono">
            <div className="h-9 w-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-bold text-cyan-300 text-xs">
              @{author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-medium text-zinc-200">
                Fielded by <span className="text-white font-bold">@{author}</span>
              </div>
              <div className="text-[10px] text-zinc-400">Independent Grassroots Bureau</div>
            </div>
          </div>

          <div className="text-sm font-light leading-relaxed text-zinc-300 space-y-4">
            <p className="text-base text-zinc-100 font-normal leading-relaxed">{leadText}</p>
            {remainingText.map(t => (
              <p key={t.id}>{t.content}</p>
            ))}
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}
    </div>
  );
};

export const ReporterBioFooter: React.FC<{
  author: string;
  location?: string;
  onOpenDm?: (handle: string) => void;
}> = ({ author, location = 'Danville Junction Bureau', onOpenDm }) => {
  return (
    <div className="mt-8 pt-6 border-t-2 border-zinc-800/80 font-mono text-xs">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-3">
        ABOUT THE REPORTER
      </div>
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-zinc-800 border-2 border-cyan-400 flex items-center justify-center font-bold text-cyan-300 text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              @{author.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">@{author}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-[10px]">
                🎖️ Frontline Scout
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">
              📍 {location}
            </div>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-lg leading-relaxed">
              Boots-on-the-ground corridor reporter and independent newsroom desk contributor. Tracking municipal infrastructure, scanner feeds, and grassroots logistics.
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              const current = localStorage.getItem(`fp_cohort_${author}`) === 'true';
              localStorage.setItem(`fp_cohort_${author}`, String(!current));
              alert(!current ? `Added @${author} to your Cohort network.` : `Removed @${author} from your Cohorts.`);
            }}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 font-bold text-xs"
          >
            + Add Cohort
          </button>
          <button
            type="button"
            onClick={() => onOpenDm ? onOpenDm(author) : (window.location.href = '/wire')}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs shadow-md transition"
          >
            💬 Message Fieldy
          </button>
          <a
            href="/profile"
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-500 text-center text-xs"
          >
            View Desk →
          </a>
        </div>
      </div>
    </div>
  );
};

export default PressieArticleRenderer;
