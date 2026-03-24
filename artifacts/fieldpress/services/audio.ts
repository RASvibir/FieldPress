// FieldPress audio helpers — recording + playback via expo-av
// v2 hook: Add cloud upload here (e.g., S3 presigned URL) after stopRecording()
//          and store the remote URL instead of local URI in the StoryItem content.

import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let activeRecording: Audio.Recording | null = null;
let activeSound: Audio.Sound | null = null;

export const isAudioSupported = Platform.OS !== 'web';

export async function requestMicPermission(): Promise<boolean> {
  if (!isAudioSupported) return false;
  const { granted } = await Audio.requestPermissionsAsync();
  return granted;
}

export async function startRecording(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  activeRecording = recording;
}

export async function stopRecording(): Promise<string> {
  if (!activeRecording) throw new Error('No active recording');
  await activeRecording.stopAndUnloadAsync();
  const uri = activeRecording.getURI();
  activeRecording = null;
  // Reset audio mode so playback works normally after recording
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
  });
  if (!uri) throw new Error('Recording produced no URI');
  return uri;
}

export async function stopPlayback(): Promise<void> {
  if (activeSound) {
    try {
      await activeSound.stopAsync();
      await activeSound.unloadAsync();
    } catch {
      // Sound may already be unloaded
    }
    activeSound = null;
  }
}

export async function playRecording(
  uri: string,
  onFinish?: () => void,
): Promise<void> {
  await stopPlayback(); // Stop anything currently playing
  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true },
    (status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        activeSound = null;
        onFinish?.();
      }
    },
  );
  activeSound = sound;
}
