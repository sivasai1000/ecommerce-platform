import { Mail, MapPin, Phone } from "lucide-react";

export default async function ContactPage() {
    let pageData = null;
    let error = "";

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
            cache: 'no-store'
        });
        if (!res.ok) throw new Error("Failed to fetch Contact page");
        pageData = await res.json();
    } catch (err: any) {
        error = err.message || "Failed to load content";
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
                    {/* Intro Text */}
                    <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {(() => {
                            try {
                                const parsed = JSON.parse(pageData.content);
                                return parsed.intro || parsed.content || ""; // Handle JSON object
                            } catch (e) {
                                return <div dangerouslySetInnerHTML={{ __html: pageData.content.replace(/\n/g, '<br/>') }} />; // Handle legacy HTML string
                            }
                        })()}
                    </div>

                    <div className="space-y-6 pt-8 border-t">
                        {(() => {
                            let parsed = { address: "", email: "", phone: "", hours: "" };
                            try {
                                parsed = JSON.parse(pageData.content);
                            } catch (e) {
                                // If legacy string, we don't have structured data, so we might show defaults or hide
                                // For now, let's keep defaults if it's legacy so the page isn't empty
                                parsed = {
                                    address: "123 Commerce St, Market City\nST 12345, United States",
                                    email: "support@sivasai.com",
                                    phone: "+1 (555) 123-4567",
                                    hours: ""
                                };
                            }

                            return (
                                <>
                                    <div className="flex items-start space-x-4">
                                        <MapPin className="w-6 h-6 text-gray-900 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-lg">Visit Us</h3>
                                            <p className="text-gray-600 whitespace-pre-wrap">{parsed.address || "Address not available"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <Mail className="w-6 h-6 text-gray-900 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-lg">Email Us</h3>
                                            <p className="text-gray-600">{parsed.email || "Email not available"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <Phone className="w-6 h-6 text-gray-900 mt-1" />
                                        <div>
                                            <h3 className="font-semibold text-lg">Call Us</h3>
                                            <p className="text-gray-600">{parsed.phone || "Phone not available"}</p>
                                        </div>
                                    </div>
                                    {parsed.hours && (
                                        <div className="flex items-start space-x-4">
                                            <div className="w-6 h-6 flex items-center justify-center mt-1">
                                                <span className="text-xl font-bold">🕒</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">Hours</h3>
                                                <p className="text-gray-600">{parsed.hours}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Contact Form (Visual Only for now) */}
                <div className="bg-gray-50 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                    <form className="space-y-4">
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
