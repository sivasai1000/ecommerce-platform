import type { Metadata } from 'next';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ slug: string }>;
}

async function fetchProduct(slug: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const decodedName = decodeURIComponent(slug).replace(/-/g, ' ');
        const res = await fetch(`${apiUrl}/api/products/name/${encodeURIComponent(decodedName)}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch product');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await fetchProduct(slug);

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    let imageUrl = product.imageUrl;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Attempt to parse if it looks like a JSON array string
    try {
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('[') || imageUrl.startsWith('{'))) {
            const parsed = JSON.parse(imageUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = parsed[0];
            }
        }
    } catch {
        // Fallback to original string if parse fails
    }

    // Ensure absolute URL
    if (imageUrl && !imageUrl.startsWith('http')) {
        const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
        imageUrl = `${apiUrl}/${cleanPath}`;
    }

    return {
        title: product.name,
        description: `Buy now for ₹${product.price} - ${product.description.substring(0, 100)}...`,
        openGraph: {
            title: product.name,
            description: `Buy now for ₹${product.price} - ${product.description.substring(0, 100)}...`,
            type: 'website',
            images: imageUrl ? [{ url: imageUrl }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: `Buy now for ₹${product.price} - ${product.description.substring(0, 100)}...`,
            images: imageUrl ? [imageUrl] : [],
        }
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = await fetchProduct(slug);

    if (!product) {
        notFound();
    }

    return <ProductClient product={product} />;
}
