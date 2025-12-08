"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User as UserIcon } from "lucide-react";

interface Blog {
    id: number;
    title: string;
    content: string;
    author: string;
    category: string;
    imageUrl: string;
    createdAt: string;
}

function BlogList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(q);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch blogs
                const queryParams = new URLSearchParams();
                if (q) queryParams.append("q", q);
                if (category) queryParams.append("category", category);

                const blogsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs?${queryParams.toString()}`);
                const blogsData = await blogsRes.json();
                setBlogs(blogsData);

                setBlogs(blogsData);

                // Fetch categories
                const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/categories`);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    if (Array.isArray(catData)) {
                        setCategories(catData);
                    } else {
                        setCategories([]);
                    }
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [q, category]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set("q", search);
        } else {
            params.delete("q");
        }
        router.push(`/blogs?${params.toString()}`);
    };

    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight mb-8">Our Blog</h1>

                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {blogs.length > 0 ? (
                                blogs.map((blog) => (
                                    <Card key={blog.id} className="flex flex-col">
                                        {blog.imageUrl && (
                                            <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                                <img
                                                    src={blog.imageUrl}
                                                    alt={blog.title}
                                                    className="h-full w-full object-cover transition-transform hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <CardHeader>
                                            <Badge className="w-fit mb-2">{blog.category}</Badge>
                                            <CardTitle className="line-clamp-2">
                                                <Link href={`/blogs/${blog.id}`} className="hover:underline">
                                                    {blog.title}
                                                </Link>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-muted-foreground line-clamp-3">
                                                {blog.content}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
                                            <div className="flex items-center">
                                                <UserIcon className="w-3 h-3 mr-1" />
                                                {blog.author}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))
                            ) : (
                                <p>No blogs found.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-64 space-y-8">
                    {/* Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">search</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <Button type="submit" size="sm">Go</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col space-y-2">
                                <Link
                                    href="/blogs"
                                    className={`text-sm hover:underline ${!category ? "font-bold text-primary" : ""}`}
                                >
                                    All Categories
                                </Link>
                                {categories.map((cat) => (
                                    <Link
                                        key={cat}
                                        href={`/blogs?category=${cat}`}
                                        className={`text-sm hover:underline ${category === cat ? "font-bold text-primary" : ""}`}
                                    >
                                        {cat}
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function BlogsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BlogList />
        </Suspense>
    );
}
