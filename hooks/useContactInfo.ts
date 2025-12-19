import { useState, useEffect } from 'react';

export const useContactInfo = () => {
    const [contactInfo, setContactInfo] = useState({
        phone: "", // Default empty, will be populated from API
        email: "",
        address: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.content) {
                        try {
                            const parsed = JSON.parse(data.content);
                            setContactInfo({
                                phone: parsed.phone || "",
                                email: parsed.email || "",
                                address: parsed.address || ""
                            });
                        } catch (e) {
                            console.error("Failed to parse contact info", e);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching contact info", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContact();
    }, []);

    return { contactInfo, loading };
};
