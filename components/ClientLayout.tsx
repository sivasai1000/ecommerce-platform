"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

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
                    <Footer />
                    <ChatWidget />
                    <Toaster />
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}
