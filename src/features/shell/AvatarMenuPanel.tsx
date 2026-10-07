import React from "react";

type Props = {
  isDark: boolean;
  signedIn: boolean;
  canAdmin: boolean;
  onClose: () => void;
  onProfile: () => void;
  onDrafts: () => void;
  onSaved: () => void;
  onAssistant: () => void;
  onSettings: () => void;
  onAdmin: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

export const AvatarMenuPanel: React.FC<Props> = ({
  isDark,
  signedIn,
  canAdmin,
  onClose,
  onProfile,
  onDrafts,
  onSaved,
  onAssistant,
  onSettings,
  onAdmin,
  onSignIn,
  onSignOut,
}) => (
  <>
    <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />
    <div
      className={`absolute right-0 mt-2 w-52 rounded-lg border shadow-xl z-50 py-1 text-sm ${
        isDark ? "bg-zinc-900 border-zinc-700 text-zinc-200" : "bg-white border-zinc-200 text-zinc-800"
      }`}
    >
      {signedIn ? (
        <>
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10" onClick={onProfile}>
            Press Pass / Profile
          </button>
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10" onClick={onDrafts}>
            Drafts
          </button>
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10" onClick={onSaved}>
            Saved
          </button>
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10" onClick={onAssistant}>
            Assistant
          </button>
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10" onClick={onSettings}>
            Settings
          </button>
          {canAdmin && (
            <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10 text-amber-500 font-semibold" onClick={onAdmin}>
              Admin
            </button>
          )}
          <hr className={isDark ? "border-zinc-800" : "border-zinc-200"} />
          <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10 text-rose-400" onClick={onSignOut}>
            Sign out
          </button>
        </>
      ) : (
        <button type="button" className="w-full text-left px-3 py-2 hover:bg-amber-500/10 font-semibold" onClick={onSignIn}>
          Sign in to post
        </button>
      )}
    </div>
  </>
);
