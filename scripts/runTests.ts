import { runTestHarness } from '../src/services/testHarness';
import { runSyntheticExperiment } from '../src/services/experimentRunner';

console.log('====================================================');
console.log('   PERMIT WORKFLOW TRACKER - AUTOMATED RUNNER       ');
console.log('====================================================\n');

console.log('--- 1. RUNNING AUTOMATED TEST HARNESS ---');
const testResults = runTestHarness();
let passedCount = 0;

testResults.forEach((tc) => {
  const statusSymbol = tc.status === 'PASS' ? '✓ [PASS]' : '✗ [FAIL]';
  console.log(`${statusSymbol} ${tc.id}: ${tc.name} (${tc.executionTimeMs}ms)`);
  console.log(`   Assertion: ${tc.assertion}`);
  if (tc.status === 'PASS') passedCount++;
});
console.log(`\nTest Harness Result: ${passedCount}/${testResults.length} test cases passed.\n`);

console.log('--- 2. RUNNING SYNTHETIC BENCHMARK EXPERIMENT (N=100) ---');
const exp = runSyntheticExperiment(100);

console.log(`Run ID: ${exp.runId}`);
console.log(`Timestamp: ${exp.timestamp}\n`);

console.log('METRIC                         | BASELINE | TARGET         | PROTOTYPE RESULT');
console.log('-------------------------------+----------+----------------+-----------------');
console.log(`Mean Processing Time           | ${exp.baseline.avgCalendarDays.toFixed(1)} days| ≥20% reduction | ${exp.prototype.avgCalendarDays.toFixed(1)} days (${exp.delayReductionPct}% reduction)`);
console.log(`Owner/Responsibility Visibility | ${exp.baseline.responsibilityVisibilityPct}%     | ≥90%           | ${exp.prototype.responsibilityVisibilityPct}%`);
console.log(`Delay Reason Visibility        | ${exp.baseline.delayReasonCapturedPct}%     | ≥90%           | ${exp.prototype.delayReasonCapturedPct}%`);
console.log(`SLA Breach Rate (>14 days)     | ${exp.baseline.slaBreachRatePct}%     | <10%           | ${exp.prototype.slaBreachRatePct}%\n`);

console.log('--- 3. FAILURE ANALYSIS & FINDINGS ---');
exp.failureAnalysis.forEach((note, idx) => {
  console.log(`[${idx + 1}] ${note}`);
});
console.log('\n====================================================');

if (passedCount !== testResults.length) {
  process.exit(1);
}
