import React from "react";
import { Bell, Home, Compass, Plus, MessageCircle, Menu, Search } from "lucide-react";
import { HOME_BUREAU } from "../../config/site";

export type MainSection = "home" | "explore";

type Props = {
  section: MainSection;
  onSectionChange: (s: MainSection) => void;
  onPost: () => void;
  onMessages: () => void;
  onNotifications: () => void;
  onSearch: () => void;
  onAvatarMenu: () => void;
  avatarUrl?: string;
  isDark: boolean;
  notifCount: number;
  showAvatarMenu: boolean;
  avatarMenu: React.ReactNode;
};

export const MainNav: React.FC<Props> = ({
  section,
  onSectionChange,
  onPost,
  onMessages,
  onNotifications,
  onSearch,
  onAvatarMenu,
  avatarUrl,
  isDark,
  notifCount,
  showAvatarMenu,
  avatarMenu,
}) => {
  const tab = (id: MainSection, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => onSectionChange(id)}
      className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
        section === id
          ? isDark
            ? "bg-zinc-800 text-amber-400"
            : "bg-zinc-200 text-amber-800"
          : isDark
          ? "text-zinc-400 hover:text-zinc-200"
          : "text-zinc-600 hover:text-zinc-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-md px-3 sm:px-5 py-2.5 ${
        isDark ? "bg-zinc-950/95 border-zinc-800" : "bg-white/95 border-zinc-200"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={() => onSectionChange("home")}
          className="flex items-center gap-1.5 font-bold text-sm shrink-0"
        >
          <span className="text-amber-500">Fp_</span>
          <img src="/pressie.svg" alt="" className="h-5 w-5" />
          <span className="hidden sm:inline">FieldPress</span>
        </button>
        <span className={`hidden lg:inline text-[10px] truncate ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
          {HOME_BUREAU.label}
        </span>

        <nav className="flex items-center gap-1 flex-1 justify-center min-w-0 overflow-x-auto">
          {tab("home", "Home", <Home className="h-3.5 w-3.5" />)}
          {tab("explore", "Explore", <Compass className="h-3.5 w-3.5" />)}
          <button
            type="button"
            onClick={onPost}
            className="mx-1 px-3 py-1.5 rounded-full bg-amber-500 text-zinc-950 text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-amber-400 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Post
          </button>
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" onClick={onSearch} className="p-2 rounded-lg hover:bg-zinc-800/50" title="Search">
            <Search className="h-4 w-4" />
          </button>
          <button type="button" onClick={onMessages} className="p-2 rounded-lg hover:bg-zinc-800/50" title="Messages">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button type="button" onClick={onNotifications} className="relative p-2 rounded-lg hover:bg-zinc-800/50" title="Notifications">
            <Bell className="h-4 w-4" />
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={onAvatarMenu}
              className="w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center bg-zinc-800"
              title="Account menu"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Menu className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            {showAvatarMenu && avatarMenu}
          </div>
        </div>
      </div>
    </header>
  );
};
