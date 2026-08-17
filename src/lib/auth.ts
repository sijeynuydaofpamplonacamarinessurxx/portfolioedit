import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim();
        const password = credentials?.password as string;

        const expectedEmail = (process.env.ADMIN_EMAIL || "admin@sijey.dev").trim();
        const expectedPassword = process.env.ADMIN_PASSWORD || "sijey2024!";

        if (
          email?.toLowerCase() === expectedEmail.toLowerCase() &&
          password === expectedPassword
        ) {
          return {
            id: "1",
            name: "Admin",
            email: expectedEmail,
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});
