
export const NEON_RATES = {
  NORMAL: 13,
  RGB: 17
};

export const NEON_LANDSCAPE_SIZES = [
  { width: 30, height: 8, label: '8" x 30"' },
  { width: 40, height: 10, label: '10" x 40"' },
  { width: 36, height: 12, label: '12" x 36"' },
  { width: 48, height: 12, label: '12" x 48"' },
  { width: 64, height: 16, label: '16" x 64"' },
];

export const NEON_SQUARE_SIZES = [
  { width: 12, height: 12, label: '12" x 12"' },
  { width: 15, height: 15, label: '15" x 15"' },
  { width: 18, height: 18, label: '18" x 18"' },
  { width: 24, height: 24, label: '24" x 24"' },
  { width: 30, height: 30, label: '30" x 30"' },
];

export const CANVAS_SQUARE_SIZES = [
  { width: 12, height: 12, label: '12" x 12"' },
  { width: 16, height: 16, label: '16" x 16"' },
  { width: 20, height: 20, label: '20" x 20"' },
  { width: 24, height: 24, label: '24" x 24"' },
  { width: 30, height: 30, label: '30" x 30"' },
  { width: 36, height: 36, label: '36" x 36"' },
];

export const CANVAS_LANDSCAPE_SIZES = [
  { width: 18, height: 12, label: '18" x 12"' },
  { width: 24, height: 16, label: '24" x 16"' },
  { width: 30, height: 20, label: '30" x 20"' },
  { width: 36, height: 24, label: '36" x 24"' },
  { width: 40, height: 30, label: '40" x 30"' },
  { width: 48, height: 32, label: '48" x 32"' },
];

export const CANVAS_PORTRAIT_SIZES = [
  { width: 12, height: 18, label: '12" x 18"' },
  { width: 16, height: 24, label: '16" x 24"' },
  { width: 20, height: 30, label: '20" x 30"' },
  { width: 24, height: 36, label: '24" x 36"' },
  { width: 30, height: 40, label: '30" x 40"' },
  { width: 32, height: 48, label: '32" x 48"' },
];

export const NEON_PRICE: Record<string, number> = {
  '12': 1999, '18': 2565, '24': 3499, '30': 4499, '36': 5599, '48': 7999,
  // New combined keys or keep logic in component
};

export const FONTS_META: { label: string; family: string; uppercase?: boolean; letterSpacing?: string; outline?: boolean }[] = [
  { label: 'Signature', family: '"Great Vibes", cursive' },
  { label: 'Barcelona', family: '"Pacifico", cursive' },
  { label: 'Sorrento', family: '"Lobster", cursive' },
  { label: 'MONACO', family: '"Bebas Neue", sans-serif', uppercase: true },
  { label: 'Melbourne', family: '"Montserrat", sans-serif' },
  { label: 'NeoTokyo', family: '"Poppins", sans-serif' },
  { label: 'NEON', family: '"Bebas Neue", sans-serif', uppercase: true, letterSpacing: '0.12em' },
  { label: 'WAIKIKI', family: '"Montserrat", sans-serif', uppercase: true, letterSpacing: '0.08em' },
  { label: 'Typewriter', family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  { label: 'NEONTRACE', family: '"Bebas Neue", sans-serif', uppercase: true, outline: true },
  { label: 'NeonGlow', family: '"Montserrat", sans-serif' },
  { label: 'LOVENEON', family: '"Bebas Neue", sans-serif', uppercase: true, outline: true },
  { label: 'OUTLINE', family: '"Bebas Neue", sans-serif', uppercase: true, outline: true },
  { label: 'Beachfront', family: '"Sacramento", cursive' },
  { label: 'Vintage', family: '"Playfair Display", serif' },
  { label: 'Brighter', family: '"Dancing Script", cursive' },
  { label: 'Capetown', family: '"Kaushan Script", cursive' },
  { label: 'Demetors', family: '"Caveat", cursive' },
  { label: 'Paul Grotesk', family: '"Montserrat", sans-serif' },
  { label: 'Retroslogy', family: '"Lobster", cursive' },
];

export const NEON_SWATCHES = ['#ffffff',
                          '#faf9f6', // Ice White
                          '#fff700', //Yellow
                          '#ff9f00', //Orange
                          '#ff1a1a', //Red
                          '#FF2ec4', //Pink
                          '#f425ee' , //Purple
                          '#39ff14', // Green
                          '#00e5ff', //Cyan
                          '#1e4bff' //Blue
                        ];
