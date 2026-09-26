import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllThemeAreas,
  getExercisesByArea,
  getExerciseInfo,
  exerciseTypeExists,
  THEME_AREAS,
  EXERCISE_TYPES
} from '../js/config/exercise-types.js';

describe('Exercise Types Configuration (js/config/exercise-types.js)', () => {
  test('getAllThemeAreas returns all 6 theme areas', () => {
    const areas = getAllThemeAreas();
    assert.equal(areas.length, 6);
    assert.deepEqual(areas, THEME_AREAS);
  });

  test('getExercisesByArea returns valid area config or null', () => {
    const aritmetica = getExercisesByArea('aritmetica');
    assert.ok(aritmetica);
    assert.equal(aritmetica.title, 'Aritmética');
    assert.ok(Array.isArray(aritmetica.exercises));

    const invalid = getExercisesByArea('non-existent');
    assert.equal(invalid, null);
  });

  test('getExerciseInfo finds existing exercise info across all areas', () => {
    const addSub = getExerciseInfo('addSub');
    assert.ok(addSub);
    assert.equal(addSub.type, 'addSub');
    assert.equal(addSub.text, 'Adição e Subtração');

    const fractions = getExerciseInfo('fractions');
    assert.ok(fractions);
    assert.equal(fractions.type, 'fractions');

    const notFound = getExerciseInfo('random_type_xyz');
    assert.equal(notFound, null);
  });

  test('exerciseTypeExists returns boolean accurately', () => {
    assert.equal(exerciseTypeExists('addSub'), true);
    assert.equal(exerciseTypeExists('fractions'), true);
    assert.equal(exerciseTypeExists('irreducibleFractions'), true);
    assert.equal(exerciseTypeExists('nonexistent'), false);
  });
});
