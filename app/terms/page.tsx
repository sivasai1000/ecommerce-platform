"use client";

import { useEffect, useState } from "react";

export default function TermsPage() {
    const [pageData, setPageData] = useState<{ title: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terms`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch Terms page");
                return res.json();
            })
            .then(data => setPageData(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                {error}
            </div>
        );
    }

    if (!pageData) return null;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">{pageData.title}</h1>
            <div
                className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{ __html: pageData.content.replace(/\n/g, '<br/>') }}
            />
        </div>
    );
}
