import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";

// Tell Remotion's staticFile() where public assets live on GitHub Pages.
// In dev this is "/" but on GH Pages it's "/Content-gen/".
(window as any).remotion_staticBase = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
