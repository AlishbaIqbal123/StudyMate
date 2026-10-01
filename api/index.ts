import type { Request, Response } from 'express';
import app from '../apps/mcp-server/src/index.js';

export default function handler(req: Request, res: Response) {
  // Ensure the original matched path is preserved when Vercel rewrites /health, /mcp, /auth to /api
  const matchedPath = req.headers['x-matched-path'] as string | undefined;
  if (matchedPath && (req.url === '/api' || req.url === '/api/')) {
    req.url = matchedPath;
  }
  return app(req, res);
}
