import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/app/libs/prismadb";
import credentials from "next-auth/providers/credentials";
import google from "next-auth/providers/google";
import github from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

export const {handlers, signIn, signOut, auth} = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers:[
        github,
        google,
        credentials({
            credentials:{
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                const email = credentials.email as string;
                const password = credentials.password as string;
                if (!email || !password) {
                    throw new Error("Please provide both email and password");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: email
                    }
                })

                if (!user || !user?.hashedPassword)
                {
                    throw new Error("No User Exists");
                }

                const isCorrectPassword = await bcrypt.compare(
                    password,
                    user.hashedPassword
                )

                if (!isCorrectPassword) {
                    throw new Error("Invalid Credentials");
                }
                return user;
            }
        })
    ],
    callbacks: {
        authorized: async ({ auth }) => {
            // Logged in users are authenticated, otherwise redirect to login page
            return !!auth
          },
    },
    pages: {
        signIn: '/',
    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: "jwt"
    },
    secret: process.env.AUTH_SECRET,
});