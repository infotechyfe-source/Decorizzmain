import { useQuery } from '@tanstack/react-query';
import { projectId, publicAnonKey } from './supabase/info';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    createdAt?: string;
    colors?: string[];
    sizes?: string[];
    roomCategory?: string;
    format?: string;
    layout?: string;
    subsection?: string;
}

interface Testimonial {
    id: string;
    name: string;
    text: string;
    rating: number;
    profileImage?: string;
}

interface VideoItem {
    id: string;
    title: string;
    url: string;
    caption?: string;
    thumbnail?: string;
    productId?: string | null;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

interface HeroImage {
    id: string;
    imageUrl: string;
    imageUrlMobile?: string;
    page?: string;
    linkUrl?: string; // New field for redirection
    active: boolean;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-52d68140`;

// Fetch functions
const fetchProducts = async (): Promise<{ featured: Product[]; newest: Product[]; all: Product[] }> => {
    const res = await fetch(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    const data = await res.json();
    const allProducts: Product[] = data.products || [];
    const featured = allProducts.slice(0, 20);
    const sortedNew = [...allProducts].sort((a: any, b: any) => {
        const ta = a.createdAt || a.created_at ? new Date(a.createdAt || a.created_at).getTime() : 0;
        const tb = b.createdAt || b.created_at ? new Date(b.createdAt || b.created_at).getTime() : 0;
        return tb - ta;
    });
    const newest = sortedNew.slice(0, 20);
    return { featured, newest, all: allProducts };
};

const fetchHomeSectionProducts = async (section: string): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/home-section/${section}`);
    const data = await res.json();
    return data.products || [];
};

const fetchTestimonials = async (): Promise<Testimonial[]> => {
    const res = await fetch(`${API_BASE}/testimonials`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    const data = await res.json();
    return (data.testimonials || []).slice(0, 4);
};

const fetchVideos = async (): Promise<VideoItem[]> => {
    const res = await fetch(`${API_BASE}/videos`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    const data = await res.json();
    const videos = data.videos || data.items || [];
    return videos.slice(0, 10);
};

const fetchFaqs = async (): Promise<FAQ[]> => {
    const res = await fetch(`${API_BASE}/faqs`);
    const data = await res.json();
    return data.faqs || [];
};

const fetchHeroImages = async (page?: string): Promise<HeroImage[]> => {
    const url = page
        ? `${API_BASE}/hero-images?page=${encodeURIComponent(page)}`
        : `${API_BASE}/hero-images`;
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
    });
    const data = await res.json();
    const images = (data.heroImages || []).filter((h: HeroImage) => h.active);

    if (!page) return images;

    // Home Page: Always show home-specific images or unassigned ones
    if (page === 'home') {
        return images.filter(h => h.page === 'home' || !h.page);
    }

    // Other pages (spiritual, lighting, etc.):
    // Strictly filter by the assigned page.
    return images.filter(h => h.page === page);
};

// Custom hooks with React Query
export const useProducts = () => {
    return useQuery({
        queryKey: ['home-products'],
        queryFn: fetchProducts,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    });
};

export const useBestProducts = () => {
    return useQuery({
        queryKey: ['home-section', 'best'],
        queryFn: () => fetchHomeSectionProducts('best'),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export const usePremiumProducts = () => {
    return useQuery({
        queryKey: ['home-section', 'premium'],
        queryFn: () => fetchHomeSectionProducts('premium'),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export const useHomeNewProducts = () => {
    return useQuery({
        queryKey: ['home-section', 'new'],
        queryFn: () => fetchHomeSectionProducts('new'),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export const useBudgetProducts = () => {
    return useQuery({
        queryKey: ['home-section', 'budget'],
        queryFn: () => fetchHomeSectionProducts('budget'),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

export const useTestimonials = () => {
    return useQuery({
        queryKey: ['testimonials'],
        queryFn: fetchTestimonials,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
    });
};

export const useVideos = () => {
    return useQuery({
        queryKey: ['videos'],
        queryFn: fetchVideos,
        staleTime: 10 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
    });
};

export const useFaqs = () => {
    return useQuery({
        queryKey: ['faqs'],
        queryFn: fetchFaqs,
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000,
    });
};

export const useHeroImages = (page?: string) => {
    return useQuery({
        queryKey: ['hero-images', page || 'all'],
        queryFn: () => fetchHeroImages(page),
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

// Combined hook for all homepage data
export const useHomePageData = () => {
    const products = useProducts();
    const bestProducts = useBestProducts();
    const premiumProducts = usePremiumProducts();
    const homeNewProducts = useHomeNewProducts();
    const budgetProducts = useBudgetProducts();
    const testimonials = useTestimonials();
    const videos = useVideos();
    const faqs = useFaqs();
    const heroImages = useHeroImages();

    const isLoading = products.isLoading || bestProducts.isLoading;
    const isFetching = products.isFetching || bestProducts.isFetching ||
        premiumProducts.isFetching || homeNewProducts.isFetching;

    // Extract room images from products
    const roomImages = products.data?.all?.reduce((acc: Record<string, { name: string; image: string }>, p: any) => {
        if (p.roomCategory && p.image && !acc[p.roomCategory]) {
            acc[p.roomCategory] = { name: p.roomCategory, image: p.image };
        }
        return acc;
    }, {}) || {};

    return {
        // Products
        featuredProducts: products.data?.featured || [],
        newProducts: products.data?.newest || [],
        bestProducts: bestProducts.data || [],
        premiumProducts: premiumProducts.data || [],
        homeNewProducts: homeNewProducts.data || [],
        budgetProducts: budgetProducts.data || [],
        roomImages,

        // Other data
        testimonials: testimonials.data || [],
        watchVideos: videos.data || [],
        faqs: faqs.data || [],
        heroImages: heroImages.data || [],

        // Loading states
        isLoading,
        isFetching,
        faqsLoading: faqs.isLoading,

        // Refetch functions
        refetchAll: () => {
            products.refetch();
            bestProducts.refetch();
            premiumProducts.refetch();
            homeNewProducts.refetch();
            budgetProducts.refetch();
            testimonials.refetch();
            videos.refetch();
            faqs.refetch();
            heroImages.refetch();
        },
    };
};
