import { CHANNELS_CHANGED_EVENT } from "./config.js";
import { settings, saveSettings } from "./store.js";

const SOURCES = {
  youtube: {
    title: "YouTube-Kanal hinzufügen",
    hint: "Die Channel-ID steht in der Kanal-URL: youtube.com/channel/UC…",
    fields: [
      { name: "name", placeholder: "Anzeigename" },
      { name: "id", placeholder: "Channel-ID (UC…)" },
    ],
    addChannel: ({ name, id }) => settings.youtubeChannels.push({ name, id }),
  },
  twitch: {
    title: "Twitch-Kanal hinzufügen",
    hint: "Der Kanalname steht in der URL: twitch.tv/kanalname",
    fields: [{ name: "name", placeholder: "Kanalname" }],
    addChannel: ({ name }) => settings.twitchChannels.push(name),
  },
};

let backdrop;
let form;
let fieldsContainer;
let titleEl;
let hintEl;
let activeSource = null;

export function openChannelDialog(source) {
  const config = SOURCES[source];
  if (!config) return;

  activeSource = source;
  titleEl.textContent = config.title;
  hintEl.textContent = config.hint;

  fieldsContainer.innerHTML = "";
  config.fields.forEach(field => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "field-input";
    input.name = field.name;
    input.placeholder = field.placeholder;
    input.autocomplete = "off";
    fieldsContainer.appendChild(input);
  });

  backdrop.hidden = false;
  fieldsContainer.querySelector("input").focus();
}

export function closeChannelDialog() {
  backdrop.hidden = true;
  activeSource = null;
  form.reset();
}

function readFields(config) {
  const values = {};
  for (const field of config.fields) {
    const value = fieldsContainer.querySelector(`[name="${field.name}"]`).value.trim();
    if (!value) return null;
    values[field.name] = value;
  }
  return values;
}

export function initChannelDialog() {
  backdrop = document.getElementById("channel-dialog");
  form = document.getElementById("channel-dialog-form");
  fieldsContainer = document.getElementById("channel-dialog-fields");
  titleEl = document.getElementById("channel-dialog-title");
  hintEl = document.getElementById("channel-dialog-hint");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const config = SOURCES[activeSource];
    const values = readFields(config);
    if (!values) return;

    config.addChannel(values);
    saveSettings();

    const source = activeSource;
    closeChannelDialog();
    document.dispatchEvent(new CustomEvent(CHANNELS_CHANGED_EVENT, { detail: { source } }));
  });

  document.getElementById("channel-dialog-close").addEventListener("click", closeChannelDialog);
  document.getElementById("channel-dialog-cancel").addEventListener("click", closeChannelDialog);

  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeChannelDialog();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.hidden) closeChannelDialog();
  });
}
