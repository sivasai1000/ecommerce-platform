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
        const loadCart = () => {
            if (user) {
                // User is logged in
                const userKey = `cart_${user.id}`;
                const guestKey = "cart_guest";
                const userCartStr = localStorage.getItem(userKey);
                const guestCartStr = localStorage.getItem(guestKey);

                let finalCart: CartItem[] = [];

                // Load user cart
                if (userCartStr) {
                    finalCart = JSON.parse(userCartStr);
                }

                // Merge guest cart if exists
                if (guestCartStr) {
                    const guestCart: CartItem[] = JSON.parse(guestCartStr);
                    if (guestCart.length > 0) {
                        guestCart.forEach(guestItem => {
                            const existingIndex = finalCart.findIndex(i => i.id === guestItem.id);
                            if (existingIndex > -1) {
                                // Add quantities
                                finalCart[existingIndex].quantity += guestItem.quantity;
                            } else {
                                finalCart.push(guestItem);
                            }
                        });
                        // Save merged cart to user key
                        localStorage.setItem(userKey, JSON.stringify(finalCart));
                        // Clear guest cart
                        localStorage.removeItem(guestKey);
                        toast.success("Guest cart merged with your account");
                    }
                }
                setCartItems(finalCart);
            } else {
                // Guest User
                const guestKey = "cart_guest";
                const guestCart = localStorage.getItem(guestKey);
                if (guestCart) {
                    setCartItems(JSON.parse(guestCart));
                } else {
                    setCartItems([]);
                }
            }
        };
        loadCart();
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
    const [couponDetails, setCouponDetails] = useState<{ code: string, discountType: string, value: number, minOrderValue: number } | null>(null);

    // Load Coupon from Storage
    useEffect(() => {
        const storageKey = user ? `coupon_${user.id}` : "coupon_guest";
        const storedCoupon = localStorage.getItem(storageKey);
        if (storedCoupon) {
            const details = JSON.parse(storedCoupon);
            setCouponDetails(details);
            setAppliedCoupon(details.code);
            setCouponCode(details.code);
        } else {
            setCouponDetails(null);
            setAppliedCoupon(null);
            setCouponCode("");
            setDiscount(0);
        }
    }, [user]);

    // Save Coupon to Storage
    useEffect(() => {
        const storageKey = user ? `coupon_${user.id}` : "coupon_guest";
        if (couponDetails) {
            localStorage.setItem(storageKey, JSON.stringify(couponDetails));
        } else {
            localStorage.removeItem(storageKey);
        }
    }, [couponDetails, user]);

    // Calculate Discount & Strict Validation
    useEffect(() => {
        if (!couponDetails) {
            setDiscount(0);
            return;
        }

        // Strict Validation: Remove if total drops below minOrderValue
        if (couponDetails.minOrderValue > 0 && cartTotal < couponDetails.minOrderValue) {
            toast.error(`Coupon ${couponDetails.code} removed. Min order $${couponDetails.minOrderValue} not met.`);
            removeCoupon();
            return;
        }

        let disc = 0;
        if (couponDetails.discountType === 'percentage') {
            disc = (cartTotal * couponDetails.value) / 100;
        } else {
            disc = Number(couponDetails.value);
        }

        if (disc > cartTotal) disc = cartTotal;
        setDiscount(disc);

    }, [cartTotal, couponDetails]);

    const applyCoupon = async (code: string) => {
        try {
            // Pass cartTotal for validation on server side too
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, cartTotal })
            });
            const data = await res.json();

            if (res.ok) {
                const details = {
                    code: data.code,
                    discountType: data.discountType,
                    value: Number(data.value),
                    minOrderValue: Number(data.minOrderValue || 0)
                };
                setCouponDetails(details);
                setAppliedCoupon(data.code);
                setCouponCode(code);
                toast.success(`Coupon ${data.code} applied!`);
                return true;
            } else {
                toast.error(data.message || "Invalid Coupon");
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
        setCouponDetails(null);
        const storageKey = user ? `coupon_${user.id}` : "coupon_guest";
        localStorage.removeItem(storageKey);
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
                setCouponCode,
                discount,
                appliedCoupon,
                applyCoupon,
                removeCoupon
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

