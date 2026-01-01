import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const ports = [
  process.env.API_PORT,
  process.env.WEB_PORT,
  process.env.ACHIEVEMENTS_PORT,
  process.env.SSO_PORT
].filter(Boolean);

console.log(`Checking ports: ${ports.join(', ')}`);

try {
  execSync('lsof -v');
} catch {
  console.warn('lsof not found, skipping port killing.');
  process.exit(0);
}

for (const port of ports) {
  try {
    // Find PID using lsof and kill it (only listening processes)
    const pid = execSync(`lsof -t -i:${port} -sTCP:LISTEN`).toString().trim();
    if (pid) {
      console.log(`Killing process ${pid} on port ${port}...`);
      // Split by newline in case there are multiple PIDs
      const pids = pid.split('\n');
      for (const p of pids) {
        if (p) {
          execSync(`kill -9 ${p}`);
        }
      }
    }
  } catch {
    // lsof returns exit code 1 if no process is found, which is fine
  }
}
