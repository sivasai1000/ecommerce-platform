"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, X } from "lucide-react";

interface Category {
    name: string;
    subcategories: string[];
}

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [categories, setCategories] = useState<Category[]>([]);
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Read URL params
    const currentCategory = searchParams.get("category");
    const currentSubcategory = searchParams.get("subcategory");
    const currentMin = searchParams.get("minPrice");
    const currentMax = searchParams.get("maxPrice");

    useEffect(() => {
        // Initialize price from URL
        if (currentMin) setPriceRange(prev => ({ ...prev, min: currentMin }));
        if (currentMax) setPriceRange(prev => ({ ...prev, max: currentMax }));

        // Expand active category
        if (currentCategory) {
            setExpandedCategories(prev => ({ ...prev, [currentCategory]: true }));
        }

        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    const updateFilter = (type: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set(type, value);
        } else {
            params.delete(type);
        }

        // Reset subcategory if category changes
        if (type === "category") {
            params.delete("subcategory");
        }

        // Reset page to 1 if pagination existed (not yet, but good practice)

        router.push(`/products?${params.toString()}`);
    };

    const handlePriceApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (priceRange.min) params.set("minPrice", priceRange.min);
        else params.delete("minPrice");

        if (priceRange.max) params.set("maxPrice", priceRange.max);
        else params.delete("maxPrice");

        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/products");
        setPriceRange({ min: "", max: "" });
    };

    const toggleCategory = (catName: string) => {
        setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }));
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Filters</h3>
                {(currentCategory || currentMin || currentMax) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary h-auto p-0">
                        Clear All
                    </Button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80 uppercase tracking-wider">Categories</h4>
                <div className="space-y-1">
                    <button
                        onClick={() => updateFilter("category", null)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${!currentCategory ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                    >
                        All Products
                    </button>
                    {categories.map((cat) => (
                        <div key={cat.name} className="space-y-1">
                            <div className="flex items-center justify-between group">
                                <button
                                    onClick={() => updateFilter("category", cat.name)}
                                    className={`flex-1 text-left px-2 py-1.5 rounded-md text-sm transition-colors ${currentCategory === cat.name ? "text-primary font-medium bg-primary/5" : "hover:bg-muted"}`}
                                >
                                    {cat.name}
                                </button>
                                {cat.subcategories.length > 0 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat.name); }}
                                        className="p-1.5 hover:bg-muted rounded-md text-muted-foreground"
                                    >
                                        {expandedCategories[cat.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </button>
                                )}
                            </div>

                            {/* Subcategories Accordion */}
                            {cat.subcategories.length > 0 && expandedCategories[cat.name] && (
                                <div className="pl-4 space-y-1 border-l-2 border-muted ml-2">
                                    {cat.subcategories.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => {
                                                updateFilter("category", cat.name); // Ensure parent is set
                                                updateFilter("subcategory", sub);
                                            }}
                                            className={`w-full text-left px-2 py-1 rounded-md text-sm transition-colors ${currentSubcategory === sub ? "text-primary font-medium bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80 uppercase tracking-wider">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Min</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Max</label>
                        <Input
                            type="number"
                            placeholder="9999"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            className="h-8 text-sm"
                        />
                    </div>
                </div>
                <Button onClick={handlePriceApply} variant="outline" size="sm" className="w-full h-8 text-xs font-medium">
                    Apply Price
                </Button>
            </div>
        </div>
    );
}
