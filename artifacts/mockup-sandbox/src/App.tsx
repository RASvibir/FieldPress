import { useEffect, useState, type ComponentType } from "react";

import { modules as discoveredModules } from "./.generated/mockup-components";

type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(
  mod: Record<string, unknown>,
  name: string,
): ComponentType | undefined {
  const fns = Object.values(mod).filter(
    (v) => typeof v === "function",
  ) as ComponentType[];
  return (
    (mod.default as ComponentType) ||
    (mod.Preview as ComponentType) ||
    (mod[name] as ComponentType) ||
    fns[fns.length - 1]
  );
}

function PreviewRenderer({
  componentPath,
  modules,
}: {
  componentPath: string;
  modules: ModuleMap;
}) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setComponent(null);
    setError(null);

    async function loadComponent(): Promise<void> {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) {
        setError(`No component found at ${componentPath}.tsx`);
        return;
      }

      try {
        const mod = await loader();
        if (cancelled) {
          return;
        }
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) {
          setError(
            `No exported React component found in ${componentPath}.tsx\n\nMake sure the file has at least one exported function component.`,
          );
          return;
        }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) {
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setError(`Failed to load preview.\n${message}`);
      }
    }

    void loadComponent();

    return () => {
      cancelled = true;
    };
  }, [componentPath, modules]);

  if (error) {
    return (
      <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>
        {error}
      </pre>
    );
  }

  if (!Component) return null;

  return <Component />;
}

function getBasePath(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

function getPreviewExamplePath(): string {
  const basePath = getBasePath();
  return `${basePath}/preview/ComponentName`;
}

function Gallery() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Component Preview Server
        </h1>
        <p className="text-gray-500 mb-4">
          This server renders individual components for the workspace canvas.
        </p>
        <p className="text-sm text-gray-400">
          Access component previews at{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
            {getPreviewExamplePath()}
          </code>
        </p>
      </div>
    </div>
  );
}

function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local =
    basePath && pathname.startsWith(basePath)
      ? pathname.slice(basePath.length) || "/"
      : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const previewPath = getPreviewPath();

  if (previewPath) {
    return (
      <PreviewRenderer
        componentPath={previewPath}
        modules={discoveredModules}
      />
    );
  }

  return <Gallery />;
}

