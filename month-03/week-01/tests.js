// tests.js - test tool

/**
 * Runs a test, prints the result in the browser,
 * in the `#results` list.
 *
 * @param {string} name - Description of the test.
 * @param {() => void} fn - The test; it fails if it throws an error.
 * @returns {void}
 */
export function test(name, fn) {
  let message;
  let passed = true;
  try {
    fn();
    message = `✔ ${name}`;
  } catch (error) {
    passed = false;
    message = `✘ ${name} — ${error.message}`;
  }

  if (typeof document !== "undefined") {
    const li = document.createElement("li");
    li.textContent = message;
    li.className = passed ? "pass" : "fail";
    document.querySelector("#results").append(li);
  }
}

/**
 * Checks that two values are strictly equal (`===`).
 *
 * @param {*} actual - The value obtained.
 * @param {*} expected - The expected value.
 * @throws {Error} If `actual !== expected`.
 * @returns {void}
 */
export function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`expected ${expected}, got ${actual}`);
  }
}

/**
 * Checks that a function throws an error.
 *
 * @param {() => void} fn - The function to run.
 * @throws {Error} If `fn` does not throw.
 * @returns {void}
 */
export function assertThrows(fn) {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error("expected an error, but none was thrown");
}
