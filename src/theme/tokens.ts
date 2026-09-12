// FieldPress Design Tokens & Centralized Theme Classes

export const FIELD_THEME = {
  card: "bg-zinc-900/60 border border-zinc-800 text-zinc-100",
  subCard: "bg-zinc-950/60 border border-zinc-800 text-zinc-300",
  input: "bg-zinc-950 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500",
  subText: "text-zinc-500 font-mono text-[10px]",
  accentEmerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  accentAmber: "bg-amber-500 text-zinc-950 font-bold",
  badge: "font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border"
} as const;

export interface AccentColorClasses {
  bar: string;
  text: string;
  border: string;
  badge: string;
  btn: string;
}

export const getAccentColorClasses = (color: string): AccentColorClasses => {
  switch (color) {
    case "emerald":
      return {
        bar: "bg-emerald-500",
        text: "text-emerald-400",
        border: "border-emerald-500/50",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        btn: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
      };
    case "cyan":
      return {
        bar: "bg-cyan-500",
        text: "text-cyan-400",
        border: "border-cyan-500/50",
        badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        btn: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950"
      };
    case "rose":
      return {
        bar: "bg-rose-500",
        text: "text-rose-400",
        border: "border-rose-500/50",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        btn: "bg-rose-500 hover:bg-rose-400 text-zinc-950"
      };
    case "zinc":
      return {
        bar: "bg-zinc-400",
        text: "text-zinc-300",
        border: "border-zinc-500/50",
        badge: "bg-zinc-800 text-zinc-300 border-zinc-600",
        btn: "bg-zinc-300 hover:bg-zinc-200 text-zinc-950"
      };
    case "amber":
    default:
      return {
        bar: "bg-amber-500",
        text: "text-amber-400",
        border: "border-amber-500/50",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        btn: "bg-amber-500 hover:bg-amber-400 text-zinc-950"
      };
  }
};

export const getThemeClasses = (theme: "dark" | "light") => {
  const isDark = theme === "dark";
  return {
    isDark,
    inputThemeClass: isDark
      ? "bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500"
      : "bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 shadow-xs",
    cardThemeClass: isDark
      ? "bg-zinc-900/60 border-zinc-800 text-zinc-100"
      : "bg-white border-zinc-200 text-zinc-900 shadow-xs",
    subCardThemeClass: isDark
      ? "bg-zinc-950/40 border-zinc-800"
      : "bg-zinc-50 border-zinc-200",
    borderThemeClass: isDark ? "border-zinc-800" : "border-zinc-200",
    subTextThemeClass: isDark ? "text-zinc-400" : "text-zinc-600"
  };
};
