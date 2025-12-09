"use client";

import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
  stock: number;
}

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, bannerRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?isFeatured=true`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/banners`)
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setFeaturedProducts(data.length > 0 ? data.slice(0, 4) : []);
        }
        if (bannerRes.ok) {
          const data = await bannerRes.json();
          setBanners(data);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Subscribed!");
        setEmail("");
      } else {
        toast.error(data.message || "Subscription failed");
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans">

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center bg-stone-100 dark:bg-stone-900 overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-40 dark:opacity-30"
              style={{ backgroundImage: `url(${banner.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-100/60 to-transparent dark:from-stone-900 dark:via-stone-900/60" />
          </div>
        ))}

        <div className="container relative z-10 px-6 md:px-12">
          {banners.length > 0 && (
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl space-y-6"
            >
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-widest text-stone-500 uppercase border border-stone-300 rounded-full dark:border-stone-700 dark:text-stone-400">
                New Collection
              </span>
              <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 dark:text-stone-50 leading-tight">
                {banners[currentBanner].title}
              </h1>
              <p className="text-lg text-stone-600 dark:text-stone-300 leading-relaxed">
                {banners[currentBanner].subtitle}
              </p>
              <div className="flex gap-4 pt-4">
                <Link href={banners[currentBanner].linkUrl || "/products"}>
                  <Button size="lg" className="h-12 px-8 text-sm uppercase tracking-widest bg-stone-900 text-stone-50 hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-900 dark:hover:bg-stone-200 rounded-none transition-all">
                    Shop Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
          {banners.length === 0 && !loading && (
            <div className="text-center">
              <h1 className="text-4xl">Welcome to FUNSTORE.</h1>
            </div>
          )}
        </div>

        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentBanner ? 'w-8 bg-stone-900 dark:bg-stone-100' : 'w-4 bg-stone-400/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Features Banner */}
      <section className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-8">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div className="flex items-center justify-center gap-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-full"><Truck className="w-5 h-5 text-stone-600" /></div>
            <div className="text-left">
              <h3 className="font-bold text-sm uppercase tracking-wider">Free Shipping</h3>
              <p className="text-xs text-stone-500">On all orders over $200</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-full"><ShieldCheck className="w-5 h-5 text-stone-600" /></div>
            <div className="text-left">
              <h3 className="font-bold text-sm uppercase tracking-wider">Secure Payment</h3>
              <p className="text-xs text-stone-500">100% secure payment</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-full"><TrendingUp className="w-5 h-5 text-stone-600" /></div>
            <div className="text-left">
              <h3 className="font-bold text-sm uppercase tracking-wider">30 Day Returns</h3>
              <p className="text-xs text-stone-500">Shop with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-white dark:bg-stone-950">
        <div className="container px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-medium mb-4">Shop by Category</h2>
            <div className="h-1 w-20 bg-stone-900 dark:bg-stone-100 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[600px] md:h-[500px]">
            {/* Category 1 */}
            <Link href="/products?category=Women" className="group relative overflow-hidden h-full lg:col-span-1 rounded-sm">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-black/80 px-8 py-4 backdrop-blur-sm">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-stone-900 dark:text-stone-50">Women</h3>
                </div>
              </div>
            </Link>

            {/* Category 2 (Large) */}
            <Link href="/products?category=Men" className="group relative overflow-hidden h-full lg:col-span-1 rounded-sm">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-black/80 px-8 py-4 backdrop-blur-sm">
                  <h3 className="text-xl font-bold uppercase tracking-widest text-stone-900 dark:text-stone-50">Men</h3>
                </div>
              </div>
            </Link>

            {/* Category 3 */}
            <div className="flex flex-col gap-6 h-full lg:col-span-1">
              <Link href="/products?category=Accessories" className="group relative flex-1 overflow-hidden rounded-sm">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590736939943-85b42d176711?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-black/80 px-6 py-3 backdrop-blur-sm">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-stone-900 dark:text-stone-50">Accessories</h3>
                  </div>
                </div>
              </Link>
              <Link href="/products?category=Shoes" className="group relative flex-1 overflow-hidden rounded-sm">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-black/80 px-6 py-3 backdrop-blur-sm">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-stone-900 dark:text-stone-50">Shoes</h3>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products -> New Arrivals */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
        <div className="container px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-serif font-medium mb-2">New Arrivals</h2>
              <p className="text-stone-500">The latest additions to our collection.</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-stone-600 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-[400px] bg-stone-200 dark:bg-stone-800 animate-pulse rounded-sm" />
              ))
            ) : featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {featuredProducts.length === 0 && !loading && (
              <div className="col-span-full h-24 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded border border-dashed border-stone-300">
                <p className="text-stone-500">No products found.</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link href="/products">
              <Button variant="outline" className="w-full">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-stone-900 dark:bg-white text-stone-100 dark:text-stone-900">
        <div className="container px-6 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-medium mb-6">Join Our Newsletter</h2>
          <p className="text-stone-400 dark:text-stone-600 mb-8 leading-relaxed">
            Sign up for our newsletter to receive exclusive offers, latest news, and a 10% discount on your first order.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full sm:flex-1 h-12 px-4 bg-stone-800 dark:bg-stone-100 border border-stone-700 dark:border-stone-200 rounded-none focus:outline-none focus:border-stone-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="h-12 w-full sm:w-auto px-8 bg-stone-100 text-stone-900 hover:bg-white dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800 rounded-none uppercase tracking-widest font-bold">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
