"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    // Get redirect path, default to home if not present
    const redirectUrl = searchParams.get("redirect") || "/";

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                toast.success("Logged in successfully");
                router.push(redirectUrl);
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">

            {/* Left Panel: Image/Branding (Desktop Only) */}
            <div className="hidden bg-stone-900 lg:block relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

                <div className="relative h-full flex flex-col justify-between p-12 text-stone-50">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-serif font-bold tracking-tight">
                            FUNSTORE.
                        </span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-serif font-medium leading-tight">
                            "Fashion is the armor to survive the reality of everyday life."
                        </h2>
                        <p className="text-stone-300 text-lg">
                            — Bill Cunningham
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="flex items-center justify-center py-12 px-4 md:px-12 lg:px-24 bg-white dark:bg-stone-950">
                <div className="mx-auto grid w-full max-w-[400px] gap-6">
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-serif font-medium tracking-tight text-stone-900 dark:text-stone-50">
                            Welcome Back
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400">
                            Enter your email below to login to your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="uppercase text-xs font-bold tracking-widest text-stone-500">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="h-12 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-stone-400 rounded-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="uppercase text-xs font-bold tracking-widest text-stone-500">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 underline-offset-4 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="h-12 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-stone-400 rounded-none"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200 rounded-none uppercase tracking-widest font-bold"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-semibold text-stone-900 dark:text-stone-50 hover:underline underline-offset-4">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
