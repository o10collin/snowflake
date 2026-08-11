import { CORS_PROXIES } from "./config.js";

export function setHidden(element, hidden) {
  if (element) element.style.display = hidden ? "none" : "";
}

export function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function fetchThroughProxy(targetUrl) {
  for (const buildProxyUrl of CORS_PROXIES) {
    try {
      const response = await fetchWithTimeout(buildProxyUrl(targetUrl), 4000);
      if (!response.ok) throw new Error(`status ${response.status}`);

      const body = await response.text();
      if (!body || body.length < 50) throw new Error("empty response");
      return body;
    } catch (error) {
      console.warn("Proxy failed, trying next:", error.message);
    }
  }
  throw new Error("All proxies failed");
}

export function stripEmoji(text) {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function relativeTime(isoDate) {
  const elapsedMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(elapsedMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 1) return `vor ${days} Tag${days === 1 ? "" : "en"}`;
  if (hours >= 1) return `vor ${hours} Stunde${hours === 1 ? "" : "n"}`;
  if (minutes >= 1) return `vor ${minutes} Minute${minutes === 1 ? "" : "n"}`;
  return "gerade eben";
}
