// Tests with console.assert, run by tests.html.

import {
  describeWeather,
  formatDay,
  formatWeather,
  isCompleteWeather,
  formatValue,
  UNKNOWN_WEATHER,
} from "./weather.js";


let failures = 0;

function check(condition, message) {
  console.assert(condition, message);
  if (!condition) failures++;
}

// describeWeather: the landmarks of the exercise

check(describeWeather(0) === "Clear sky", "code 0: clear");
check(describeWeather(1) === "Mainly clear", "code 1: mainly clear");
check(describeWeather(2) === "Partly cloudy", "code 2: partly cloudy");
check(describeWeather(3) === "Overcast", "code 3: overcast");
for (const code of [45, 48]) {
  check(describeWeather(code).toLowerCase().includes("fog"), `code ${code}: fog`);
}
for (const code of [51, 53, 55, 56, 57]) {
  check(describeWeather(code).toLowerCase().includes("drizzle"), `code ${code}: drizzle`);
}
for (const code of [61, 63, 65, 66, 67]) {
  check(describeWeather(code).toLowerCase().includes("rain"), `code ${code}: rain`);
}
for (const code of [71, 73, 75, 77]) {
  check(describeWeather(code).toLowerCase().includes("snow"), `code ${code}: snow`);
}
for (const code of [80, 81, 82, 85, 86]) {
  check(describeWeather(code).toLowerCase().includes("showers"), `code ${code}: showers`);
}
for (const code of [95, 96, 97, 99]) {
  check(describeWeather(code).toLowerCase().includes("thunderstorm"), `code ${code}: thunderstorm`);
}

// exact texts, and the 29 codes of the doc are all different
check(describeWeather(63) === "Moderate rain", "code 63: exact text");
check(describeWeather(95) === "Thunderstorm", "code 95: exact text");
const docCodes = [
  0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77,
  80, 81, 82, 85, 86, 95, 96, 97, 99,
];
const descriptions = docCodes.map(describeWeather);
check(!descriptions.includes(UNKNOWN_WEATHER), "doc codes: none is unknown");
check(new Set(descriptions).size === docCodes.length, "doc codes: all descriptions differ");

// unknown codes
check(UNKNOWN_WEATHER === "Unknown weather", "unknown: text");
for (const code of [4, 10, 44, 46, 49, 60, 68, 78, 83, 90, 98, 100, -1, 1.5, 63.5]) {
  check(describeWeather(code) === "Unknown weather", `unknown code ${code}`);
}
for (const [label, value] of [
  ["NaN", NaN],
  ["Infinity", Infinity],
  ["null", null],
  ["undefined", undefined],
  ["object", {}],
  ["true", true],
  ["'constructor'", "constructor"],
  ["'__proto__'", "__proto__"],
]) {
  let result;
  try {
    result = describeWeather(value);
  } catch {
    result = undefined;
  }
  check(result === "Unknown weather", `unknown value (${label})`);
}

// formatDay: is the displayed day the RIGHT one? (dates checked on a calendar)

check(formatDay("2026-11-17") === "Tuesday", "day: 2026-11-17 is a Tuesday");
check(formatDay("2026-11-18") === "Wednesday", "day: 2026-11-18 is a Wednesday");
check(formatDay("2026-11-19") === "Thursday", "day: 2026-11-19");
check(formatDay("2026-11-20") === "Friday", "day: 2026-11-20");
check(formatDay("2026-11-21") === "Saturday", "day: 2026-11-21");
check(formatDay("2026-11-22") === "Sunday", "day: 2026-11-22");
check(formatDay("2026-11-23") === "Monday", "day: 2026-11-23");
check(formatDay("2000-01-01") === "Saturday", "day: 2000-01-01 is a Saturday");
check(formatDay("2024-02-29") === "Thursday", "day: leap day 2024-02-29");
check(formatDay("2026-12-31") === "Thursday", "day: end of year");
check(formatDay("2027-01-01") === "Friday", "day: new year");
check(formatDay("2025-03-30") === "Sunday", "day: summer time starts (Europe)");
check(formatDay("2025-10-26") === "Sunday", "day: summer time ends (Europe)");
for (const [label, value] of [
  ["empty", ""],
  ["null", null],
  ["undefined", undefined],
  ["number", 20261118],
  ["31 February", "2026-02-31"],
  ["month 13", "2026-13-01"],
  ["day 0", "2026-11-00"],
  ["french format", "18/11/2026"],
  ["with time", "2026-11-18T10:00"],
]) {
  check(formatDay(value) === "", `day: invalid date (${label})`);
}

// formatWeather: with the real answer (Lille)

