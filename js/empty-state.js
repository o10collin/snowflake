// The "nothing configured yet" placeholder shown wherever a feed has no channels.
//
// Its action opens the quick-add dialog rather than sending the user off to the
// settings view — the whole point is to fix the gap without leaving the page.

import { openChannelDialog } from "./channel-dialog.js";

export function renderEmptyState(container, { message, actionLabel, source }) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";
  wrapper.innerHTML = `
    <i class="ti ti-mood-empty"></i>
    <p class="empty-state-message"></p>
  `;
  wrapper.querySelector(".empty-state-message").textContent = message;

  const action = document.createElement("button");
  action.className = "btn";
  action.innerHTML = `<i class="ti ti-plus"></i><span></span>`;
  action.querySelector("span").textContent = actionLabel;
  action.addEventListener("click", () => openChannelDialog(source));

  wrapper.appendChild(action);
  container.appendChild(wrapper);
}
