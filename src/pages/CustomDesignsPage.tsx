import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import SkeletonProductCard from '../components/SkeletonProductCard';
import { Filter, X, ChevronDown, ArrowRight, Sparkles, Upload, MousePointerClick, Truck, ShieldCheck, Award } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { MobileFilterSheet } from '../components/MobileFilterSheet';
import { useHeroImages } from '../utils/useHomePageData';
import { HeroCarousel } from '../components/HeroCarousel';
import { useCategoryImages } from '../utils/useCategoryImages';
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { optimizeImage } from "../utils/optimizeImage";

import SquareImg from '../assets/squre.jpeg';
import CircleImg from '../assets/circle.jpeg';
import LandscapeImg from '../assets/landscape.jpeg';
import PortraitImg from '../assets/verticalsize.jpg';
import GokuImg from '../assets/goku.webp';
import PickaImg from '../assets/picka.webp';

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" }
];

// Categories for Custom Designs
const CUSTOM_CATEGORIES = [
  'Custom Round',
  'Custom Square',
  'Custom Portrait',
  'Custom Landscape',
  'Custom Acrylic',
  'Wings' // Fallback for Neon
];

const LAYOUT_OPTIONS = ['Portrait', 'Square', 'Landscape', 'Circle', 'Neon'];

