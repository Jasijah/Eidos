import { stdin, stdout } from 'node:process';
import { hashPassword } from '../api/_lib/admin-auth.js';

async function readPassword(): Promise<string> {
  if (!stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of stdin) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8').trim();
  }

  stdout.write('Admin password (minimum 12 characters): ');
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    const onData = (key: string) => {
      if (key === '\u0003') {
        stdin.setRawMode(false);
        reject(new Error('Cancelled.'));
        return;
      }
      if (key === '\r' || key === '\n') {
        stdin.off('data', onData);
        stdin.setRawMode(false);
        stdin.pause();
        stdout.write('\n');
        resolve(value);
        return;
      }
      if (key === '\u007f' || key === '\b') {
        if (value.length > 0) {
          value = value.slice(0, -1);
          stdout.write('\b \b');
        }
        return;
      }
      value += key;
      stdout.write('*');
    };
    stdin.on('data', onData);
  });
}

try {
  const password = await readPassword();
  stdout.write(`${hashPassword(password)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Could not hash password.');
  process.exitCode = 1;
}
