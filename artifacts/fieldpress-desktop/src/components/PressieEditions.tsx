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
}

export const EDITIONS: { id: PressieEdition; label: string; icon: string; defaultFont: PressieFont; desc: string }[] = [
  { id: 'tactical', label: 'Tactical Wire', icon: '⚡', defaultFont: 'serif', desc: 'Standard: Field Broadsheet + Ink Stamps' },
  { id: 'vintage', label: '1920s Gazette', icon: '📰', defaultFont: 'playfair', desc: 'Old-Timey Broadsheet with Drop Caps' },
  { id: 'comic', label: 'Graphic Novel', icon: '💥', defaultFont: 'bangers', desc: 'Modern Comic Tabloid with Pop Badges' },
  { id: 'pixel', label: '8-Bit CRT', icon: '👾', defaultFont: 'vt323', desc: 'Retro Green Phosphor Teletype' },
  { id: 'sleek', label: 'Sleek Magazine', icon: '✨', defaultFont: 'grotesk', desc: 'Minimalist Swiss Glass Editorial' },
];

export const FONTS: { id: PressieFont; label: string; family: string }[] = [
  { id: 'auto', label: 'Auto (By Edition)', family: 'inherit' },
  { id: 'serif', label: 'Source Serif', family: '"Source Serif 4", serif' },
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

export const PressieEditionSwitcher: React.FC<{
  currentEdition: PressieEdition;
  onSelectEdition: (edition: PressieEdition) => void;
  currentFont: PressieFont;
  onSelectFont: (font: PressieFont) => void;
}> = ({ currentEdition, onSelectEdition, currentFont, onSelectFont }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-black/60 border border-zinc-800 font-mono text-xs mb-4">
      {/* Edition Buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 uppercase font-bold px-1.5">Edition:</span>
        {EDITIONS.map(e => (
          <button
            key={e.id}
            type="button"
            onClick={() => onSelectEdition(e.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-bold transition ${
              currentEdition === e.id
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-600 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <span>{e.icon}</span>
            <span>{e.label}</span>
          </button>
        ))}
      </div>

      {/* Font Dropdown / Override */}
      <div className="flex items-center space-x-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">Typeface:</span>
        <select
          value={currentFont}
          onChange={e => onSelectFont(e.target.value as PressieFont)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-cyan-500"
        >
          {FONTS.map(f => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const PressieArticleRenderer: React.FC<PressieArticleProps> = ({
  story,
  inkCounts = {},
  initialEdition = 'tactical',
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
    <div className="space-y-4">
      {/* Switcher & Font Controls */}
      <PressieEditionSwitcher
        currentEdition={edition}
        onSelectEdition={setEdition}
        currentFont={font}
        onSelectFont={setFont}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. THE SIGNATURE FIELDPRESS TACTICAL BROADSHEET (DEFAULT)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'tactical' && (
        <article className="p-6 rounded-lg border border-zinc-800 bg-zinc-950 font-mono relative overflow-hidden shadow-2xl">
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
              {leadText || 'Field inspection confirmed on-scene relay activities along the municipal corridor.'}
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

          <div className="absolute bottom-4 right-6 pointer-events-none select-none">
            <div className="border-2 border-dashed border-emerald-500/80 text-emerald-400 px-3 py-1 text-[11px] font-black uppercase tracking-widest transform rotate-[-4deg] shadow-lg">
              ✓ PEER CORROBORATED
            </div>
          </div>
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. OLD-TIMEY 1920s BROADSHEET GAZETTE                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'vintage' && (
        <article className="p-8 border-4 border-double border-amber-900/60 bg-[#14120e] text-[#dcd1ba] shadow-2xl relative">
          <div className="text-center border-b-2 border-[#5c4a30] pb-3 mb-4">
            <div className="text-[10px] tracking-[0.25em] uppercase text-amber-600/90 font-mono mb-1">
              THE VERMILION & MIDWEST INDEPENDENT GAZETTE • DAILY COURIER
            </div>
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight text-[#f4ecd8] uppercase leading-tight"
              style={{ fontFamily: activeFontFamily }}
            >
              {story.title}
            </h1>
            <div className="flex justify-between items-center text-[11px] border-t border-b border-[#5c4a30] py-1 mt-2 text-amber-500/80 font-mono">
              <span>VOL. CIV ... No. 34,812</span>
              <span>SPECIAL DISPATCH • {story.formattedDate}</span>
              <span>PRICE: FREE MERIT</span>
            </div>
          </div>

          <div className="text-center italic text-xs mb-4 text-[#c7b99c]">
            Fielded by Special Correspondent <strong>@{author}</strong> on assignment at {location}.
          </div>

          <div className="text-sm leading-relaxed space-y-4 columns-1 sm:columns-2 gap-6 text-justify font-serif">
            {leadText && (
              <p>
                <span className="float-left text-4xl leading-none font-black pr-2 pt-1 text-amber-500">
                  {leadText.charAt(0)}
                </span>
                <span className="uppercase font-bold tracking-wider">{location.slice(0, 12)} — </span>
                {leadText.slice(1)}
              </p>
            )}
            {remainingText.map(t => (
              <p key={t.id}>{t.content}</p>
            ))}
          </div>

          {photoItems.length > 0 && (
            <div className="my-4 border border-[#5c4a30] p-1 bg-black/40">
              <img src={photoItems[0].content} alt="" className="w-full max-h-80 object-cover sepia-[0.35] contrast-125" />
              <div className="p-1.5 text-center text-xs italic text-[#b5a788]">
                Plate I. Photographic evidence procured directly on scene by Field Reporter @{author}.
              </div>
            </div>
          )}
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. MODERN COMIC BOOK / GRAPHIC NOVEL TABLOID                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'comic' && (
        <article className="p-6 border-4 border-black bg-zinc-900 text-white relative shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <div className="inline-block bg-yellow-400 text-black font-black uppercase text-xs px-3 py-1 transform -rotate-1 border-2 border-black mb-3 shadow-[3px_3px_0px_#000]">
            ⚡ BREAKING LOCAL REPORT!
          </div>

          <h1
            className="text-3xl sm:text-4xl tracking-wider uppercase text-white mb-3 leading-none drop-shadow-[2px_2px_0px_#000]"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="bg-cyan-400 text-black border-2 border-black p-2.5 mb-4 flex items-center justify-between font-bold text-xs shadow-[4px_4px_0px_#000]">
            <span>FIELDED BY: @{author}</span>
            <span className="bg-black text-white px-2 py-0.5 text-[10px] uppercase">
              📍 {location.slice(0, 20)}
            </span>
          </div>

          {photoItems.length > 0 && (
            <div className="border-3 border-black bg-black mb-4 relative shadow-[6px_6px_0px_#000]">
              <img src={photoItems[0].content} alt="" className="w-full max-h-80 object-cover contrast-150" />
              <div className="absolute bottom-2 left-2 bg-yellow-300 text-black px-2 py-1 font-black text-xs border border-black transform -rotate-1">
                PROOF CAPTURED! 📸
              </div>
            </div>
          )}

          <div className="bg-white text-black p-4 border-2 border-black font-medium text-xs leading-relaxed space-y-2 shadow-[4px_4px_0px_#000]">
            <p><strong>{location.toUpperCase()}: </strong>{leadText}</p>
            {remainingText.map(t => (
              <p key={t.id}>{t.content}</p>
            ))}
          </div>
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

          <div className="text-[11px] text-emerald-600 mb-1 font-mono">
            TIMESTAMP: {story.formattedDate} // SECTOR: {location}
          </div>

          <h1
            className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-emerald-300 my-2 leading-tight"
            style={{ fontFamily: activeFontFamily }}
          >
            &gt; {story.title}
          </h1>

          <div className="p-2 border border-emerald-800 bg-emerald-950/30 my-3 text-[12px] font-mono">
            [OPERATOR_CREDENTIAL]: @{author} // STATUS: ACTIVE_ON_SCENE
          </div>

          <div
            className="space-y-3 leading-relaxed text-emerald-200/90 my-4 text-sm sm:text-base"
            style={{ fontFamily: activeFontFamily }}
          >
            <p>&gt;&gt; {leadText}</p>
            {remainingText.map(t => (
              <p key={t.id}>&gt;&gt; {t.content}</p>
            ))}
          </div>

          {photoItems.length > 0 && (
            <div className="border border-emerald-700 my-3 p-1 bg-black">
              <img src={photoItems[0].content} alt="" className="w-full max-h-72 object-contain grayscale contrast-200" />
              <div className="text-[10px] text-emerald-500 text-center mt-1 font-mono">
                --- [IMG_RASTER_ENCODED: PROOF_ATTACHED] ---
              </div>
            </div>
          )}
        </article>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. SLEEK MODERN MAGAZINE / GLASS EDITORIAL                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      {edition === 'sleek' && (
        <article className="p-8 rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-xl text-zinc-100 shadow-2xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-3 tracking-wide">
            <span className="uppercase">FieldPress Journal</span>
            <span>•</span>
            <span className="text-zinc-400">{location}</span>
            <span>•</span>
            <span className="text-zinc-500">{story.formattedDate}</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-normal tracking-tight text-white mb-4 leading-tight"
            style={{ fontFamily: activeFontFamily }}
          >
            {story.title}
          </h1>

          <div className="flex items-center space-x-3 py-3 border-y border-white/10 mb-6">
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

          {photoItems.length > 0 && (
            <div className="my-6 rounded-xl overflow-hidden border border-white/10 shadow-lg">
              <img src={photoItems[0].content} alt="" className="w-full max-h-[460px] object-cover" />
              <div className="p-3 bg-black/40 backdrop-blur text-xs text-zinc-400">
                Visual documentation captured on scene by @{author}.
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};

export default PressieArticleRenderer;
