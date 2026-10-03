export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle token request (POST /auth/token)
  if (req.method === 'POST') {
    return res.status(200).json({
      access_token: 'studymate_demo_access_token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'studymate_demo_refresh_token',
    });
  }

  // Handle authorization code redirect (GET /auth?redirect_uri=...&state=...)
  const redirectUri = req.query?.redirect_uri;
  const state = req.query?.state;
  if (redirectUri) {
    const target = `${redirectUri}?code=studymate_demo_code&state=${encodeURIComponent(state || '')}`;
    return res.redirect(302, target);
  }

  return res.status(200).json({ status: 'ok', message: 'StudyMate OAuth Mock Ready' });
}
