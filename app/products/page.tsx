
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import FilterSidebar from "@/components/FilterSidebar";
import type { Metadata, ResolvingMetadata } from 'next';

interface Product {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    category: string;
    subcategory?: string;
    stock: number;
}


interface ProductsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Dynamic Metadata
export async function generateMetadata(
    { searchParams }: ProductsPageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const category = resolvedParams.category as string;
    const title = category ? `${category} Products | Store` : 'All Products | Store';
    return {
        title: title,
        description: `Browse our collection of ${category || 'premium'} products.`,
    };
}

async function getProducts(searchParams: any) {
    const params = new URLSearchParams();
    if (searchParams.category) params.append("category", searchParams.category);
    if (searchParams.subcategory) params.append("subcategory", searchParams.subcategory);
    if (searchParams.minPrice) params.append("minPrice", searchParams.minPrice);
    if (searchParams.maxPrice) params.append("maxPrice", searchParams.maxPrice);
    if (searchParams.q) params.append("search", searchParams.q); // Note: 'q' mapped to 'search' from original

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const response = await fetch(`${apiUrl}/api/products?${params.toString()}`, {
            cache: 'no-store', // Ensure fresh data, or use 'force-cache' / revalidate for static
        });
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const resolvedSearchParams = await searchParams;
    const products: Product[] = await getProducts(resolvedSearchParams);

    // Derived state
    const categoryFilter = resolvedSearchParams.category as string;
    const activeFilterCount = Object.keys(resolvedSearchParams).length;

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

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12">
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

                        {products.length > 0 ? (
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
                                    <Link href="/products" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                                        Clear Filters
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
