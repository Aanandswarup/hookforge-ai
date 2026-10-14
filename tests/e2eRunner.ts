import { register } from 'node:module';
// Register custom module loader for node environment mocks (e.g. jspdf constructor)
register('./loader.mjs', import.meta.url);

process.env.NODE_ENV = 'test';

import { allSuiteResults } from './helpers/testHarness';

async function main() {
  console.log('================================================================');
  console.log('       HOOKFORGE AI — 4-TIER E2E TEST SUITE RUNNER              ');
  console.log('================================================================\n');

  const suiteStartTime = Date.now();

  try {
    const { runTier1Tests } = await import('./tier1_feature_coverage.test');
    const { runTier2Tests } = await import('./tier2_boundary_corner_cases.test');
    const { runTier3Tests } = await import('./tier3_cross_feature_interactions.test');
    const { runTier4Tests } = await import('./tier4_real_world_workloads.test');

    console.log('▶ Running Tier 1: Feature Coverage (Core Areas & Build Bundle)...');
    await runTier1Tests();
    console.log('✔ Tier 1 Completed.\n');

    console.log('▶ Running Tier 2: Boundary & Corner Cases...');
    await runTier2Tests();
    console.log('✔ Tier 2 Completed.\n');

    console.log('▶ Running Tier 3: Cross-Feature Interactions...');
    await runTier3Tests();
    console.log('✔ Tier 3 Completed.\n');

    console.log('▶ Running Tier 4: Real-World Workload Scenarios...');
    await runTier4Tests();
    console.log('✔ Tier 4 Completed.\n');
  } catch (err: any) {
    console.error('Fatal error during test suite execution:', err);
    process.exit(1);
  }

  const totalDuration = ((Date.now() - suiteStartTime) / 1000).toFixed(2);

  // Compute stats
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  console.log('----------------------------------------------------------------');
  console.log('                 DETAILED SUITE BREAKDOWN                       ');
  console.log('----------------------------------------------------------------');

  for (const suite of allSuiteResults) {
    totalTests += suite.tests.length;
    totalPassed += suite.passedCount;
    totalFailed += suite.failedCount;

    const icon = suite.failedCount === 0 ? '✔' : '✖';
    console.log(
      `${icon} ${suite.suiteName} [${suite.passedCount}/${suite.tests.length}] (${suite.totalDurationMs}ms)`
    );

    if (suite.failedCount > 0) {
      for (const t of suite.tests) {
        if (!t.passed) {
          console.log(`    ✖ FAIL: ${t.name}`);
          if (t.error) {
            console.log(`      Error: ${t.error.message}`);
          }
        }
      }
    }
  }

  console.log('\n================================================================');
  console.log('                      TEST RUN SUMMARY                          ');
  console.log('================================================================');
  console.log(`Total Test Suites : ${allSuiteResults.length}`);
  console.log(`Total Test Cases  : ${totalTests}`);
  console.log(`Passed            : ${totalPassed}`);
  console.log(`Failed            : ${totalFailed}`);
  console.log(`Total Time        : ${totalDuration}s`);
  console.log('================================================================');

  if (totalFailed > 0) {
    console.log(`\n❌ TEST SUITE FAILED with ${totalFailed} failure(s).`);
    process.exit(1);
  } else {
    console.log('\n✅ ALL 4 TIERS PASSED PERFECTLY (100% PASS RATE, EXIT 0).');
    process.exit(0);
  }
}

main();
