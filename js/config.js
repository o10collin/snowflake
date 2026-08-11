export const SETTINGS_STORAGE_KEY = "snowflake-settings";
export const TODOS_STORAGE_KEY = "snowflake-todos";

export const CHANNELS_CHANGED_EVENT = "snowflake:channels-changed";

export const SIDEBAR_FEED_LIMIT = 9;
export const MAX_VIDEO_SHORTCUTS = 9;
export const REFRESH_INTERVAL_MS = 60 * 1000;
export const TOAST_DURATION_MS = { status: 3500, event: 8000 };

export const WINDOWS_VM_URL = "https://app.apponfly.com/trial";

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
  browserNotifications: false,
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
    { name: "Marvin", id: "UCh24_9600fCJemez4RgoOmw" },
    { name: "laserluca", id: "UCmxc6kXbU1J-0pR2F3wIx9A" },
  ],
  twitchChannels: ["LetsHugoTV", "BludixLIVE", "Gleggmire", "marco_scm"],
};

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

export const CORS_PROXIES = [
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];
