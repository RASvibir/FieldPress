import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToPhotoDataUrl } from "@/lib/capture-photo";

type Props = {
  signedIn: boolean;
  onNeedSignIn: () => void;
  onPhoto: (dataUrl: string) => Promise<void> | void;
  busy?: boolean;
};

export function CaptureBar({ signedIn, onNeedSignIn, onPhoto, busy }: Props) {
  const libraryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!live || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play();
  }, [live]);

  function stopLive() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLive(false);
  }

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setHint(null);
    try {
      const dataUrl = await fileToPhotoDataUrl(file);
      await onPhoto(dataUrl);
    } catch (err) {
      setHint(err instanceof Error ? err.message : "Could not use that photo");
    }
  }

  async function requestCamera() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }
    setHint(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setHint("This browser has no camera API. Use Photo library.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError") setHint("Camera permission was denied. Allow camera, or use Photo library.");
      else setHint("Could not open the camera. Use Photo library.");
    }
  }

  async function snapLive() {
    const video = videoRef.current;
    if (!video || video.videoWidth < 2) {
      setHint("Camera is still starting.");
      return;
    }
    const canvas = document.createElement("canvas");
    const max = 1600;
    const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
    stopLive();
    await onPhoto(dataUrl);
  }

  function requestLibrary() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }
    libraryRef.current?.click();
  }

  return (
    <div className="space-y-2">
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {live && (
        <div className="space-y-2 border border-neon/30 bg-card p-2">
          <video ref={videoRef} playsInline muted autoPlay className="w-full max-h-64 bg-black object-cover" />
          <div className="flex gap-2">
            <Button type="button" onClick={() => void snapLive()} disabled={busy}>
              SNAP
            </Button>
            <Button type="button" variant="ghost" onClick={stopLive}>
              <X className="w-4 h-4 mr-1" />
              CANCEL
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" disabled={busy || live} onClick={() => void requestCamera()}>
          <Camera className="w-4 h-4 mr-2" />
          CAMERA
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 border-neon-yellow/40 text-neon-yellow"
          disabled={busy}
          onClick={requestLibrary}
        >
          <ImagePlus className="w-4 h-4 mr-2" />
          PHOTO LIBRARY
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        {signedIn
          ? "Camera uses this device after you allow it, then Snap. Photo library is for a file already on the phone."
          : "Sign in to use the camera or photo library. Public notes do not need an account."}
      </p>
      {hint && <p className="text-xs text-neon-red">{hint}</p>}
    </div>
  );
}
