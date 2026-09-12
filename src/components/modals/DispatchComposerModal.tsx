import React, { useState, useRef, useEffect } from "react";
import { Send, X, AlertCircle, Sparkles, Camera, RefreshCw, ImageIcon, Upload, Check, Download, Trash2, FolderLock } from "lucide-react";
import { Dispatch, PressPassData, GalleryItem, POPULAR_BEAT_PHOTOS, CORRIDOR_DATELINES } from "../../types/dispatch";

interface DispatchComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftToEdit?: Dispatch | null;
  pressPass: PressPassData;
  onSaveDraft: (draft: Dispatch) => void;
  onPublishDispatch: (dispatch: Dispatch) => void;
  isDark: boolean;
  inputThemeClass: string;
  subCardThemeClass: string;
  borderThemeClass: string;
  subTextThemeClass: string;
}

export const DispatchComposerModal: React.FC<DispatchComposerModalProps> = ({
  isOpen,
  onClose,
  draftToEdit,
  pressPass,
  onSaveDraft,
  onPublishDispatch,
  isDark,
  inputThemeClass,
  subCardThemeClass,
  borderThemeClass,
  subTextThemeClass
}) => {
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Field Dispatch");
  const [newLocation, setNewLocation] = useState("Danville, IL • Vermilion Line");
  const [newCoordinates, setNewCoordinates] = useState("-87.6298, 40.1245");
  const [newContent, setNewContent] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [visualPrompt, setVisualPrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [evidenceGallery, setEvidenceGallery] = useState<GalleryItem[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");

  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (draftToEdit) {
        setEditingDraftId(draftToEdit.id);
        setNewTitle(draftToEdit.title.replace(/^Draft:\s*/i, ""));
        setNewCategory(draftToEdit.category || "Field Dispatch");
        setNewLocation(draftToEdit.location || "Danville, IL • Vermilion Line");
        setNewContent(draftToEdit.content || "");
        setNewImageUrl(draftToEdit.imageUrl || "");
        setNewImageCaption(draftToEdit.imageCaption || "");
        setVisualPrompt(draftToEdit.title || "");
        if (draftToEdit.imageUrl) {
          setEvidenceGallery([{
            id: `init-${Date.now()}`,
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
        setNewLocation("Danville, IL • Vermilion Line");
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
    }
  }, [isOpen, draftToEdit]);

  if (!isOpen) return null;

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
      const lower = cleanPrompt.toLowerCase();

      let editorialFallback = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=675&q=80";
      if (lower.includes("rail") || lower.includes("train") || lower.includes("transit") || lower.includes("track")) {
        editorialFallback = "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&h=675&q=80";
      } else if (lower.includes("power") || lower.includes("grid") || lower.includes("substation") || lower.includes("electric")) {
        editorialFallback = "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&h=675&q=80";
      } else if (lower.includes("fiber") || lower.includes("telecom") || lower.includes("network") || lower.includes("cable")) {
        editorialFallback = "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&h=675&q=80";
      } else if (lower.includes("water") || lower.includes("drainage") || lower.includes("river") || lower.includes("basin")) {
        editorialFallback = "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&h=675&q=80";
      }

      setNewImageUrl(editorialFallback);
      const generatedCaption = `${cleanPrompt.slice(0, 75)} (Documentary 35mm visual)`;
      setNewImageCaption(generatedCaption);

      setEvidenceGallery((prev) => [
        {
          id: `ai-${Date.now()}`,
          url: editorialFallback,
          source: "ai",
          caption: generatedCaption,
          timestamp: "AI Visual"
        },
        ...prev
      ]);
    } catch {
      setFormValidationError("Visual rendering timed out. Please try another prompt or attach an evidence photo.");
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

  const handleUploadImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewImageUrl(result);
        const autoCap = `Field Evidence Still: ${file.name.replace(/\.[^/.]+$/, "")}`;
        setNewImageCaption(autoCap);
        setEvidenceGallery((prev) => [
          {
            id: `up-${Date.now()}`,
            url: result,
            source: "upload",
            caption: autoCap,
            timestamp: "Capture"
          },
          ...prev
        ]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!manualImageUrl.trim()) return;
    setNewImageUrl(manualImageUrl.trim());
    const cap = `Evidence photo from URL: ${newTitle || "Field Dispatch"}`;
    setNewImageCaption(cap);
    setEvidenceGallery((prev) => [
      {
        id: `url-${Date.now()}`,
        url: manualImageUrl.trim(),
        source: "url",
        caption: cap,
        timestamp: "Web URL"
      },
      ...prev
    ]);
    setManualImageUrl("");
    setShowUrlInput(false);
  };

  const handleStageDraft = () => {
    if (!newTitle.trim() && !newContent.trim()) {
      setFormValidationError("Please enter at least a title or draft notes to stage.");
      return;
    }

    const titleText = newTitle.trim() || "Untitled Draft Dispatch";
    const finalTitle = titleText.toLowerCase().startsWith("draft:") ? titleText : `Draft: ${titleText}`;

    let parsedCoords: [number, number] | undefined = undefined;
    if (newCoordinates.includes(",")) {
      const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedCoords = [parts[0], parts[1]];
      }
    }

    const draftItem: Dispatch = {
      id: editingDraftId || `draft-${Date.now()}`,
      title: finalTitle,
      category: newCategory,
      author: pressPass.name,
      callsign: pressPass.callsign,
      bureau: pressPass.bureau,
      timestamp: "Draft Staged",
      location: newLocation.trim() || "Midwest Corridor",
      coordinates: parsedCoords,
      content: newContent.trim(),
      imageUrl: newImageUrl || undefined,
      imageCaption: newImageCaption || undefined,
      isPressRoll: true
    };

    onSaveDraft(draftItem);
    onClose();
  };

  const handlePublish = () => {
    if (!newTitle.trim()) {
      setFormValidationError("Headline / Dispatch Title is required.");
      return;
    }
    if (!newContent.trim()) {
      setFormValidationError("Dispatch copy cannot be empty.");
      return;
    }

    let parsedCoords: [number, number] | undefined = undefined;
    if (newCoordinates.includes(",")) {
      const parts = newCoordinates.split(",").map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        parsedCoords = [parts[0], parts[1]];
      }
    }

    const newDispatch: Dispatch = {
      id: editingDraftId || `disp-${Date.now()}`,
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
      isLead: false,
      isPressRoll: false
    };

    onPublishDispatch(newDispatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden transition ${
        isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
      }`}>
        
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-mono">
            <Send className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-base">
              {editingDraftId ? "New Field Dispatch or Press Roll • Editing Staged Draft" : "New Field Dispatch or Press Roll"}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form id="pressie-builder-form" className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 font-mono text-xs">
          {formValidationError && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/40 text-rose-500 flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{formValidationError}</span>
            </div>
          )}

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
                <option value="Field Notes">Field Notes</option>
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
                {["Rail Corridor", "Power Grid", "Dark Fiber", "River Basin"].map((preset) => {
                  const isActive = visualPrompt === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setVisualPrompt(preset);
                        generateVisual(preset);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                        isActive
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/60 font-bold shadow-xs"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
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

            <div className="pt-2.5 border-t border-zinc-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Popular Editorial Photo Stills</span>
                </span>
                <span className={`text-[10px] ${subTextThemeClass}`}>1-click front-page cover</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR_BEAT_PHOTOS.map((item) => {
                  const isSelected = newImageUrl === item.url;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setNewImageUrl(item.url);
                        setNewImageCaption(item.caption);
                        if (!evidenceGallery.some((g) => g.url === item.url)) {
                          setEvidenceGallery((prev) => [
                            ...prev,
                            {
                              id: `pop-${Date.now()}-${Math.random()}`,
                              url: item.url,
                              source: "upload",
                              caption: item.caption,
                              timestamp: "Curated"
                            }
                          ]);
                        }
                      }}
                      className={`group relative rounded border overflow-hidden cursor-pointer aspect-video bg-zinc-900 transition ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500/50"
                          : "border-zinc-800 hover:border-amber-500/40"
                      }`}
                      title={`Click to attach "${item.label}"`}
                    >
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-1 inset-x-1 font-mono text-[9px] text-white truncate font-medium">
                        {item.label}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold text-[8px] flex items-center gap-0.5">
                          <Check className="h-2 w-2" /> Cover
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
                              onClick={() => {
                                const a = document.createElement("a");
                                a.href = item.url;
                                a.download = `fieldpress-visual-${idx + 1}.jpg`;
                                a.target = "_blank";
                                a.click();
                              }}
                              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 cursor-pointer transition"
                              title="Download"
                            >
                              <Download className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEvidenceGallery(evidenceGallery.filter((g) => g.id !== item.id))}
                              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer transition"
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
                  Generate documentary photography above, select a popular still, or click "Upload / Capture Photo" to attach evidence.
                </p>
              </div>
            )}
          </div>

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

          <div className={`p-2.5 rounded border text-[11px] ${subCardThemeClass} ${subTextThemeClass}`}>
            <span className="font-bold text-amber-500">Byline:</span> {pressPass.name} (@{pressPass.callsign}) • {pressPass.role}
          </div>
        </form>

        <div className={`flex-shrink-0 p-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${
          isDark ? "bg-zinc-950/80" : "bg-zinc-50"
        }`}>
          <button
            type="button"
            onClick={handleStageDraft}
            className="px-4 py-2 rounded border border-zinc-700 bg-zinc-800 text-amber-400 hover:bg-zinc-700 hover:border-amber-500/50 transition font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Save this dispatch to your staged Press Roll"
          >
            <FolderLock className="h-4 w-4" />
            <span>Stage Pressie to Press Roll</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded border transition cursor-pointer ${
                isDark ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800" : "border-zinc-300 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-5 py-2 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Publish dispatch to Live Feed"
            >
              <Send className="h-4 w-4" />
              <span>Publish Pressie to Live Feed</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
