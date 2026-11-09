import React, { useState } from "react";
import { ImageIcon } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * Renders a remote image by URL only (no fetch/canvas). Shows a placeholder if the asset 404s.
 */
export const SafeExternalImage: React.FC<Props> = ({ src, alt, className = "" }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1 bg-zinc-900/80 text-zinc-500 font-mono text-[10px] p-3 ${className}`}
        role="img"
        aria-label={alt || "Image unavailable"}
      >
        <ImageIcon className="h-6 w-6 opacity-50" />
        <span>Image unavailable</span>
        <span className="text-[9px] opacity-70 text-center">The linked file may have been removed or made private.</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
};
