"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
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

        const success = await register(formData);
        if (success) {
            toast.success("Registration successful! Please login.");
            router.push("/login"); // Or auto-login
        } else {
            toast.error("Registration failed. Email might be taken.");
        }
        setLoading(false);
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">

            {/* Left Panel: Image/Branding (Desktop Only) */}
            <div className="hidden bg-stone-900 lg:block relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

                <div className="relative h-full flex flex-col justify-between p-12 text-stone-50">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl font-serif font-bold tracking-tight">
                            FUNNY.
                        </span>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-serif font-medium leading-tight">
                            "Style is a way to say who you are without having to speak."
                        </h2>
                        <p className="text-stone-300 text-lg">
                            — Rachel Zoe
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="flex items-center justify-center py-12 px-4 md:px-12 lg:px-24 bg-white dark:bg-stone-950">
                <div className="mx-auto grid w-full max-w-[400px] gap-6">
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-serif font-medium tracking-tight text-stone-900 dark:text-stone-50">
                            Create Account
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400">
                            Enter your details below to create your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="uppercase text-xs font-bold tracking-widest text-stone-500">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="h-12 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-stone-400 rounded-none"
                            />
                        </div>
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
                            <Label htmlFor="password" className="uppercase text-xs font-bold tracking-widest text-stone-500">Password</Label>
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
                            className="w-full h-12 bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200 rounded-none uppercase tracking-widest font-bold mt-4"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Sign Up"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-stone-900 dark:text-stone-50 hover:underline underline-offset-4">
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
