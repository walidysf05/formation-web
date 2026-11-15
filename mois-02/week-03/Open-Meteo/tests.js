// Tests with console.assert, run by tests.html.

import { formatWeather, formatTemperature, formatTime } from "./weather.js";
import { isFresh } from "./cache.js";

let failures = 0;

function check(condition, message) {
  console.assert(condition, message);
  if (!condition) failures++;
}

const jsonNormal = {
  current_units: { temperature_2m: "°C" },
  current: { time: "2026-11-09T10:45", temperature_2m: 12.3 },
};

// formatWeather: normal case
const a = formatWeather(jsonNormal);
check(a.temperature === 12.3, "normal: temperature");
check(a.unit === "°C", "normal: unit");
check(a.time === "2026-11-09T10:45", "normal: time");

// Negative and zero temperatures must not be treated as "missing"
const b = formatWeather({
  ...jsonNormal,
  current: { ...jsonNormal.current, temperature_2m: 0 },
});
check(b.temperature === 0, "zero: temperature is 0, not null");

const c = formatWeather({
  ...jsonNormal,
  current: { ...jsonNormal.current, temperature_2m: -4.5 },
});
check(c.temperature === -4.5, "negative: temperature");

// Missing data
const d = formatWeather({});
check(d.temperature === null, "empty: temperature is null");
check(d.time === null, "empty: time is null");
check(d.unit === "°C", "empty: default unit");

// formatTemperature
check(formatTemperature(a) === "12.3 °C", "text: normal temperature");
check(formatTemperature(b) === "0 °C", "text: zero is displayed");
check(
  formatTemperature(d) === "Temperature not available",
  "text: missing temperature",
);

// formatTime
check(formatTime("2026-11-09T10:45") === "As of 2026-11-09 10:45", "time: text");
check(formatTime(null) === "", "time: missing");


document.getElementById("result").textContent =
  failures === 0
    ? "All tests pass ✅"
    : `${failures} test(s) failed ❌ — see the console.`;
