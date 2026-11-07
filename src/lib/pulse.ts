import type React from "react";

// Restartable one-shot tile effect. Sets data-<attr> on the tile so CSS can play its
// keyframes: "pulse" is the copy-link ripple, "opening" the bloom before a video opens.
// With a click the effect starts where the tile was pressed; from the keyboard, the centre.
export function playPulse(tile: HTMLElement, e: React.MouseEvent, { attr = "pulse", duration = 900 } = {}) {
  const rect = tile.getBoundingClientRect();
  const fromPointer = e.detail > 0;
  tile.style.setProperty("--pulse-x", fromPointer ? `${e.clientX - rect.left}px` : "50%");
  tile.style.setProperty("--pulse-y", fromPointer ? `${e.clientY - rect.top}px` : "50%");
  delete tile.dataset[attr];
  void tile.offsetWidth; // restart the keyframes if triggered again mid-effect
  const id = String(performance.now());
  tile.dataset[attr] = id;
  setTimeout(() => {
    if (tile.dataset[attr] === id) delete tile.dataset[attr];
  }, duration);
}
