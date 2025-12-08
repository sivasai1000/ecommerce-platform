"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Category {
    name: string;
    subcategories: string[];
}

export default function CategoriesPage() {
    // State to hold normalized category objects
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`);
                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }
                const data = await response.json();

                // Normalize data to handle both string[] and Category[]
                let normalizedCategories: Category[] = [];
                if (Array.isArray(data)) {
                    if (data.length > 0 && typeof data[0] === 'string') {
                        normalizedCategories = data.map((name: string) => ({ name, subcategories: [] }));
                    } else if (data.length > 0 && typeof data[0] === 'object') {
                        normalizedCategories = data;
                    } else {
                        // Empty array
                        normalizedCategories = [];
                    }
                }

                setCategories(normalizedCategories);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="container px-4 md:px-6 py-24 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Loading categories...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container px-4 md:px-6 py-24 flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-4">
                    <p className="text-destructive font-medium">Error: {error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container px-4 md:px-6 py-12 md:py-24">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Browse Categories</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-lg">
                    Find the perfect product by browsing our categories.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <Link href={`/products?category=${category.name}`} key={category.name} className="group">
                            <Card className="h-full transition-colors hover:bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-center group-hover:text-primary transition-colors">
                                        {category.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center">
                                    <p className="text-sm text-muted-foreground">Explore {category.name} products</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center text-muted-foreground">
                        No categories found.
                    </div>
                )}
            </div>
        </div>
    );
}
