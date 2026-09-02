import { useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fileToPhotoDataUrl } from "@/lib/capture-photo";

type Props = {
  signedIn: boolean;
  onNeedSignIn: () => void;
  onPhoto: (dataUrl: string) => Promise<void> | void;
  busy?: boolean;
};

export function CaptureBar({ signedIn, onNeedSignIn, onPhoto, busy }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [hint, setHint] = useState<string | null>(null);

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

  function requestCamera() {
    if (!signedIn) {
      onNeedSignIn();
      return;
    }
    cameraRef.current?.click();
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
      {signedIn && (
        <>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
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
        </>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" disabled={busy} onClick={requestCamera}>
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
          ? "Camera opens only after you tap. Cancel is fine. Device photos stay on your signed-in desk."
          : "Sign in to use the camera or photo library. Public notes do not need an account."}
      </p>
      {hint && <p className="text-xs text-neon-red">{hint}</p>}
    </div>
  );
}
