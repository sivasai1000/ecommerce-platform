"use client";



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
                    {children}
                    <Toaster />
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}
