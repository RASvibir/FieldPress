# Device access (web)

FieldPress asks for sensitive capabilities only after a reporter chooses the related action. A browser permission is not consent to upload, run AI, share, or publish.

## Rules

1. Ask only after an explicit user action.
2. Ask only for the minimum permission for that action.
3. Do not request camera, microphone, or location on first load.
4. Treat cancel as a normal outcome.
5. Keep a useful fallback (file picker, typed notes, skip).
6. Store local evidence only after a completed capture or selection.
7. Require a separate step for sync, transcription, sharing, or publishing.

These rules apply to the responsive web app at https://fieldpress.studio and to Tauri later. They do not require Expo or an app-store client.
