import { settings } from "./store.js";
import { state } from "./state.js";
import { fetchWithTimeout } from "./util.js";
import { showToast, notifyIfEnabled } from "./notify.js";
import { renderStats } from "./dashboard.js";
import { renderEmptyState } from "./empty-state.js";

const channelUrl = channelName => `https://twitch.tv/${channelName}`;

async function fetchStreamStatus(channelName) {
  try {
    const response = await fetchWithTimeout(`https://decapi.me/twitch/uptime/${channelName}`, 5000);
    const uptime = (await response.text()).trim();
    return { channel: channelName, isLive: !uptime.toLowerCase().includes("offline") };
  } catch (error) {
    console.error(`Twitch status failed for ${channelName}`, error);
    return { channel: channelName, isLive: false, error: true };
  }
}

function renderStreamGrid(streams) {
  const container = document.getElementById("stream-grid");

  if (streams.length === 0) {
    renderEmptyState(container, {
      message: "Noch keine Twitch-Kanäle eingerichtet.",
      actionLabel: "Kanal hinzufügen",
      source: "twitch",
    });
    return;
  }

  container.innerHTML = "";

  const ordered = [...streams].sort((a, b) => Number(b.isLive) - Number(a.isLive));

  ordered.forEach(stream => {
    const card = document.createElement("div");
    card.className = "stream-card" + (stream.isLive ? " live" : "");
    card.innerHTML = `
      <div class="stream-status ${stream.isLive ? "live" : "offline"}">
        <span class="dot"></span>${stream.isLive ? "Live" : "Offline"}
      </div>
      <div class="stream-name">${stream.channel}</div>
    `;
    card.addEventListener("click", () => window.open(channelUrl(stream.channel), "_blank"));
    container.appendChild(card);
  });
}

function renderLivePills(streams) {
  const container = document.getElementById("live-list");
  container.innerHTML = "";

  streams.filter(stream => stream.isLive).forEach(stream => {
    const pill = document.createElement("a");
    pill.className = "live-pill";
    pill.href = channelUrl(stream.channel);
    pill.target = "_blank";
    pill.innerHTML = `<span class="dot"></span><i class="ti ti-brand-twitch"></i>${stream.channel} ist live`;
    container.appendChild(pill);
  });
}

let liveChannelsLastPoll = null;

export function findNewlyLive(streams) {
  const usable = streams.filter(stream => !stream.error);
  if (usable.length === 0) return [];

  const liveNow = new Set(usable.filter(stream => stream.isLive).map(stream => stream.channel));

  if (liveChannelsLastPoll === null) {
    liveChannelsLastPoll = liveNow;
    return [];
  }

  const newlyLive = [...liveNow].filter(channel => !liveChannelsLastPoll.has(channel));
  liveChannelsLastPoll = liveNow;
  return newlyLive;
}

function announceNewlyLive(channels) {
  channels.forEach(channelName => {
    showToast({
      icon: "ti-brand-twitch",
      title: `${channelName} ist live`,
      detail: "Twitch",
      url: channelUrl(channelName),
    });
    notifyIfEnabled("Jetzt live auf Twitch", `${channelName} ist live`, channelUrl(channelName));
  });
}

let latestRequestId = 0;

export async function loadStreams() {
  const requestId = ++latestRequestId;
  const channels = settings.twitchChannels;

  if (channels.length === 0) {
    state.streams = [];
    renderStreamGrid([]);
    renderLivePills([]);
    renderStats();
    return;
  }

  const streams = await Promise.all(channels.map(fetchStreamStatus));
  if (requestId !== latestRequestId) return;

  state.streams = streams;
  renderStreamGrid(streams);
  renderLivePills(streams);
  renderStats();
  announceNewlyLive(findNewlyLive(streams));
}
