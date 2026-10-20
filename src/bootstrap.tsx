import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
// @ts-ignore CSS is loaded by the bundler; TypeScript has no declaration for it.
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
