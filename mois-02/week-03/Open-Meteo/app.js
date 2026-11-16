// Entry point: connects api.js and ui.js and sets the listeners.

import { getWeather, getCachedWeather } from "./api.js";
import { formatAge } from "./weather.js";
import {
  dom,
  displayWeather,
  displayMessage,
  displayLoading,
  setRefreshDisabled,
} from "./ui.js";

// Fixed coordinates (Paris). Change them to get another place.
const PLACE = { name: "Paris", latitude: 48.85, longitude: 2.35 };

async function showWeather(force = false) {
  displayLoading();
  setRefreshDisabled(true);
  try {
    displayWeather(PLACE, await getWeather(PLACE, { force }));
  } catch (error) {
    // Refresh failed: show the last saved data (any age) with a notice, if any
    const cached = getCachedWeather(PLACE);
    if (cached) {
      displayWeather(PLACE, cached.value, {
        notice: `${error.message} Showing data saved ${formatAge(cached.savedAt)}.`,
      });
    } else {
      displayMessage(error.message, true);
    }
  } finally {
    setRefreshDisabled(false);
  }
}

function handleRefreshClick() {
  showWeather(true);
}

// Listeners

dom.refreshButton.addEventListener("click", handleRefreshClick);

showWeather();
