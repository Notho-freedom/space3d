import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

// Trace la modalité d'interaction courante sur <html>. Certains navigateurs
// (Opera GX) laissent l'anneau de focus après un simple clic ; la feuille de
// style masque l'indicateur en mode "pointer" et le rétablit dès qu'on
// navigue au clavier.
const root = document.documentElement;
const setMode = (mode: "pointer" | "keyboard") => {
  root.setAttribute("data-input-mode", mode);
};
setMode("pointer");
window.addEventListener("pointerdown", () => setMode("pointer"), true);
window.addEventListener("mousedown", () => setMode("pointer"), true);
window.addEventListener("touchstart", () => setMode("pointer"), true);
// `key` n'est pas garanti : autocomplétion de mot de passe, saisie IME et
// évènements synthétiques d'extensions en émettent sans. On le lit donc de
// façon défensive plutôt que d'appeler une méthode sur undefined.
const KEYBOARD_KEYS = new Set(["Tab", "Enter", " ", "Escape", "Home", "End"]);
window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key;
  if (typeof key !== "string") return;
  if (KEYBOARD_KEYS.has(key) || key.startsWith("Arrow")) {
    setMode("keyboard");
  }
}, true);
const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<App />);
}