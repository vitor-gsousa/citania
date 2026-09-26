import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test environment
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, String(v)),
  clear: () => store.clear(),
  removeItem: (k) => store.delete(k),
};

import {
  getPlayerName,
  setPlayerName,
  DEFAULT_USER_NAME,
  USER_NAME_KEY,
  LEGACY_USER_NAME_KEY,
} from '../js/services/user-profile.js';

describe('User Profile Service (js/services/user-profile.js)', () => {
  beforeEach(() => {
    store.clear();
  });

  test('returns default user name when no storage entry exists', () => {
    assert.equal(getPlayerName(), DEFAULT_USER_NAME);
  });

  test('reads from primary key if present', () => {
    store.set(USER_NAME_KEY, 'Afonso');
    assert.equal(getPlayerName(), 'Afonso');
  });

  test('falls back to legacy key if primary is absent', () => {
    store.set(LEGACY_USER_NAME_KEY, 'Beatriz');
    assert.equal(getPlayerName(), 'Beatriz');
  });

  test('setPlayerName synchronizes both current and legacy storage keys', () => {
    setPlayerName('Carlos');
    assert.equal(store.get(USER_NAME_KEY), 'Carlos');
    assert.equal(store.get(LEGACY_USER_NAME_KEY), 'Carlos');
    assert.equal(getPlayerName(), 'Carlos');
  });

  test('setPlayerName trims whitespace and defaults on empty string', () => {
    setPlayerName('   ');
    assert.equal(getPlayerName(), DEFAULT_USER_NAME);

    setPlayerName('  Diana  ');
    assert.equal(getPlayerName(), 'Diana');
  });
});
