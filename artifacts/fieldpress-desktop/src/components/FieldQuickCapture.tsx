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

  // 1. Watermarked Camera Capture
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

      // Draw original image (strips native EXIF)
      ctx.drawImage(img, 0, 0);

      // Render Tactical High-Contrast Watermark Bar
      const bannerHeight = Math.max(36, Math.floor(img.height * 0.05));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, img.height - bannerHeight, img.width, bannerHeight);

      // Watermark Text
      const fontSize = Math.max(14, Math.floor(bannerHeight * 0.45));
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.fillStyle = '#10b981';
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const watermark = `FIELDPROOF // ${corridor.toUpperCase()} // ${timestamp} UTC`;
      ctx.fillText(watermark, 20, img.height - bannerHeight / 2 + fontSize / 3);

      const watermarked = canvas.toDataURL('image/jpeg', 0.88);
      onPhotoCaptured(watermarked);
    };
  };

  // 2. Quick Voice Memo Recording
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
        reader.onloadend = () => {
          onAudioRecorded(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mr.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access is required for field voice notes.');
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

      {/* Quick Camera Snap */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs"
      >
        <span>📸</span>
        <span>Quick Scene Snap</span>
      </button>

      {/* Quick Voice Memo */}
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
        Auto-stamps: {corridor}
      </span>
    </div>
  );
};

export default FieldQuickCapture;