export default App;

              {/* 1. AI Photojournalism Visual Generator */}
              <div className={`p-4 rounded-xl border space-y-3 ${subCardThemeClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-500">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Photojournalism Visual Generator</span>
                  </div>
                  <span className={`text-[10px] font-mono ${subTextThemeClass}`}>
                    Documentary Engine • Generates directly to Tray
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Visual framing brief (e.g. Utility substation array along rural rail lines)..."
                      value={visualPrompt}
                      onChange={(e) => setVisualPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          generateVisual();
                        }
                      }}
                      className={`flex-1 rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                    <button
                      type="button"
                      onClick={() => generateVisual()}
                      disabled={isGeneratingImage}
                      className="px-4 py-2 rounded bg-amber-500 text-zinc-950 font-mono font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 flex-shrink-0"
                      title="Generate documentary photojournalism visual"
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

                  <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={subTextThemeClass}>Quick Prompts:</span>
                      <button
                        type="button"
                        onClick={() => { setVisualPrompt("Midwest freight rail corridor switching yard"); generateVisual("Midwest freight rail corridor switching yard"); }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] border border-zinc-700 cursor-pointer"
                      >
                        Rail Corridor
                      </button>
                      <button
                        type="button"
                        onClick={() => { setVisualPrompt("High-voltage regional power distribution substation"); generateVisual("High-voltage regional power distribution substation"); }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] border border-zinc-700 cursor-pointer"
                      >
                        Power Grid
                      </button>
                      <button
                        type="button"
                        onClick={() => { setVisualPrompt("Nighttime emergency dispatch and wire perimeter"); generateVisual("Nighttime emergency dispatch and wire perimeter"); }}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] border border-zinc-700 cursor-pointer"
                      >
                        Night Wire
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={autoDraftVisualBrief}
                      disabled={isGeneratingImage || !newTitle.trim()}
                      className="text-amber-500 hover:underline flex items-center gap-1 font-bold cursor-pointer disabled:opacity-40"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Auto-prompt from Headline</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Visual Evidence & Media Tray */}
              <div className={`p-4 rounded-xl border space-y-3 ${subCardThemeClass}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-500">
                    <ImageIcon className="h-4 w-4" />
                    <span>Visual Evidence & Media Tray</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold">
                      {evidenceGallery.length} {evidenceGallery.length === 1 ? "photo" : "photos"}
                    </span>
                  </div>

                  {/* Add / Upload Actions */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="file"
                      ref={imageFileInputRef}
                      onChange={handleUploadImageFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center gap-1.5 border border-amber-500/30 transition cursor-pointer font-bold"
                      title="Upload photo evidence from your computer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Add / Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className={`px-2.5 py-1.5 rounded font-mono text-xs border transition cursor-pointer ${
                        showUrlInput
                          ? "bg-zinc-700 text-white border-zinc-600"
                          : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 border-zinc-700"
                      }`}
                      title="Attach image via URL"
                    >
                      URL
                    </button>
                  </div>
                </div>

                {/* Optional URL input */}
                {showUrlInput && (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)..."
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      className={`flex-1 rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 rounded bg-amber-500 text-zinc-950 font-mono font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
                    >
                      Attach
                    </button>
                  </div>
                )}

                {/* Evidence Image Previews Grid (holds multiple, displays 3 at once in grid) */}
                {evidenceGallery.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {evidenceGallery.map((item, idx) => {
                        const isActive = item.url === newImageUrl;
                        return (
                          <div
                            key={item.id || idx}
                            className={`group relative rounded-lg overflow-hidden border transition bg-black/40 flex flex-col ${
                              isActive
                                ? "border-amber-500 ring-2 ring-amber-500/40 shadow-lg"
                                : "border-zinc-700/80 hover:border-zinc-500"
                            }`}
                          >
                            {/* Image Thumbnail */}
                            <div
                              onClick={() => {
                                setNewImageUrl(item.url);
                                if (item.caption) setNewImageCaption(item.caption);
                              }}
                              className="relative aspect-video w-full cursor-pointer bg-zinc-900 overflow-hidden"
                              title="Click to select as active dispatch cover"
                            >
                              <img
                                src={item.url}
                                alt={item.caption || "Evidence visual"}
                                className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                              />

                              {/* Active Cover Badge */}
                              {isActive ? (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-mono text-[10px] font-bold flex items-center gap-1 shadow-md">
                                  <Check className="h-3 w-3" />
                                  <span>Active Cover</span>
                                </div>
                              ) : (
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-zinc-300 font-mono text-[9px] opacity-0 group-hover:opacity-100 transition">
                                  Click to Select
                                </div>
                              )}

                              {/* Source Badge */}
                              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-zinc-400 font-mono text-[9px]">
                                {item.source === "ai" ? "AI Gen" : "Field"}
                              </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-2.5 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between gap-1 text-xs">
                              <span className="truncate text-[10px] font-mono text-zinc-400 flex-1" title={item.caption || item.timestamp}>
                                {item.caption || item.timestamp}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadImage(item.url, `fieldpress-visual-${idx + 1}`);
                                  }}
                                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition cursor-pointer"
                                  title="Download high-res visual"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveGalleryImage(item.id);
                                  }}
                                  className="p-1 rounded hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                                  title="Delete image from tray"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Image Caption & Attribution */}
                    {newImageUrl && (
                      <div className="pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-zinc-400">
                          <span className="font-bold text-amber-500">Active Cover Caption & Verification Note:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewImageUrl("");
                              setNewImageCaption("");
                            }}
                            className="text-rose-400 hover:underline text-[10px] cursor-pointer"
                          >
                            Detach Active Cover
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Photo caption & source verification note..."
                          value={newImageCaption}
                          onChange={(e) => setNewImageCaption(e.target.value)}
                          className={`w-full rounded px-3 py-2 text-xs focus:outline-none ${inputThemeClass}`}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => imageFileInputRef.current?.click()}
                    className="p-6 rounded-lg border border-dashed border-zinc-700/80 hover:border-amber-500/50 transition text-center cursor-pointer space-y-1.5 bg-zinc-900/20"
                  >
                    <div className="flex justify-center text-zinc-400">
                      <ImageIcon className="h-8 w-8 opacity-60" />
                    </div>
                    <p className={`text-xs font-mono font-medium ${subTextThemeClass}`}>
                      No media in evidence tray yet
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Generate visuals using the AI desk above, or click "Add / Upload Photo" to attach files.
                    </p>
                  </div>
                )}
              </div>

