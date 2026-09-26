import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { gcd, lcm, isPrime, getPrimeFactors } from '../js/modules/utils/math.js';
import { shuffle } from '../js/modules/utils/rand.js';

describe('Math utilities (js/modules/utils/math.js)', () => {
  describe('gcd (Greatest Common Divisor)', () => {
    test('calculates correct GCD for common pairs', () => {
      assert.equal(gcd(12, 8), 4);
      assert.equal(gcd(54, 24), 6);
      assert.equal(gcd(10, 10), 10);
      assert.equal(gcd(7, 13), 1); // coprime
    });

    test('is order-invariant', () => {
      assert.equal(gcd(24, 54), gcd(54, 24));
      assert.equal(gcd(15, 30), gcd(30, 15));
    });

    test('handles identity with 1', () => {
      assert.equal(gcd(1, 100), 1);
      assert.equal(gcd(42, 1), 1);
    });
  });

  describe('lcm (Least Common Multiple)', () => {
    test('calculates correct LCM for common pairs', () => {
      assert.equal(lcm(4, 6), 12);
      assert.equal(lcm(5, 7), 35);
      assert.equal(lcm(10, 15), 30);
      assert.equal(lcm(8, 8), 8);
    });

    test('satisfies gcd(a,b) * lcm(a,b) = a * b for positive integers', () => {
      const pairs = [[12, 18], [7, 11], [15, 25], [9, 6]];
      for (const [a, b] of pairs) {
        assert.equal(gcd(a, b) * lcm(a, b), a * b);
      }
    });
  });

  describe('isPrime', () => {
    test('identifies non-primes <= 1', () => {
      assert.equal(isPrime(0), false);
      assert.equal(isPrime(1), false);
      assert.equal(isPrime(-5), false);
    });

    test('identifies smallest prime 2', () => {
      assert.equal(isPrime(2), true);
    });

    test('identifies primes accurately', () => {
      const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 97];
      for (const p of primes) {
        assert.equal(isPrime(p), true, `${p} should be prime`);
      }
    });

    test('identifies composite numbers accurately', () => {
      const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 25, 49, 100];
      for (const c of composites) {
        assert.equal(isPrime(c), false, `${c} should not be prime`);
      }
    });
  });

  describe('getPrimeFactors', () => {
    test('calculates prime factors for small and large numbers', () => {
      assert.deepEqual(getPrimeFactors(2), [2]);
      assert.deepEqual(getPrimeFactors(12), [2, 2, 3]);
      assert.deepEqual(getPrimeFactors(30), [2, 3, 5]);
      assert.deepEqual(getPrimeFactors(100), [2, 2, 5, 5]);
    });

    test('product of prime factors equals original number', () => {
      const numbers = [18, 45, 84, 120, 256, 315];
      for (const n of numbers) {
        const factors = getPrimeFactors(n);
        const product = factors.reduce((acc, val) => acc * val, 1);
        assert.equal(product, n, `Factors of ${n} must multiply to ${n}`);
        for (const factor of factors) {
          assert.equal(isPrime(factor), true, `Factor ${factor} must be prime`);
        }
      }
    });
  });

  describe('shuffle (Fisher-Yates)', () => {
    test('preserves all original elements without mutation', () => {
      const original = [1, 2, 3, 4, 5];
      const result = shuffle(original);
      assert.notEqual(result, original, 'Must return a new array instance');
      assert.deepEqual(original, [1, 2, 3, 4, 5], 'Original must not be mutated');
      assert.deepEqual([...result].sort((a, b) => a - b), [1, 2, 3, 4, 5]);
    });

    test('handles empty or non-array inputs safely', () => {
      assert.deepEqual(shuffle([]), []);
      assert.deepEqual(shuffle(null), []);
      assert.deepEqual(shuffle(undefined), []);
    });
  });
});
