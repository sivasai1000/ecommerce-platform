"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
                toast.success("Reset link generated!");

                // MOCKING EMAIL BEHAVIOR FOR DEV:
                // Show the reset link to the user immediately since we don't have an email server.
                if (data.resetUrl) {
                    // Parse the token out just for the link
                    const urlObj = new URL(data.resetUrl);
                    const token = urlObj.searchParams.get('token');
                    // We need to point to the FRONTEND reset page, not backend
                    // Backend gave us a suggestion, but let's construct the frontend link ourselves to match App Router
                    const frontendLink = `/reset-password?token=${token}`;

                    toast.message("DEV MODE: Click to Reset", {
                        description: "Since no email server is configured, here is your link.",
                        action: {
                            label: "Reset Now",
                            onClick: () => window.location.href = frontendLink
                        }
                    });
                }

            } else {
                toast.error(data.message || "Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
                {/* Left Panel: Image/Branding (Desktop Only) */}
                <div className="hidden bg-stone-900 lg:block relative overflow-hidden">
                    <div
                        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516972238977-89271fb2bab8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"
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
                                "Simplicity is the keynote of all true elegance."
                            </h2>
                            <p className="text-stone-300 text-lg">
                                — Coco Chanel
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content */}
                <div className="flex items-center justify-center py-12 px-4 md:px-12 lg:px-24 bg-white dark:bg-stone-950">
                    <div className="mx-auto grid w-full max-w-[400px] gap-6 text-center">
                        <div className="space-y-2 mb-4">
                            <h1 className="text-3xl font-serif font-medium tracking-tight text-stone-900 dark:text-stone-50">
                                Check your email
                            </h1>
                            <p className="text-stone-500 dark:text-stone-400">
                                We have sent a password reset link to <br /><strong>{email}</strong>
                            </p>
                        </div>

                        <p className="text-xs text-stone-400 mb-4 bg-stone-100 dark:bg-stone-900 p-4 rounded">
                            Usually this would be sent via email. CHECK THE TOAST NOTIFICATION FOR THE LINK (Dev Mode).
                        </p>

                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full h-12 rounded-none border-stone-200 text-stone-900 hover:bg-stone-100 uppercase tracking-widest font-bold">
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">

            {/* Left Panel: Image/Branding (Desktop Only) */}
            <div className="hidden bg-stone-900 lg:block relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516972238977-89271fb2bab8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-overlay"
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
                            "Simplicity is the keynote of all true elegance."
                        </h2>
                        <p className="text-stone-300 text-lg">
                            — Coco Chanel
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="flex items-center justify-center py-12 px-4 md:px-12 lg:px-24 bg-white dark:bg-stone-950">
                <div className="mx-auto grid w-full max-w-[400px] gap-6">
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-serif font-medium tracking-tight text-stone-900 dark:text-stone-50">
                            Forgot Password
                        </h1>
                        <p className="text-stone-500 dark:text-stone-400">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="uppercase text-xs font-bold tracking-widest text-stone-500">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 focus-visible:ring-stone-400 rounded-none"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200 rounded-none uppercase tracking-widest font-bold"
                            disabled={loading}
                        >
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
                        <Link href="/login" className="font-semibold text-stone-900 dark:text-stone-50 hover:underline underline-offset-4">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
