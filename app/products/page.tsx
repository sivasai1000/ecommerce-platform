"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link"; // Ensure Link is imported if needed, usually Next.js uses standard imports
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";

interface Product {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    category: string;
    subcategory?: string;
}

function ProductsList() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get("category");
    const subcategoryFilter = searchParams.get("subcategory");
    const searchQuery = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (categoryFilter) params.append("category", categoryFilter);
                if (subcategoryFilter) params.append("subcategory", subcategoryFilter);
                if (minPrice) params.append("minPrice", minPrice);
                if (maxPrice) params.append("maxPrice", maxPrice);
                if (searchQuery) params.append("search", searchQuery);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${params.toString()}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch products");
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryFilter, subcategoryFilter, minPrice, maxPrice, searchQuery]);

    const activeFilterCount = [categoryFilter, subcategoryFilter, minPrice, maxPrice].filter(Boolean).length;



    // ... existing code ...

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Hero Section */}
            <section className="relative w-full h-[300px] bg-neutral-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/placeholder-hero.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                <div className="relative z-10 text-center space-y-4 px-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                        {categoryFilter || "Shop the Collection"}
                    </h1>
                    <p className="text-neutral-300 max-w-lg mx-auto text-lg">
                        Discover our curated selection of premium products designed for your lifestyle.
                    </p>
                </div>
            </section>

            <div className="container px-4 md:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px] px-6">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="mt-8">
                                    <FilterSidebar />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="lg:sticky lg:top-24">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-muted-foreground">
                                Showing {products.length} results
                            </p>
                            {/* Sort Component could go here */}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <div key={n} className="h-[400px] w-full bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 text-red-500">
                                <p>Error loading products.</p>
                                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">Retry</Button>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={{ ...product, price: Number(product.price) }} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-900 rounded-lg border border-dashed text-center">
                                <h3 className="text-lg font-medium">No products found</h3>
                                <p className="text-muted-foreground mt-2 max-w-xs">
                                    Try adjusting your filters or search query to find what you're looking for.
                                </p>
                                {activeFilterCount > 0 && (
                                    <Button variant="link" onClick={() => window.location.href = '/products'}>Clear Filters</Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsList />
        </Suspense>
    );
}
