"use client";

import { useEffect, useState } from "react";

interface AboutData {
    title: string;
    description: string;
    imageUrl: string;
}

export default function AboutPage() {
    const [data, setData] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`);
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch about data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAbout();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-950">
            <main className="flex-1">
                {/* Hero / Header Section */}
                <section className="relative py-20 bg-muted/30 dark:bg-zinc-900/50">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            {data?.title || "Our Story"}
                        </h1>
                        <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-16 container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                        {/* Image */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-square md:aspect-[4/3] bg-gray-100">
                            {data?.imageUrl ? (
                                <img
                                    src={data.imageUrl}
                                    alt={data.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-gray-200">
                                    No image available
                                </div>
                            )}
                        </div>

                        {/* Text Content */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-semibold mb-6">About Us</h2>
                            <div className="prose dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                                {data?.description || "Welcome to our store. We are dedicated to providing the best quality products for our customers."}
                            </div>

                            {/* Optional Store Stats or Values */}
                            <div className="grid grid-cols-2 gap-6 pt-6">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-primary mb-1">100%</div>
                                    <div className="text-sm text-muted-foreground">Original Products</div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                                    <div className="text-sm text-muted-foreground">Customer Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
