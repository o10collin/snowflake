// The settings panel: reflecting state into the controls and handling edits.

import { ACCENTS, DEVELOPER_PRESET, DEFAULT_QUICK_LINK_ICON } from "./config.js";
import { settings, saveSettings, resetSettings, applyPreset } from "./store.js";
import { showToast, requestNotificationPermission } from "./notify.js";
import { applySettings } from "./appearance.js";
import { renderGreeting, renderQuickLinks } from "./dashboard.js";
import { loadVideos } from "./youtube.js";
import { loadStreams } from "./twitch.js";

const emptyListNote = text => `<div class="empty-state"><i class="ti ti-mood-empty"></i>${text}</div>`;

function reloadFeeds() {
  loadVideos();
  loadStreams();
}

// A bare "google.com" would otherwise resolve as a relative path.
function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// ---------- editable lists ----------
// All three lists share the same row shape: icon, title, optional detail, remove.
function createListRow({ icon, title, detail, source, index }) {
  const row = document.createElement("div");
  row.className = "list-row";
  row.innerHTML = `
    <i class="ti ${icon} list-row-icon"></i>
    <div class="list-row-info">
      <div class="list-row-title"></div>
      ${detail ? `<div class="list-row-detail"></div>` : ""}
    </div>
    <button class="list-row-remove" data-source="${source}" data-index="${index}"><i class="ti ti-x"></i></button>
  `;
  row.querySelector(".list-row-title").textContent = title;
  if (detail) row.querySelector(".list-row-detail").textContent = detail;
  return row;
}

function renderQuickLinkList() {
  const list = document.getElementById("quick-link-list");
  list.innerHTML = settings.quickLinks.length ? "" : emptyListNote("Noch keine Links.");

  settings.quickLinks.forEach((link, index) => {
    list.appendChild(createListRow({
      icon: link.icon || DEFAULT_QUICK_LINK_ICON,
      title: link.label,
      detail: link.url,
      source: "quicklink",
      index,
    }));
  });
}

function renderYoutubeChannelList() {
  const list = document.getElementById("youtube-channel-list");
  list.innerHTML = settings.youtubeChannels.length ? "" : emptyListNote("Noch keine Kanäle.");

  settings.youtubeChannels.forEach((channel, index) => {
    list.appendChild(createListRow({
      icon: "ti-brand-youtube",
      title: channel.name,
      detail: channel.id,
      source: "youtube",
      index,
    }));
  });
}

function renderTwitchChannelList() {
  const list = document.getElementById("twitch-channel-list");
  list.innerHTML = settings.twitchChannels.length ? "" : emptyListNote("Noch keine Kanäle.");

  settings.twitchChannels.forEach((channelName, index) => {
    list.appendChild(createListRow({
      icon: "ti-brand-twitch",
      title: channelName,
      source: "twitch",
      index,
    }));
  });
}

// ---------- panel state ----------
function renderAccentSwatches() {
  const container = document.getElementById("accent-swatches");
  container.innerHTML = "";

  Object.entries(ACCENTS).forEach(([key, accent]) => {
    const swatch = document.createElement("button");
    swatch.className = "swatch" + (settings.accent === key ? " active" : "");
    swatch.style.background = accent.swatch;
    swatch.dataset.accent = key;
    swatch.title = accent.label;
    container.appendChild(swatch);
  });
}

export function renderSettingsUI() {
  document.querySelectorAll(".toggle[data-setting]").forEach(toggle => {
    toggle.classList.toggle("on", Boolean(settings[toggle.dataset.setting]));
  });

  document.querySelectorAll(".segmented[data-setting]").forEach(group => {
    group.querySelectorAll("button").forEach(button => {
      button.classList.toggle("active", settings[group.dataset.setting] === button.dataset.value);
    });
  });

  document.getElementById("setting-name").value = settings.name;
  document.getElementById("setting-engine").value = settings.searchEngine;

  renderAccentSwatches();
  renderQuickLinkList();
  renderYoutubeChannelList();
  renderTwitchChannelList();
}

// ---------- handlers ----------
function initToggles() {
  document.querySelectorAll(".toggle[data-setting]").forEach(toggle => {
    toggle.addEventListener("click", async () => {
      const key = toggle.dataset.setting;
      settings[key] = !settings[key];

      // switching this on only means anything if the browser grants permission
      if (key === "browserNotifications" && settings[key]) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          settings[key] = false;
          showToast({
            icon: "ti-bell-off",
            title: "Benachrichtigungen blockiert",
            detail: "Im Browser für diese Seite erlauben",
          });
        }
      }

      saveSettings();
      toggle.classList.toggle("on", settings[key]);
      applySettings();

      // this one changes which feed URL we read, so the videos must be refetched
      if (key === "hideShorts") loadVideos();
    });
  });
}

