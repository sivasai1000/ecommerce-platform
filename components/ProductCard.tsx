"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useWishlist } from "@/context/WishlistContext";
import { Heart } from "lucide-react";

interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    mrp?: number;
    imageUrl: string;
    category: string;
    subcategory?: string;
    discount?: number;
    stock: number;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart, cartItems } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const isAddedToCart = cartItems.some(item => item.id === product.id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if wrapped
        e.stopPropagation();

        if (product.stock === 0) return;

        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.imageUrl,
            quantity: 1,
        });
        toast.success("Added to cart");
    };

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            toast.info("Removed from wishlist");
        } else {
            addToWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.imageUrl,
                category: product.category,
                stock: product.stock
            });
            toast.success("Added to wishlist");
        }
    };

    return (
        <Card className="group relative flex flex-col space-y-3 bg-transparent border-0 shadow-none rounded-none overflow-visible p-0 gap-0">
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800">
                <Link href={`/product/${product.id}`} className="block h-full w-full">
                    <img
                        src={product.imageUrl || "/placeholder-image.png"}
                        alt={product.name}
                        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${product.stock === 0 ? "opacity-50 grayscale" : ""}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    />
                    {product.stock === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </Link>

                {/* Wishlist Button */}
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white/80 hover:bg-white text-stone-700 dark:text-stone-300 transition-all hover:scale-110"
                >
                    <Heart
                        className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "currentColor"}`}
                    />
                </button>

                {/* Quick Add Button - Floating Overlay */}
                {product.stock > 0 && (
                    <div className="absolute inset-x-4 bottom-4 z-20 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <Button
                            className="w-full bg-white text-stone-900 hover:bg-stone-50 shadow-lg font-bold tracking-wide uppercase text-xs h-10 rounded-lg transform active:scale-95 transition-all"
                            onClick={isAddedToCart ? () => window.location.href = '/cart' : handleAddToCart}
                        >
                            {isAddedToCart ? "View Cart" : "Add to Cart"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="space-y-1">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest truncate">
                            {product.category}
                        </p>
                        <h3 className="text-base font-medium leading-tight text-stone-900 dark:text-stone-50 truncate group-hover:underline decoration-stone-400 underline-offset-4">
                            <Link href={`/product/${product.id}`}>
                                {product.name}
                            </Link>
                        </h3>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                        {product.discount && product.discount > 0 ? (
                            <div className="text-right">
                                <span className="block font-bold text-sm text-stone-900 dark:text-stone-50">
                                    ₹{Number(product.price).toFixed(2)}
                                </span>
                                <span className="block text-[10px] text-muted-foreground line-through">
                                    ₹{Number(product.mrp || (Number(product.price) / (1 - product.discount / 100))).toFixed(2)}
                                </span>
                            </div>
                        ) : (
                            <span className="font-bold text-sm text-stone-900 dark:text-stone-50">
                                ₹{Number(product.price).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
