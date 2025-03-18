import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/app/lib/db';
import User from '@/models/User';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    access_type: "offline",
                    prompt: "select_account",
                    scope: "openid email profile"
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            try {
                await connectDB();
                
                // Check if user exists
                let dbUser = await User.findOne({ email: user.email });
                
                if (!dbUser) {
                    // Create new user
                    dbUser = await User.create({
                        email: user.email,
                        displayName: user.name,
                        photoURL: user.image,
                        isAdmin: false, // Default to non-admin
                        createdAt: new Date(),
                        lastLogin: new Date()
                    });
                } else {
                    // Update last login
                    await User.findOneAndUpdate(
                        { email: user.email },
                        { lastLogin: new Date() }
                    );
                }

                user.id = dbUser._id.toString();
                user.isAdmin = dbUser.isAdmin; // Add isAdmin to the user object
                return true;
            } catch (error) {
                console.error("Sign in error:", error);
                return false;
            }
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id;
                session.user.isAdmin = token.isAdmin; // Add isAdmin to the session
                session.accessToken = token.accessToken;
                session.user.image = token.picture || session.user.image;
            }
            return session;
        },
        async jwt({ token, user, account, profile }) {
            if (user) {
                token.id = user.id;
                token.isAdmin = user.isAdmin; // Add isAdmin to the token
            }
            if (profile) {
                token.picture = profile.picture;
            }
            return token;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
