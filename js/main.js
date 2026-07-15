// Entry point: wires the modules together, runs the first render, and owns the
// background refresh loop.

import { REFRESH_INTERVAL_MS, TOAST_DURATION_MS, CHANNELS_CHANGED_EVENT } from "./config.js";
import { showToast, requestNotificationPermission, sendNotification } from "./notify.js";
import { renderQuickLinks, renderTodos, initTodo, renderGreeting, renderClock } from "./dashboard.js";
import { applySettings, initSystemThemeWatcher } from "./appearance.js";
import { initNavigation } from "./navigation.js";
import { initChannelDialog } from "./channel-dialog.js";
import { renderSettingsUI, initSettingsUI } from "./settings-ui.js";
import { loadVideos } from "./youtube.js";
import { loadStreams } from "./twitch.js";

const GREETING_INTERVAL_MS = 30 * 1000;
const CLOCK_INTERVAL_MS = 1000;

// ---------- background refresh ----------
let refreshInFlight = false;

// Silent by design: nothing on screen changes until the new data has arrived,
// and even then only if it differs from what's displayed.
async function refreshAll() {
  if (refreshInFlight) return; // a slow refresh must not stack with the next tick
  refreshInFlight = true;

  try {
    await Promise.all([loadVideos(), loadStreams()]);
    showToast({
      icon: "ti-refresh",
      title: "Aktualisiert",
      detail: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      duration: TOAST_DURATION_MS.status,
    });
  } finally {
    refreshInFlight = false;
  }
}

function initRefresh() {
  setInterval(() => {
    // don't hammer the proxies while the tab is in the background
    if (document.visibilityState === "visible") refreshAll();
  }, REFRESH_INTERVAL_MS);

  document.getElementById("manual-refresh").addEventListener("click", refreshAll);
}

// Deliberately bypasses the browserNotifications toggle: the click is an explicit
// request for both, and a test that silently does nothing is worse than useless.
function initNotificationTest() {
  document.getElementById("test-notification").addEventListener("click", async () => {
    showToast({ icon: "ti-bell", title: "Test-Benachrichtigung", detail: "So sieht ein Hinweis aus" });

    if (!("Notification" in window)) {
      showToast({
        icon: "ti-bell-off",
        title: "Keine Browser-Benachrichtigungen",
        detail: "Dieser Browser unterstützt sie nicht",
      });
      return;
    }

    if (!(await requestNotificationPermission())) {
      showToast({
        icon: "ti-bell-off",
        title: "Benachrichtigungen blockiert",
        detail: "Im Browser für diese Seite erlauben",
      });
      return;
    }

    sendNotification("Snowflake", "Test-Benachrichtigung — alles funktioniert.");
  });
}

// The quick-add dialog only touches the store, so reloading the affected feed
// (and refreshing the settings lists) is wired up here instead.
function initChannelSync() {
  document.addEventListener(CHANNELS_CHANGED_EVENT, (event) => {
    renderSettingsUI();

    if (event.detail.source === "youtube") {
      loadVideos();
      showToast({ icon: "ti-brand-youtube", title: "Kanal hinzugefügt", duration: TOAST_DURATION_MS.status });
    } else {
      loadStreams();
      showToast({ icon: "ti-brand-twitch", title: "Kanal hinzugefügt", duration: TOAST_DURATION_MS.status });
    }
  });
}

// ---------- start ----------
initNavigation();
initChannelDialog();
initChannelSync();
initTodo();
initSettingsUI();
initSystemThemeWatcher();
initRefresh();
initNotificationTest();

renderQuickLinks();
renderSettingsUI();
applySettings();
renderTodos();

setInterval(renderGreeting, GREETING_INTERVAL_MS);
setInterval(renderClock, CLOCK_INTERVAL_MS);

loadVideos();
loadStreams();
