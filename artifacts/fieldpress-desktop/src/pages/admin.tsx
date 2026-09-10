import React, { useState } from "react";
import { Shield, Radio, Key, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export const AdminDashboardPage: React.FC = () => {
  const [, navigate] = useLocation();
  const [issuedHandle, setIssuedHandle] = useState("");
  const [activeFrequencies] = useState([
    { county: "Vermilion / Danville", freq: "160.800 MHz", status: "ACTIVE", listeners: 14 },
    { county: "Champaign / Urbana", freq: "161.100 MHz", status: "ACTIVE", listeners: 22 },
    { county: "Vanderburgh / Evansville", freq: "160.550 MHz", status: "STANDBY", listeners: 6 },
    { county: "Cook / Chicago Loop", freq: "161.350 MHz", status: "ACTIVE", listeners: 48 },
  ]);

  const handleIssueCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuedHandle.trim()) return;
    alert("Frontline Scout seal granted to @" + issuedHandle.replace("@", ""));
    setIssuedHandle("");
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-6 font-mono pt-20 max-w-6xl mx-auto space-y-6">
      <div className="border border-red-900/60 bg-red-950/20 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-900/40 border border-red-700 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-red-300 uppercase">Bureau Oversight Console</h1>
              <span className="text-[10px] bg-red-900/60 text-red-200 px-1.5 py-0.5 rounded font-bold">SUPER ADMIN</span>
            </div>
            <p className="text-xs text-zinc-400">Identity: vibir@fieldpress.studio • Host: fieldpress.studio</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-xs px-3 py-1.5 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-900"
        >
          ← Return to Desk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
              <Radio className="w-4 h-4" /> Regional Frequency Routing
            </h2>
            <span className="text-[10px] text-zinc-500">Auto-Balancing</span>
          </div>
          <div className="space-y-2">
            {activeFrequencies.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded bg-zinc-900/70 border border-zinc-800/80 text-xs">
                <div>
                  <div className="font-bold text-zinc-200">{f.county}</div>
                  <div className="text-[10px] text-zinc-500">{f.freq}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-400">{f.listeners} scouts</span>
                  <span className={"text-[10px] px-1.5 py-0.5 rounded font-bold " + (f.status === "ACTIVE" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-zinc-800 text-zinc-400")}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-xl space-y-4">
          <h2 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-2">
            <Key className="w-4 h-4" /> Issue Frontline Scout Seal
          </h2>
          <p className="text-xs text-zinc-400">
            Authorize field reporters to sign cryptographic dispatches and field verifications.
          </p>
          <form onSubmit={handleIssueCredential} className="space-y-3">
            <div>
              <label className="text-[10px] uppercase text-zinc-500 block mb-1">Reporter Callsign / Handle</label>
              <input
                type="text"
                placeholder="@callsign"
                value={issuedHandle}
                onChange={e => setIssuedHandle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-xs transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Issue Cryptographic Press Seal
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Official Desk Inquiries:</span>
            <a href="mailto:support@fieldpress.studio" className="text-amber-400 hover:underline">
              support@fieldpress.studio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
