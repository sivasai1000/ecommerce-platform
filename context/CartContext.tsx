"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner"; // Assuming sonner or similar toast
// We'll use simple alerts if toast isn't available or add a simple toast context later

interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    couponCode: string;
    setCouponCode: (code: string) => void;
    discount: number;
    appliedCoupon: string | null;
    applyCoupon: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const storageKey = user ? `cart_${user.id}` : "cart_guest";
        const storedCart = localStorage.getItem(storageKey);
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        } else {
            setCartItems([]);
        }
    }, [user]);

    useEffect(() => {
        const storageKey = user ? `cart_${user.id}` : "cart_guest";
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
    }, [cartItems, user]);

    const addToCart = (newItem: CartItem) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === newItem.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, newItem];
        });
        // Optional: show feedback (e.g., toast)
    };

    const removeFromCart = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) return;
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // Coupon State
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

    const applyCoupon = async (code: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (res.ok) {
                let disc = 0;
                // Calculate discount based on current cartTotal
                if (data.discountType === 'percentage') {
                    disc = (cartTotal * data.value) / 100;
                } else {
                    disc = Number(data.value);
                }
                // Cap discount
                if (disc > cartTotal) disc = cartTotal;

                setDiscount(disc);
                setAppliedCoupon(data.code);
                setCouponCode(code); // Keep input in sync
                toast.success(`Coupon ${data.code} applied!`);
                return true;
            } else {
                toast.error(data.message || "Invalid Coupon");
                setDiscount(0);
                setAppliedCoupon(null);
                return false;
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to apply coupon");
            return false;
        }
    };

    const removeCoupon = () => {
        setDiscount(0);
        setAppliedCoupon(null);
        setCouponCode("");
    };

    // Recalculate discount if cartTotal changes (e.g. quantity update)
    // We would need to store the coupon details (type/value) to do this accurately without re-fetching.
    // For simplicity, let's just reset discount if cart changes significantly or just keep fixed value?
    // Better: Store coupon details.

    // Store simple coupon details to re-calculate
    const [couponDetails, setCouponDetails] = useState<{ type: string, value: number } | null>(null);

    useEffect(() => {
        if (couponDetails && appliedCoupon) {
            let disc = 0;
            if (couponDetails.type === 'percentage') {
                disc = (cartTotal * couponDetails.value) / 100;
            } else {
                disc = couponDetails.value;
            }
            if (disc > cartTotal) disc = cartTotal;
            setDiscount(disc);
        }
    }, [cartTotal, couponDetails, appliedCoupon]);

    // Enhanced applyCoupon to store details
    const applyCouponEnhanced = async (code: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (res.ok) {
                setCouponDetails({ type: data.discountType, value: Number(data.value) });
                setAppliedCoupon(data.code);
                setCouponCode(code);
                toast.success(`Coupon ${data.code} applied!`);
                return true;
            } else {
                toast.error(data.message || "Invalid Coupon");
                setDiscount(0);
                setAppliedCoupon(null);
                setCouponDetails(null);
                return false;
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to apply coupon");
            return false;
        }
    }

    const removeCouponEnhanced = () => {
        setDiscount(0);
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponDetails(null);
    };


    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                couponCode,
                setCouponCode, // Expose setter for inputs
                discount,
                appliedCoupon,
                applyCoupon: applyCouponEnhanced,
                removeCoupon: removeCouponEnhanced
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

