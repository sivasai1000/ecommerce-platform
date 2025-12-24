import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import Newsletter from "@/components/Newsletter";

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

// Fetch data on the server
async function getData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
    return { featuredProducts: [], banners: [] };
  }

  try {
    const [prodRes, bannerRes, catRes] = await Promise.all([
      fetch(`${apiUrl}/api/products`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/banners`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/products/categories`, { cache: 'no-store' })
    ]);

    let featuredProducts: Product[] = [];
    if (prodRes.ok) {
      const data = await prodRes.json();
      featuredProducts = Array.isArray(data) ? (data.length > 0 ? data.slice(0, 4) : []) : [];
    } else {
      console.error("Failed to fetch products:", prodRes.statusText);
    }

    let banners: Banner[] = [];
    if (bannerRes.ok) {
      const data = await bannerRes.json();
      banners = Array.isArray(data) ? data : [];
    } else {
      console.error("Failed to fetch banners:", bannerRes.statusText);
    }

    let categories: { name: string; image?: string }[] = [];
    if (catRes.ok) {
      categories = await catRes.json();
    }

    return { featuredProducts, banners, categories };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { featuredProducts: [], banners: [], categories: [] };
  }
}

const getCategoryImage = (categoryName: string, index: number) => {
  const imageMap: { [key: string]: string } = {
    "Electronics": "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&q=80",
    "Fashion": "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80",
    "Home & Furniture": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80",
    "Health & Beauty": "https://images.unsplash.com/photo-1596462502278-27bfdd403348?auto=format&fit=crop&q=80",
    "Men's Wear": "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&q=80",
    "Women's Wear": "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80",
    "Smartphones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80",
    "Laptops": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80"
  };

  if (imageMap[categoryName]) return imageMap[categoryName];

  const images = [
    "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&q=80", // Women
    "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&q=80", // Men
    "https://images.unsplash.com/photo-1590736939943-85b42d176711?auto=format&fit=crop&q=80", // Accessories
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80", // Shoes
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80", // Tech
    "https://images.unsplash.com/photo-1610465299993-e6675c9f9efa?auto=format&fit=crop&q=80", // Laptop
  ];
  return images[index % images.length];
};

export default async function Home() {
  const { featuredProducts, banners, categories = [] } = await getData();

  return (
    <div className="flex flex-col min-h-screen font-sans">


      <HeroSection banners={banners} />
      <section className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 py-8">
        <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div className="flex items-center justify-center gap-4">
            <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-full"><Truck className="w-5 h-5 text-stone-600" /></div>
            <div className="text-left">
              <h3 className="font-bold text-sm uppercase tracking-wider">Free Shipping</h3>
              <p className="text-xs text-stone-500">On all orders over ₹200</p>
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
        <div className="w-full max-w-[1400px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-medium mb-4">Shop by Category</h2>
            <div className="h-1 w-20 bg-stone-900 dark:bg-stone-100 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2 auto-rows-[300px] gap-4 h-[600px]">
            {categories.slice(0, 4).map((cat, index) => {
              // Layout Logic:
              // Index 0: Tall (Col 1, Row 1-2)
              // Index 1: Tall (Col 2, Row 1-2)
              // Index 2: Stacked (Col 3, Row 1)
              // Index 3: Stacked (Col 3, Row 2)
              let gridClass = "";
              if (index === 0) gridClass = "lg:col-span-1 lg:row-span-2 md:col-span-1 md:row-span-2 h-full";
              else if (index === 1) gridClass = "lg:col-span-1 lg:row-span-2 md:col-span-1 md:row-span-2 h-full";
              else gridClass = "lg:col-span-1 lg:row-span-1 md:col-span-1 md:row-span-1 h-full";

              // Image Logic: Use dynamic category image from backend, fallback to map
              const bgImage = cat.image || getCategoryImage(cat.name, index);

              return (
                <Link
                  key={cat.name}
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`group relative overflow-hidden rounded-sm ${gridClass}`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${bgImage}')` }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 dark:bg-black/80 px-8 py-4 backdrop-blur-sm">
                      <h3 className="text-xl font-bold uppercase tracking-widest text-stone-900 dark:text-stone-50">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products -> New Arrivals */}
      <section className="py-20 bg-stone-50 dark:bg-stone-900/50">
        <div className="w-full max-w-[1400px] mx-auto px-6">
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
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
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
      <Newsletter />
    </div>
  );
}
