import React from "react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  /** Visible label beside the icon (optional). */
  label?: string;
  title?: string;
  size?: number;
  className?: string;
  isDark?: boolean;
};

/** Subtle imbrgr studio handoff control — favicon only unless `label` is set. */
export const ImbrgrIconButton: React.FC<Props> = ({
  onClick,
  disabled,
  label,
  title = "Make or edit on imbrgr",
  size = 20,
  className = "",
  isDark,
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={onClick}
    className={
      label
        ? `inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isDark ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-200 hover:bg-zinc-100"
          } ${className}`
        : `p-1.5 rounded-lg border shrink-0 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 ${
            isDark ? "border-zinc-700 hover:bg-zinc-800 ring-offset-zinc-900" : "border-zinc-200 hover:bg-zinc-100 ring-offset-white"
          } ${className}`
    }
  >
    <img
      src="/brand/imbrgr-icon.svg"
      alt=""
      width={size}
      height={size}
      className="block object-contain"
      style={{ width: size, height: size }}
    />
    {label ? <span>{label}</span> : null}
  </button>
);
