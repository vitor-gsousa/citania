import test from "node:test";
import assert from "node:assert/strict";

// Helper to create mock DOM elements
function createMockElement(tag = "div") {
  const listeners = new Map();
  const attributes = new Map();
  const classList = new Set();

  const el = {
    tagName: tag.toUpperCase(),
    value: "",
    attributes,
    classList: {
      has: (c) => classList.has(c),
      add: (c) => classList.add(c),
      remove: (c) => classList.delete(c),
      contains: (c) => classList.has(c),
      toggle: (c) => {
        if (classList.has(c)) {
          classList.delete(c);
          return false;
        }
        classList.add(c);
        return true;
      },
    },
    dataset: {},
    addEventListener: (type, fn) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener: (type, fn) => {
      const list = listeners.get(type) || [];
      listeners.set(type, list.filter((cb) => cb !== fn));
    },
    dispatchEvent: (type, event = {}) => {
      const list = listeners.get(type) || [];
      for (const cb of list) {
        cb({ target: el, ...event });
      }
    },
    setAttribute: (k, v) => attributes.set(k, String(v)),
    getAttribute: (k) => attributes.get(k) ?? null,
    removeAttribute: (k) => attributes.delete(k),
    hasAttribute: (k) => attributes.has(k),
    closest: (sel) => {
      if (sel === ".key" && classList.has("key")) return el;
      return null;
    },
    focus: () => {},
  };

  return el;
}

// Mock globals for headless Node testing of events.js
const mockBody = createMockElement("body");
globalThis.document = {
  body: mockBody,
  activeElement: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  contains: () => true,
};

globalThis.MutationObserver = class {
  observe() {}
  disconnect() {}
};

import { initEventListeners } from "../js/events.js";

test("Events Module (js/events.js)", async (t) => {
  await t.test("numpad key click assigns to fraction input without undeclared variable error", () => {
    const fractionInput = createMockElement("input");
    fractionInput.classList.add("fraction-missing-input");

    const answerInput = createMockElement("input");
    const customKeyboard = createMockElement("div");

    const key5 = createMockElement("button");
    key5.classList.add("key");
    key5.dataset.value = "5";

    globalThis.document.querySelectorAll = (sel) => {
      if (sel === ".fraction-missing-input") return [fractionInput];
      if (sel.includes(".fraction-missing-input")) return [fractionInput];
      return [];
    };
    globalThis.document.querySelector = (sel) => {
      if (sel.includes('[data-active="true"]')) return fractionInput;
      return null;
    };
    globalThis.document.contains = (el) => el === fractionInput;

    const DOM = {
      menuContainer: createMockElement("div"),
      answerInput,
      customKeyboard,
    };
    const state = { currentArea: null };

    // Initialize listeners
    initEventListeners(DOM, state);

    // Simulate clicking '5' on the numpad keyboard
    // This previously threw "ReferenceError: assignment to undeclared variable activeFractionInput"
    assert.doesNotThrow(() => {
      customKeyboard.dispatchEvent("click", {
        target: key5,
      });
    });

    assert.equal(fractionInput.value, "5");
    assert.equal(fractionInput.getAttribute("data-active"), "true");
  });
});
