"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useContactInfo } from "@/hooks/useContactInfo";
import { MessageCircle } from "lucide-react";

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, couponCode, setCouponCode, applyCoupon, removeCoupon, appliedCoupon, discount } = useCart();
    const { isAuthenticated } = useAuth();
    const { contactInfo } = useContactInfo();
    const router = useRouter();

    const handleCartEnquiry = (productName?: string, productId?: number) => {
        if (!contactInfo.phone) {
            toast.error("Contact info not available");
            return;
        }

        let message = "Hi, I need help with my cart.";
        if (productName && productId) {
            const productUrl = `${window.location.origin}/product/${encodeURIComponent(productName)}`;
            message = `Hi, I have a question about *${productName}* in my cart.\n\nLink: ${productUrl}`;
        } else if (cartItems.length > 0) {
            message = `Hi, I need help with my cart containing ${cartItems.length} items. Total: ₹${cartTotal.toFixed(2)}`;
        }

        const phoneNumber = contactInfo.phone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Coupons Logic
    const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const active = data.filter((c: any) => c.isActive);
                    setAvailableCoupons(active);
                }
            })
            .catch(err => console.error("Failed to fetch coupons", err));
    }, []);

    const eligibleCoupons = availableCoupons.filter(c => {
        return !c.minOrderValue || cartTotal >= Number(c.minOrderValue);
    });

    const taxableAmount = Math.max(0, cartTotal - discount);
    const tax = taxableAmount * 0.1;
    const total = taxableAmount + tax;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            toast.error("Please login to proceed to checkout");
            router.push("/login?redirect=/checkout");
        } else {
            router.push("/checkout");
        }
    };

    return (
        <div className="container py-10 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                                <p className="text-muted-foreground">Your cart is empty.</p>
                                <Button variant="outline" asChild>
                                    <Link href="/products">Continue Shopping</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        cartItems.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="flex items-center p-4 gap-4">
                                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-gray-100">
                                        <img
                                            src={item.image || "/placeholder-image.png"}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image'; }}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline" size="icon" className="h-6 w-6"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </Button>
                                            <span className="text-sm w-4 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline" size="icon" className="h-6 w-6"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <p className="font-bold">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleCartEnquiry(item.name, item.id)}
                                                className="text-green-600 hover:bg-green-50"
                                                title="Ask about this item"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Coupon Section */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCoupon}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                {appliedCoupon ? (
                                    <Button variant="destructive" onClick={removeCoupon}>Remove</Button>
                                ) : (
                                    <Button variant="secondary" onClick={() => applyCoupon(couponCode)}>Apply</Button>
                                )}
                            </div>

                            {/* Smart Coupon Suggestions */}
                            <div className="space-y-4 pt-2">
                                {/* Eligible Coupons - Show only if NO coupon applied */}
                                {!appliedCoupon && availableCoupons.filter(c => !c.minOrderValue || cartTotal >= Number(c.minOrderValue)).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Available Now</p>
                                        <div className="flex flex-col gap-2">
                                            {availableCoupons
                                                .filter(c => !c.minOrderValue || cartTotal >= Number(c.minOrderValue))
                                                .map(coupon => (
                                                    <div
                                                        key={coupon.id}
                                                        className="border border-green-200 bg-green-50/50 rounded-lg p-3 cursor-pointer hover:bg-green-100 transition-colors flex justify-between items-center group"
                                                        onClick={() => applyCoupon(coupon.code)}
                                                    >
                                                        <div>
                                                            <span className="font-bold text-green-700 block">{coupon.code}</span>
                                                            <span className="text-xs text-green-600">
                                                                {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                                                            </span>
                                                        </div>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 text-green-700 bg-white group-hover:bg-green-600 group-hover:text-white">
                                                            Apply
                                                        </Button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upcoming Coupons (Upsell) - ALWAYS SHOW (excluding applied one) */}
                                {availableCoupons.filter(c => Number(c.minOrderValue) > cartTotal && c.code !== appliedCoupon).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unlock More Savings</p>
                                        <div className="flex flex-col gap-2">
                                            {availableCoupons
                                                .filter(c => Number(c.minOrderValue) > cartTotal && c.code !== appliedCoupon)
                                                .sort((a, b) => Number(a.minOrderValue) - Number(b.minOrderValue)) // Sort by nearest target
                                                .slice(0, 3) // Show top 3 nearest
                                                .map(coupon => {
                                                    const needed = Number(coupon.minOrderValue) - cartTotal;
                                                    return (
                                                        <div key={coupon.id} className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50/50 opacity-75">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-mono font-bold text-gray-500">{coupon.code}</span>
                                                                <span className="text-xs font-medium bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                                                                    Locked
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mb-1">
                                                                {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                                                            </p>
                                                            <div className="text-xs font-medium text-orange-600 flex items-center gap-1">
                                                                <span>Add ${needed.toFixed(2)} more</span>
                                                                <Link href="/products" className="underline hover:text-orange-800">
                                                                    Shop
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount ({appliedCoupon})</span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax (10%)</span>
                                <span>₹{taxableAmount ? (taxableAmount * 0.1).toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                            >
                                Proceed to Checkout
                            </Button>
                            <Button
                                className="w-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                                variant="outline"
                                size="lg"
                                onClick={() => handleCartEnquiry()}
                                disabled={cartItems.length === 0}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Need Help?
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
