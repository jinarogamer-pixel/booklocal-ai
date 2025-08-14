import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
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
    async session({ session, token }: any) {
      // Attach minimal token info safely
      if (session && typeof session === 'object') {
        (session as any).user = (session as any).user || {};
        (session as any).user.id = token?.sub ?? (session as any).user.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions as any);