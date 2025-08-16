import NextAuth, { type NextAuthOptions, type Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { withRateLimit } from '../../../lib/rate-limit';
import type { NextApiRequest, NextApiResponse } from 'next';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }): Promise<Session> {
      if (session && typeof session === 'object') {
        const s = session as Session & Record<string, unknown>;
        if (!('user' in s) || typeof s.user !== 'object') {
          s.user = { id: undefined } as unknown as Session['user'];
        }
        const userObj = s.user as Record<string, unknown>;
        if (token && typeof token === 'object' && 'sub' in (token as Record<string, unknown>)) {
          userObj.id = (token as Record<string, unknown>).sub as string | undefined;
        }
      }
      return session as Session;
    },
  },
};

// Rate limited NextAuth handler
async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Stricter rate limit for auth requests (3 per 15 minutes)
  const allowed = await withRateLimit(req, res, {
    limit: 3,
    windowSeconds: 900, // 15 minutes
    identifier: 'auth-attempts',
  });

  if (!allowed) {
    return; // withRateLimit already sent the response
  }

  return NextAuth(authOptions)(req, res);
}

export default handler;