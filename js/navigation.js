import {
  WINDOWS_VM_URL,
  MAX_VIDEO_SHORTCUTS,
  SEARCH_ENGINES,
  DEFAULT_QUICK_LINK_ICON,
} from "./config.js";
import { settings } from "./store.js";
import { state } from "./state.js";
import { relativeTime } from "./util.js";

const MENU_VIEWPORT_MARGIN = 8;

export function switchView(viewName) {
  const navButton = document.querySelector(`.nav-btn[data-view="${viewName}"]`);
  if (!navButton) return;

  document.querySelectorAll(".nav-btn").forEach(button => button.classList.remove("active"));
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  navButton.classList.add("active");
  document.getElementById(`view-${viewName}`).classList.add("active");

  document.body.classList.toggle("hide-sidebar", viewName !== "dashboard");
  document.getElementById("main").scrollTop = 0;
}

function initViewSwitching() {
  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });
}

let contextMenu;

function createMenuItem({ icon, label, url, detail }) {
  const item = document.createElement("a");
  item.className = "menu-item";
  item.href = url;
  item.target = "_blank";
  item.innerHTML = `<i class="ti ${icon}"></i><span class="menu-label"><span class="menu-title"></span></span>`;
  item.querySelector(".menu-title").textContent = label;

  if (detail) {
    const detailEl = document.createElement("span");
    detailEl.className = "menu-detail";
    detailEl.textContent = detail;
    item.querySelector(".menu-label").appendChild(detailEl);
  }
  return item;
}

function createMenuDivider() {
  const divider = document.createElement("div");
  divider.className = "menu-divider";
  return divider;
}

function buildContextMenu() {
  contextMenu.innerHTML = "";

  settings.quickLinks.forEach(link => contextMenu.appendChild(createMenuItem({
    ...link,
    icon: link.icon || DEFAULT_QUICK_LINK_ICON,
  })));

  const latestVideo = state.videos[0];
  if (latestVideo) {
    contextMenu.appendChild(createMenuDivider());
    contextMenu.appendChild(createMenuItem({
      icon: "ti-player-play",
      label: latestVideo.title,
      url: latestVideo.url,
      detail: `${latestVideo.channel} · ${relativeTime(latestVideo.published)}`,
    }));
  }

  contextMenu.appendChild(createMenuDivider());
  contextMenu.appendChild(createMenuItem({
    icon: "ti-brand-windows",
    label: "Neue Windows VM",
    url: WINDOWS_VM_URL,
  }));
}

function openContextMenu(x, y) {
  buildContextMenu();
  contextMenu.hidden = false;

  const margin = MENU_VIEWPORT_MARGIN;
  const left = Math.max(margin, Math.min(x, window.innerWidth - contextMenu.offsetWidth - margin));
  const top = Math.max(margin, Math.min(y, window.innerHeight - contextMenu.offsetHeight - margin));
  contextMenu.style.left = `${left}px`;
  contextMenu.style.top = `${top}px`;
}

export function closeContextMenu() {
  contextMenu.hidden = true;
}

function initContextMenu() {
  contextMenu = document.getElementById("context-menu");

  document.addEventListener("contextmenu", (event) => {

    if (event.target.closest("input, textarea, select")) {
      closeContextMenu();
      return;
    }
    event.preventDefault();
    openContextMenu(event.clientX, event.clientY);
  });

  document.addEventListener("click", closeContextMenu);
  document.addEventListener("scroll", closeContextMenu, true);
  window.addEventListener("resize", closeContextMenu);
}

function initSearch() {
  document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("search-input");
    const query = input.value.trim();
    if (!query) return;

    const buildSearchUrl = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.duckduckgo;
    window.open(buildSearchUrl(encodeURIComponent(query)), "_blank");
    input.value = "";
  });
}

const VIEW_SHORTCUTS = {
  KeyD: "dashboard",
  KeyY: "youtube",
  KeyT: "twitch",
  KeyS: "settings",
};

function initShortcuts() {
  document.addEventListener("keydown", (event) => {
    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);

    if (event.key === "Escape") {
      closeContextMenu();
      return;
    }

    if (event.key === "/" && !event.altKey && !event.ctrlKey && !event.metaKey && !isTyping) {
      event.preventDefault();
      switchView("dashboard");
      document.getElementById("search-input").focus();
      return;
    }

    if (!event.altKey) return;

    if (VIEW_SHORTCUTS[event.code]) {
      event.preventDefault();
      switchView(VIEW_SHORTCUTS[event.code]);
      return;
    }

    if (event.code === "KeyW") {
      event.preventDefault();
      window.open(WINDOWS_VM_URL, "_blank");
      return;
    }

    const digitMatch = event.code.match(/^Digit([1-9])$/);
    if (!digitMatch) return;

    const position = Number(digitMatch[1]);
    if (position > MAX_VIDEO_SHORTCUTS) return;

    const video = state.shortcutVideos[position - 1];
    if (video) {
      event.preventDefault();
      window.open(video.url, "_blank");
    }
  });
}

export function initNavigation() {
  initViewSwitching();
  initContextMenu();
  initSearch();
  initShortcuts();
}
