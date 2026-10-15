import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@tiket-ds/fonts/fonts.css";
import "@tiket-ds/tokens/tokens.css";
import "@tiket-ds/ui/styles.css";
import "./example.css";

import { App } from "./App.js";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from index.html");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
