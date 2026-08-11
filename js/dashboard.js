import { DEFAULT_QUICK_LINK_ICON } from "./config.js";
import { settings, loadTodos, saveTodos } from "./store.js";
import { state } from "./state.js";

function greetingForHour(hour) {
  if (hour < 5) return "Guten Abend";
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export function renderGreeting() {
  const now = new Date();
  const name = (settings.name || "").trim();
  const greeting = greetingForHour(now.getHours());

  document.getElementById("greeting").textContent = name ? `${greeting}, ${name}.` : `${greeting}.`;
  document.getElementById("date").textContent = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function renderClock() {
  const format = { hour: "2-digit", minute: "2-digit", hour12: !settings.clock24h };
  if (settings.showSeconds) format.second = "2-digit";

  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString(settings.clock24h ? "de-DE" : "en-US", format);
}

export function renderStats() {
  const liveCount = state.streams.filter(stream => stream.isLive).length;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const videosToday = state.videos.filter(video => new Date(video.published) >= startOfToday).length;

  const openTodoCount = loadTodos().filter(todo => !todo.done).length;

  const videoCountEl = document.getElementById("stat-videos");
  document.getElementById("stat-live").textContent = state.streams.length ? liveCount : "–";
  videoCountEl.textContent = state.videos.length ? videosToday : "–";
  document.getElementById("stat-todos").textContent = openTodoCount;

  const glowing = settings.forceGlow || videosToday >= 1;
  videoCountEl.classList.toggle("glow", glowing);
  document.getElementById("stat-videos-tile").classList.toggle("glow", glowing);
}

export function renderQuickLinks() {
  const container = document.getElementById("quick-links");
  container.innerHTML = "";

  settings.quickLinks.forEach(({ icon, label, url }) => {
    const link = document.createElement("a");
    link.className = "quick-link";
    link.href = url;
    link.target = "_blank";
    link.innerHTML = `<i class="ti ${icon || DEFAULT_QUICK_LINK_ICON}"></i><span></span>`;
    link.querySelector("span").textContent = label;
    container.appendChild(link);
  });
}

export function renderTodos() {
  const todos = loadTodos();
  const container = document.getElementById("todo-list");
  container.innerHTML = "";
  renderStats();

  if (todos.length === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "todo-empty";
    placeholder.textContent = "Keine Aufgaben.";
    container.appendChild(placeholder);
    return;
  }

  todos.forEach((todo, index) => {
    const row = document.createElement("div");
    row.className = "todo-item" + (todo.done ? " done" : "");

    const checkbox = document.createElement("button");
    checkbox.className = "todo-check";
    checkbox.dataset.index = index;
    checkbox.innerHTML = `<i class="ti ti-check"></i>`;

    const label = document.createElement("span");
    label.className = "todo-text";
    label.textContent = todo.text;

    const removeButton = document.createElement("button");
    removeButton.className = "todo-remove";
    removeButton.dataset.index = index;
    removeButton.innerHTML = `<i class="ti ti-x"></i>`;

    row.append(checkbox, label, removeButton);
    container.appendChild(row);
  });
}

export function initTodo() {
  document.getElementById("todo-list").addEventListener("click", (event) => {
    const checkbox = event.target.closest(".todo-check");
    const removeButton = event.target.closest(".todo-remove");
    if (!checkbox && !removeButton) return;

    const todos = loadTodos();
    const index = Number((checkbox || removeButton).dataset.index);

    if (checkbox) {
      todos[index].done = !todos[index].done;
    } else {
      todos.splice(index, 1);
    }

    saveTodos(todos);
    renderTodos();
  });

  document.getElementById("todo-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.getElementById("todo-input");
    const text = input.value.trim();
    if (!text) return;

    const todos = loadTodos();
    todos.push({ text, done: false });
    saveTodos(todos);
    input.value = "";
    renderTodos();
  });
}
