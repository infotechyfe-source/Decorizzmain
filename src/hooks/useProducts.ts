
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import LandscapeImg from "../assets/landscape.jpeg";
import SquareImg from "../assets/squre.jpeg";
import VerticalImg from "../assets/verticalsize.jpg";
import CircleImg from "../assets/circle.jpeg";
import ViratImg from "../assets/virat.jpg";

// Hardcoded custom products logic extracted from ProductDetailPage
const getMockProduct = (nameParam: string | undefined): any | null => {
    if (nameParam === 'custom-print-round-canvas-wall-art') {
        return {
            id: 'custom-round-canvas',
            name: 'Custom Print - Round Canvas',
            category: 'Custom Designs',
            layout: 'Circle',
            material: '380 GSM Canvas',
            price: 1250,
            sizes: ['12 inches', '18 inches', '24 inches', '30 inches', '36 inches'],
            colors: [],
            format: 'Canvas',
            image: CircleImg,
            description: 'Upload your file, add instructions, we share a mockup, then print once approved. Extra detailed work may add cost. Free delivery in 7-10 days.',
            reviewsCount: 2,
            rating: 4.8,
            isCustomCanvas: true,
        };
    }

    if (nameParam === 'custom-print-square-canvas-wall-art') {
        return {
            id: 'custom-square-canvas',
            name: 'Custom Print - Square Canvas',
            category: 'Custom Designs',
            layout: 'Square',
            material: '380 GSM Canvas',
            price: 1250,
            sizes: ['12 inches', '18 inches', '24 inches', '30 inches', '36 inches'],
            colors: [],
            format: 'Canvas',
            image: SquareImg,
            description: 'Upload your file, add instructions, we share a mockup, then print once approved. Extra detailed work may add cost. Free delivery in 7-10 days.',
            reviewsCount: 2,
            rating: 4.8,
            isCustomCanvas: true,
        };
    }

    if (nameParam === 'custom-print-portrait-canvas-wall-art') {
        return {
            id: 'custom-portrait-canvas',
            name: 'Custom Print - Portrait Canvas',
            category: 'Custom Designs',
            layout: 'Portrait',
            material: '380 GSM Canvas',
            price: 1250,
            sizes: ['8X12', '12X18', '18X24', '20X30', '24X36'],
            colors: [],
            format: 'Canvas',
            image: VerticalImg,
            description: 'Upload your file, add instructions, we share a mockup, then print once approved. Extra detailed work may add cost. Free delivery in 7-10 days.',
            reviewsCount: 2,
            rating: 4.8,
            isCustomCanvas: true,
        };
    }

    if (nameParam === 'custom-print-landscape-canvas-wall-art') {
        return {
            id: 'custom-landscape-canvas',
            name: 'Custom Print - Landscape Canvas',
            category: 'Custom Designs',
            layout: 'Landscape',
            material: '380 GSM Canvas',
            price: 1250,
            sizes: ['36X18', '48X24', '20X30', '30X40'],
            colors: [],
            format: 'Canvas',
            image: LandscapeImg,
            description: 'Upload your file, add instructions, we share a mockup, then print once approved. Extra detailed work may add cost. Free delivery in 7-10 days.',
            reviewsCount: 2,
            rating: 4.8,
            isCustomCanvas: true,
        };
    }

    if (nameParam === 'custom-name-neon-signs-lights') {
        return {
            id: 'custom-neon-sign',
            name: 'Custom Name Neon Sign',
            category: 'Custom Neon Sign',
            layout: 'Neon',
            material: 'LED Neon Flex Strip + 6mm A‑Cast Acrylic',
            price: 4999,
            sizes: ['24in', '30in', '36in'],
            colors: ['Warm White', 'Cool White', 'Teal', 'Pink', 'Yellow'],
            format: 'Canvas',
            image: 'https://res.cloudinary.com/dzt6v3p5n/image/upload/v1707000000/neon_preview.jpg',
            description: 'Design your personalized neon sign: write your text, pick font, size and colors. Safe LED, eco‑friendly, free delivery 7‑10 days, secure packaging.',
            reviewsCount: 0,
            rating: 4.9,
        };
    }

    if (nameParam === 'custom-acrylic-artwork') {
        return {
            id: 'custom-acrylic-artwork',
            name: 'Custom Acrylic Artwork',
            category: 'Custom Designs',
            layout: 'Acrylic',
            material: 'High-Quality UV Printed Acrylic',
            price: 2499,
            sizes: ['12X12', '18X18', '24X24'],
            colors: [],
            format: 'Canvas',
            image: ViratImg,
            description: 'Upload your own SVG design for a custom UV-printed acrylic masterpiece. Premium quality, vibrant colors, and durable finish.',
            reviewsCount: 0,
            rating: 4.8,
        };
    }

    return null;
};

// Function fetching single product by ID or Name
const fetchProductData = async (id?: string, nameParam?: string) => {
    // Check mock products first
    const mock = getMockProduct(nameParam);
    if (mock) return mock;

    if (id) {
        const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/products/${id}`,
            { headers: { Authorization: `Bearer ${publicAnonKey}` } }
        );
        const data = await response.json();
        return data.product;
    }

    if (nameParam) {
        // Try to fetch by slug if the API supports it, or keep it as is if it's the only way
        // Given we don't have a direct "by-slug" endpoint known, staying safe but ensuring it's efficient
        const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/products`,
            { headers: { Authorization: `Bearer ${publicAnonKey}` } }
        );
        const data = await response.json();
        const all = data.products || [];
        return all.find((item: any) => {
            const itemSlug = (item.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return itemSlug === nameParam;
        }) || null;
    }

    return null;
};


export const useProduct = (id?: string, nameParam?: string) => {
    return useQuery({
        queryKey: ['product', id, nameParam],
        queryFn: async () => {
            if (!id && !nameParam) throw new Error('Product ID or Name required');

            // Check mock products first (custom canvas, neon, etc.) - no network needed
            const mock = getMockProduct(nameParam);
            if (mock) return mock;

            // Fetch from network for real products
            const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/products`;
            const url = id
                ? `${baseUrl}/${id}`
                : `${baseUrl}?name=${encodeURIComponent(nameParam || '')}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${publicAnonKey}` },
            });

            if (!res.ok) throw new Error('Product not found');
            const data = await res.json();
            return data.product || data.products?.[0];
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        enabled: !!id || !!nameParam
    });
};

export const useBestSellers = () => {
    return useQuery({
        queryKey: ['home', 'best-sellers'],
        queryFn: async () => {
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-52d68140/home-section/best`);
            const data = await res.json();
            return data.products || [];
        },
        staleTime: 1000 * 60 * 15,
    });
};

export const useBudgetFinds = () => {
    return useQuery({
        queryKey: ['home', 'budget-finds'],
        queryFn: async () => {
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-52d68140/home-section/budget`);
            const data = await res.json();
            return data.products || [];
        },
        staleTime: 1000 * 60 * 15,
    });
};

export const useAllProducts = () => {
    return useQuery({
        queryKey: ['products', 'all'],
        queryFn: async () => {
            const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-52d68140/products`, {
                headers: { Authorization: `Bearer ${publicAnonKey}` }
            });
            const data = await res.json();
            return data.products || [];
        },
        staleTime: 1000 * 60 * 30, // 30 mins, heavy call
    });
};
