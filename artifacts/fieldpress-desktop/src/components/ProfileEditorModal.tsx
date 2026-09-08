import React, { useState } from 'react';
import { ReporterProfile } from '../pages/profile';

export const ProfileEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  profile: ReporterProfile;
  onSave: (updated: Partial<ReporterProfile>) => Promise<void>;
}> = ({ isOpen, onClose, profile, onSave }) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(profile.coverPhotoUrl);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ displayName, bio, coverPhotoUrl, avatarUrl });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 font-mono text-xs p-4">
      <div className="w-full max-w-lg rounded-lg border border-zinc-700 bg-zinc-950 p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white uppercase">⚙️ Edit Reporter Desk Profile</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded p-2 text-zinc-200 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Bio / Mission Statement</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded p-2 text-zinc-200 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Cover Photo URL (Widescreen)</label>
            <input
              type="text"
              value={coverPhotoUrl}
              onChange={e => setCoverPhotoUrl(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded p-2 text-zinc-200 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded p-2 text-zinc-200 text-xs"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 border border-zinc-800 text-zinc-400 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded"
            >
              {isSaving ? 'Saving to Database...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
