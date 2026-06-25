import { spawn } from 'node:child_process';

const url = 'http://127.0.0.1:5173';
let ready = false;
for (let attempt = 0; attempt < 120; attempt += 1) {
  try {
    const response = await fetch(url);
    if (response.ok) { ready = true; break; }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 250));
}
if (!ready) throw new Error(`Eidos dev server did not become available at ${url}`);
const executable = process.platform === 'win32' ? 'node_modules/.bin/electron.cmd' : 'node_modules/.bin/electron';
const child = spawn(executable, ['dist-electron/main.js'], { stdio: 'inherit', env: { ...process.env, EIDOS_DEV_SERVER_URL: `${url}/` }, shell: process.platform === 'win32' });
child.on('exit', (code) => process.exit(code ?? 0));
