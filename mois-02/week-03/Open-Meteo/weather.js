// Pure functions on weather data: no DOM, no fetch, no storage.

const DEFAULT_UNIT = "°C";

/**
 * Turns the API JSON into a simple object.
 * @param {object} data Raw response of `/forecast`.
 * @returns {{temperature: number|null, unit: string, time: string|null}}
 *   `temperature` and `time` are `null` when missing (0 °C is a valid value).
 */
export function formatWeather(data) {
  return {
    temperature: data.current?.temperature_2m ?? null,
    unit: data.current_units?.temperature_2m ?? DEFAULT_UNIT,
    time: data.current?.time ?? null,
  };
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
