import React, { useState } from "react";
import { ShieldCheck, Check, Sparkles, Camera } from "lucide-react";
import { Dispatch, PressPassData, POPULAR_BEAT_PHOTOS } from "../../types/dispatch";
import { AccentColorClasses } from "../../theme/tokens";

interface DesktopEditorialSuiteProps {
  dispatches: Dispatch[];
  pressRoll: Dispatch[];
  setDispatches: React.Dispatch<React.SetStateAction<Dispatch[]>>;
  setPressRoll: React.Dispatch<React.SetStateAction<Dispatch[]>>;
  pressPass: PressPassData;
  setSavedSuccessToast: (msg: string) => void;
  currentAccent: AccentColorClasses;
  isDark: boolean;
  cardThemeClass: string;
  subCardThemeClass: string;
  inputThemeClass: string;
  borderThemeClass: string;
  subTextThemeClass: string;
}

export const DesktopEditorialSuite: React.FC<DesktopEditorialSuiteProps> = ({
  dispatches,
  pressRoll,
  setDispatches,
  setPressRoll,
  pressPass,
  setSavedSuccessToast,
  isDark,
  cardThemeClass,
  subCardThemeClass,
  inputThemeClass,
  borderThemeClass,
  subTextThemeClass
}) => {
  const allDeskItems = [
    ...pressRoll.map((p) => ({ ...p, isDraft: true })),
    ...dispatches.map((d) => ({ ...d, isDraft: false }))
  ];

  const [selectedDeskId, setSelectedDeskId] = useState<string>(allDeskItems[0]?.id || "");
  const activeItem = allDeskItems.find((item) => item.id === selectedDeskId) || allDeskItems[0];

  const [deskTitle, setDeskTitle] = useState(activeItem?.title || "");
  const [deskContent, setDeskContent] = useState(activeItem?.content || "");
  const [deskCategory, setDeskCategory] = useState(activeItem?.category || "Field Dispatch");
  const [deskLocation, setDeskLocation] = useState(activeItem?.location || "Danville, IL");
  const [deskImageUrl, setDeskImageUrl] = useState(activeItem?.imageUrl || "");
  const [deskImageCaption, setDeskImageCaption] = useState(activeItem?.imageCaption || "");
  const [factCheckApproved, setFactCheckApproved] = useState(true);
  const [apStyleVerified, setApStyleVerified] = useState(true);

  const handleSelectStory = (item: any) => {
    setSelectedDeskId(item.id);
    setDeskTitle(item.title);
    setDeskContent(item.content);
    setDeskCategory(item.category);
    setDeskLocation(item.location);
    setDeskImageUrl(item.imageUrl || "");
    setDeskImageCaption(item.imageCaption || "");
  };

  const handlePromoteToLead = () => {
    if (!activeItem) return;
    const updated = dispatches.map((d) => ({
      ...d,
      isLead: d.id === activeItem.id
    }));
    if (activeItem.isDraft) {
      const promoted: Dispatch = {
        ...activeItem,
        title: deskTitle,
        content: deskContent,
        category: deskCategory,
        location: deskLocation,
        imageUrl: deskImageUrl,
        imageCaption: deskImageCaption,
        isLead: true,
        isPressRoll: false,
        timestamp: "Just now"
      };
      setDispatches([promoted, ...dispatches.map((d) => ({ ...d, isLead: false }))]);
      setPressRoll(pressRoll.filter((p) => p.id !== activeItem.id));
    } else {
      setDispatches(updated);
    }
    setSavedSuccessToast(`"${deskTitle}" promoted to Front-Page Lead.`);
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  const handleVerifyAndPublish = () => {
    if (!activeItem) return;
    const updatedStory: Dispatch = {
      ...activeItem,
      title: deskTitle,
      content: deskContent,
      category: deskCategory,
      location: deskLocation,
      imageUrl: deskImageUrl,
      imageCaption: deskImageCaption,
      isPressRoll: false,
      timestamp: activeItem.isDraft ? "Just now" : activeItem.timestamp
    };

    if (activeItem.isDraft) {
      setDispatches([updatedStory, ...dispatches]);
      setPressRoll(pressRoll.filter((p) => p.id !== activeItem.id));
    } else {
      setDispatches(dispatches.map((d) => (d.id === activeItem.id ? updatedStory : d)));
    }
    setSavedSuccessToast("Dispatch verified and published to Live Wire.");
    setTimeout(() => setSavedSuccessToast(""), 3000);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${subCardThemeClass}`}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          <div>
            <h2 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <span>FieldPress Desk: Editorial Suite & Intake Terminal</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase">
                Bureau Chief Clearance
              </span>
            </h2>
            <p className={`text-[11px] ${subTextThemeClass}`}>
              Wire intake queue, AP style verification, high-res photojournalism curation, and syndication sign-off.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePromoteToLead}
            className="px-3 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Promote to Lead</span>
          </button>
          <button
            type="button"
            onClick={handleVerifyAndPublish}
            className="px-3.5 py-1.5 rounded bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Verify & Syndicate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className={`lg:col-span-3 rounded-xl border overflow-hidden flex flex-col max-h-[750px] ${cardThemeClass}`}>
          <div className={`p-3 border-b flex items-center justify-between font-bold ${borderThemeClass}`}>
            <span>Intake Queue ({allDeskItems.length})</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {pressRoll.length} Staged Drafts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-1">
            {allDeskItems.map((item) => {
              const isSelected = item.id === (activeItem?.id || "");
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectStory(item)}
                  className={`p-3 rounded-lg cursor-pointer transition space-y-1.5 ${
                    isSelected
                      ? "bg-amber-500/15 border border-amber-500/40 text-white"
                      : "hover:bg-zinc-800/40 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                      item.isDraft ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {item.isDraft ? "STAGED DRAFT" : "PUBLISHED"}
                    </span>
                    <span className={subTextThemeClass}>{item.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-xs line-clamp-2">{item.title}</h4>
                  <div className={`text-[10px] flex items-center justify-between ${subTextThemeClass}`}>
                    <span>@{item.callsign}</span>
                    <span>[{item.location}]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`lg:col-span-6 rounded-xl border p-5 space-y-4 ${cardThemeClass}`}>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="font-bold text-sm text-zinc-200">
              Desk Copy Editor • AP Style Verification Gate
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <label className="flex items-center gap-1 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={factCheckApproved}
                  onChange={(e) => setFactCheckApproved(e.target.checked)}
                  className="cursor-pointer"
                />
                <span>Fact-Check Passed</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={apStyleVerified}
                  onChange={(e) => setApStyleVerified(e.target.checked)}
                  className="cursor-pointer"
                />
                <span>AP Style Checked</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-bold">Headline / Wire Title</label>
              <input
                type="text"
                value={deskTitle}
                onChange={(e) => setDeskTitle(e.target.value)}
                className={`w-full rounded px-3 py-2 text-sm font-bold ${inputThemeClass}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Category</label>
                <select
                  value={deskCategory}
                  onChange={(e) => setDeskCategory(e.target.value)}
                  className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass} cursor-pointer`}
                >
                  <option value="Field Dispatch">Field Dispatch</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Civic Wire">Civic Wire</option>
                  <option value="Transit">Transit</option>
                  <option value="Telecom">Telecom</option>
                  <option value="Field Notes">Field Notes</option>
                  <option value="Editorial">Editorial</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Location Dateline</label>
                <input
                  type="text"
                  value={deskLocation}
                  onChange={(e) => setDeskLocation(e.target.value)}
                  className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-400 font-bold">Dispatch Body Copy</label>
                <span className={subTextThemeClass}>
                  {deskContent.length} chars • {deskContent.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={10}
                value={deskContent}
                onChange={(e) => setDeskContent(e.target.value)}
                className={`w-full rounded p-3 font-serif text-sm leading-relaxed ${inputThemeClass}`}
              />
            </div>
          </div>
        </div>

        <div className={`lg:col-span-3 rounded-xl border p-4 space-y-4 ${cardThemeClass}`}>
          <div className="font-bold text-xs text-zinc-300 pb-2 border-b border-zinc-800 flex items-center justify-between">
            <span>Evidence & Provenance</span>
            <span className="text-emerald-400 text-[10px] font-bold">PGP VERIFIED</span>
          </div>

          <div className={`p-3 rounded-lg border space-y-1.5 ${subCardThemeClass}`}>
            <div className="text-[10px] uppercase font-bold text-amber-500">Field Reporter</div>
            <div className="font-bold text-sm text-zinc-200">{activeItem?.author}</div>
            <div className="text-zinc-400">@{activeItem?.callsign}</div>
            <div className={`text-[10px] ${subTextThemeClass}`}>{activeItem?.bureau}</div>
            <div className="pt-1 text-[9px] font-mono text-zinc-500 border-t border-zinc-800">
              Badge: {pressPass.badgeId} • PGP: {pressPass.pgpKey}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-zinc-300">Cover Still Photo</span>
              {deskImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setDeskImageUrl("");
                    setDeskImageCaption("");
                  }}
                  className="text-rose-400 hover:underline text-[10px] cursor-pointer"
                >
                  Detach
                </button>
              )}
            </div>

            {deskImageUrl ? (
              <div className="rounded-lg overflow-hidden border border-zinc-800 aspect-video relative bg-black shadow-md">
                <img src={deskImageUrl} alt="Evidence still" className="w-full h-full object-cover" />
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono text-[9px] text-amber-400 font-bold border border-amber-500/40">
                  DOCUMENTARY 35MM
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-zinc-700 text-center space-y-1 text-zinc-500">
                <Camera className="h-5 w-5 mx-auto opacity-50" />
                <p className="text-[10px]">No high-res photo attached</p>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Photo Caption & Evidence Note</label>
              <input
                type="text"
                placeholder="Caption still..."
                value={deskImageCaption}
                onChange={(e) => setDeskImageCaption(e.target.value)}
                className={`w-full rounded px-2 py-1 text-xs ${inputThemeClass}`}
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-1.5">
              <span className={`text-[10px] ${subTextThemeClass}`}>Curated On-Site Stills:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {POPULAR_BEAT_PHOTOS.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setDeskImageUrl(item.url);
                      setDeskImageCaption(item.caption);
                    }}
                    className="relative rounded overflow-hidden aspect-video border border-zinc-800 hover:border-amber-500 cursor-pointer group"
                    title={item.label}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
