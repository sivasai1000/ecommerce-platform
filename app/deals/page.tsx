"use client";

import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";

export default function DealsPage() {
    const [dealsProducts, setDealsProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeals = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/deals`);
                if (res.ok) {
                    const data = await res.json();
                    setDealsProducts(data);
                }
            } catch (error) {
                console.error("Failed to fetch deals", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, []);

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-10">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Hot Deals & Discounts
                </h1>
                <p className="text-muted-foreground max-w-[600px]">
                    Grab these limited-time offers before they are gone. Premium products at unbeatable prices.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : dealsProducts.length > 0 ? (
                    dealsProducts.map((product) => (
                        <div key={product.id} className="relative">
                            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                                {product.discount}% OFF
                            </span>
                            <ProductCard product={product} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No active deals at the moment. Check back later!
                    </div>
                )}
            </div>
        </div>
    );
}
