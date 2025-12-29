"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Heart, MessageSquare, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useWishlist } from "@/context/WishlistContext";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    mrp: number;
    discount: number;
    imageUrl: string;
    images?: string[]; // Optional array of images
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

interface ProductClientProps {
    product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
    const router = useRouter();
    const { token } = useAuth();
    const { addToCart, cartItems } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { contactInfo } = useContactInfo();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeImage, setActiveImage] = useState(product.imageUrl);
    const [allImages, setAllImages] = useState<string[]>([]);

    useEffect(() => {
        // Initialize images
        let imagesList: string[] = [];
        if (product.images && product.images.length > 0) {
            imagesList = product.images;
        } else if (product.imageUrl) {
            // Try parsing JSON if stored as string
            try {
                if (product.imageUrl.startsWith('[') || product.imageUrl.startsWith('{')) {
                    const parsed = JSON.parse(product.imageUrl);
                    if (Array.isArray(parsed)) imagesList = parsed;
                    else imagesList = [product.imageUrl];
                } else {
                    imagesList = [product.imageUrl];
                }
            } catch {
                imagesList = [product.imageUrl];
            }
        }
        setAllImages(imagesList);
        setActiveImage(imagesList[0] || product.imageUrl);
    }, [product]);

    useEffect(() => {
        fetchReviews();
        // Reset active image if product changes (though usually page reload will handle this)
        setActiveImage(product.imageUrl);
    }, [product.id]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/product/${product.id}`);
            if (res.ok) {
                setReviews(await res.json());
            }
        } catch (error) {
            console.error("Error loading reviews", error);
        }
    };

    const handleWhatsApp = () => {
        if (!contactInfo.phone) {
            toast.error("Contact info not available");
            return;
        }
        const message = `Hi, I am interested in *${product.name}*.\n\nPrice: ₹${product.price}\n\nLink: ${window.location.href}`;
        const phoneNumber = contactInfo.phone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const isAddedToCart = cartItems.some(item => item.id === product.id);

    const handleAddToCart = () => {
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
    };

    const toggleWishlist = () => {
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
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-[1.3fr_1fr] gap-12 mb-16">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="order-2 md:order-1 grid grid-cols-4 md:flex md:flex-col gap-4 md:w-24 shrink-0">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? "border-black ring-1 ring-black/50" : "border-transparent hover:border-gray-300"}`}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Image */}
                    <div className="order-1 md:order-2 flex-1 aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative group">
                        {activeImage ? (
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-zoom-in"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                        {product.discount > 0 && <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">-{product.discount}%</span>}
                    </div>
                </div>

                <div className="space-y-8 sticky top-24 h-fit">
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

                    <Button
                        onClick={handleWhatsApp}
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 h-12 text-base"
                    >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Enquire on WhatsApp
                    </Button>
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
