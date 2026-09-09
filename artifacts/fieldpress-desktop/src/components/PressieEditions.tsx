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
  { id: 'tactical', label: 'Tactical Wire', icon: '⚡', defaultFont: 'serif', desc: 'Standard: Field Broadsheet + Watermarks' },
  { id: 'vintage', label: '1920s Broadsheet', icon: '📰', defaultFont: 'playfair', desc: 'Authentic Newsprint on Aged Paper with Ears' },
  { id: 'comic', label: 'Graphic Novel', icon: '💥', defaultFont: 'bangers', desc: 'Pop-Art Comic Tabloid with Action Badges' },
  { id: 'pixel', label: '8-Bit DOS CRT', icon: '👾', defaultFont: 'vt323', desc: 'Green Phosphor DOS Terminal Teletype' },
  { id: 'sleek', label: 'Sleek Magazine', icon: '✨', defaultFont: 'grotesk', desc: 'Swiss Minimalist Glass Editorial' },
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

export const FaviconEditionSeal: React.FC<{
  edition: PressieEdition;
  location: string;
}> = ({ edition, location }) => {
  if (edition === 'vintage') {
    return (
      <div className="flex items-center space-x-2.5 pb-2 border-b-2 border-[#2b241b]">
        <img src="/favicon.svg" alt="" className="h-6 w-6 sepia contrast-200 opacity-90 filter" />
        <div>
          <div className="text-[11px] font-mono tracking-widest font-black uppercase text-[#14120e]">
            THE FIELDPRESS BROADSHEET • EST. 1926
          </div>
          <div className="text-[9px] font-mono text-[#5a4c3a]">
            REGISTERED TELETYPE // SECTOR: {location.toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  if (edition === 'comic') {
    return (
      <div className="flex items-center space-x-2 mb-3">
        <div className="h-8 w-8 bg-[#fde047] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_#000]">
          <img src="/favicon.svg" alt="" className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-wider text-black">
            FIELDPRESS COMICS GROUP
          </div>
          <div className="text-[9px] font-bold text-zinc-700 uppercase">
            APPROVED BY THE COMICS CODE AUTHORITY
          </div>
        </div>
      </div>
    );
  }

  if (edition === 'pixel') {
    return (
      <div className="flex items-center space-x-2 text-xs text-[#22c55e] pb-2 border-b border-[#166534] mb-3 select-none">
        <img src="/favicon.svg" alt="" className="h-5 w-5 opacity-90 filter invert hue-rotate-90" />
        <span>[DOS_STATION_NODE // {location.slice(0, 24).toUpperCase()}]</span>
      </div>
    );
  }

  if (edition === 'sleek') {
    return (
      <div className="flex items-center space-x-2 text-xs font-semibold text-foreground mb-4">
        <img src="/favicon.svg" alt="" className="h-5 w-5 opacity-90" />
        <span className="tracking-widest uppercase text-[10px]">FieldPress Journal Issue</span>
      </div>
    );
  }

  // Tactical (Standard)
  return (
    <div className="flex items-center space-x-2 pb-2.5 mb-3 border-b border-border">
      <img src="/favicon.svg" alt="" className="h-5 w-5 opacity-85" />
      <div>
        <div className="text-[10px] font-mono tracking-widest font-bold uppercase text-foreground">
          FIELDPRESS DESK EDITION
        </div>
        <div className="text-[9px] text-muted-foreground font-mono">
          SECTOR: {location.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export const PressieArticleRenderer: React.FC<PressieArticleProps> = ({
  story,
  inkCounts = {},
  initialEdition = 'tactical',
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
      {/* Interactive Edition & Typography Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl bg-card border border-border text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">Edition:</span>
          {EDITIONS.map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEdition(e.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                edition === e.id
                  ? 'bg-primary/15 text-primary border border-primary/50 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
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
            className="bg-muted border border-border text-foreground rounded-lg px-2 py-1 text-[11px] focus:outline-none"
          >
            {FONTS.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>

          {canEdit && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold"
            >
              ✏️ Edit
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. 1920s BROADSHEET (AUTHENTIC LEAD-TYPE INK ON NEWSPRINT)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'vintage' && (
        <article className="p-8 sm:p-14 border-[6px] border-[#2b241b] bg-[#f5efe4] text-[#1a1814] font-serif shadow-2xl relative rounded-sm selection:bg-amber-200">
          <FaviconEditionSeal edition="vintage" location={location} />

          {/* Top Newspaper Ears */}
          <div className="flex justify-between items-center border-b-2 border-[#2b241b] py-1 text-[11px] font-mono tracking-widest text-[#4a3f31] uppercase">
            <span>WEATHER: OVERCAST, 68° • RAILS OPEN</span>
            <span className="font-bold">FIVE CENTS • NO ALGORITHM</span>
          </div>

          {/* Master Broadsheet Masthead */}
          <div className="text-center py-4 border-b-4 border-double border-[#2b241b] my-2">
            <div className="text-[11px] tracking-[0.35em] uppercase font-mono text-[#5a4c3a] mb-1 font-bold">
              THE VERMILION & MIDWEST INDEPENDENT COURIER
            </div>
            <h1
              className="text-3xl sm:text-5xl font-black tracking-tight text-[#14120e] uppercase leading-tight my-2"
              style={{
                fontFamily: activeFontFamily,
                textShadow: '0 0.5px 1px rgba(20,18,14,0.3)',
              }}
            >
              {story.title}
            </h1>
            <div className="flex justify-between items-center text-xs font-mono border-t border-[#3d3326] pt-1.5 mt-2 text-[#4a3f31]">
              <span>VOL. CIV ... No. 42,918</span>
              <span className="font-bold">{location.toUpperCase()} • {story.formattedDate}</span>
              <span>SPECIAL EDITION</span>
            </div>
          </div>

          {/* Byline Strip */}
          <div className="my-4 py-2 border-b border-[#3d3326] flex items-center justify-between text-xs font-mono text-[#382f24]">
            <div className="flex items-center space-x-2">
              <span className="font-bold uppercase tracking-wider">FIELDED BY SPECIAL CORRESPONDENT:</span>
              <strong className="text-black font-bold">@{author}</strong>
              <span className="px-1.5 py-0.2 rounded border border-[#5a4c3a] bg-[#e8dfcf] text-[10px] font-bold">
                🎖️ Frontline Scout
              </span>
            </div>
            <span className="font-bold">EDITION: PRINT I</span>
          </div>

          {/* Multi-Column Newsprint Body with Drop Cap */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-6 text-sm leading-relaxed text-[#1c1914] text-justify">
            <div className={`space-y-4 ${photoItems.length > 0 ? 'md:col-span-8 border-r-0 md:border-r border-[#d4c7b2] md:pr-6' : 'md:col-span-12'}`}>
              {leadText && (
                <p>
                  <span className="float-left text-5xl leading-none font-black pr-2.5 pt-1 font-serif text-[#14120e]">
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

            {/* Photo Column with Newsprint Frame */}
            {photoItems.length > 0 && (
              <div className="md:col-span-4 space-y-3">
                <div className="border-2 border-[#2b241b] p-1 bg-[#ede4d3] shadow-sm relative">
                  <img src={photoItems[0].content} alt="" className="w-full max-h-64 object-cover sepia-[0.35] contrast-125" />
                  <div className="p-2 text-center text-xs italic text-[#382f24] border-t border-[#2b241b] mt-1 font-serif">
                    Fig 1. On-scene photographic evidence recorded by correspondent @{author}.
                  </div>
                </div>

                {/* Stamped Red Ink Seal */}
                <div className="p-3 border-2 border-dashed border-[#852c1e] text-[#852c1e] text-center font-mono font-black text-xs uppercase tracking-widest transform -rotate-2">
                  ✓ VERIFIED DISPATCH
                  <div className="text-[10px] font-normal tracking-normal mt-0.5">
                    ⚡ {inkCounts['signal'] || 42} SIGNALS • 🔥 {inkCounts['heat'] || 12} HEAT
                  </div>
                </div>
              </div>
            )}
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. 8-BIT DOS CRT TELETYPE (TRUE GREEN PHOSPHOR DOS SYSTEM)    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'pixel' && (
        <article className="p-6 sm:p-10 border-4 border-[#15803d] bg-[#060e06] text-[#22c55e] font-mono text-sm relative shadow-[0_0_35px_rgba(34,197,94,0.25)] rounded-lg">
          <FaviconEditionSeal edition="pixel" location={location} />

          {/* DOS Prompt Line */}
          <div className="text-xs text-[#16a34a] border-b border-[#166534] pb-2 mb-4 select-none">
            C:\FIELDPRESS\DESK&gt; TYPE DISPATCH_{story.id.slice(0, 8).toUpperCase()}.TXT --RENDER=CRT<br />
            [SYSTEM: MS-DOS 6.22 // PHOSPHOR REFRESH: 60HZ // NODE: ONLINE]
          </div>

          {/* ASCII Masthead Box */}
          <div className="text-xs text-[#16a34a] leading-tight select-none mb-3">
            ╔═══════════════════════════════════════════════════════════════════════╗<br />
            ║ FIELDPRESS NETWORK STATION :: SECTOR_{location.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 24).toUpperCase()} ║<br />
            ╚═══════════════════════════════════════════════════════════════════════╝
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#4ade80] my-3 leading-tight"
            style={{
              fontFamily: activeFontFamily,
              textShadow: '0 0 8px rgba(74, 222, 128, 0.7)',
            }}
          >
            &gt;&gt; {story.title}
          </h1>

          <div className="p-2 border border-[#166534] bg-[#052e16]/40 my-3 text-xs flex justify-between">
            <span>[OPERATOR]: @{author.toUpperCase()}</span>
            <span>[DATE]: {story.formattedDate}</span>
          </div>

          <div className="space-y-4 leading-relaxed text-[#86efac] my-5 text-base" style={{ fontFamily: activeFontFamily }}>
            <p>&gt; {leadText || 'Transmission confirmed.'}</p>
            {remainingText.map(t => (
              <p key={t.id}>&gt; {t.content}</p>
            ))}
          </div>

          {photoItems.length > 0 && (
            <div className="border-2 border-[#16a34a] my-4 p-1 bg-black">
              <img src={photoItems[0].content} alt="" className="w-full max-h-80 object-contain grayscale contrast-200" />
              <div className="text-xs text-[#22c55e] text-center mt-1">
                -- [RASTER_FRAME_01: VERIFIED_SCENE_CAPTURE] --
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[#166534] flex justify-between items-center text-xs text-[#16a34a]">
            <span>SIGNAL_PACKETS: {inkCounts['signal'] || 42}</span>
            <span className="animate-pulse">CURSOR: _</span>
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. GRAPHIC NOVEL / COMIC BOOK TABLOID                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'comic' && (
        <article className="p-6 sm:p-10 border-[5px] border-black bg-[#fffef0] text-black font-sans relative shadow-[10px_10px_0px_#000] rounded-none">
          <FaviconEditionSeal edition="comic" location={location} />

          <div className="flex justify-between items-center mb-3">
            <div className="inline-block bg-[#fde047] text-black font-black uppercase text-sm px-3.5 py-1 transform -rotate-1 border-3 border-black shadow-[3px_3px_0px_#000]">
              💥 FRONT-PAGE SCOOP!
            </div>
            <span className="font-bold text-xs bg-black text-white px-2 py-0.5 uppercase tracking-wider">
              ISSUE #{story.id.slice(0, 6).toUpperCase()}
            </span>
          </div>

          <h1
            className="text-4xl sm:text-6xl tracking-wider uppercase text-black mb-4 leading-none drop-shadow-[3px_3px_0px_#fde047]"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="bg-[#22d3ee] text-black border-3 border-black p-3 mb-5 flex items-center justify-between font-bold text-sm shadow-[4px_4px_0px_#000]">
            <span>FIELDED BY: @{author}</span>
            <span className="bg-black text-white px-2.5 py-0.5 text-xs uppercase">
              📍 {location.slice(0, 24)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start my-4">
            <div className={`bg-white text-black p-5 border-3 border-black font-medium text-sm leading-relaxed space-y-3 shadow-[5px_5px_0px_#000] ${photoItems.length > 0 ? 'md:col-span-7' : 'md:col-span-12'}`}>
              <p><strong>{location.toUpperCase()}: </strong>{leadText}</p>
              {remainingText.map(t => (
                <p key={t.id}>{t.content}</p>
              ))}
            </div>

            {photoItems.length > 0 && (
              <div className="md:col-span-5 border-4 border-black bg-black relative shadow-[6px_6px_0px_#000]">
                <img src={photoItems[0].content} alt="" className="w-full max-h-80 object-cover contrast-150" />
                <div className="absolute bottom-2 left-2 bg-[#fde047] text-black px-2.5 py-1 font-black text-xs border-2 border-black transform -rotate-2">
                  EVIDENCE CAPTURED! 📸
                </div>
              </div>
            )}
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. THE SIGNATURE TACTICAL BROADSHEET (DEFAULT)                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'tactical' && (
        <article className="p-6 sm:p-10 rounded-2xl border-2 border-border bg-card text-foreground relative overflow-hidden shadow-xl">
          <FaviconEditionSeal edition="tactical" location={location} />

          <div className="flex items-center justify-between border-b border-border pb-3 mb-4 text-[10px] text-emerald-500 tracking-wider font-bold uppercase">
            <span>📍 {location}</span>
            <span>DISPATCH #{story.id.slice(0, 8)} • {story.formattedDate}</span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-bold font-serif tracking-tight leading-snug mb-4"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/60 border border-border mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-card border-2 border-primary flex items-center justify-center font-bold text-primary text-xs shadow-sm">
                @{author.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">FIELDED BY:</span>
                  <span className="font-bold text-foreground text-xs">@{author}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold">
                    🎖️ Frontline Scout
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Verified On-Scene Corridor Lead • [✦ Immutable Provenance]
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="px-2.5 py-1 rounded-lg bg-card border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                ⚡ {inkCounts['signal'] || 42} SIGNALS
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-card border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold">
                🔥 {inkCounts['heat'] || 12} HEAT
              </div>
            </div>
          </div>

          <div className="text-sm text-foreground/90 leading-relaxed space-y-4">
            <p>
              <strong className="text-foreground uppercase tracking-wide mr-1.5 font-mono text-xs">
                {location.split('•')[0].trim().toUpperCase()} —
              </strong>
              {leadText || 'Field inspection confirmed on-scene relay activities along the municipal corridor.'}
            </p>
            {remainingText.map(t => (
              <p key={t.id}>{t.content}</p>
            ))}
          </div>

          {photoItems.map(p => (
            <div key={p.id} className="my-6 border border-border bg-black rounded-xl overflow-hidden shadow-lg relative">
              <img src={p.content} alt="Field Proof" className="w-full max-h-[440px] object-contain" />
              <div className="p-3 bg-card border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>📸 Evidence capture attached by reporter @{author}</span>
                <span className="text-[10px] uppercase font-bold text-primary">Verified Proof</span>
              </div>
            </div>
          ))}

          {/* Translucent Watermark Seal */}
          <div className="absolute bottom-6 right-8 pointer-events-none select-none flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-[1px] transform -rotate-3">
            <img src="/favicon.svg" alt="" className="h-5 w-5 opacity-80" />
            <div className="text-[10px] font-mono tracking-widest text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              VERIFIED FIELD DISPATCH
            </div>
          </div>

          <ReporterBioFooter author={author} location={location} />
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. SLEEK MODERN MAGAZINE / GLASS EDITORIAL                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'sleek' && (
        <article className="p-8 sm:p-14 rounded-3xl border border-border bg-card/90 backdrop-blur-xl text-card-foreground shadow-2xl font-sans">
          <FaviconEditionSeal edition="sleek" location={location} />

          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-4 tracking-wide">
            <span className="uppercase">FieldPress Journal</span>
            <span>•</span>
            <span className="text-muted-foreground">{location}</span>
            <span>•</span>
            <span className="text-muted-foreground">{story.formattedDate}</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-light tracking-tight text-foreground mb-6 leading-tight"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="flex items-center space-x-3 py-4 border-y border-border mb-8 font-mono">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs">
              @{author.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-medium text-foreground">
                Fielded by <span className="text-foreground font-bold">@{author}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">Independent Grassroots Bureau</div>
            </div>
          </div>

          <div className="text-base font-light leading-relaxed text-foreground/85 space-y-5">
            <p className="text-lg text-foreground font-normal leading-relaxed">{leadText}</p>
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
    <div className="mt-8 pt-6 border-t border-border font-mono text-xs">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">
        ABOUT THE REPORTER
      </div>
      <div className="p-4 rounded-xl border border-border bg-muted/40 backdrop-blur flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="relative">
            <div className="h-12 w-12 rounded-xl bg-card border-2 border-primary flex items-center justify-center font-bold text-primary text-sm shadow-sm">
              @{author.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-foreground text-sm">@{author}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                🎖️ Frontline Scout
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              📍 {location}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-lg leading-relaxed">
              Boots-on-the-ground corridor reporter and independent newsroom contributor. Tracking municipal infrastructure, scanner audio, and grassroots logistics.
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onOpenDm ? onOpenDm(author) : (window.location.href = '/wire')}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm transition"
          >
            💬 Message Fieldy
          </button>
          <a
            href="/profile"
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-border bg-card text-foreground hover:bg-muted text-center text-xs"
          >
            View Desk →
          </a>
        </div>
      </div>
    </div>
  );
};

export default PressieArticleRenderer;
