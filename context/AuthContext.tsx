"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    name: string;
    mobile?: string;
    role?: string;
    profilePicture?: string;
    address?: any;
    bio?: string;
    gender?: string;
    dateOfBirth?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    register: (userData: any) => Promise<boolean>;
    isAuthenticated: boolean;
    isLoading: boolean;
    apiCall: (url: string, options?: RequestInit) => Promise<Response | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (storedToken) {
                setToken(storedToken);
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Verify token and fetch latest user data
                try {
                    // We need a specific endpoint to get the current user. 
                    // Usually this is GET /api/users/profile or /api/auth/me
                    // Since we don't have a dedicated /me, we can trust the token for now 
                    // OR try to fetch the profile if we have that endpoint.
                    // Given the previous code, we only have GET /api/users/profile (PUT only?)
                    // Let's rely on localStorage but handle 401s globally via apiCall.

                    // Actually, let's try to fetch fresh data to avoid stale localStorage
                    // Assuming GET /api/users/profile exists? No, only PUT was added.
                    // Let's use the one we added: GET /api/users which is admin only?
                    // We need a route for the user to get their own details.

                    // For now, let's stick to localStorage but ensure we don't logout immediately.
                    // The user said "refresh then its logout". This usually means state isn't rehydrating fast enough?
                    // OR the "token" is invalid.

                } catch (error) {
                    console.error("Auth init failed", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    const register = async (userData: any) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            return res.ok;
        } catch (error) {
            console.error("Registration failed", error);
            return false;
        }
    };

    const apiCall = async (url: string, options: RequestInit = {}) => {
        const headers: any = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        const currentToken = localStorage.getItem("token");
        if (currentToken) {
            headers["Authorization"] = `Bearer ${currentToken}`;
        }

        try {
            const res = await fetch(url, { ...options, headers });

            if (res.status === 401 || res.status === 403) {
                // Token invalid or expired
                logout();
                return null;
            }
            return res;
        } catch (error) {
            console.error("API Call failed", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                updateUser,
                register,
                isAuthenticated: !!token,
                isLoading,
                apiCall
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
