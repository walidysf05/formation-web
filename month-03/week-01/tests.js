// tests.js - test tool

export function test(name, fn) {
  let message;
  try {
    fn();
    message = `✔ ${name}`;
  } catch (error) {
    message = `✘ ${name} — ${error.message}`;
  }
  console.log(message);

  if (typeof document !== "undefined") {
    const li = document.createElement("li");
    li.textContent = message;
    document.querySelector("#results").append(li);
  }
}

export function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`expected ${expected}, got ${actual}`);
  }
}

export function assertThrows(fn) {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error("expected an error, but none was thrown");
}
