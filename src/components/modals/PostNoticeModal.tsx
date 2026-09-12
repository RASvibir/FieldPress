import React, { useState } from "react";
import { X } from "lucide-react";
import { ClassifiedItem, PressPassData } from "../../types/dispatch";

interface PostNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostNotice: (item: ClassifiedItem) => void;
  pressPass: PressPassData;
  isDark: boolean;
  inputThemeClass: string;
}

export const PostNoticeModal: React.FC<PostNoticeModalProps> = ({
  isOpen,
  onClose,
  onPostNotice,
  pressPass,
  isDark,
  inputThemeClass
}) => {
  const [noticeTag, setNoticeTag] = useState("NOTICE");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDetails, setNoticeDetails] = useState("");
  const [noticeContact, setNoticeContact] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeDetails.trim()) return;

    const newItem: ClassifiedItem = {
      id: `c-${Date.now()}`,
      tag: noticeTag,
      tagColor: noticeTag === "NOTICE" ? "amber" : noticeTag === "EQUIPMENT" ? "emerald" : noticeTag === "TRANSIT" ? "cyan" : "rose",
      title: noticeTitle.trim(),
      details: noticeDetails.trim(),
      contact: noticeContact.trim() || `@${pressPass.callsign}`,
      timestamp: "Just now"
    };

    onPostNotice(newItem);
    setNoticeTitle("");
    setNoticeDetails("");
    setNoticeContact("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-xl border shadow-2xl p-6 font-mono text-xs ${
        isDark ? "bg-zinc-900 border-zinc-700 text-zinc-100" : "bg-white border-zinc-300 text-zinc-900"
      }`}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <h3 className="font-bold text-sm">Post Community Bulletin Notice</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 cursor-pointer p-1 rounded hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Notice Category</label>
            <select
              value={noticeTag}
              onChange={(e) => setNoticeTag(e.target.value)}
              className={`w-full rounded px-2.5 py-1.5 cursor-pointer ${inputThemeClass}`}
            >
              <option value="NOTICE">NOTICE</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
              <option value="TRANSIT">TRANSIT</option>
              <option value="ALERT">ALERT</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Headline / Title</label>
            <input
              type="text"
              placeholder="e.g. Route 1 Volunteer Packet Check-in"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              required
              className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Notice Details</label>
            <textarea
              rows={3}
              placeholder="Details, venue, requirements..."
              value={noticeDetails}
              onChange={(e) => setNoticeDetails(e.target.value)}
              required
              className={`w-full rounded px-2.5 py-1.5 font-sans ${inputThemeClass}`}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Contact Coordinate</label>
            <input
              type="text"
              placeholder="Email, packet frequency, or signal handle"
              value={noticeContact}
              onChange={(e) => setNoticeContact(e.target.value)}
              className={`w-full rounded px-2.5 py-1.5 ${inputThemeClass}`}
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition cursor-pointer shadow-xs"
            >
              Post Bulletin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
