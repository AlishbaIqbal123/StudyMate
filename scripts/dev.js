#!/usr/bin/env node
import { spawn } from 'node:child_process';

console.log('🚀 Starting StudyMate (MCP Server on port 3000 + Web Dashboard on port 5173)...');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const server = spawn(npmCmd, ['run', 'dev', '--workspace=apps/mcp-server'], {
  stdio: 'inherit',
  shell: true,
});

const web = spawn(npmCmd, ['run', 'dev', '--workspace=apps/web'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  try { server.kill(); } catch {}
  try { web.kill(); } catch {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
