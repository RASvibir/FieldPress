import React, { useState, useRef } from "react";
import { ShieldCheck, X, Camera, User, Upload } from "lucide-react";
import { PressPassData } from "../../types/dispatch";
import { PressieMark } from "../common/PressieMark";
import { getAccentColorClasses } from "../../theme/tokens";

interface PressPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  pressPass: PressPassData;
  onSavePass: (data: PressPassData) => void;
  isDark: boolean;
  inputThemeClass: string;
  borderThemeClass: string;
}

export const PressPassModal: React.FC<PressPassModalProps> = ({
  isOpen,
  onClose,
  pressPass,
  onSavePass,
  isDark,
  inputThemeClass,
  borderThemeClass
}) => {
  const [editPassForm, setEditPassForm] = useState<PressPassData>(pressPass);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setEditPassForm(pressPass);
    }
  }, [isOpen, pressPass]);

  if (!isOpen) return null;

  const livePassAccent = getAccentColorClasses(editPassForm.accentColor);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditPassForm((prev) => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-xl border-2 shadow-2xl overflow-hidden transition-all duration-300 ${
        livePassAccent.border
      } ${isDark ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"}`}>
        
        <div className="flex-shrink-0 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className={`h-5 w-5 ${livePassAccent.text} transition-colors duration-200`} />
            <h3 className="font-bold text-base">Press Pass Credential & ID Studio</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 font-mono text-xs">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          <div className="flex flex-col items-center">
            <div className={`w-full max-w-md rounded-xl border-2 p-5 relative overflow-hidden shadow-2xl transition-all duration-300 ${
              livePassAccent.border
            } ${isDark ? "bg-zinc-950" : "bg-zinc-50"}`}>
              <div className={`absolute top-0 left-0 right-0 h-2.5 transition-all duration-300 ${livePassAccent.bar}`} />

              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 pt-1">
                <div className="flex items-center gap-1.5 font-mono text-xs font-black tracking-tight">
                  <span className={`${livePassAccent.text} font-black`}>FP_</span>
                  <PressieMark className="h-4 w-4" />
                  <span className="font-bold text-zinc-100 ml-0.5">FIELDPRESS</span>
                  <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-400 ml-1">PRESS CORPS</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-zinc-500 tracking-wider">
                  {editPassForm.badgeId}
                </span>
              </div>

              <div className="flex gap-4 my-4 items-center">
                <div className="flex flex-col items-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className={`w-20 h-24 rounded border-2 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group transition hover:border-amber-400 shadow-md ${
                      isDark ? "bg-zinc-900 border-zinc-700" : "bg-zinc-200 border-zinc-300"
                    }`}
                    title="Click photo frame to upload profile image"
                  >
                    {editPassForm.avatarUrl ? (
                      <>
                        <img
                          src={editPassForm.avatarUrl}
                          alt={editPassForm.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition text-[9px] font-mono font-bold">
                          <Camera className="h-4 w-4 mb-0.5 text-amber-400" />
                          <span>CHANGE</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <User className="h-8 w-8 text-zinc-400 group-hover:text-amber-400 transition mb-1" />
                        <div className="font-mono text-[8px] text-amber-500 font-bold uppercase tracking-tight flex items-center gap-0.5">
                          <Upload className="h-2.5 w-2.5" /> ADD PHOTO
                        </div>
                      </>
                    )}
                  </button>
                  {editPassForm.avatarUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditPassForm({ ...editPassForm, avatarUrl: undefined });
                      }}
                      className="mt-1 text-[10px] font-mono text-zinc-500 hover:text-rose-400 cursor-pointer transition hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    ISSUED CREDENTIAL
                  </div>
                  <div className="font-extrabold text-lg leading-tight">
                    {editPassForm.name || "Reporter Name"}
                  </div>
                  <div className={`font-mono text-xs font-bold ${livePassAccent.text}`}>
                    @{editPassForm.callsign || "callsign"}
                  </div>
                  <div className="font-mono text-xs text-zinc-400 pt-0.5">
                    {editPassForm.role}
                  </div>
                  <div className="font-mono text-[11px] text-zinc-500">
                    {editPassForm.bureau}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between font-mono text-[10px]">
                <span className="text-zinc-500">VALID: {editPassForm.issueDate}</span>
                <span className={`px-2 py-0.5 rounded font-black tracking-widest text-[9px] uppercase transition-all duration-300 ${livePassAccent.badge}`}>
                  ACTIVE CREDENTIAL
                </span>
              </div>
            </div>

            <p className="text-[11px] font-mono text-zinc-400 mt-2 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span>Click the photo frame on the badge above to add your profile image.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Full Legal / Byline Name</label>
              <input
                type="text"
                value={editPassForm.name}
                onChange={(e) => setEditPassForm({ ...editPassForm, name: e.target.value })}
                className={`w-full rounded px-3 py-2 ${inputThemeClass}`}
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Reporter Callsign (handle)</label>
              <input
                type="text"
                value={editPassForm.callsign}
                onChange={(e) => setEditPassForm({ ...editPassForm, callsign: e.target.value })}
                className={`w-full rounded px-3 py-2 ${inputThemeClass}`}
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Role / Clearance Level</label>
              <select
                value={editPassForm.role}
                onChange={(e) => setEditPassForm({ ...editPassForm, role: e.target.value })}
                className={`w-full rounded px-3 py-2 cursor-pointer ${inputThemeClass}`}
              >
                <option value="Bureau Chief & Field Lead">Bureau Chief & Field Lead</option>
                <option value="Senior Investigative Correspondent">Senior Investigative Correspondent</option>
                <option value="Field Reporter & Photographer">Field Reporter & Photographer</option>
                <option value="Independent Wire Dispatcher">Independent Wire Dispatcher</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Bureau / Outlet Affiliation</label>
              <input
                type="text"
                value={editPassForm.bureau}
                onChange={(e) => setEditPassForm({ ...editPassForm, bureau: e.target.value })}
                className={`w-full rounded px-3 py-2 ${inputThemeClass}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-2 font-bold">Badge Accent Trim (Live Preview)</label>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "amber", label: "Amber Gold", class: "bg-amber-500", ring: "ring-amber-400 border-amber-400 text-amber-400" },
                { id: "emerald", label: "Emerald Press", class: "bg-emerald-500", ring: "ring-emerald-400 border-emerald-400 text-emerald-400" },
                { id: "cyan", label: "Cyber Cyan", class: "bg-cyan-500", ring: "ring-cyan-400 border-cyan-400 text-cyan-400" },
                { id: "rose", label: "Wire Crimson", class: "bg-rose-500", ring: "ring-rose-400 border-rose-400 text-rose-400" },
                { id: "zinc", label: "Monoprint", class: "bg-zinc-400", ring: "ring-zinc-400 border-zinc-400 text-zinc-200" }
              ].map((col) => {
                const isSelected = editPassForm.accentColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setEditPassForm({ ...editPassForm, accentColor: col.id })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[11px] transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? `ring-2 ring-offset-2 ring-offset-zinc-950 bg-zinc-800 font-bold shadow-md ${col.ring}`
                        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${col.class} ${isSelected ? "ring-2 ring-white/60" : ""}`} />
                    <span>{col.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`flex-shrink-0 p-4 border-t flex items-center justify-between font-mono text-xs ${borderThemeClass} ${
          isDark ? "bg-zinc-950/80" : "bg-zinc-50"
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSavePass(editPassForm);
              onClose();
            }}
            className={`px-5 py-2 rounded font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-md ${livePassAccent.btn}`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Save Press Pass Credentials</span>
          </button>
        </div>
      </div>
    </div>
  );
};
