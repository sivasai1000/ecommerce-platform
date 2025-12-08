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
            <div className="flex items-center justify-center min-h-[60vh] px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Check your email</CardTitle>
                        <CardDescription>
                            We have sent a password reset link to <strong>{email}</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Usually this would be sent via email. CHECK THE TOAST NOTIFICATION FOR THE LINK (Dev Mode).
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/login" className="w-full">
                            <Button variant="outline" className="w-full">Back to Login</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </Button>
                        <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                            Back to Login
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
