"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

interface Blog {
    id: number;
    title: string;
    content: string;
    author: string;
    category: string;
    imageUrl: string;
    createdAt: string;
}

export default function BlogDetailPage() {
    const params = useParams();
    const id = params?.id;
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchBlog = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setBlog(data);
                }
            } catch (error) {
                console.error("Error fetching blog:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    if (loading) return <div className="container py-12">Loading...</div>;
    if (!blog) return <div className="container py-12">Blog not found</div>;

    return (
        <div className="container max-w-4xl py-12 px-4 md:px-6">
            <div className="space-y-6">
                <Badge>{blog.category}</Badge>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{blog.title}</h1>

                <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {blog.author}
                    </div>
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {blog.imageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                        <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}

                <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                        {blog.content}
                    </p>
                </div>
            </div>
        </div>
    );
}
