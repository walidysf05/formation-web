// Pure functions on weather data: no DOM, no fetch, no storage.

const DEFAULT_UNIT = "°C";

/**
 * Turns the API JSON into a simple object. Never Throws: anything unexpected
 * (null body, wrong types) gives `null` for the temperature and the time.
 * @param {*} data Raw response of `/forecast`.
 * @returns {{temperature: number|null, unit: string, time: string|null}}
 *   `temperature` and `time` are `null` when missing (0 °C is a valid value).
 */
export function formatWeather(data) {
  const current = data?.current;
  const temperature = current?.temperature_2m;
  const unit = data?.current_units?.temperature_2m;
  return {
    // Number.isFinite rejects undefined, "12", NaN and Infinity, but keeps 0
    temperature: Number.isFinite(temperature) ? temperature : null,
    unit: typeof unit === "string" && unit ? unit : DEFAULT_UNIT,
    time: typeof current?.time === "string" ? current.time :null,
  };
}

/**
 * Is this a complete weather object, safe to display and to keep in the cache?
 * @param {*} weather
 * @returns {boolean}
 */
export function isCompleteWeather(weather) {
  return (
    weather !== null &&
    typeof weather === "object" &&
    Number.isFinite(weather.temperature) &&
    typeof weather.unit === "string" &&
    (weather.time === null || typeof weather.time === "string")
  );
}

/**
 * Text shown for the temperature.
 * @param {{temperature: number|null, unit: string}} weather
 * @returns {string} e.g. "12.3 °C", or a message when missing.
 */
export function formatTemperature(weather) {
  return weather.temperature === null
    ? "Temperature not available"
    : `${weather.temperature} ${weather.unit}`;
}

/**
 * Text shown for the time: "2026-11-09T10:45" => "As of 2026-11-09 10:45".
 * @param {string|null} time
 * @returns {string} Empty string when there is no time.
 */
export function formatTime(time) {
  return time ? `As of ${time.replace("T", " ")}` : "";
}

/**
 * How old a saved value is, in words: "just now", "5 minutes ago", "3 hours ago".
 * @param {number} savedAt Timestamp in milliseconds.
 * @param {number} [now=Date.now()] Current time (can be set for tests).
 * @returns {string}
 */
export function formatAge(savedAt, now = Date.now()) {
  const minutes = Math.floor((now - savedAt) / 60_000);
  if (minutes < 1) return "just now";
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.floor(hours / 24), "day");
}
