import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { captureInstallPrompt, registerServiceWorker } from "@/hooks/use-install";

captureInstallPrompt();
void registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
