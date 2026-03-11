// Default Supabase JWT verification.
// Validates tokens issued by Supabase default auth using JWKS.
import * as jose from '@panva/jose';

const SUPABASE_JWT_ISSUER =
  Deno.env.get('SB_JWT_ISSUER') ?? Deno.env.get('SUPABASE_URL') + '/auth/v1';

const SUPABASE_JWT_KEYS = jose.createRemoteJWKSet(
  new URL(Deno.env.get('SUPABASE_URL')! + '/auth/v1/.well-known/jwks.json')
);

export function getAuthToken(req: Request): string {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }
  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer') {
    throw new Error("Auth header is not 'Bearer {token}'");
  }
  return token;
}

export function verifySupabaseJWT(jwt: string) {
  return jose.jwtVerify(jwt, SUPABASE_JWT_KEYS, {
    issuer: SUPABASE_JWT_ISSUER,
  });
}
