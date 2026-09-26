import test from "node:test";
import assert from "node:assert/strict";

// Mock localStorage for Node environment
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  clear: () => store.clear(),
  removeItem: (k) => store.delete(k),
};

import {
  gamification,
  generateNewMathFact,
  startAutoFactRotation,
  stopAutoFactRotation,
  loadGamification,
  saveGamification,
  GAMIFICATION_KEY,
  BADGES,
} from "../js/features/gamification.js";
import {
  getRandomMathFact,
  getLevelBasedMathFact,
  getArithmeticFact,
  startFactRotation,
} from "../js/modules/utils/math-facts.js";

test("Math Facts Utility (js/modules/utils/math-facts.js)", async (t) => {
  await t.test("getRandomMathFact returns a non-empty fact string", () => {
    const fact = getRandomMathFact();
    assert.equal(typeof fact, "string");
    assert.ok(fact.length > 5);
  });

  await t.test("getLevelBasedMathFact returns level-appropriate facts", () => {
    for (const lvl of [1, 2, 3, 4]) {
      const fact = getLevelBasedMathFact(lvl);
      assert.equal(typeof fact, "string");
      assert.ok(fact.length > 5);
    }
  });

  await t.test("getArithmeticFact returns arithmetic curiosity", () => {
    const fact = getArithmeticFact();
    assert.equal(typeof fact, "string");
    assert.ok(fact.length > 5);
  });

  await t.test("startFactRotation invokes callback immediately and stops cleanly", () => {
    let calledWith = null;
    const controller = startFactRotation((fact) => {
      calledWith = fact;
    });

    assert.equal(typeof controller.stop, "function");
    assert.equal(typeof calledWith, "string");
    assert.ok(calledWith.length > 0);
    controller.stop();
  });
});

test("Gamification Features (js/features/gamification.js)", async (t) => {
  t.afterEach(() => {
    stopAutoFactRotation();
    store.clear();
  });

  await t.test("BADGES definition contains standard badges with emojis", () => {
    assert.ok(BADGES.explorer);
    assert.equal(BADGES.explorer.emoji, "🧭");
    assert.ok(BADGES.speedster);
    assert.ok(BADGES.firstTry);
  });

  await t.test("generateNewMathFact updates gamification.curiosidade", () => {
    generateNewMathFact();
    assert.equal(typeof gamification.curiosidade, "string");
    assert.ok(gamification.curiosidade.length > 5);

    generateNewMathFact(2);
    assert.equal(typeof gamification.curiosidade, "string");
    assert.ok(gamification.curiosidade.length > 5);
  });

  await t.test("startAutoFactRotation and stopAutoFactRotation operate cleanly", () => {
    startAutoFactRotation();
    assert.equal(typeof gamification.curiosidade, "string");
    stopAutoFactRotation();
  });

  await t.test("loadGamification loads stored data correctly", async () => {
    const dummyState = {
      pontos: 150,
      medalhas: [{ id: "explorer", label: "Explorador", emoji: "🧭" }],
      curiosidade: "Curiosidade de teste",
      userName: "ExploradorTeste",
    };
    store.set(GAMIFICATION_KEY, JSON.stringify(dummyState));

    await loadGamification();

    assert.equal(gamification.pontos, 150);
    assert.equal(gamification.medalhas.length, 1);
    assert.equal(gamification.userName, "ExploradorTeste");
    stopAutoFactRotation();
  });

  await t.test("saveGamification persists current gamification state", () => {
    gamification.pontos = 275;
    gamification.userName = "HeroiCitania";
    saveGamification();

    const raw = store.get(GAMIFICATION_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.pontos, 275);
    assert.equal(parsed.userName, "HeroiCitania");
  });
});
