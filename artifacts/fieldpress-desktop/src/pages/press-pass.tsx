import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useSkin } from '../context/SkinContext';

export interface PressPassProps {
  params?: { handle?: string };
}

export const PressPassPage: React.FC<PressPassProps> = (props) => {
  const [, routeParams] = useRoute('/pass/:handle');
  const handle = routeParams?.handle || props.params?.handle || 'ras.ip';
  const { skinConfig } = useSkin();
  const [passIssueTime, setPassIssueTime] = useState('');

  useEffect(() => {
    setPassIssueTime(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }, []);

  const verificationHash = `FP-PASS-${handle.toUpperCase()}-VERIFIED-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="max-w-md mx-auto px-4 pt-20 sm:pt-24 pb-16 font-mono text-zinc-200">
      <div className="text-center mb-4">
        <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
          ← Return to Newsroom Desk
        </a>
      </div>

      {/* Tamper-Evident Physical Press Card Simulation */}
      <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-950 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
        {/* Top Security Banner */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 text-center">
          <div className="text-[9px] uppercase tracking-[0.25em] text-emerald-400 font-bold mb-1">
            VERIFIED FIELD JOURNALISM CREDENTIAL
          </div>
          <h1 className="text-lg font-bold tracking-wider text-white">FIELDPRESS NEWSROOM</h1>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            DECENTRALIZED FREELANCE BUREAU CORRESPONDENT
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          {/* Portrait & Core Info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className="h-24 w-24 rounded-xl bg-zinc-900 border-2 flex items-center justify-center text-xl font-bold text-cyan-300 shadow-inner"
                style={{ borderColor: skinConfig.hex }}
              >
                @{handle.slice(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-black" />
            </div>

            <div className="space-y-1">
              <div className="text-base font-bold text-white leading-tight">
                {handle === 'ras.ip' ? 'Victor Birkle' : 'Pamela Black'}
              </div>
              <div className="text-xs text-cyan-400 font-semibold">@{handle}</div>
              <div className="text-[10px] text-zinc-400">
                Corridor: <span className="text-zinc-200 font-bold">Danville • Vermilion Desk</span>
              </div>
              <div className="inline-block px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[10px] font-bold">
                🎖️ Frontline Scout
              </div>
            </div>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
            <div>
              <div className="text-[9px] uppercase text-zinc-500 font-bold">SIGNAL SCORE</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">⚡ 842 CRED</div>
            </div>
            <div>
              <div className="text-[9px] uppercase text-zinc-500 font-bold">DISPATCH ACCURACY</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">98.4% PEER VETTED</div>
            </div>
          </div>

          {/* Mock QR Verification Stamp */}
          <div className="p-3 rounded-xl border border-zinc-800 bg-black flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-[9px] uppercase font-bold text-zinc-400">LIVE MERIT VERIFICATION</div>
              <div className="text-[10px] text-emerald-400 font-mono truncate max-w-[180px]">
                {verificationHash}
              </div>
              <div className="text-[9px] text-zinc-500">Issued: {passIssueTime} • Verified Offline</div>
            </div>
            {/* Visual Simulated QR Block */}
            <div className="h-12 w-12 bg-white p-1 rounded grid grid-cols-4 gap-0.5">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div key={idx} className={`${idx % 2 === 0 || idx % 5 === 0 ? 'bg-black' : 'bg-transparent'}`} />
              ))}
            </div>
          </div>

          {/* Legal Rights Callout */}
          <div className="text-[9px] text-zinc-500 leading-relaxed border-t border-zinc-800/80 pt-3 text-center">
            The bearer is an independent newsroom correspondent gathering news, audio logs, and photographic proof in public spaces. Protected under state and federal press freedoms.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressPassPage;
