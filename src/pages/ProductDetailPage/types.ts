export interface Product {
    id: number | string;
    name: string;
    description: string; // HTML string
    price: number;
    comparePrice?: number;
    images?: string[];
    category?: string;
    material?: string;
    layout?: string;
    colors?: string[]; // Array of Hex codes generally
    sizes?: string[]; // e.g. "12X15", "20X24"
    rating?: number;
    reviewsCount?: number;
    subsection?: string; // Critical for pricing logic: '2-set', '3-set', 'acrylic', 'neon' etc.
    isCustomCanvas?: boolean; // If true, show custom size & upload logic
    neon_images_by_color?: Record<string, string>; // { '#hex': 'url' } - NEW from Admin
}

export interface ThumbItem {
    type: 'image' | 'video';
    src: string;
    alt: string;
    id: string; // unique ID for key
    selected: boolean;
    label?: string; // 'Cover', '3D View', etc.
}

export interface PriceRow {
    '12X15'?: number;
    '15X18'?: number;
    '20X24'?: number;
    '24X28'?: number;
    '30X40'?: number;
    '20X30'?: number;
    '18X18'?: number;
    '24X24'?: number;
    '30X30'?: number;
    '12X12'?: number;
    '36X18'?: number;
    '48X24'?: number;
}

export interface AcrylicPriceRow {
    'non-light': number;
    'warm light': number;
    'white light': number;
}

export interface FontMeta {
    label: string;
    family: string;
    uppercase?: boolean;
    letterSpacing?: string;
    outline?: boolean;
}
