import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && "email" in profile && typeof profile.email === "string") {
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.email && typeof token.email === "string") {
        session.user.email = token.email;
      }
      return session;
    },
  },
};
