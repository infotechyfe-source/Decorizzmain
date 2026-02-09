export const BASIC_PRICE: Record<string, { Rolled: number | null; Canvas: number | null; Frame: number | null }> = {
    '8X12': { Rolled: 679, Canvas: 800, Frame: 999 },
    '12X18': { Rolled: 879, Canvas: 1100, Frame: 1299 },
    '18X24': { Rolled: 1280, Canvas: 1699, Frame: 1799 },
    '20X30': { Rolled: 1780, Canvas: 2599, Frame: 2799 },
    '24X36': { Rolled: 1999, Canvas: 2999, Frame: 3299 },
    '30X40': { Rolled: 2899, Canvas: 4699, Frame: 5199 },
    '36X48': { Rolled: 3500, Canvas: 5799, Frame: 6499 },
    '48X66': { Rolled: 5879, Canvas: 9430, Frame: null },
    '18X18': { Rolled: 1199, Canvas: 1699, Frame: 1899 },
    '24X24': { Rolled: 1599, Canvas: 2299, Frame: 2499 },
    '36X36': { Rolled: 3199, Canvas: 4599, Frame: 4999 },
    '20X20': { Rolled: 1299, Canvas: 1899, Frame: 1999 },
    '30X30': { Rolled: 2199, Canvas: 3199, Frame: 3499 },
    '36X18': { Rolled: 1880, Canvas: 2699, Frame: 2899 },
    '48X24': { Rolled: 2799, Canvas: 3299, Frame: 3599 },
};

export const TWOSET_PRICE: Record<string, { Rolled: number | null; Canvas: number | null; Frame: number | null }> = {
    '8X12': { Rolled: 1299, Canvas: 1599, Frame: 1999 },
    '12X18': { Rolled: 1699, Canvas: 2199, Frame: 2499 },
    '18X24': { Rolled: 2499, Canvas: 3399, Frame: 3599 },
    '20X30': { Rolled: 3499, Canvas: 5199, Frame: 5599 },
    '24X36': { Rolled: 3899, Canvas: 5999, Frame: 6599 },
    '30X40': { Rolled: 5799, Canvas: 9399, Frame: 10399 },
    '36X48': { Rolled: 6999, Canvas: 11599, Frame: 12999 },
    '48X66': { Rolled: 11799, Canvas: 18899, Frame: null },
};

export const THREESET_PRICE: Record<string, { Rolled: number | null; Canvas: number | null; Frame: number | null }> = {
    '8X12': { Rolled: 2099, Canvas: 2499, Frame: 2999 },
    '12X18': { Rolled: 2699, Canvas: 3399, Frame: 3899 },
    '18X24': { Rolled: 3899, Canvas: 5099, Frame: 5399 },
    '20X30': { Rolled: 5399, Canvas: 7799, Frame: 8399 },
    '24X36': { Rolled: 6999, Canvas: 8899, Frame: 9599 },
    '30X40': { Rolled: 8699, Canvas: 14099, Frame: 15559 },
    '36X48': { Rolled: 10599, Canvas: 17399, Frame: 19499 },
    '48X66': { Rolled: 17699, Canvas: 28299, Frame: null },
};

export const ACRYLIC_RECT_PRICES: Record<string, { 'non-light': number; 'warm light': number; 'white light': number }> = {
    '12X15': { 'non-light': 1599, 'warm light': 2699, 'white light': 2699 },
    '15X18': { 'non-light': 2699, 'warm light': 3799, 'white light': 3799 },
    '20X24': { 'non-light': 3699, 'warm light': 4799, 'white light': 4799 },
    '24X28': { 'non-light': 5599, 'warm light': 6699, 'white light': 6699 },
};

export const ACRYLIC_SQUARE_PRICES: Record<string, { 'non-light': number; 'warm light': number; 'white light': number }> = {
    '12X12': { 'non-light': 1299, 'warm light': 2399, 'white light': 2399 },
    '18X18': { 'non-light': 2899, 'warm light': 3999, 'white light': 3999 },
    '24X24': { 'non-light': 3899, 'warm light': 4999, 'white light': 4999 },
    '30X30': { 'non-light': 5899, 'warm light': 6999, 'white light': 6999 },
};

export const NEON_PRICE: Record<'12' | '18' | '24' | '30' | '36' | '48', number> = {
    '12': 1999,
    '18': 2565,
    '24': 3499,
    '30': 4499,
    '36': 5599,
    '48': 7999
};
