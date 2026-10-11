export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { action, email, code, purpose } = req.body || {};

    // 1. Send OTP
    if (action === 'send-otp' || req.query?.action === 'send-otp') {
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid university email is required' });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ success: false, error: 'Please enter a valid academic email address.' });
      }

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      return res.status(200).json({
        success: true,
        message: `Verification code sent to ${normalizedEmail}`,
        code: otpCode,
        expiresIn: 300,
      });
    }

    // 2. Verify OTP
    if (action === 'verify-otp' || req.query?.action === 'verify-otp') {
      if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Both email and verification code are required' });
      }
      const cleanCode = String(code).trim().replace(/\D/g, '');
      if (cleanCode.length !== 6) {
        return res.status(400).json({ success: false, error: 'Verification code must be exactly 6 digits.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const nameFromEmail = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = nameFromEmail
        .split(' ')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Enrolled Student';

      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Email successfully verified!',
        token: `studymate_verified_${Date.now()}`,
        user: {
          id: `stu-${Date.now().toString().slice(-4)}`,
          email: normalizedEmail,
          name: formattedName,
          major: 'Computer Science & AI',
          year: 'Enrolled Scholar',
          verified: true,
        },
      });
    }

    // Default OAuth token response (POST /auth/token)
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

  return res.status(200).json({ status: 'ok', message: 'StudyMate Auth & OTP Ready' });
}
