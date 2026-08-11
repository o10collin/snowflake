import { SIDEBAR_FEED_LIMIT, MAX_VIDEO_SHORTCUTS } from "./config.js";
import { settings } from "./store.js";
import { state } from "./state.js";
import { fetchThroughProxy, stripEmoji, relativeTime } from "./util.js";
import { showToast, notifyIfEnabled } from "./notify.js";
import { renderStats } from "./dashboard.js";
import { renderEmptyState } from "./empty-state.js";

const MAX_INDIVIDUAL_ANNOUNCEMENTS = 3;

export function buildFeedUrl(channelId) {
  if (settings.hideShorts && channelId.startsWith("UC")) {
    return `https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${channelId.slice(2)}`;
  }
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

async function fetchChannelVideos(channelName, channelId) {
  try {
    const xmlText = await fetchThroughProxy(buildFeedUrl(channelId));
    const feed = new DOMParser().parseFromString(xmlText, "text/xml");

    return Array.from(feed.querySelectorAll("entry")).map(entry => ({
      channel: channelName,
      title: stripEmoji(entry.querySelector("title").textContent),
      url: entry.querySelector("link").getAttribute("href"),
      published: entry.querySelector("published").textContent,
    }));
  } catch (error) {
    console.error(channelName, error);
    return [{ channel: channelName, error: true }];
  }
}

function failedChannelMarkup(channelName) {
  return `
    <div class="channel-label"><i class="ti ti-brand-youtube"></i>${channelName}</div>
    <div class="load-error"><i class="ti ti-alert-triangle"></i>Konnte nicht geladen werden</div>
  `;
}

function videoMarkup(video) {
  return `
    <div class="channel-label"><i class="ti ti-brand-youtube"></i>${video.channel}</div>
    <div class="video-title">
      <a href="${video.url}" target="_blank">${video.title}</a>
    </div>
    <span class="timestamp"><i class="ti ti-clock"></i>${relativeTime(video.published)}</span>
  `;
}

function renderVideoGrid(videos) {
  const container = document.getElementById("video-grid");

  if (videos.length === 0) {
    renderEmptyState(container, {
      message: "Noch keine YouTube-Kanäle eingerichtet.",
      actionLabel: "Kanal hinzufügen",
      source: "youtube",
    });
    return;
  }

  container.innerHTML = "";
  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.innerHTML = video.error ? failedChannelMarkup(video.channel) : videoMarkup(video);
    container.appendChild(card);
  });
}

function renderSidebarFeed(videos) {
  const container = document.getElementById("feed-list");
  container.innerHTML = "";

  videos.slice(0, SIDEBAR_FEED_LIMIT).forEach((video, index) => {
    const item = document.createElement("div");
    item.className = "feed-item";

    if (video.error) {
      item.innerHTML = failedChannelMarkup(video.channel);
    } else {
      const badge = index < MAX_VIDEO_SHORTCUTS
        ? `<div class="shortcut-badge">⌥${index + 1}</div>`
        : "";
      item.innerHTML = badge + videoMarkup(video);
    }

    container.appendChild(item);
  });
}

export function renderLatestVideo(video) {
  const section = document.getElementById("latest-video-section");

  if (!video || !settings.showLatest) {
    section.style.display = "none";
    return;
  }

  const card = document.getElementById("latest-video");
  card.href = video.url;
  card.querySelector(".latest-channel").textContent = video.channel;
  card.querySelector(".latest-title").textContent = video.title;
  card.querySelector(".latest-time").textContent = relativeTime(video.published);
  section.style.display = "";
}

let seenVideoUrls = null;

export function findUnseenVideos(videos) {
  if (videos.length === 0) return [];

  if (seenVideoUrls === null) {
    seenVideoUrls = new Set(videos.map(video => video.url));
    return [];
  }

  const unseen = videos.filter(video => !seenVideoUrls.has(video.url));
  videos.forEach(video => seenVideoUrls.add(video.url));
  return unseen;
}

function announceNewVideos(videos) {
  if (videos.length === 0) return;

  if (videos.length > MAX_INDIVIDUAL_ANNOUNCEMENTS) {
    const channels = [...new Set(videos.map(video => video.channel))].join(", ");
    showToast({ icon: "ti-brand-youtube", title: `${videos.length} neue Videos`, detail: channels });
    notifyIfEnabled(`${videos.length} neue Videos`, videos.map(video => video.title).join("\n"));
    return;
  }

  videos.forEach(video => {
    showToast({
      icon: "ti-brand-youtube",
      title: video.title,
      detail: `Neues Video · ${video.channel}`,
      url: video.url,
    });
    notifyIfEnabled(`Neues Video · ${video.channel}`, video.title, video.url);
  });
}

let latestRequestId = 0;

let renderedFeedKey = "";

function feedKeyFor(videos) {
  return videos.map(video => video.error ? `error:${video.channel}` : video.url).join("|");
}

export async function loadVideos() {
  const requestId = ++latestRequestId;
  const channels = settings.youtubeChannels;

  if (channels.length === 0) {
    state.videos = [];
    state.shortcutVideos = [];
    renderedFeedKey = "";
    renderVideoGrid([]);
    renderEmptyState(document.getElementById("feed-list"), {
      message: "Noch keine Kanäle.",
      actionLabel: "Hinzufügen",
      source: "youtube",
    });
    renderLatestVideo(null);
    renderStats();
    return;
  }

  const results = await Promise.all(channels.map(channel => fetchChannelVideos(channel.name, channel.id)));
  if (requestId !== latestRequestId) return;

  const entries = results.flat();
  const videos = entries.filter(entry => !entry.error);
  const failures = entries.filter(entry => entry.error);
  videos.sort((a, b) => new Date(b.published) - new Date(a.published));

  state.videos = videos;
  state.shortcutVideos = videos.slice(0, SIDEBAR_FEED_LIMIT);

  const feedKey = feedKeyFor([...videos, ...failures]);
  if (feedKey !== renderedFeedKey) {
    renderedFeedKey = feedKey;
    renderVideoGrid([...videos, ...failures]);
    renderSidebarFeed([...videos, ...failures]);
    renderLatestVideo(videos[0]);
  }

  renderStats();
  announceNewVideos(findUnseenVideos(videos));
}
