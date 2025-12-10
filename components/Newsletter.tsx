"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Newsletter() {
    const [email, setEmail] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "Subscribed!");
                setEmail("");
            } else {
                toast.error(data.message || "Subscription failed");
            }
        } catch (err) {
            toast.error("Something went wrong.");
        }
    };

    return (
        <section className="py-24 bg-stone-900 dark:bg-white text-stone-100 dark:text-stone-900">
            <div className="container px-6 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-serif font-medium mb-6">Join Our Newsletter</h2>
                <p className="text-stone-400 dark:text-stone-600 mb-8 leading-relaxed">
                    Sign up for our newsletter to receive exclusive offers, latest news, and a 10% discount on your first order.
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md mx-auto gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full sm:flex-1 h-12 px-4 bg-stone-800 dark:bg-stone-100 border border-stone-700 dark:border-stone-200 rounded-none focus:outline-none focus:border-stone-500 transition-colors"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" size="lg" className="h-12 w-full sm:w-auto px-8 bg-stone-100 text-stone-900 hover:bg-white dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800 rounded-none uppercase tracking-widest font-bold">
                        Subscribe
                    </Button>
                </form>
            </div>
        </section>
    );
}
