import type { Metadata } from 'next';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

async function fetchProduct(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
            cache: 'no-store' // Ensure fresh data
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Error fetching product", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    return {
        title: product.name,
        description: product.description.substring(0, 160), // Limit description for SEO
        openGraph: {
            title: product.name,
            description: `Buy now for ₹${product.price} - ${product.description.substring(0, 100)}...`,
            images: [
                {
                    url: product.imageUrl,
                    width: 800,
                    height: 600,
                    alt: product.name,
                },
            ],
            type: 'website',
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) {
        notFound(); // Triggers the default 404 page
    }

    return <ProductClient product={product} />;
}
