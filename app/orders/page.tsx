"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useContactInfo } from "@/hooks/useContactInfo";

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    isReviewed?: boolean;
    Product: {
        name: string;
        imageUrl: string;
    };
}

// ... Order interface ...
interface Order {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    OrderItems: OrderItem[];
}

export default function OrdersPage() {
    // ... state ...
    const { token, isAuthenticated } = useAuth();
    const { contactInfo } = useContactInfo();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [reviewingItemId, setReviewingItemId] = useState<number | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleOrderHelp = (orderId: number, productName: string) => {
        if (!contactInfo.phone) {
            toast.error("Contact info not available");
            return;
        }
        const productUrl = `${window.location.origin}/product/${encodeURIComponent(productName.replace(/\s+/g, '-'))}`;
        const message = `Hi, I have a query regarding Order #${orderId}, Product: *${productName}*.\n\nLink: ${productUrl}`;
        const phoneNumber = contactInfo.phone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // ... useEffect ...
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    // ... fetchOrders ...
    const fetchOrders = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                toast.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading orders");
        } finally {
            setLoading(false);
        }
    };

    const handleStartReview = (itemId: number) => {
        setReviewingItemId(itemId);
        setRating(5);
        setComment("");
    };

    const handleCancelReview = () => {
        setReviewingItemId(null);
        setRating(5);
        setComment("");
    };

    const submitReview = async (productId: number, orderId: number) => {
        setSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId, rating, comment, orderId })
            });

            if (res.ok) {
                toast.success("Thanks for your review!");
                setReviewingItemId(null);
                fetchOrders(); // Refresh to update status
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to submit review");
            }
        } catch (error) {
            toast.error("Error submitting review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Please login to view your orders</h1>
                <Link href="/login">
                    <Button>Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                    <Link href="/products">
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="bg-muted/40 flex flex-row items-center justify-between pb-4">
                                <div>
                                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold">₹{Number(order.totalAmount).toFixed(2)}</span>
                                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                        {order.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {order.OrderItems?.map((item) => (
                                        <div key={item.id} className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                    {item.Product?.imageUrl && (
                                                        <img
                                                            src={item.Product.imageUrl}
                                                            alt={item.Product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.Product?.name || 'Product'}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="font-medium text-right">
                                                    <div className="mb-2">
                                                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                                    </div>
                                                    {order.status === 'completed' && (
                                                        <div className="flex flex-col gap-2 mt-2 items-end">
                                                            {item.isReviewed ? (
                                                                <Button variant="secondary" size="sm" disabled>
                                                                    Review Submitted
                                                                </Button>
                                                            ) : reviewingItemId !== item.id && (
                                                                <Button variant="outline" size="sm" onClick={() => handleStartReview(item.id)}>
                                                                    Write a Review
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleOrderHelp(order.id, item.Product?.name || 'Product')}
                                                            >
                                                                <MessageCircle className="h-4 w-4 mr-1" />
                                                                Help
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Inline Review Form */}
                                            {reviewingItemId === item.id && (
                                                <div className="mt-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border animate-in fade-in slide-in-from-top-2">
                                                    <h4 className="font-bold text-sm mb-3">Rate & Review {item.Product?.name}</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex gap-1 mb-2">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <button
                                                                        key={star}
                                                                        type="button"
                                                                        onClick={() => setRating(star)}
                                                                        className={`text-xl transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                                                                    >
                                                                        ★
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            className="w-full p-2 text-sm border rounded bg-white dark:bg-black"
                                                            placeholder="Write your review here..."
                                                            rows={3}
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <Button variant="ghost" size="sm" onClick={handleCancelReview}>Cancel</Button>
                                                            <Button size="sm" onClick={() => submitReview(item.productId, order.id)} disabled={submitting}>
                                                                {submitting ? "Submitting..." : "Submit Review"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
