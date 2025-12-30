"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart, couponCode, setCouponCode, applyCoupon, removeCoupon, appliedCoupon, discount } = useCart();
    const { user, isAuthenticated, token, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?redirect=/checkout");
        }
    }, [isAuthenticated, isLoading, router]);

    // Debug logging for Razorpay Key
    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        console.log("Razorpay Key Status:", key ? "Present" : "Missing", key);
        if (!key) {
            console.error("NEXT_PUBLIC_RAZORPAY_KEY_ID is missing in client environment!");
            toast.error("Payment System Error: Key missing");
        }
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Calculate final total (Shared logic with Cart, but ensure consistent tax calculation)
    const taxableAmount = Math.max(0, cartTotal - discount);
    const finalTotal = taxableAmount * 1.1; // 10% Tax

    const onApplyCoupon = async () => {
        await applyCoupon(couponCode);
    };

    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
    const [submitting, setSubmitting] = useState(false);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const form = e.target as HTMLFormElement;
        const address = (form.elements.namedItem('address') as HTMLInputElement).value;
        const city = (form.elements.namedItem('city') as HTMLInputElement).value;
        const zip = (form.elements.namedItem('zip') as HTMLInputElement).value;
        const fullAddress = `${address}, ${city}, ${zip}`;

        if (paymentMethod === 'ONLINE') {
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setSubmitting(false);
                return;
            }
        }

        try {
            // 1. Create Order on Server
            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cartItems.map(item => ({ ...item, productId: item.id })),
                    totalAmount: finalTotal,
                    address: fullAddress,
                    paymentMethod: paymentMethod // Pass payment method
                })
            });

            if (!orderRes.ok) {
                const errorData = await orderRes.json();
                throw new Error(errorData.message || "Failed to create order");
            }
            const orderData = await orderRes.json();

            if (paymentMethod === 'COD') {
                // Determine order success immediately for COD
                toast.success("Order Placed Successfully!");
                clearCart();
                router.push("/orders");
                return;
            }

            // 2. Open Razorpay Checkout (Only for ONLINE)
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "E-Commerce Store",
                description: appliedCoupon ? `Order with Coupon ${appliedCoupon}` : "Transaction",
                image: "https://example.com/logo.png",
                order_id: orderData.id, // Razorpay Order ID
                handler: async function (response: any) {
                    // 3. Verify Payment on Server
                    const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/verify`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            cartItems: cartItems,
                            totalAmount: finalTotal,
                            address: fullAddress
                        }),
                    });

                    let verifyData;
                    try {
                        verifyData = await verifyRes.json();
                    } catch (e) {
                        verifyData = { message: "Invalid JSON response" };
                    }

                    if (verifyRes.ok) {
                        toast.success("Payment Successful! Order placed.");
                        clearCart();
                        router.push("/orders");
                    } else {
                        toast.error(verifyData.message || "Payment Verification Failed.");
                    }
                },
                prefill: {
                    name: user?.name || "User",
                    email: user?.email || "user@example.com",
                    contact: user?.mobile || "9999999999",
                },
                theme: { color: "#0F172A" },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.on('payment.failed', function (response: any) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            paymentObject.open();

        } catch (error: any) {
            console.error("Payment Flow Error:", error);
            toast.error(error.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    // DEBUG UI
    const [debugError, setDebugError] = useState<string | null>(null);

    if (cartItems.length === 0) {
        return <div className="container py-10">Your cart is empty.</div>;
    }

    return (
        <div className="container py-10 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {debugError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Debug Error: </strong>
                    <span className="block sm:inline">{debugError}</span>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">

                {/* Shipping Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Information</CardTitle>
                        <CardDescription>Enter your delivery details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" name="firstName" placeholder="John" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" name="lastName" placeholder="Doe" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={user?.email || ""} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" defaultValue={typeof user?.address === 'object' ? user?.address?.street : ''} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" defaultValue={typeof user?.address === 'object' ? user?.address?.city : ''} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">Zip Code</Label>
                                    <Input id="zip" name="zip" defaultValue={typeof user?.address === 'object' ? user?.address?.zip : ''} required />
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="pt-4 border-t space-y-3">
                                <Label className="text-base">Payment Method</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 ${paymentMethod === 'ONLINE' ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                                        onClick={() => setPaymentMethod('ONLINE')}
                                    >
                                        <div className="font-bold">Online Payment</div>
                                        <div className="text-xs text-muted-foreground">UPI, Cards, Netbanking</div>
                                    </div>
                                    <div
                                        className={`border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                                        onClick={() => setPaymentMethod('COD')}
                                    >
                                        <div className="font-bold">Cash on Delivery</div>
                                        <div className="text-xs text-muted-foreground">Pay when you receive</div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}

                        <div className="pt-4 border-t space-y-2">
                            {/* Coupon Input */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCoupon}
                                />
                                {appliedCoupon ? (
                                    <Button variant="destructive" onClick={removeCoupon}>
                                        Remove
                                    </Button>
                                ) : (
                                    <Button onClick={onApplyCoupon} variant="outline" type="button">
                                        Apply
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({appliedCoupon})</span>
                                    <span>-₹{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax (10%)</span>
                                <span>₹{(taxableAmount * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total</span>
                                <span>₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button type="submit" form="checkout-form" className="w-full mt-4" size="lg" disabled={submitting}>
                            {submitting ? "Processing..." : (paymentMethod === 'ONLINE' ? "Pay with Razorpay" : "Place Order (COD)")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
