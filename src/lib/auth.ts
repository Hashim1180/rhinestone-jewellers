/**
 * Admin auth — NextAuth v4 credentials provider.
 * Server-only. No third-party OAuth needed.
 */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null
        const user = await db.user.findUnique({ where: { email: creds.email } })
        if (!user) return null
        const ok = await bcrypt.compare(creds.password, user.password)
        if (!ok) return null
        return { id: user.id, email: user.email, name: user.name ?? 'Admin', role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user role onto the token when signing in
      if (user) {
        (token as any).role = (user as any).role
      }
      return token
    },
    async session(params: any) {
      const { session, token } = params
      if (session?.user) {
        const userWithRole = session.user as any
        userWithRole.role = (token as any).role
        userWithRole.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  // Use NEXTAUTH_URL if set; otherwise auto-detect from request.
  // For Vercel deployment, set NEXTAUTH_URL to the production URL.
  ...(process.env.NEXTAUTH_URL ? { url: process.env.NEXTAUTH_URL } : {}),
}
