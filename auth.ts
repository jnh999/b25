import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { createSparkWallet } from "./lib/services";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "name" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "username" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user && !credentials.name) {
          throw new Error("Invalid credentials");
        }

        if (!user) {
          const { wallet, mnemonic } = await createSparkWallet();
          const sparkAddress = await wallet.getSparkAddress();
          return await prisma.user.create({
            data: {
              name: credentials.name,
              email: credentials.email,
              username: credentials.username,
              password: await bcrypt.hash(credentials.password, 10),
              sparkWallet: {
                create: {
                  mnemonic: mnemonic ?? "",
                  address: sparkAddress,
                  validated: true,
                },
              },
            },
          });
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, id: token.id ?? user?.id };
    },
    async session({ session, token }) {
      return { ...session, user: { ...session.user, id: token.id } };
    },
    // async redirect({ url, baseUrl }) {
    //   // After login, redirect to setup page if user hasn't set their region
    //   if (url.startsWith(baseUrl)) {
    //     const session = await getServerSession(authOptions);
    //     if (session?.user?.id) {
    //       const user = await prisma.user.findUnique({
    //         where: { id: session.user.id },
    //       });
    //       if (!user?.region) {
    //         return `${baseUrl}/setup`;
    //       }
    //     }
    //   }
    //   return url;
    // },
  },
} satisfies NextAuthOptions;