function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative sort-dropdown z-40">
      <button
        className="border px-4 py-2 rounded-xl font-medium w-full flex items-center justify-between cursor-pointer"
        style={{
          borderColor: '#d1d5db',
          backgroundColor: '#ffffff',
          color: '#374151'
        }}
        onClick={() => setOpen(!open)}
      >
        {SORT_OPTIONS.find(o => o.value === value)?.label}
        <ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-full rounded-xl shadow-2xl overflow-hidden animate-fadeIn backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #f3f4f6'
          }}
        >
          <div className="py-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="flex items-center justify-between w-full px-6 py-2 text-sm text-left transition-colors duration-150"
                style={{
                  backgroundColor: value === opt.value ? '#f0fdfa' : 'transparent',
                  color: value === opt.value ? '#14b8a6' : '#374151',
                  fontWeight: value === opt.value ? 600 : 400
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#14b8a6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#374151';
                  }
                }}
              >
                <span className="whitespace-nowrap">{opt.label}</span>
                {value === opt.value && (
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  categories?: string[];
  sizes?: string[];
  colors?: string[];
  material?: string;

  layout?: string;
  createdAt?: string;
  subsection?: '2-Set' | '3-Set' | 'Square';
  format?: 'Rolled' | 'Canvas' | 'Frame';
  frameColor?: 'White' | 'Black' | 'Brown';
}

export default function CustomDesignsPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const shuffledProducts = useMemo(() => shuffleArray(products), [products]);

  // Reusing acrylic hero images for now or generic if needed, can change later
  const { data: heroImages, isLoading: heroLoading } = useHeroImages('custom');
  const { getImage } = useCategoryImages();

  const [filters, setFilters] = useState({
    categories: [] as string[],
    layouts: [] as string[],
    priceMin: 0,
    priceMax: 10000,
    sortBy: 'popular',
  });

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    layout: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section as keyof typeof prev]: !prev[section as keyof typeof prev]
    }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = (typeof window !== 'undefined' && window.innerWidth < 640) ? 8 : 12;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category && CUSTOM_CATEGORIES.includes(category)) {
      setFilters(prev => ({ ...prev, categories: [category] }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/products`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await res.json();

      const filtered = (data.products || []).filter((p: Product) => {
        const productCategories = p.categories && p.categories.length > 0
          ? p.categories
          : (p.category ? [p.category] : []);
        // Include if matches custom categories OR if it's a "Custom" type product generally
        return productCategories.some(cat => CUSTOM_CATEGORIES.includes(cat)) ||
          p.name.toLowerCase().startsWith('custom');
      });
      setProducts(filtered);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = {};
    products.forEach(p => {
      const productCategories = p.categories && p.categories.length > 0
        ? p.categories
        : (p.category ? [p.category] : []);

      productCategories.forEach(cat => {
        if (CUSTOM_CATEGORIES.includes(cat)) {
          counts[cat] = (counts[cat] || 0) + 1;
        }
      });
    });
    return counts;
  };
  const categoryCounts = useMemo(() => getCategoryCounts(), [products]);

  const toggleFilter = (filterType: string, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType as keyof typeof prev] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterType]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      layouts: [],
      priceMin: 0,
      priceMax: 10000,
      sortBy: 'popular',
    });
  };

  const filteredProducts = useMemo(() => {
    let result = [...shuffledProducts];

    if (filters.categories.length > 0) {
      result = result.filter(p => {
        const productCategories = p.categories && p.categories.length > 0
          ? p.categories
          : (p.category ? [p.category] : []);
        return productCategories.some(cat => filters.categories.includes(cat));
      });
    }

    if (filters.layouts.length > 0) {
      result = result.filter(p =>
        filters.layouts.includes(p.layout || '') ||
        filters.layouts.includes(p.subsection || '')
      );
    }

    result = result.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);

    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [shuffledProducts, filters]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, currentPage * PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setCurrentPage((p) => {
          const next = p + 1;
          const maxPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
          return next <= maxPages ? next : p;
        });
      }
    }, { root: null, rootMargin: '200px', threshold: 0.01 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredProducts.length, PAGE_SIZE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleCategoryClick = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: [category],
      layouts: []
    }));
  };

  return (
    <div className="min-h-screen content-offset premium-bg">
      <Navbar />
      <HeroCarousel images={heroImages || []} loading={heroLoading} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Custom Categories Section */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="section-title-themed font-extrabold mb-3 inline-block">
              <span className="text-brand">Design</span>
              <span className="text-accent"> Your Own</span>
            </h2>
            <p className="section-subtitle">Choose a style to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: 'Round Canvas',
                to: '/product/custom/custom-print-round-canvas-wall-art',
                image: CircleImg,
                badge: 'Modern',
                desc: 'Unique circular canvas for a modern aesthetic.',
                cta: 'Customize Round'
              },
              {
                name: 'Square Canvas',
                to: '/product/custom/custom-print-square-canvas-wall-art',
                image: SquareImg,
                badge: 'Balanced',
                desc: 'Perfectly symmetrical for a clean look.',
                cta: 'Customize Square'
              },
              {
                name: 'Portrait Canvas',
                to: '/product/custom/custom-print-portrait-canvas-wall-art',
                image: PortraitImg,
                badge: 'Classic',
                desc: 'Ideal for tall photos and artwork.',
                cta: 'Customize Portrait'
              },
              {
                name: 'Landscape Canvas',
                to: '/product/custom/custom-print-landscape-canvas-wall-art',
                image: LandscapeImg,
                badge: 'Panoramic',
                desc: 'Wide format for scenic and group shots.',
                cta: 'Customize Landscape'
              },
              {
                name: 'Custom Neon Sign',
                to: '/product/custom/custom-name-neon-signs-lights',
                image: PickaImg,
                badge: 'Vibrant',
                desc: 'Bright customizable neon for any mood.',
                cta: 'Design Neon'
              },
              {
                name: 'Custom Acrylic',
                to: '/product/custom/custom-acrylic-artwork',
                image: GokuImg,
                badge: 'Premium',
                desc: 'Sleek, glass-like finish with depth.',
                cta: 'Design Acrylic'
              },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="collection-card home-card"
              >
                <ImageWithFallback
                  src={optimizeImage(item.image, 800)}
                  alt={item.name}
                  className="collection-card-bg"
                  loading="lazy"
                  decoding="async"
                />
                <div className="collection-card-content">
                  <span className="collection-badge">{item.badge}</span>
                  <span className="collection-title">{item.name}</span>
                  <span className="collection-desc">{item.desc}</span>
                  <div className="collection-cta">
                    {item.cta} <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Create your masterpiece in 3 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="p-6 rounded-2xl bg-gray-50/50">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">1. Choose Your Style</h3>
              <p className="text-gray-500">Select from our premium range of canvas, acrylic, or neon formats.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50/50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                <ArrowRight size={32} className="rotate-[-45deg]" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">2. Customize It</h3>
              <p className="text-gray-500">Upload your photo, adjust layouts, and pick your perfect size.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50/50">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">3. We Create & Ship</h3>
              <p className="text-gray-500">We print with archival quality and ship safely to your doorstep.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile-only Filter Sheet */}
      <MobileFilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={() => setShowFilters(false)}
        sortBy={filters.sortBy}
        onSortChange={(val) => setFilters(prev => ({ ...prev, sortBy: val }))}

        categories={CUSTOM_CATEGORIES}
        selectedCategories={filters.categories}
        onToggleCategory={(cat) => toggleFilter('categories', cat)}
        priceMin={filters.priceMin}
        priceMax={filters.priceMax}
        onPriceRangeChange={(min, max) => setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }))}
        priceBounds={{ min: 0, max: 10000 }}
      />

      <Footer />
    </div>
  );
}
