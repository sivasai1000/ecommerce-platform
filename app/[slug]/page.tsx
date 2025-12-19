 "use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";

interface PageData {
    title: string;
    content: string;
    updatedAt: string;
}

export default function DynamicPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [data, setData] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages/${slug}`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to fetch page", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-muted-foreground">Page not found.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-950">
            <main className="flex-1 py-16 container mx-auto px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center space-y-4 border-b border-border pb-8">
                        <h1 className="text-4xl font-bold tracking-tight">{data.title}</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                            Last Updated: {new Date(data.updatedAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {data.content}
                    </div>
                </div>
            </main>
        </div>
    );
}
