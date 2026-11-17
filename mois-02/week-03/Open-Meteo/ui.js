// Everything that touches the page. No fetch, no storage.

import { formatTemperature, formatTime } from "./weather.js";

/** Elements of the page, defined once. */
export const dom = {
  refreshButton: document.getElementById("refresh"),
  result: document.getElementById("result"),
};

function makeElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

/**
 * Displays the weather card of a place in the result area.
 * @param {{name: string}} place
 * @param {{temperature: number|null, unit: string, time: string|null}} weather
 *   Object produced by `formatWeather`.
 * @param {{notice?: string}} [options] `notice`: small warning under the card
 *   (e.g. the data is old because the refresh failed). Shown as plain text.
 */
export function displayWeather(place, weather, { notice } = {}) {
  const card = document.getElementById("tpl-weather").content.cloneNode(true);

  card.querySelector("h2").textContent = place.name;
  card.querySelector(".temperature").textContent = formatTemperature(weather);
  card.querySelector(".time").textContent = formatTime(weather.time);

  const noticeElement = card.querySelector(".notice");
  noticeElement.textContent = notice ?? ""; // textContent , never innerHTML
  noticeElement.hidden = !notice;

  dom.result.replaceChildren(card);
}

/**
 * Displays a message in the result area.
 * @param {string} text The message.
 * @param {boolean} [isError=false] If true, the message is shown in red.
 */
export function displayMessage(text, isError = false) {
  dom.result.replaceChildren(makeElement("p", text, isError ? "error" : ""));
}

/** Displays "Loading..." in the result area. */
export function displayLoading() {
  displayMessage("Loading...");
}

/**
 * Enables or disables the Refresh button (prevents duplicate requests).
 * @param {boolean} disabled
 */
export function setRefreshDisabled(disabled) {
  dom.refreshButton.disabled = disabled;
}
