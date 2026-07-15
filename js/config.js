// Static configuration. No imports, no side effects — safe for anything to read.

export const SETTINGS_STORAGE_KEY = "snowflake-settings";
export const TODOS_STORAGE_KEY = "snowflake-todos";

// Fired when a channel is added from the quick-add dialog. main.js listens and
// reloads the right feed, which keeps the dialog from having to import the feed
// modules that render it.
export const CHANNELS_CHANGED_EVENT = "snowflake:channels-changed";

export const SIDEBAR_FEED_LIMIT = 9;   // videos listed in the right-hand feed
export const MAX_VIDEO_SHORTCUTS = 9;  // ⌥1 – ⌥9
export const REFRESH_INTERVAL_MS = 60 * 1000;
export const TOAST_DURATION_MS = { status: 3500, event: 8000 };

export const WINDOWS_VM_URL = "https://app.apponfly.com/trial";

// Used when a custom quick link doesn't name one.
export const DEFAULT_QUICK_LINK_ICON = "ti-link";

export const DEFAULT_SETTINGS = {
  theme: "dark",
  accent: "mono",
  name: "",
  showClock: true,
  clock24h: true,
  showSeconds: false,
  showStats: true,
  showQuickLinks: true,
  showTodo: true,
  showLatest: true,
  showFeed: true,
  searchEngine: "duckduckgo",
  browserNotifications: false, // requires an explicit permission grant
  hideShorts: true,
  forceGlow: false,
  quickLinks: [
    { label: "Google",  url: "https://google.com",      icon: "ti-brand-google" },
    { label: "Gmail",   url: "https://mail.google.com", icon: "ti-mail" },
    { label: "YouTube", url: "https://youtube.com",     icon: "ti-brand-youtube" },
  ],
  youtubeChannels: [],
  twitchChannels: [],
};

// Restored by the "Entwickler-Favoriten" button in settings — a one-click way to
// get the original author's setup back on a fresh profile.
export const DEVELOPER_PRESET = {
  name: "Collin",
  quickLinks: [
    { label: "DuckDuckGo", url: "https://duckduckgo.com",    icon: "ti-search" },
    { label: "Tuta Mail",  url: "https://app.tuta.com/mail", icon: "ti-mail" },
    { label: "GitHub",     url: "https://github.com",        icon: "ti-brand-github" },
    { label: "YouTube",    url: "https://youtube.com",       icon: "ti-brand-youtube" },
  ],
  youtubeChannels: [
    { name: "Cisko G", id: "UC5oN8biQKAyeEKi7EWzBWUg" },
    { name: "Gleggmire", id: "UCgDJZ9c94TFiw83x3wuNcFg" },
    { name: "Gelgmire", id: "UC_WxS6C3_CwTZQVIYXSvnaw" },
    { name: "Bog", id: "UCZXW8E1__d5tZb-wLFOt8TQ" },
    { name: "Nick Hein", id: "UChT2t0UrGnUKj4CowiKKrWg" },
  ],
  twitchChannels: ["LetsHugoTV", "BludixLIVE", "Gleggmire"],
};

// `mono` resolves through --mono-rgb, which the theme flips, so it stays legible
// on both dark and light backgrounds.
export const ACCENTS = {
  mono:   { rgb: "var(--mono-rgb)", swatch: "#b0b0b6", label: "Mono" },
  green:  { rgb: "127, 191, 127",   swatch: "rgb(127, 191, 127)", label: "Grün" },
  blue:   { rgb: "126, 166, 214",   swatch: "rgb(126, 166, 214)", label: "Blau" },
  purple: { rgb: "162, 142, 214",   swatch: "rgb(162, 142, 214)", label: "Lila" },
  amber:  { rgb: "214, 172, 110",   swatch: "rgb(214, 172, 110)", label: "Amber" },
  rose:   { rgb: "214, 130, 138",   swatch: "rgb(214, 130, 138)", label: "Rosé" },
};

export const SEARCH_ENGINES = {
  duckduckgo: query => `https://duckduckgo.com/?q=${query}`,
  google:     query => `https://www.google.com/search?q=${query}`,
  bing:       query => `https://www.bing.com/search?q=${query}`,
  startpage:  query => `https://www.startpage.com/sp/search?query=${query}`,
  ecosia:     query => `https://www.ecosia.org/search?q=${query}`,
};

// Browsers can't read YouTube's RSS cross-origin, so feeds go through these
// public proxies, tried in order until one answers.
export const CORS_PROXIES = [
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];
