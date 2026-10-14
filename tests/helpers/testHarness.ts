/**
 * Lightweight test harness providing describe/it/expect for standalone E2E test execution.
 */

export interface TestCaseResult {
  name: string;
  passed: boolean;
  error?: Error;
  durationMs: number;
}

export interface TestSuiteResult {
  suiteName: string;
  tests: TestCaseResult[];
  passedCount: number;
  failedCount: number;
  totalDurationMs: number;
}

let currentSuiteName = '';
let currentSuiteResults: TestCaseResult[] = [];
export const allSuiteResults: TestSuiteResult[] = [];

export function describe(suiteName: string, fn: () => void | Promise<void>) {
  currentSuiteName = suiteName;
  currentSuiteResults = [];
  const start = Date.now();

  const run = async () => {
    try {
      await fn();
    } catch (err: any) {
      console.error(`Suite failure in ${suiteName}:`, err);
    }
    const duration = Date.now() - start;
    const passedCount = currentSuiteResults.filter((r) => r.passed).length;
    const failedCount = currentSuiteResults.filter((r) => !r.passed).length;

    allSuiteResults.push({
      suiteName,
      tests: [...currentSuiteResults],
      passedCount,
      failedCount,
      totalDurationMs: duration,
    });
  };

  return run();
}

export async function it(testName: string, testFn: () => void | Promise<void>) {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    currentSuiteResults.push({
      name: testName,
      passed: true,
      durationMs: duration,
    });
  } catch (err: any) {
    const duration = Date.now() - start;
    currentSuiteResults.push({
      name: testName,
      passed: false,
      error: err,
      durationMs: duration,
    });
  }
}

export function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },
    toEqual(expected: any) {
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      if (a !== e) {
        throw new Error(`Expected ${a} to equal ${e}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} to be >= ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${actual} to be <= ${expected}`);
      }
    },
    toContain(expected: any) {
      if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected string "${actual}" to contain "${expected}"`);
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
        }
      } else {
        throw new Error(`toContain called on non-collection: ${typeof actual}`);
      }
    },
    toHaveLength(expected: number) {
      if (!actual || actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : undefined}`);
      }
    },
    toBeCloseTo(expected: number, delta: number = 0.001) {
      if (Math.abs(actual - expected) > delta) {
        throw new Error(`Expected ${actual} to be close to ${expected} within ${delta}`);
      }
    },
  };
}
