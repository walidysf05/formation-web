// Pure functions on weather data: no DOM, no fetch.

export const UNKNOWN_WEATHER = "Unknown weather";

// WMO weather interpretation codes (https://open-meteo.com/en/docs).
const WEATHER_DESCRIPTIONS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  97: "Violent thunderstorm",
  99: "Thunderstorm with heavy hail",
};

// A valid number (0 included), otherwise null.
const numberOrNull = (value) => (Number.isFinite(value) ? value : null);
const asArray = (value) => (Array.isArray(value) ? value : []);

/** Describes a WMO code in English; unknown code => "Unknown weather". */
export function describeWeather(code) {
  // hasOwn: "constructor" or "__proto__" must not be found by accident
  return Object.hasOwn(WEATHER_DESCRIPTIONS, code)
    ? WEATHER_DESCRIPTIONS[code]
    : UNKNOWN_WEATHER;
}

/**
 * Weekday of a calendar date of the API: "2026-11-18" => "Wednesday".
 * The date is built at 12:00 local time: no time zone can change the day.
 * @returns {string} Weekday (e.g. "Wednesday"), or "" if the date is missing or not real.
 */
export function formatDay(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  // 2026-02-31 would silently become March 3rd: refuse it
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return "";
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

/** Turns the raw JSON of /forecast into a simple object. Never throws. */
export function formatWeather(data) {
  const current = data?.current ?? {};
  const daily = data?.daily ?? {};
  const dates = asArray(daily.time);
  const codes = asArray(daily.weather_code);
  const mins = asArray(daily.temperature_2m_min);
  const maxes = asArray(daily.temperature_2m_max);
  const code = numberOrNull(current.weather_code);

  return {
    temperature: numberOrNull(current.temperature_2m),
    windSpeed: numberOrNull(current.wind_speed_10m),
    code,
    description: describeWeather(code),
    temperatureUnit: data?.current_units?.temperature_2m || "°C",
    windUnit: data?.current_units?.wind_speed_10m || "km/h",
    // daily data = PARALLEL arrays: index i is the same day in each of them
    days: dates.map((date, i) => {
      const dayCode = numberOrNull(codes[i]);
      return {
        date: typeof date === "string" ? date : null,
        code: dayCode,
        description: describeWeather(dayCode),
        min: numberOrNull(mins[i]),
        max: numberOrNull(maxes[i]),
      };
    }),
  };
}

/** Is this weather object complete, i.e. safe to display? */
export function isCompleteWeather(weather) {
  return (
    Boolean(weather) &&
    Number.isFinite(weather.temperature) &&
    Number.isFinite(weather.windSpeed) &&
    Array.isArray(weather.days) &&
    weather.days.length > 0 &&
    weather.days.every(
      (day) =>
        formatDay(day?.date) !== "" &&
        Number.isFinite(day.min) &&
        Number.isFinite(day.max),
    )
  );
}

/** formatValue(14.5, "°C") => "14.5 °C" */
export function formatValue(value, unit) {
  return `${value} ${unit}`;
}
