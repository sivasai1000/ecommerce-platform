"use client";

import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`);
                if (res.ok) {
                    setFaqs(await res.json());
                }
            } catch (error) {
                console.error("Failed to fetch FAQs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFAQs();
    }, []);

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-950">
            <main className="flex-1 py-16 container mx-auto px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
                        <p className="text-muted-foreground text-lg">
                            Find answers to common questions about our products, shipping, and returns.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq) => (
                                <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                                    <AccordionTrigger className="text-left text-lg font-medium">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-base leading-relaxed whitespace-pre-line">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            {faqs.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">
                                    No FAQs available at the moment.
                                </p>
                            )}
                        </Accordion>
                    )}
                </div>
            </main>
        </div>
    );
}
