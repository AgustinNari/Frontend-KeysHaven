import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const directory = await mkdtemp(join(tmpdir(), 'keyshaven-tests-'));
try {
  const output = join(directory, 'regression.test.mjs');
  await build({ entryPoints: ['tests/regression.test.js'], outfile: output, bundle: true,
    platform: 'node', format: 'esm', define: { 'import.meta.env.VITE_API_BASE_URL': '"http://localhost:4002"' } });
  const result = spawnSync(process.execPath, ['--test', output], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally { await rm(directory, { recursive: true, force: true }); }
