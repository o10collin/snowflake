import { SETTINGS_STORAGE_KEY, TODOS_STORAGE_KEY, DEFAULT_SETTINGS } from "./config.js";

function readStoredSettings() {

  const defaults = structuredClone(DEFAULT_SETTINGS);
  try {

    return { ...defaults, ...(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || {}) };
  } catch {
    return defaults;
  }
}

export let settings = readStoredSettings();

export function saveSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings() {
  settings = structuredClone(DEFAULT_SETTINGS);
  saveSettings();
}

export function applyPreset(preset) {
  settings = { ...settings, ...structuredClone(preset) };
  saveSettings();
}

export function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(TODOS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveTodos(todos) {
  localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
}
