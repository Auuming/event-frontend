import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogIn from "@/libs/userLogIn";
import getUserProfile from "@/libs/getUserProfile";

export const authOptions:AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
            // Add logic here to look up the user from the credentials supplied
            // const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
            if (!credentials) return null
            
            try {
                const loginResponse = await userLogIn(credentials.email, credentials.password)
                
                // Handle different response structures: could be direct user object or wrapped in data
                let userData = loginResponse;
                if (loginResponse && loginResponse.data) {
                    userData = loginResponse.data;
                }
                
                // If role is missing, fetch user profile to get it
                if (userData && userData.token && !userData.role) {
                    try {
                        const profileResponse = await getUserProfile(userData.token);
                        const profileData = profileResponse.data || profileResponse;
                        if (profileData && profileData.role) {
                            userData.role = profileData.role;
                        }
                    } catch (err) {
                        console.error('Failed to fetch user profile:', err);
                    }
                }
                
                if (userData) {
                    // Ensure we have all required fields
                    const userToReturn: any = {
                        id: userData._id || userData.id,
                        _id: userData._id || userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role || 'member', // Default to member if role not found
                        token: userData.token
                    };
                    return userToReturn;
                } else {
                    return null;
                }
            } catch (error) {
                console.error('Login error:', error);
                return null;
            }
            }
        })
    ],
    session: {strategy:"jwt"},
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // First time JWT callback is called, user object is available
                const userAny = user as any;
                token._id = userAny._id || userAny.id;
                token.name = userAny.name;
                token.email = userAny.email;
                token.role = userAny.role;
                token.token = userAny.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    _id: token._id as string,
                    name: token.name as string,
                    email: token.email as string,
                    role: token.role as string,
                    token: token.token as string
                };
            }
            return session;
        }
    }
}