"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface WishlistItem {
    id: number;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: number) => void;
    isInWishlist: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { token, isAuthenticated } = useAuth();
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [isAuthenticated, token]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Map backend response if needed, assuming backend returns items with Product include
                // If backend returns { id, Product: {...} }, we need to map it to WishlistItem format
                // Checking backend controller... it returns `wishlist` array.
                // Each item has `Product`.
                const mappedItems = data.map((item: any) => {
                    let finalImage = item.Product.imageUrl;
                    try {
                        if (finalImage && (finalImage.startsWith('[') || finalImage.startsWith('{'))) {
                            const parsed = JSON.parse(finalImage);
                            if (Array.isArray(parsed) && parsed.length > 0) finalImage = parsed[0];
                        }
                    } catch (e) {
                        // Keep original if parsing fails
                    }

                    return {
                        id: item.Product.id,
                        name: item.Product.name,
                        price: Number(item.Product.price),
                        image: finalImage || "/placeholder-image.png",
                        category: item.Product.category,
                        stock: item.Product.stock,
                        wishlistId: item.id
                    };
                });
                setWishlistItems(mappedItems);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        }
    };

    const addToWishlist = async (item: WishlistItem) => {
        if (!isAuthenticated || !token) {
            toast.error("Please login to add to wishlist");
            return;
        }

        // Optimistic update
        const tempId = item.id;
        if (wishlistItems.find((i) => i.id === item.id)) {
            toast.info("Item already in wishlist");
            return;
        }
        setWishlistItems((prev) => [...prev, item]);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId: item.id })
            });
            if (!res.ok) {
                // Revert on failure
                setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to add to wishlist");
            } else {
                toast.success("Added to wishlist");
                // Refresh to get correct IDs if needed, or just leave it
                fetchWishlist();
            }
        } catch (error) {
            console.error(error);
            setWishlistItems((prev) => prev.filter((i) => i.id !== item.id));
            toast.error("Failed to add to wishlist");
        }
    };

    const removeFromWishlist = async (id: number) => {
        if (!isAuthenticated || !token) return;

        // Optimistic update
        setWishlistItems((prev) => prev.filter((item) => item.id !== id));
        toast.info("Removed from wishlist");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wishlist/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                fetchWishlist(); // Revert/Refresh
                toast.error("Failed to remove from wishlist");
            }
        } catch (error) {
            console.error(error);
            fetchWishlist();
            toast.error("Error removing from wishlist");
        }
    };

    const isInWishlist = (id: number) => {
        return wishlistItems.some((item) => item.id === id);
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
