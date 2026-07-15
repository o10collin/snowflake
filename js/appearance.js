// Projects the current settings onto the page: theme, accent, and which
// dashboard sections are visible.

import { ACCENTS } from "./config.js";
import { settings } from "./store.js";
import { state } from "./state.js";
import { setHidden } from "./util.js";
import { renderGreeting, renderClock, renderStats } from "./dashboard.js";
import { renderLatestVideo } from "./youtube.js";

const prefersLight = () => window.matchMedia("(prefers-color-scheme: light)");

function resolveTheme(theme) {
  if (theme !== "system") return theme;
  return prefersLight().matches ? "light" : "dark";
}

export function applySettings() {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme(settings.theme);
  root.style.setProperty("--accent-rgb", (ACCENTS[settings.accent] || ACCENTS.mono).rgb);

  setHidden(document.getElementById("clock"), !settings.showClock);
  setHidden(document.getElementById("stats-row"), !settings.showStats);
  setHidden(document.getElementById("quick-links-column"), !settings.showQuickLinks);
  setHidden(document.getElementById("todo-column"), !settings.showTodo);
  document.body.classList.toggle("no-feed", !settings.showFeed);

  renderGreeting();
  renderClock();
  renderStats();
  renderLatestVideo(state.videos[0]);
}

export function initSystemThemeWatcher() {
  prefersLight().addEventListener("change", () => {
    if (settings.theme === "system") applySettings();
  });
}
