"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext"; // Adjust path if needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number | null;
    message: string;
    is_admin_sender: number | boolean; // MySQL might return 1/0
    created_at: string;
}

export default function ChatWidget() {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const fetchMessages = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    useEffect(() => {
        if (isOpen && token) {
            fetchMessages();
            // Optional: Poll for new messages every 10 seconds
            const interval = setInterval(fetchMessages, 10000);
            return () => clearInterval(interval);
        }
    }, [isOpen, token]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !token) return;

        const tempMessage = newMessage;
        setNewMessage(""); // Optimistic clear

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: tempMessage }),
            });

            if (res.ok) {
                await fetchMessages(); // Refresh messages
            } else {
                toast.error("Failed to send message");
                setNewMessage(tempMessage); // Restore on failure
            }
        } catch (error) {
            console.error(error);
            toast.error("Error sending message");
            setNewMessage(tempMessage);
        }
    };

    if (!user) return null; // Don't show chat if not logged in

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl rounded-lg w-80 sm:w-96 flex flex-col h-[500px] overflow-hidden">
                    {/* Header */}
                    <div className="bg-stone-900 text-stone-50 p-4 flex justify-between items-center">
                        <h3 className="font-semibold text-sm tracking-wide">Customer Support</h3>
                        <Button variant="ghost" size="icon" onClick={toggleChat} className="h-6 w-6 text-stone-400 hover:text-white">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 dark:bg-stone-950">
                        {messages.length === 0 && (
                            <p className="text-center text-stone-400 text-sm mt-10">Any questions? We are here to help!</p>
                        )}
                        {messages.map((msg) => {
                            // If is_admin_sender is true, it's incoming (left). 
                            // If is_admin_sender is false, it's outgoing (right).
                            const isSupport = Boolean(msg.is_admin_sender);
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full mb-2",
                                        isSupport ? "justify-start" : "justify-end"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                                            isSupport
                                                ? "bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-tl-none"
                                                : "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 rounded-tr-none"
                                        )}
                                    >
                                        <p>{msg.message}</p>
                                        <span className="text-[10px] opacity-70 block text-right mt-1">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 text-sm bg-stone-50 dark:bg-stone-800 border-none focus-visible:ring-1 focus-visible:ring-stone-400"
                            />
                            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-stone-900 hover:bg-stone-800 text-white">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            ) : (
                <Button
                    onClick={toggleChat}
                    className="h-14 w-14 rounded-full shadow-lg bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center transition-transform hover:scale-105"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
