import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Resume } from "./resume/Resume";
import "./app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Resume />
  </StrictMode>,
);
