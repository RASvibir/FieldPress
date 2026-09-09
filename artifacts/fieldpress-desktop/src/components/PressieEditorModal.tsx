import React, { useState } from "react";
import { X, Edit3, Save, Plus } from "lucide-react";

export const PressieEditorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  story: any;
  onSaved: (updated: any) => void;
}> = ({ isOpen, onClose, story, onSaved }) => {
  const [title, setTitle] = useState(story?.title || "");
  const initialText = story?.items?.find((i: any) => i.type === "text" || !i.type)?.content || "";
  const [content, setContent] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !story) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/stories/" + story.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        onSaved(data);
        window.location.reload();
      } else {
        alert(data.error || "Failed to update pressie");
      }
    } catch {
      alert("Network error updating pressie");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10006] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono text-xs text-foreground">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-border bg-card p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <Edit3 className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm uppercase text-foreground">Edit Verified Pressie</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-muted text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border-2 border-border rounded-xl p-3 text-foreground font-serif font-bold text-base focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Dispatch Body & Notes</label>
              <button
                type="button"
                onClick={() => setContent(prev => prev + "\n\n[UPDATE " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "]: ")}
                className="text-[11px] text-primary hover:underline font-bold"
              >
                + Insert Timestamp Update
              </button>
            </div>
            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-background border-2 border-border rounded-xl p-3 text-foreground text-xs leading-relaxed focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save & Update Newsstand"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PressieEditorModal;
