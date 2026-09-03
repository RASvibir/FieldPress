import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { captureInstallPrompt, registerServiceWorker } from "@/hooks/use-install";
import { applyDisplaySettings } from "@/lib/desk-settings";

captureInstallPrompt();
void registerServiceWorker();
applyDisplaySettings();

createRoot(document.getElementById("root")!).render(<App />);
