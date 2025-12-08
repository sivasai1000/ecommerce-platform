"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    const [pageData, setPageData] = useState<{ title: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch Contact page");
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
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">{pageData.title}</h1>
                <div className="w-24 h-1 bg-black mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info / Content */}
                <div className="space-y-8">
                    <div
                        className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: pageData.content.replace(/\n/g, '<br/>') }}
                    />

                    <div className="space-y-6 pt-8 border-t">
                        <div className="flex items-start space-x-4">
                            <MapPin className="w-6 h-6 text-gray-900 mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Visit Us</h3>
                                <p className="text-gray-600">123 Commerce St, Market City<br />ST 12345, United States</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Mail className="w-6 h-6 text-gray-900 mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Email Us</h3>
                                <p className="text-gray-600">support@sivasai.com</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Phone className="w-6 h-6 text-gray-900 mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg">Call Us</h3>
                                <p className="text-gray-600">+1 (555) 123-4567</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form (Visual Only for now) */}
                <div className="bg-gray-50 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="Your name" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="your@email.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none" placeholder="How can we help?" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none h-32" placeholder="Your message..."></textarea>
                        </div>
                        <button className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