function initSegmentedControls() {
  document.querySelectorAll(".segmented[data-setting]").forEach(group => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-value]");
      if (!button) return;

      settings[group.dataset.setting] = button.dataset.value;
      saveSettings();
      group.querySelectorAll("button").forEach(b => b.classList.toggle("active", b === button));
      applySettings();
    });
  });
}

function initAccentSwatches() {
  document.getElementById("accent-swatches").addEventListener("click", (event) => {
    const swatch = event.target.closest(".swatch");
    if (!swatch) return;

    settings.accent = swatch.dataset.accent;
    saveSettings();
    document.querySelectorAll(".swatch").forEach(s => s.classList.toggle("active", s === swatch));
    applySettings();
  });
}

function initTextFields() {
  document.getElementById("setting-name").addEventListener("input", (event) => {
    settings.name = event.target.value;
    saveSettings();
    renderGreeting();
  });

  document.getElementById("setting-engine").addEventListener("change", (event) => {
    settings.searchEngine = event.target.value;
    saveSettings();
  });
}

// One delegated handler for every list in the panel.
const REMOVE_HANDLERS = {
  quicklink: (index) => {
    settings.quickLinks.splice(index, 1);
    saveSettings();
    renderQuickLinkList();
    renderQuickLinks();
  },
  youtube: (index) => {
    settings.youtubeChannels.splice(index, 1);
    saveSettings();
    renderYoutubeChannelList();
    loadVideos();
  },
  twitch: (index) => {
    settings.twitchChannels.splice(index, 1);
    saveSettings();
    renderTwitchChannelList();
    loadStreams();
  },
};

function initListRemoval() {
  document.getElementById("view-settings").addEventListener("click", (event) => {
    const removeButton = event.target.closest(".list-row-remove");
    if (!removeButton) return;

    const remove = REMOVE_HANDLERS[removeButton.dataset.source];
    if (remove) remove(Number(removeButton.dataset.index));
  });
}

function initQuickLinkForm() {
  document.getElementById("quick-link-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const labelInput = document.getElementById("quick-link-label");
    const urlInput = document.getElementById("quick-link-url");
    const iconInput = document.getElementById("quick-link-icon");

    const label = labelInput.value.trim();
    const url = urlInput.value.trim();
    if (!label || !url) return;

    settings.quickLinks.push({
      label,
      url: normalizeUrl(url),
      icon: iconInput.value.trim() || DEFAULT_QUICK_LINK_ICON,
    });
    saveSettings();

    labelInput.value = "";
    urlInput.value = "";
    iconInput.value = "";
    renderQuickLinkList();
    renderQuickLinks();
  });
}

function initChannelForms() {
  document.getElementById("youtube-channel-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("youtube-channel-name");
    const idInput = document.getElementById("youtube-channel-id");
    const name = nameInput.value.trim();
    const id = idInput.value.trim();
    if (!name || !id) return;

    settings.youtubeChannels.push({ name, id });
    saveSettings();
    nameInput.value = "";
    idInput.value = "";
    renderYoutubeChannelList();
    loadVideos();
  });

  document.getElementById("twitch-channel-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("twitch-channel-name");
    const name = nameInput.value.trim();
    if (!name) return;

    settings.twitchChannels.push(name);
    saveSettings();
    nameInput.value = "";
    renderTwitchChannelList();
    loadStreams();
  });
}

function initPresetAndReset() {
  document.getElementById("developer-preset").addEventListener("click", () => {
    applyPreset(DEVELOPER_PRESET);
    renderSettingsUI();
    applySettings();
    renderQuickLinks();
    reloadFeeds();
    showToast({
      icon: "ti-heart",
      title: "Entwickler-Favoriten geladen",
      detail: `${DEVELOPER_PRESET.youtubeChannels.length} YouTube- und ${DEVELOPER_PRESET.twitchChannels.length} Twitch-Kanäle`,
    });
  });

  document.getElementById("reset-settings").addEventListener("click", () => {
    if (!confirm("Alle Einstellungen auf Standard zurücksetzen?")) return;
    resetSettings();
    renderSettingsUI();
    applySettings();
    renderQuickLinks();
    reloadFeeds();
  });
}

export function initSettingsUI() {
  initToggles();
  initSegmentedControls();
  initAccentSwatches();
  initTextFields();
  initListRemoval();
  initQuickLinkForm();
  initChannelForms();
  initPresetAndReset();
}
