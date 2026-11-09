import React, { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

type Props = {
  isDark: boolean;
  /** Resolved HTTPS studio URL (embed=1). Refreshed when prompt/draft changes. */
  resolveEmbedUrl: () => Promise<string | null>;
  onOpenFullStudio: () => void;
  busy?: boolean;
  subTextClass: string;
};

export const ImbrgrEmbedPanel: React.FC<Props> = ({
  isDark,
  resolveEmbedUrl,
  onOpenFullStudio,
  busy,
  subTextClass,
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setLoadError(false);
    try {
      const url = await resolveEmbedUrl();
      setSrc(url);
    } catch {
      setSrc(null);
      setLoadError(true);
    } finally {
      setRefreshing(false);
    }
  }, [resolveEmbedUrl]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold flex items-center gap-1.5">
          <img src="/brand/imbrgr-icon.svg" alt="" width={16} height={16} className="shrink-0" />
          imbrgr studio
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={onOpenFullStudio}
          className="text-[10px] font-semibold inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 disabled:opacity-50"
        >
          Full studio <ExternalLink className="h-3 w-3" />
        </button>
      </div>
      <p className={`text-[10px] ${subTextClass}`}>
        Images are generated in imbrgr. When you share back to FieldPress, the photo attaches to this draft.
      </p>
      <div
        className={`relative w-full rounded-xl border overflow-hidden ${
          isDark ? "border-zinc-700 bg-zinc-950" : "border-zinc-200 bg-zinc-50"
        }`}
        style={{ minHeight: 280 }}
      >
        {(refreshing || busy) && !src && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">Loading studio…</div>
        )}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <p className="text-xs text-zinc-500">Could not prepare imbrgr link. Save your draft or sign in, then retry.</p>
            <button type="button" onClick={() => void refresh()} className="text-xs font-bold text-amber-600">
              Retry
            </button>
          </div>
        )}
        {src && (
          <iframe
            title="imbrgr image studio"
            src={src}
            className="w-full border-0"
            style={{ height: 320 }}
            allow="clipboard-write"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}
      </div>
      <button type="button" onClick={() => void refresh()} className="text-[10px] underline text-zinc-500">
        Refresh embed after you edit the prompt
      </button>
    </div>
  );
};
