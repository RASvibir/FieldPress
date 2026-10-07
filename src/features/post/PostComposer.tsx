import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronDown, ImageIcon, Link2, MapPin, MoreHorizontal, Sparkles, X } from "lucide-react";
import { PostAiTray } from "../../components/PostAiTray";
import { LOOK_OPTIONS, TOPIC_OPTIONS } from "./looks";
import { saveComposerAutosave, clearComposerAutosave } from "./composerAutosave";
import type { PostComposerProps, SharingOption } from "./types";
import { ImageCaptionAltFields } from "./ImageCaptionAltFields";
const ADVANCED_KEY = "fp-composer-advanced-open";

type TrayId = "photo" | "link" | "ai" | "location" | "more" | "advanced" | null;

function splitCombinedText(raw: string): { title: string; body: string } {
  const lines = raw.split(/\n/);
  const title = (lines[0] || "").trim();
  const body = lines.slice(1).join("\n").trim();
  return { title, body };
}

export const PostComposer: React.FC<PostComposerProps> = (props) => {
  const {
    open,
    isDark,
    isSubmitting,
    editingPublishedId,
    editingDraftId,
    formError,
    authSignedIn,
    authAvatarUrl,
    displayName,
    displayHandle,
    draftSavedLabel,
    newTitle,
    newContent,
    setNewTitle,
    setNewContent,
    newSourceUrl,
    setNewSourceUrl,
    newLocation,
    setNewLocation,
    newCoordinates,
    setNewCoordinates,
    newCategory,
    setNewCategory,
    newEditionStyle,
    setNewEditionStyle,
    newSharingOption,
    setNewSharingOption,
    newIsAnonymous,
    setNewIsAnonymous,
    newDecoupleLocationPin,
    setNewDecoupleLocationPin,
    newImageUrl,
    setNewImageUrl,
    newImageCaption,
    setNewImageCaption,
    newImageAltText,
    setNewImageAltText,
    onSuggestCaptionAlt,
    captionAltBusy,
    captionAltStatus,
    builderUseThemePhotoFilter,
    setBuilderUseThemePhotoFilter,
    evidenceGallery,
    setEvidenceGallery,
    manualImageUrl,
    setManualImageUrl,
    showUrlInput,
    setShowUrlInput,
    isUnfurling,
    unfurlStatus,
    pressyoBusy,
    pressyoStatus,
    pressyoLeads,
    pressyoCanUndo,
    onPressyoUndo,
    onPressyoWrite,
    onPressyoFindLeads,
    onPressyoCustom,
    onOpenImbrgr,
    imbrgrHandoffBusy,
    onPressyoAdvanced,
    onGuestSignInPrompt,
    onCloseRequest,
    onSaveDraft,
    onPost,
    onPastePrepared,
    onPinMyArea,
    onUploadClick,
    onAddImageUrl,
    onUnfurlFromText,
    onUseVideoFrameAsCover,
    hasYoutubeSource,
    imageFileInputRef,
    onImageFileChange,
    inputClass,
    subCardClass,
    subTextClass,
  } = props;

  const [tray, setTray] = useState<TrayId>(null);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(() => {
    try {
      return localStorage.getItem(ADVANCED_KEY) === "1";
    } catch {
      return false;
    }
  });

  const combinedText = useMemo(() => {
    if (!newContent.trim()) return newTitle;
    if (!newTitle.trim()) return newContent;
    return `${newTitle}\n${newContent}`;
  }, [newTitle, newContent]);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => {
      saveComposerAutosave({
        title: newTitle,
        content: newContent,
        category: newCategory,
        location: newLocation,
        coordinates: newCoordinates,
        sourceUrl: newSourceUrl,
        imageUrl: newImageUrl,
        imageCaption: newImageCaption,
        imageAltText: newImageAltText,
        editionStyle: newEditionStyle,
        sharingOption: newSharingOption,
        isAnonymous: newIsAnonymous,
        decoupleLocationPin: newDecoupleLocationPin,
        builderUseThemePhotoFilter,
        evidenceGallery,
      });
    }, 4000);
    return () => clearInterval(t);
  }, [
    open,
    newTitle,
    newContent,
    newCategory,
    newLocation,
    newCoordinates,
    newSourceUrl,
    newImageUrl,
    newImageCaption,
    newImageAltText,
    newEditionStyle,
    newSharingOption,
    newIsAnonymous,
    newDecoupleLocationPin,
    builderUseThemePhotoFilter,
    evidenceGallery,
  ]);

  if (!open) return null;

  const setCombined = (raw: string) => {
    setDirty(true);
    if (!authSignedIn && raw.trim().length === 1) onGuestSignInPrompt();
    const url = raw.match(/https?:\/\/[^\s]+/i)?.[0];
    if (url && url.length > 12) onUnfurlFromText(raw);
    const { title, body } = splitCombinedText(raw);
    setNewTitle(title);
    setNewContent(body);
  };

  const tryClose = () => {
    if (dirty && (newTitle.trim() || newContent.trim() || evidenceGallery.length)) {
      if (!window.confirm("Discard draft?")) return;
      clearComposerAutosave();
    }
    onCloseRequest();
  };

  const setCover = (url: string) => {
    setNewImageUrl(url);
    const item = evidenceGallery.find((g) => g.url === url);
    if (item?.caption) setNewImageCaption(item.caption);
  };

  const remixLabel = (opt: SharingOption) =>
    opt === "fork" ? "Anyone" : opt === "colab" ? "Ask me" : "No one";

  const panel = isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300";
  const trayBtn = `px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
    isDark ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-200 hover:bg-zinc-100"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`w-full sm:max-w-xl max-h-[100dvh] sm:max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden ${panel}`}
      >
        <div className={`flex-shrink-0 px-4 py-3 border-b flex items-center justify-between ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
          <h2 className="font-bold text-base">{editingPublishedId ? "Edit post" : "Post"}</h2>
          <div className="flex items-center gap-2">
            {draftSavedLabel && <span className="text-[10px] text-emerald-500">{draftSavedLabel}</span>}
            <button type="button" onClick={tryClose} className="p-2 rounded-lg hover:bg-zinc-800/40" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 flex gap-2 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border shrink-0">
              {authAvatarUrl ? (
                <img src={authAvatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">?</div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAudienceOpen((v) => !v)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  isDark ? "border-zinc-700" : "border-zinc-300"
                }`}
              >
                {newIsAnonymous ? "Anonymous" : "Everyone"}
                <ChevronDown className="h-3 w-3" />
              </button>
              {audienceOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAudienceOpen(false)} />
                  <div
                    className={`absolute left-0 mt-1 z-20 w-40 rounded-lg border shadow-lg py-1 ${
                      isDark ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200"
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs hover:bg-amber-500/10"
                      onClick={() => {
                        setNewIsAnonymous(false);
                        setAudienceOpen(false);
                      }}
                    >
                      Everyone
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs hover:bg-amber-500/10"
                      onClick={() => {
                        setNewIsAnonymous(true);
                        setNewDecoupleLocationPin(true);
                        setAudienceOpen(false);
                      }}
                    >
                      Anonymous
                    </button>
                  </div>
                </>
              )}
            </div>
            <span className={`text-xs ${subTextClass}`}>
              {authSignedIn ? `${displayName} (@${displayHandle})` : "Sign in to post"}
            </span>
          </div>

          <textarea
            value={combinedText}
            onChange={(e) => setCombined(e.target.value)}
            placeholder="What's happening? First line becomes your headline."
            rows={6}
            className={`w-full rounded-xl px-3 py-3 text-sm leading-relaxed resize-y min-h-[140px] ${inputClass}`}
          />

          {(newSourceUrl || unfurlStatus) && (
            <div className={`rounded-xl border p-3 ${subCardClass}`}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Link2 className="h-4 w-4 text-amber-500" />
                Link preview
              </div>
              {newSourceUrl && (
                <a href={newSourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 dark:text-amber-400 break-all mt-1 block">
                  {newSourceUrl}
                </a>
              )}
              {unfurlStatus && <p className={`text-[11px] mt-1 ${subTextClass}`}>{unfurlStatus}</p>}
              {isUnfurling && <p className="text-[11px] text-amber-500 mt-1">Importing link…</p>}
            </div>
          )}

          {evidenceGallery.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {evidenceGallery.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCover(item.url)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    newImageUrl === item.url ? "border-amber-500" : isDark ? "border-zinc-700" : "border-zinc-200"
                  }`}
                  title="Set as cover"
                >
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {(newImageUrl || evidenceGallery.length > 0) && (
            <ImageCaptionAltFields
              isDark={isDark}
              hasImage={Boolean(newImageUrl || evidenceGallery.length)}
              caption={newImageCaption}
              altText={newImageAltText}
              onCaptionChange={setNewImageCaption}
              onAltTextChange={setNewImageAltText}
              onSuggest={onSuggestCaptionAlt}
              suggestBusy={captionAltBusy}
              suggestStatus={captionAltStatus}
              inputClass={inputClass}
              subCardClass={subCardClass}
              subTextClass={subTextClass}
            />
          )}

          <div className="flex flex-wrap gap-1.5 items-center">
            <div className="inline-flex items-center gap-0.5 shrink-0">
              <button type="button" className={trayBtn} onClick={() => setTray(tray === "photo" ? null : "photo")}>
                <ImageIcon className="h-3.5 w-3.5 inline mr-1" /> Photo
              </button>
              <button
                type="button"
                title="Make or edit on imbrgr"
                aria-label="Make or edit on imbrgr"
                disabled={imbrgrHandoffBusy}
                onClick={() => onOpenImbrgr()}
                className={`p-1.5 rounded-lg border shrink-0 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 ${
                  isDark ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-200 hover:bg-zinc-100"
                } ${isDark ? "ring-offset-zinc-900" : "ring-offset-white"}`}
              >
                <img src="/brand/imbrgr-icon.png" alt="" width={20} height={20} className="w-5 h-5 block" />
              </button>
            </div>
            <button type="button" className={trayBtn} onClick={() => setTray(tray === "link" ? null : "link")}>
              <Link2 className="h-3.5 w-3.5 inline mr-1" /> Link
            </button>
            <button type="button" className={trayBtn} onClick={() => setTray(tray === "ai" ? null : "ai")}>
              <Sparkles className="h-3.5 w-3.5 inline mr-1" /> AI
            </button>
            <button type="button" className={trayBtn} onClick={() => setTray(tray === "location" ? null : "location")}>
              <MapPin className="h-3.5 w-3.5 inline mr-1" /> Location
            </button>
            <button type="button" className={trayBtn} onClick={() => setTray(tray === "more" ? null : "more")}>
              <MoreHorizontal className="h-3.5 w-3.5 inline mr-1" /> More
            </button>
          </div>

          {tray === "photo" && (
            <div className={`rounded-xl border p-3 space-y-2 ${subCardClass}`}>
              <input
                type="file"
                ref={imageFileInputRef as React.RefObject<HTMLInputElement>}
                accept="image/*"
                multiple
                className="hidden"
                onChange={onImageFileChange}
              />
              <button type="button" onClick={onUploadClick} className="text-xs font-bold text-amber-600 dark:text-amber-400">
                Add photo
              </button>
              <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} className="text-xs font-bold ml-3">
                Paste image URL
              </button>
              {showUrlInput && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="https://…"
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs ${inputClass}`}
                  />
                  <button type="button" onClick={onAddImageUrl} className="px-2 py-1 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold">
                    Add
                  </button>
                </div>
              )}
            </div>
          )}

          {tray === "link" && (
            <div className={`rounded-xl border p-3 space-y-2 ${subCardClass}`}>
              <label className="text-xs font-bold">Source link</label>
              <input
                type="url"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="Article or video URL"
                className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputClass}`}
              />
              {hasYoutubeSource && onUseVideoFrameAsCover && (
                <button type="button" onClick={onUseVideoFrameAsCover} className="text-xs font-bold text-amber-600">
                  Use video frame as cover
                </button>
              )}
            </div>
          )}

          {tray === "ai" && (
            <PostAiTray
              isDark={isDark}
              busy={pressyoBusy}
              status={pressyoStatus}
              leads={pressyoLeads}
              canUndo={pressyoCanUndo}
              onUndo={onPressyoUndo}
              onWriteAction={onPressyoWrite}
              onFindLeads={onPressyoFindLeads}
              onCustomAsk={onPressyoCustom}
            />
          )}

          {tray === "location" && (
            <div className={`rounded-xl border p-3 space-y-3 ${subCardClass}`}>
              <button type="button" onClick={onPinMyArea} className="text-xs font-bold text-sky-600 dark:text-sky-400">
                Share my area (~5 km)
              </button>
              <div>
                <label className="text-xs font-bold block mb-1">Area name</label>
                <input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className={`w-full rounded-lg px-2 py-1.5 text-xs ${inputClass}`}
                />
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="accent-amber-600 scale-110"
                  checked={newDecoupleLocationPin}
                  onChange={(e) => setNewDecoupleLocationPin(e.target.checked)}
                />
                Don&apos;t link the pin to me
              </label>
            </div>
          )}

          {tray === "more" && (
            <div className={`rounded-xl border p-3 space-y-3 ${subCardClass}`}>
              <div>
                <span className="text-xs font-bold">Look</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {LOOK_OPTIONS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setNewEditionStyle(l.id)}
                      className={`px-2 py-1 rounded-md text-[10px] border ${
                        newEditionStyle === l.id ? "border-amber-500 bg-amber-500/15" : ""
                      }`}
                    >
                      {l.emoji} {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold">Who can remix</span>
                <div className="flex gap-1 mt-1">
                  {(["fork", "colab", "none"] as SharingOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setNewSharingOption(opt)}
                      className={`px-2 py-1 rounded-md text-[10px] border ${
                        newSharingOption === opt ? "border-amber-500 bg-amber-500/15" : ""
                      }`}
                    >
                      {remixLabel(opt)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-bold">Topic</span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={`mt-1 w-full rounded-lg px-2 py-1.5 text-xs ${inputClass}`}
                >
                  {TOPIC_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="text-[11px] underline text-zinc-500"
                onClick={() => {
                  const next = !advancedOpen;
                  setAdvancedOpen(next);
                  try {
                    localStorage.setItem(ADVANCED_KEY, next ? "1" : "0");
                  } catch {}
                  setTray("advanced");
                }}
              >
                Advanced options…
              </button>
            </div>
          )}

          {(tray === "advanced" || advancedOpen) && (
            <div className={`rounded-xl border p-3 space-y-3 ${subCardClass}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold">Advanced</span>
                <button
                  type="button"
                  className="text-[10px] text-zinc-500"
                  onClick={() => {
                    setAdvancedOpen(false);
                    try {
                      localStorage.setItem(ADVANCED_KEY, "0");
                    } catch {}
                    if (tray === "advanced") setTray(null);
                  }}
                >
                  Collapse
                </button>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="accent-amber-600 scale-110"
                  checked={builderUseThemePhotoFilter}
                  onChange={(e) => setBuilderUseThemePhotoFilter(e.target.checked)}
                />
                Theme photo filter
              </label>
              <div>
                <span className="text-xs font-bold">Rewrite voice</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {LOOK_OPTIONS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onPressyoAdvanced("rewrite_voice", l.id)}
                      className="px-2 py-1 rounded-md text-[10px] border"
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  ["expand", "Expand"],
                  ["uplift_angle", "Uplift angle"],
                  ["social_thread", "Radio + thread"],
                  ["factcheck_polish", "Polish & check"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onPressyoAdvanced(id as any)}
                    className="px-2 py-1 rounded-md text-[10px] border"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold">Coordinates (lon, lat)</label>
                <input
                  value={newCoordinates}
                  onChange={(e) => setNewCoordinates(e.target.value)}
                  className={`mt-1 w-full rounded-lg px-2 py-1.5 text-xs ${inputClass}`}
                />
              </div>
              <button type="button" onClick={onPastePrepared} className="text-xs font-bold text-amber-600">
                Import from clipboard
              </button>
            </div>
          )}
        </div>

        <div
          className={`flex-shrink-0 px-4 py-3 border-t flex gap-2 justify-end ${
            isDark ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setDirty(false);
              onSaveDraft();
            }}
            className={`px-4 py-2 rounded-lg border text-xs font-bold ${
              isDark ? "border-zinc-700 text-zinc-200" : "border-zinc-300 text-zinc-800"
            }`}
          >
            Save draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onPost}
            className="px-5 py-2 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold disabled:opacity-50"
          >
            {isSubmitting ? "Posting…" : editingPublishedId ? "Save" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};
