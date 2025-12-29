"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
}

interface HeroSectionProps {
    banners: Banner[];
}

export default function HeroSection({ banners }: HeroSectionProps) {
    const [currentBanner, setCurrentBanner] = useState(0);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    return (
        <section className="relative h-[80vh] flex items-center bg-stone-100 dark:bg-stone-900 overflow-hidden">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-40 dark:opacity-30"
                        style={{ backgroundImage: `url(${banner.imageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-100/60 to-transparent dark:from-stone-900 dark:via-stone-900/60" />
                </div>
            ))}

            <div className="container relative z-10 px-6 md:px-12">
                {banners.length > 0 && (
                    <motion.div
                        key={currentBanner}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-xl space-y-6"
                    >
                        <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-stone-500 uppercase border border-stone-300 rounded-full dark:border-stone-700 dark:text-stone-400">
                            New Collection
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 dark:text-stone-50 leading-tight">
                            {banners[currentBanner].title}
                        </h1>
                        <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                            {banners[currentBanner].subtitle}
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link href={banners[currentBanner].linkUrl || "/products"}>
                                <Button size="lg" className="h-12 px-8 text-sm uppercase tracking-widest bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200 rounded-none transition-all">
                                    Shop Now
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
                {banners.length === 0 && (
                    <div className="text-center">
                        <h1 className="text-4xl">Welcome to FUNNY.</h1>
                    </div>
                )}
            </div>

            {/* Slider Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentBanner(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentBanner ? 'w-8 bg-stone-900 dark:bg-stone-100' : 'w-4 bg-stone-400/50'}`}
                    />
                ))}
            </div>
        </section>
    );
}
