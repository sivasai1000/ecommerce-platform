"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Menu, User, Search, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState, useEffect } from "react";

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { cartCount } = useCart();
    const { wishlistItems } = useWishlist();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<{ name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/categories`);
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
            setShowMobileSearch(false);
        }
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-stone-100 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md">
            <div className="w-full max-w-[1400px] mx-auto flex h-20 items-center px-4 md:px-8">
                {/* Mobile Menu */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden mr-2 -ml-2">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] p-0 border-r border-stone-200 dark:border-stone-800">
                        <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                        <div className="flex flex-col h-full bg-white dark:bg-stone-950">
                            <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                                <Link href="/" onClick={closeMobileMenu} className="text-2xl font-serif font-bold tracking-tight">
                                    FUNSTORE.
                                </Link>
                            </div>
                            <nav className="flex flex-col p-6 space-y-6">
                                <Link href="/products" onClick={closeMobileMenu} className="text-lg font-medium uppercase tracking-wider hover:text-stone-500 transition-colors">Shop All</Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat.name}
                                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                                        onClick={closeMobileMenu}
                                        className="text-lg font-medium uppercase tracking-wider hover:text-stone-500 transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                                <Link href="/about" onClick={closeMobileMenu} className="text-lg font-medium uppercase tracking-wider hover:text-stone-500 transition-colors">Our Story</Link>
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <Link href="/" className="mr-2 md:mr-6 flex items-center space-x-2">
                    <span className="text-xl md:text-2xl font-serif font-bold tracking-tight text-stone-900 dark:text-stone-50">
                        FUNSTORE.
                    </span>
                </Link>

                {/* Desktop Links - Centered */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium uppercase tracking-widest text-stone-600 dark:text-stone-400 mx-auto">
                    <Link href="/products" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                        Shop
                    </Link>
                    {categories.slice(0, 2).map((cat) => (
                        <Link
                            key={cat.name}
                            href={`/products?category=${encodeURIComponent(cat.name)}`}
                            className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors"
                        >
                            {cat.name}
                        </Link>
                    ))}
                    <Link href="/blogs" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                        Blogs
                    </Link>
                    <Link href="/about" className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                        About
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
                    <form onSubmit={handleSearch} className="relative hidden lg:flex items-center">
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="w-[200px] xl:w-[300px] h-9 pr-8 bg-stone-100 dark:bg-stone-900 border-none focus-visible:ring-1 focus-visible:ring-stone-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9 w-9 text-stone-500 hover:text-stone-900 hover:bg-transparent"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-stone-700 dark:text-stone-300 hover:text-stone-900 hover:bg-transparent"
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    <Link href="/wishlist">
                        <Button variant="ghost" size="icon" className="relative text-stone-700 dark:text-stone-300 hover:text-stone-900 hover:bg-transparent">
                            <Heart className="h-5 w-5" />
                            {wishlistItems.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-stone-950" />
                            )}
                        </Button>
                    </Link>

                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative text-stone-700 dark:text-stone-300 hover:text-stone-900 hover:bg-transparent">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-stone-900 dark:bg-stone-100 text-[9px] text-white dark:text-stone-900 flex items-center justify-center border border-white dark:border-stone-950">
                                </span>
                            )}
                        </Button>
                    </Link>

                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full ml-1 md:ml-2">
                                    <Avatar className="h-8 w-8 border border-stone-200">
                                        <AvatarImage src="/avatars/01.png" alt="@user" />
                                        <AvatarFallback className="bg-stone-100 text-stone-600 font-serif text-xs">{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-none border-stone-200 bg-white dark:bg-stone-950">
                                <DropdownMenuLabel className="font-normal text-xs text-stone-500 uppercase tracking-wider">
                                    {user?.email}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Link href="/profile">
                                    <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                                </Link>
                                <Link href="/orders">
                                    <DropdownMenuItem className="cursor-pointer">Orders</DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                                    <LogOut className="mr-2 h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="ml-2 text-xs uppercase tracking-widest font-bold">Login</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showMobileSearch && (
                <div className="lg:hidden border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 px-4 py-4 animate-in slide-in-from-top-2">
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="w-full h-10 pr-10 bg-stone-100 dark:bg-stone-900 border-none focus-visible:ring-1 focus-visible:ring-stone-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10 text-stone-500 hover:text-stone-900 hover:bg-transparent"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            )}
        </nav>
    );
}
