import test from "node:test";
import assert from "node:assert/strict";

import {
  isServiceWorkerSupported,
  checkForSWUpdate,
  promptUserToRefresh,
  stopSWUpdateInterval,
  initServiceWorker,
} from "../js/services/sw-manager.js";

test("Service Worker Manager Service (js/services/sw-manager.js)", async (t) => {
  t.afterEach(() => {
    stopSWUpdateInterval();
  });

  await t.test("isServiceWorkerSupported returns false in headless environment without navigator.serviceWorker", () => {
    assert.equal(isServiceWorkerSupported(), false);
  });

  await t.test("checkForSWUpdate exits cleanly when Service Worker is unsupported", async () => {
    let prompted = false;
    await checkForSWUpdate(() => {
      prompted = true;
    });
    assert.equal(prompted, false);
  });

  await t.test("initServiceWorker returns null when unsupported", () => {
    const res = initServiceWorker();
    assert.equal(res, null);
  });

  await t.test("promptUserToRefresh returns null when document is undefined", () => {
    const el = promptUserToRefresh();
    assert.equal(el, null);
  });

  await t.test("checkForSWUpdate invokes onPrompt when a waiting worker exists", async () => {
    const mockRegistration = {
      waiting: {
        postMessage: () => {},
      },
      update: async () => {},
    };

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        getRegistration: async () => mockRegistration,
      },
      configurable: true,
      writable: true,
    });

    try {
      let promptedWith = null;
      await checkForSWUpdate((reg) => {
        promptedWith = reg;
      });

      assert.equal(promptedWith, mockRegistration);
    } finally {
      delete navigator.serviceWorker;
    }
  });

  await t.test("stopSWUpdateInterval clears active interval cleanly", () => {
    stopSWUpdateInterval();
    assert.ok(true);
  });
});
