import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const FieldPressMaster = lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-950">
          Loading FieldPress…
        </div>
      }
    >
      <FieldPressMaster />
    </Suspense>
  </React.StrictMode>
);
