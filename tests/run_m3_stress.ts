import { register } from 'node:module';
register('./loader.mjs', import.meta.url);

async function run() {
  console.log('Running Challenger M3-2 Empirical Stress Tests...');
  await import('./m3_challenger_empirical.test');
}

run();
