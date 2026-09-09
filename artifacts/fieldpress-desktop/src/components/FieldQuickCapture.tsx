import React, { useState, useRef } from 'react';

export interface FieldQuickCaptureProps {
  corridor: string;
  onPhotoCaptured: (watermarkedDataUrl: string) => void;
  onAudioRecorded: (audioDataUrl: string) => void;
}

export const FieldQuickCapture: React.FC<FieldQuickCaptureProps> = ({
  corridor,
  onPhotoCaptured,
  onAudioRecorded,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Light, Transparent Favicon Watermarking
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Light transparent overlay badge in bottom-right corner
      const badgeWidth = Math.max(260, Math.floor(img.width * 0.35));
      const badgeHeight = Math.max(48, Math.floor(img.height * 0.07));
      const x = img.width - badgeWidth - 20;
      const y = img.height - badgeHeight - 20;

      // Subtle translucent backdrop (light gradient)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, badgeWidth, badgeHeight, 8);
      ctx.fill();
      ctx.stroke();

      // Draw favicon logo
      const icon = new Image();
      icon.src = '/favicon.svg';
      icon.onload = () => {
        const iconSize = Math.floor(badgeHeight * 0.65);
        ctx.globalAlpha = 0.85;
        ctx.drawImage(icon, x + 12, y + (badgeHeight - iconSize) / 2, iconSize, iconSize);

        // Watermark text
        const fontSize = Math.max(12, Math.floor(badgeHeight * 0.32));
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(corridor.toUpperCase(), x + iconSize + 22, y + badgeHeight * 0.45);

        ctx.font = `${Math.max(10, fontSize - 2)}px monospace`;
        ctx.fillStyle = '#10b981';
        const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
        ctx.fillText(`FIELDPROOF // ${timestamp} UTC`, x + iconSize + 22, y + badgeHeight * 0.78);

        onPhotoCaptured(canvas.toDataURL('image/jpeg', 0.9));
      };
      icon.onerror = () => {
        onPhotoCaptured(canvas.toDataURL('image/jpeg', 0.9));
      };
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      mr.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => onAudioRecorded(reader.result as string);
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      alert('Microphone access required for field audio memos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 font-mono text-xs">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs"
      >
        <span>📸</span>
        <span>Quick Scene Snap</span>
      </button>

      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 border border-cyan-800/60 font-bold text-xs"
        >
          <span>🎙️</span>
          <span>Record Voice Memo</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center space-x-2 px-3 py-1.5 rounded bg-red-950 text-red-300 border border-red-600 font-bold text-xs animate-pulse"
        >
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>Stop Memo ({recordingSeconds}s)</span>
        </button>
      )}

      <span className="text-[10px] text-zinc-500 hidden sm:inline ml-auto">
        Watermark: {corridor}
      </span>
    </div>
  );
};

export default FieldQuickCapture;
