// In-page toasts (bottom right) and browser notifications.

import { TOAST_DURATION_MS } from "./config.js";
import { settings } from "./store.js";

const TOAST_EXIT_MS = 200; // must match the toast-out animation in overlays.css

// Named options rather than positional arguments — at five parameters the call
// sites became unreadable.
export function showToast({ icon, title, detail, url, duration = TOAST_DURATION_MS.event }) {
  const toast = document.createElement(url ? "a" : "div");
  toast.className = "toast";
  if (url) {
    toast.href = url;
    toast.target = "_blank";
  }

  toast.innerHTML = `<i class="ti ${icon}"></i><div class="toast-body"><div class="toast-title"></div></div>`;
  toast.querySelector(".toast-title").textContent = title;

  if (detail) {
    const detailEl = document.createElement("div");
    detailEl.className = "toast-detail";
    detailEl.textContent = detail;
    toast.querySelector(".toast-body").appendChild(detailEl);
  }

  document.getElementById("toasts").appendChild(toast);
  setTimeout(() => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), TOAST_EXIT_MS);
  }, duration);
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false; // only the user can undo this
  return (await Notification.requestPermission()) === "granted";
}

// Unconditional send — only for the explicit "test notification" button.
export function sendNotification(title, body, url) {
  const notification = new Notification(title, { body, icon: "https://www.youtube.com/favicon.ico" });
  if (url) {
    notification.onclick = () => {
      window.open(url, "_blank");
      notification.close();
    };
  }
}

// The normal path: honours the user's preference and the permission state.
export function notifyIfEnabled(title, body, url) {
  if (!settings.browserNotifications) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  sendNotification(title, body, url);
}
