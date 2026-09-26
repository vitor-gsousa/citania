import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateGcd } from '../js/modules/arithmetic/gcd.js';
import { generateLcm } from '../js/modules/arithmetic/lcm.js';
import { generatePrimeFactorization } from '../js/modules/arithmetic/primeFactorization.js';
import { generatePowerMultiplication } from '../js/modules/arithmetic/powerMultiplication.js';
import { generatePowerDivision } from '../js/modules/arithmetic/powerDivision.js';
import { gcd, lcm, isPrime } from '../js/modules/utils/math.js';

describe('Other Arithmetic Generators', () => {
  describe('generateGcd (js/modules/arithmetic/gcd.js)', () => {
    test('generates mathematically correct GCD problems', () => {
      for (let level = 1; level <= 5; level++) {
        for (let i = 0; i < 10; i++) {
          const exercise = generateGcd(level);
          const match = exercise.question.match(/term-box">(\d+)<\/span>.*term-box">(\d+)<\/span>/);
          assert.ok(match, 'Must have 2 term boxes');
          const num1 = Number(match[1]);
          const num2 = Number(match[2]);
          assert.equal(exercise.answer, gcd(num1, num2));
          assert.equal(exercise.hasInlineInput, true);
        }
      }
    });
  });

  describe('generateLcm (js/modules/arithmetic/lcm.js)', () => {
    test('generates mathematically correct LCM problems', () => {
      for (let level = 1; level <= 5; level++) {
        for (let i = 0; i < 10; i++) {
          const exercise = generateLcm(level);
          const match = exercise.question.match(/term-box">(\d+)<\/span>.*term-box">(\d+)<\/span>/);
          assert.ok(match, 'Must have 2 term boxes');
          const num1 = Number(match[1]);
          const num2 = Number(match[2]);
          assert.equal(exercise.answer, lcm(num1, num2));
          assert.equal(exercise.hasInlineInput, true);
        }
      }
    });
  });

  describe('generatePrimeFactorization (js/modules/arithmetic/primeFactorization.js)', () => {
    test('generates valid composite numbers and correct prime factors array', () => {
      for (let level = 1; level <= 5; level++) {
        for (let i = 0; i < 10; i++) {
          const exercise = generatePrimeFactorization(level);
          const match = exercise.question.match(/term-box">(\d+)<\/span>/);
          assert.ok(match, 'Must have number in term box');
          const originalNum = Number(match[1]);
          assert.equal(isPrime(originalNum), false, 'Number must be composite');
          assert.ok(Array.isArray(exercise.answer), 'Answer must be an array of factors');
          
          const product = exercise.answer.reduce((acc, f) => acc * f, 1);
          assert.equal(product, originalNum, 'Factors must multiply back to original number');
          for (const factor of exercise.answer) {
            assert.equal(isPrime(factor), true, `Factor ${factor} must be prime`);
          }
        }
      }
    });
  });

  describe('generatePowerMultiplication (js/modules/arithmetic/powerMultiplication.js)', () => {
    test('generates valid power multiplication exercises', () => {
      for (let level = 1; level <= 4; level++) {
        for (let i = 0; i < 15; i++) {
          const exercise = generatePowerMultiplication(level);
          assert.ok(['string', 'number'].includes(exercise.checkType));
          assert.ok(exercise.explanation.length > 0);
          assert.equal(exercise.hasInlineInput, true);
        }
      }
    });
  });

  describe('generatePowerDivision (js/modules/arithmetic/powerDivision.js)', () => {
    test('generates valid power division exercises', () => {
      for (let level = 1; level <= 4; level++) {
        for (let i = 0; i < 15; i++) {
          const exercise = generatePowerDivision(level);
          assert.match(exercise.answer, /^\d+\^\d+$/);
          assert.ok(exercise.explanation.length > 0);
          assert.equal(exercise.hasInlineInput, true);
        }
      }
    });
  });
});
