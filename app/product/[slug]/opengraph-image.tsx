import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Product Image';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Reuse fetch logic (duplicated to avoid import issues with page.tsx)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const decodedName = decodeURIComponent(slug).replace(/-/g, ' ');

    let product = null;
    try {
        const res = await fetch(`${apiUrl}/api/products/name/${encodeURIComponent(decodedName)}`);
        if (res.ok) {
            product = await res.json();
        }
    } catch (e) {
        console.error("Failed to fetch product for OG image", e);
    }

    if (!product) {
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 48,
                        background: 'white',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    Product Not Found
                </div>
            ),
            { ...size }
        );
    }

    // Parse image URL logic
    let imageUrl = product.imageUrl;
    try {
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('[') || imageUrl.startsWith('{'))) {
            const parsed = JSON.parse(imageUrl);
            if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = parsed[0];
            }
        }
    } catch { }

    return new ImageResponse(
        (
            <div
                style={{
                    background: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {/* Background/Main Image */}
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.5
                        }}
                    />
                ) : null}


                {/* Card Overlay */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    maxWidth: '80%'
                }}>
                    {imageUrl && <img
                        src={imageUrl}
                        width="300"
                        height="300"
                        style={{
                            borderRadius: '10px',
                            objectFit: 'cover',
                            marginBottom: '20px'
                        }}
                    />}
                    <div style={{ fontSize: 60, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: '10px' }}>
                        {product.name}
                    </div>
                    <div style={{ fontSize: 40, color: '#666' }}>
                        ₹{product.price}
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
