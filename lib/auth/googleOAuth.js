import { google } from 'googleapis';

const SCOPES = [
  'openid',
  'email',
  'profile',
];

export function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID || '';
}

export function getGoogleClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || '';
}

export function getGoogleRedirectUri() {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/api/auth/google/callback`;
}

export function createGoogleOAuthClient() {
  const clientId = getGoogleClientId();
  const clientSecret = getGoogleClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');
  }
  return new google.auth.OAuth2(clientId, clientSecret, getGoogleRedirectUri());
}

export function getGoogleAuthUrl(state = 'login') {
  const client = createGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: SCOPES,
    state,
  });
}

export async function exchangeGoogleCode(code) {
  const client = createGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();
  return {
    googleId: data.id,
    email: (data.email || '').toLowerCase().trim(),
    firstName: data.given_name || '',
    lastName: data.family_name || '',
    avatarUrl: data.picture || '',
    emailVerified: Boolean(data.verified_email),
  };
}
