// Shared runtime state, deliberately dependency-free.
//
// This exists so modules needing the same data (the stat tiles need videos *and*
// stream statuses) don't import each other and form a cycle. It's a mutable
// object rather than exported `let`s so every reader always sees current values.
export const state = {
  videos: [],          // every fetched video, newest first
  shortcutVideos: [],  // the sidebar slice, addressed by ⌥1 – ⌥9
  streams: [],         // last known Twitch status per channel
};
