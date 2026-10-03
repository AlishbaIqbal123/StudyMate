import { simulateConversationalVoice } from '../apps/mcp-server/src/voice/simulator.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { utterance } = req.body || {};
    if (!utterance) {
      return res.status(400).json({ success: false, error: 'utterance is required' });
    }
    const result = await simulateConversationalVoice(utterance);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
