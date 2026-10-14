import { register } from 'node:module';
// Register custom module loader for node environment mocks before any other imports
register('./loader.mjs', import.meta.url);

async function run() {
  await import('./m2_empirical_stress.test');
}

run();
