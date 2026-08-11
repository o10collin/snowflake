import { TOAST_DURATION_MS } from "./config.js";
import { settings } from "./store.js";

const TOAST_EXIT_MS = 200;

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
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

export function sendNotification(title, body, url) {
  const notification = new Notification(title, { body, icon: "https://www.youtube.com/favicon.ico" });
  if (url) {
    notification.onclick = () => {
      window.open(url, "_blank");
      notification.close();
    };
  }
}

export function notifyIfEnabled(title, body, url) {
  if (!settings.browserNotifications) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  sendNotification(title, body, url);
}