const jsonLille = {
  current_units: { time: "iso8601", temperature_2m: "°C", wind_speed_10m: "km/h", weather_code: "wmo code" },
  current: { time: "2026-11-17T10:45", interval: 900, temperature_2m: 14.5, wind_speed_10m: 33.5, weather_code: 0 },
  daily: {
    time: ["2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20", "2026-11-21"],
    temperature_2m_max: [15.1, 11.3, 11.0, 10.6, 9.9],
    temperature_2m_min: [5.0, 9.0, 8.9, 8.3, 2.4],
    weather_code: [63, 63, 63, 53, 51],
  },
};

const lille = formatWeather(jsonLille);
check(lille.temperature === 14.5, "weather: temperature");
check(lille.windSpeed === 33.5, "weather: wind");
check(lille.code === 0 && lille.description === "Clear sky", "weather: description from the code");
check(lille.temperatureUnit === "°C" && lille.windUnit === "km/h", "weather: units");
check(lille.days.length === 5, "weather: 5 days");
check(
  lille.days[0].date === "2026-11-17" && lille.days[0].min === 5 && lille.days[0].max === 15.1,
  "weather: first day (min and max are not swapped)",
);
check(
  lille.days[4].date === "2026-11-21" && lille.days[4].min === 2.4 && lille.days[4].max === 9.9,
  "weather: last day",
);
check(lille.days.map((day) => formatDay(day.date)).join() === "Tuesday,Wednesday,Thursday,Friday,Saturday", "weather: weekdays");
check(isCompleteWeather(lille), "complete: the real answer");
check(lille.days[0].description === "Moderate rain", "weather: description of day 0");
check(lille.days[3].description === "Moderate drizzle", "weather: description of day 3");

// 0 is a valid value, never "missing"
const cold = formatWeather({
  ...jsonLille,
  current: { ...jsonLille.current, temperature_2m: 0, wind_speed_10m: 0 },
  daily: { time: ["2026-11-17"], temperature_2m_max: [0], temperature_2m_min: [-4.5] },
});
check(cold.temperature === 0 && cold.windSpeed === 0, "zero: temperature and wind are 0, not null");
check(cold.days[0].min === -4.5 && cold.days[0].max === 0, "zero: negative min, max 0");
check(isCompleteWeather(cold), "complete: zeros and negatives");

// unexpected input never throws
for (const [label, input] of [
  ["null", null],
  ["undefined", undefined],
  ["array", []],
  ["string", "abc"],
  ["number", 42],
  ["empty object", {}],
  ["current null", { current: null, daily: null }],
]) {
  let result;
  try {
    result = formatWeather(input);
  } catch {
    result = undefined;
  }
  check(result !== undefined, `bad input (${label}): no exception`);
  check(result?.temperature === null && result?.days.length === 0, `bad input (${label}): nulls and no days`);
  check(result?.description === "Unknown weather", `bad input (${label}): unknown weather`);
  check(!isCompleteWeather(result), `bad input (${label}): not complete`);
}

// daily data that is not made of arrays: no days, so the answer is not complete
const brokenDaily = formatWeather({
  ...jsonLille,
  daily: { time: "x", temperature_2m_max: 1, temperature_2m_min: {} },
});
check(brokenDaily.days.length === 0 && !isCompleteWeather(brokenDaily), "daily not arrays: no days, not complete");

// wrong types inside a good answer
check(formatWeather({ ...jsonLille, current: { ...jsonLille.current, temperature_2m: "14" } }).temperature === null, "temperature as string: null");
check(formatWeather({ ...jsonLille, current: { ...jsonLille.current, wind_speed_10m: NaN } }).windSpeed === null, "wind NaN: null");
check(formatWeather({ ...jsonLille, current: { ...jsonLille.current, weather_code: "0" } }).description === "Unknown weather", "weather_code as string: unknown");
check(formatWeather({ current: {} }).temperatureUnit === "°C", "default temperature unit");
check(formatWeather({ current: {} }).windUnit === "km/h", "default wind unit");

// isCompleteWeather
check(!isCompleteWeather(null), "complete: null");
check(!isCompleteWeather("abc"), "complete: string");
check(!isCompleteWeather({ ...lille, days: [] }), "complete: no forecast");
check(!isCompleteWeather({ ...lille, windSpeed: null }), "complete: no wind");
check(!isCompleteWeather({ ...lille, temperature: null }), "complete: no temperature");
check(!isCompleteWeather({ ...lille, days: [{ date: "2026-11-17", min: null, max: 3 }] }), "complete: a day without min");
check(!isCompleteWeather({ ...lille, days: [{ date: "not a date", min: 1, max: 2 }] }), "complete: a day with a bad date");
check(!isCompleteWeather({ ...lille, days: [null] }), "complete: null day");

// formatValue
check(formatValue(14.5, "°C") === "14.5 °C", "value: temperature");
check(formatValue(0, "km/h") === "0 km/h", "value: zero is displayed");
check(formatValue(-4.5, "°C") === "-4.5 °C", "value: negative");



document.getElementById("result").textContent =
  failures === 0
    ? "All tests pass ✅"
    : `${failures} test(s) failed ❌ — see the console.`;
