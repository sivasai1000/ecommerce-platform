"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Heart, Share2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    mrp: number;
    discount: number;
    imageUrl: string;
    category: string;
    stock: number;
    isFeatured: boolean;
}

interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

import { useWishlist } from "@/context/WishlistContext";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { token } = useAuth();
    const { addToCart, cartItems } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState("");

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchReviews();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProduct(data);
                setActiveImage(data.imageUrl);
            } else {
                toast.error("Product not found");
                router.push("/products");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading product");
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${id}`);
            if (res.ok) {
                setReviews(await res.json());
            }
        } catch (error) {
            console.error("Error loading reviews", error);
        }
    };

    const isAddedToCart = product && cartItems.some(item => item.id === product.id);

    const handleAddToCart = () => {
        if (product) {
            if (isAddedToCart) {
                router.push('/cart');
                return;
            }
            addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image: product.imageUrl,
                quantity: 1
            });
            toast.success("Added to cart");
        }
    };

    const toggleWishlist = () => {
        if (!product) return;
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!product) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
                        {product.imageUrl ? (
                            <img src={activeImage} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        {product.discount > 0 && <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">-{product.discount}%</span>}
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="bg-gray-100 px-3 py-1 rounded-full">{product.category}</span>
                            {product.stock > 0 ? <span className="text-green-600 font-medium">In Stock</span> : <span className="text-red-500 font-medium">Out of Stock</span>}
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                            {product.mrp > product.price && <span className="text-xl text-gray-400 line-through mb-1">₹{product.mrp}</span>}
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
                    <div className="flex gap-4 pt-4 border-t">
                        <Button
                            size="lg"
                            className={`flex-1 text-base h-12 ${isAddedToCart ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {product.stock > 0 ? (isAddedToCart ? "View Cart" : "Add to Cart") : "Out of Stock"}
                        </Button>
                        <Button size="lg" variant="outline" className="px-4" onClick={toggleWishlist}>
                            <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="max-w-4xl mx-auto border-t pt-12">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" />
                    Customer Reviews
                </h2>
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl">
                                <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="bg-white p-6 rounded-xl border shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold">{review.userName}</h4>
                                            <div className="flex text-yellow-400 text-sm mt-1">
                                                {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />)}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
