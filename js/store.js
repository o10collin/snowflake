// Persistence for settings and to-dos (localStorage).

import { SETTINGS_STORAGE_KEY, TODOS_STORAGE_KEY, DEFAULT_SETTINGS } from "./config.js";

function readStoredSettings() {
  // structuredClone, not a spread: a shallow copy would hand out the *same*
  // quickLinks/channel arrays that DEFAULT_SETTINGS holds, so every push and
  // splice would quietly rewrite the defaults and break resetSettings().
  const defaults = structuredClone(DEFAULT_SETTINGS);
  try {
    // layered over the defaults so settings added later appear for existing users
    return { ...defaults, ...(JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY)) || {}) };
  } catch {
    return defaults;
  }
}

// Reassigned by resetSettings(); importers track it through ES live bindings.
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
