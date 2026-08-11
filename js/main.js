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

let refreshInFlight = false;

async function refreshAll() {
  if (refreshInFlight) return;
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

    if (document.visibilityState === "visible") refreshAll();
  }, REFRESH_INTERVAL_MS);

  document.getElementById("manual-refresh").addEventListener("click", refreshAll);
}

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
