"use client";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart, cartItems } = useCart();

    const moveToCart = (item: any) => {
        addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: 1,
        });
        toast.success("Added to cart");
    };

    return (
        <div className="container py-10 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
            {wishlistItems.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
                    <Link href="/products">
                        <Button>Browse Products</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {wishlistItems.map((item) => {
                        const imageSrc = item.image && item.image.trim().length > 0 ? item.image : "/placeholder-image.png";
                        const isAddedToCart = cartItems.some(cartItem => cartItem.id === item.id);

                        return (
                            <Card key={item.id} className="overflow-hidden">
                                <div className="aspect-square relative overflow-hidden bg-gray-100">
                                    <Link href={`/product/${encodeURIComponent(item.name)}`} className="block h-full w-full">
                                        <img
                                            src={imageSrc}
                                            alt={item.name}
                                            className={`h-full w-full object-cover ${item.stock === 0 ? "opacity-50 grayscale" : ""}`}
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder-image.png";
                                            }}
                                        />
                                    </Link>
                                    {item.stock === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold line-clamp-1">
                                        <Link href={`/product/${encodeURIComponent(item.name)}`} className="hover:underline">
                                            {item.name}
                                        </Link>
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                                    <p className="font-bold text-lg mb-4">₹{item.price}</p>

                                    <div className="flex gap-2">
                                        {item.stock > 0 ? (
                                            isAddedToCart ? (
                                                <Link href="/cart" className="flex-1">
                                                    <Button className="w-full" variant="secondary">
                                                        View Cart
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button className="flex-1" onClick={() => moveToCart(item)}>
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    Add to Cart
                                                </Button>
                                            )
                                        ) : (
                                            <Button className="flex-1" disabled>
                                                Out of Stock
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeFromWishlist(item.id)}
                                            className="text-destructive hover:bg-destructive/10 border-destructive/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
