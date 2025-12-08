"use client";

import Navbar from "@/components/Navbar";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "sonner";
import Link from "next/link";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <footer className="border-t border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 py-16">
                        <div className="w-full max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between gap-12">
                            <div className="space-y-4 md:max-w-sm">
                                <h4 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-50">SIVA SAI.</h4>
                                <p className="text-sm leading-relaxed">
                                    Curated fashion and lifestyle essentials for the modern aesthetic. Quality, design, and sustainability at our core.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
                                <div>
                                    <h4 className="font-bold text-stone-900 dark:text-stone-50 uppercase tracking-wider text-sm mb-6">Shop</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><Link href="/products" className="hover:text-stone-900 dark:hover:text-stone-50">New Arrivals</Link></li>
                                        <li><Link href="/products?category=Men" className="hover:text-stone-900 dark:hover:text-stone-50">Men</Link></li>
                                        <li><Link href="/products?category=Women" className="hover:text-stone-900 dark:hover:text-stone-50">Women</Link></li>
                                        <li><Link href="/deals" className="hover:text-stone-900 dark:hover:text-stone-50">Sale</Link></li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-stone-900 dark:text-stone-50 uppercase tracking-wider text-sm mb-6">Support</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><Link href="/contact" className="hover:text-stone-900 dark:hover:text-stone-50">Contact Us</Link></li>
                                        <li><Link href="/shipping" className="hover:text-stone-900 dark:hover:text-stone-50">Shipping & Returns</Link></li>
                                        <li><Link href="/faq" className="hover:text-stone-900 dark:hover:text-stone-50">FAQ</Link></li>
                                        <li><Link href="/privacy" className="hover:text-stone-900 dark:hover:text-stone-50">Privacy Policy</Link></li>
                                        <li><Link href="/terms" className="hover:text-stone-900 dark:hover:text-stone-50">Terms and Conditions</Link></li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-bold text-stone-900 dark:text-stone-50 uppercase tracking-wider text-sm mb-6">Connect</h4>
                                    <ul className="space-y-3 text-sm">
                                        <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-stone-50">Instagram</a></li>
                                        <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-stone-50">Twitter</a></li>
                                        <li><a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-stone-900 dark:hover:text-stone-50">Pinterest</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="w-full max-w-[1400px] mx-auto px-6 mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 text-center text-xs uppercase tracking-widest">
                            &copy; 2025 Siva Sai E-Commerce. All rights reserved.
                        </div>
                    </footer>
                    <Toaster />
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}
