// Tests with console.assert, run by tests.html.

import {
  formatWeather,
  formatTemperature,
  formatTime,
  formatAge,
  isCompleteWeather,
} from "./weather.js";
import { isFresh, hasValidTimestamp } from "./cache.js";


let failures = 0;

function check(condition, message) {
  console.assert(condition, message);
  if (!condition) failures++;
}

const jsonNormal = {
  current_units: { temperature_2m: "°C" },
  current: { time: "2026-11-09T10:45", temperature_2m: 12.3 },
};

// formatWeather 

// normal case
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

// Unexpected input never throws and gives a null temperature
for (const [label, input] of [
  ["null", null],
  ["undefined", undefined],
  ["array", []],
  ["string", "abc"],
  ["number", 42],
  ["current null", { current: null }],
  ["current empty", { current: {} }],
]) {
  let result;
  try {
    result = formatWeather(input);
  } catch {
    result = undefined;
  }
  check(result?.temperature === null, `bad input (${label}): null temperature`);
  check(result?.unit === "°C", `bad input (${label}): default unit`);
}
for (const [label, value] of [
  ["string", "12"],
  ["NaN", NaN],
  ["null", null],
  ["Infinity", Infinity],
]) {
  const w = formatWeather({ current: { temperature_2m: value } });
  check(w.temperature === null, `temperature_2m ${label}: null`);
}
check(
  formatWeather({ current: { time: 123 } }).time === null,
  "time that is not a string: null",
);

// isCompleteWeather 

check(isCompleteWeather(a), "complete: normal weather");
check(isCompleteWeather(b), "complete: zero is complete");
check(!isCompleteWeather(d), "complete: null temperature is not");
check(!isCompleteWeather({}), "complete: {} is not");
check(!isCompleteWeather(null), "complete: null is not");
check(!isCompleteWeather("abc"), "complete: string is not");
check(!isCompleteWeather([]), "complete: array is not");
check(
  !isCompleteWeather({ temperature: "12", unit: "°C", time: null }),
  "complete: temperature as string is not",
);

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

// formatAge 

const T = 1_700_000_000_000;
check(formatAge(T - 30_000, T) === "just now", "age: 30 seconds");
check(formatAge(T - 60_000, T) === "1 minute ago", "age: 1 minute");
check(formatAge(T - 5 * 60_000, T) === "5 minutes ago", "age: 5 minutes");
check(formatAge(T - 3 * 3_600_000, T) === "3 hours ago", "age: 3 hours");
check(formatAge(T - 2 * 86_400_000, T) === "2 days ago", "age: 2 days");

// isFresh / hasValidTimestamp 

const NOW = 1_000_000;
const MAX = 600_000;
check(isFresh({ savedAt: NOW }, MAX, NOW), "fresh: age 0 is fresh");
check(isFresh({ savedAt: NOW - MAX + 1 }, MAX, NOW), "fresh: just under max");
check(!isFresh({ savedAt: NOW - MAX }, MAX, NOW), "fresh: exactly max is stale");
check(!isFresh({ savedAt: NOW + 1 }, MAX, NOW), "fresh: future by 1 ms");
check(!isFresh({ savedAt: 1e15 }, MAX, NOW), "fresh: far future");
check(!isFresh({ savedAt: Infinity }, MAX, NOW), "fresh: Infinity");
check(!isFresh({ savedAt: NaN }, MAX, NOW), "fresh: NaN");
check(!isFresh({ savedAt: null }, MAX, NOW), "fresh: null savedAt");
check(!isFresh({ savedAt: "123" }, MAX, NOW), "fresh: string savedAt");
check(!isFresh({}, MAX, NOW), "fresh: missing savedAt");
check(!isFresh(null, MAX, NOW), "fresh: null entry");
check(
  hasValidTimestamp({ savedAt: NOW - 10 * MAX }, NOW),
  "timestamp: an old past date is believable",
);
check(!hasValidTimestamp({ savedAt: NOW + 1 }, NOW), "timestamp: future");



document.getElementById("result").textContent =
  failures === 0
    ? "All tests pass ✅"
    : `${failures} test(s) failed ❌ — see the console.`;

