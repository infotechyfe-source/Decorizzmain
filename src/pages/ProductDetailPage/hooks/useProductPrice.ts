import { BASIC_PRICE, TWOSET_PRICE, THREESET_PRICE, ACRYLIC_RECT_PRICES, ACRYLIC_SQUARE_PRICES } from '../constants/prices';

const normalizeSize = (s?: string) => {
    if (!s) return '';
    const cleaned = s.replace(/\s+/g, '').toUpperCase().replace('×', 'X');
    const parts = cleaned.split('X');
    if (parts.length !== 2) return cleaned;
    return `${parts[0]}X${parts[1]}`;
};

export const computePriceFor = (
    size: string,
    format: 'Rolled' | 'Canvas' | 'Frame',
    subsection?: 'Basic' | '2-Set' | '3-Set' | 'Square' | string
) => {
    const key = normalizeSize(size);
    const table = subsection === '2-Set' ? TWOSET_PRICE : subsection === '3-Set' ? THREESET_PRICE : BASIC_PRICE;
    const row = table[key];
    if (!row) return undefined;
    const value = row[format as keyof typeof row];
    return value === null ? undefined : value ?? undefined;
};

export const calculateCustomPrice = (w: number, h: number, fmt: 'Rolled' | 'Canvas' | 'Frame') => {
    const area = w * h;
    // Approximate formula based on standard sizes
    const rolled = 500 + (1.8 * area);
    const canvas = rolled + (1.2 * area);
    const frame = canvas + (0.4 * area) + 150;

    let final = rolled;
    if (fmt === 'Canvas') final = canvas;
    if (fmt === 'Frame') final = frame;

    return Math.round(final / 10) * 10; // Round to nearest 10
};

export const getAcrylicPrice = (size: string, layout: string, color: string) => {
    const isSquare = layout?.toLowerCase() === 'square' || layout?.toLowerCase() === 'circle';
    const table = isSquare ? ACRYLIC_SQUARE_PRICES : ACRYLIC_RECT_PRICES;
    const sizeKey = normalizeSize(size);

    if (table[sizeKey]) {
        const colorKey = (color || 'non-light').toLowerCase();
        let p = table[sizeKey]['non-light'];
        if (colorKey.includes('warm')) p = table[sizeKey]['warm light'];
        else if (colorKey.includes('white')) p = table[sizeKey]['white light'];
        return p;
    }
    return null;
};
