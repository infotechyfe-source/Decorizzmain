import React, { useEffect, useState, useContext, useMemo, useRef, Suspense, lazy } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingCart, Truck, Package, Lock, CheckSquare, CircleHelp, RotateCcw, FileText, ChevronDown, CheckCircle, Star, Share2, Copy, Home, ChevronRight, ChevronLeft, Info, Upload, Box, Clock } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
// Lazy load heavier component
const ProductReviews = lazy(() => import('../components/ProductReviews').then(m => ({ default: m.ProductReviews })));
import { AuthContext } from '../context/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { cartEvents } from '../utils/cartEvents';
import { wishlistEvents } from '../utils/wishlistEvents';
import { supabase } from '../utils/supabase/client';
import { optimizeImage } from "../utils/optimizeImage";
import LazyShow from "../components/LazyShow";
import CardBoard from "../assets/7th.jpeg";
import Frame from "../assets/8th.jpeg";
import Bubble from "../assets/9th.jpeg";
import LandscapeImg from "../assets/landscape.jpeg";
import SquareImg from "../assets/squre.jpeg";
import VerticalImg from "../assets/verticalsize.jpg";
import CircleImg from "../assets/circle.jpeg";
import BackImage from "../assets/back.jpg";
import ViratImg from "../assets/virat.jpg";
import { FloatingProductVideo } from '../components/FloatingProductVideo';
import { NeonProductDesigner } from '../components/NeonProductDesigner';
import { AcrylicProductDesigner } from '../components/AcrylicProductDesigner';
import { CanvasProductDesigner } from '../components/CanvasProductDesigner';
import { SmoothImage } from '../components/SmoothImage';
import { NEON_PRICE, FONTS_META, NEON_RATES, NEON_LANDSCAPE_SIZES, NEON_SQUARE_SIZES } from '../utils/neonConstants';
import logo from '../assets/logo-r.png';
import { useProduct, useBestSellers, useBudgetFinds, useAllProducts } from '../hooks/useProducts';
import NeonProductDetails from "@/components/NeonProductDetails";

export default function ProductDetailPage() {
  const { id, category: categoryParam, name: nameParam } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useContext(AuthContext);
  const [product, setProduct] = useState<any>(null);
  const [relatedStart, setRelatedStart] = useState(0);
  const [bestStart, setBestStart] = useState(0);
  const [budgetStart, setBudgetStart] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const bestScrollRef = useRef<HTMLDivElement>(null);
  const budgetScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id, nameParam]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'Rolled' | 'Canvas' | 'Frame'>('Rolled');
  const [selectedFrameColor, setSelectedFrameColor] = useState<'White' | 'Black' | 'Brown'>('Black');
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState<string>('50% 50%');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Track if user manually selected an image (to prevent auto-override)
  const userSelectedRef = useRef(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [customFile, setCustomFile] = useState<{ name: string; dataUrl: string } | null>(null);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [selectedArtStyle, setSelectedArtStyle] = useState<string>('Fantasy Painting');

  // Custom Size State
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customWidth, setCustomWidth] = useState(24);
  const [customHeight, setCustomHeight] = useState(36);

  const islighting = useMemo(() => {
    // 1. Priority: Check product data category and layout
    const pCat = (product?.category || '').toLowerCase();
    const pLayout = (product?.layout || '').toLowerCase();

    // Check for explicit neon signals in data
    // Check for explicit neon signals in data
    const hasNeonImages = (product?.neon_images_by_color && Object.keys(product.neon_images_by_color).length > 0) ||
      (product?.neonImagesByColor && Object.keys(product.neonImagesByColor).length > 0);
    const isNeonMaterial = (product?.material || '').toLowerCase().includes('neon');

    // Explicitly exclude non-lighting categories even if URL says 'lighting'
    if (pCat.includes('spiritual') || pCat.includes('shiv') || pCat.includes('god') || pCat.includes('canvas')) {
      // Allow only if layout explicitly overrides with neon AND we define what override means
      // If it really has neon images, we should treat it as neon
      if (!pLayout.includes('neon') && !pLayout.includes('light') && !hasNeonImages && !isNeonMaterial) return false;
    }

    if (nameParam === 'custom-name-neon-signs-lights') return true;
    if (hasNeonImages || isNeonMaterial) return true;
    if (pLayout.includes('neon') || pLayout === 'lighting') return true;
    if (pCat.includes('neon') || pCat.includes('lighting')) return true;
    if (categoryParam === 'lighting') return true;

    return false;
  }, [categoryParam, nameParam, product]);

  const isNeon = useMemo(() => {
    return nameParam === 'custom-name-neon-signs-lights';
  }, [nameParam]);
  const isCustomAcrylic = nameParam === 'custom-acrylic-artwork';

  const isAcrylic = useMemo(() => categoryParam === 'acrylic' ||
    String(product?.material || '').toLowerCase().includes('acrylic') ||
    String(product?.layout || '').toLowerCase() === 'acrylic', [categoryParam, product?.material, product?.layout]);

  const [neonOn, setNeonOn] = useState(true);
  const [neonText, setNeonText] = useState('Text');
  const [neonSize, setNeonSize] = useState<string>('24');
  const [neonSizeLabel, setNeonSizeLabel] = useState('8" x 30"');
  const [neonLightMode, setNeonLightMode] = useState<'NORMAL' | 'RGB'>('NORMAL');
  const [neonWidth, setNeonWidth] = useState(30);
  const [neonHeight, setNeonHeight] = useState(0);
  const [neonFont, setNeonFont] = useState('');
  const [neonColor, setNeonColor] = useState('#ffffff');
  const [neonBackboard, setNeonBackboard] = useState('Rectangle');
  const [neonFontOpen, setNeonFontOpen] = useState(false);
  const [neonSizeOpen, setNeonSizeOpen] = useState(false);
  const [neonBackboardOpen, setNeonBackboardOpen] = useState(false);

  const neonPrice = useMemo(() => {
    const rate = neonLightMode === 'RGB' ? NEON_RATES.RGB : NEON_RATES.NORMAL;
    // Check if it's one of the predefined sizes first
    const predefined = [...NEON_LANDSCAPE_SIZES, ...NEON_SQUARE_SIZES].find(s => s.label === neonSizeLabel);
    if (predefined) {
      return predefined.width * predefined.height * rate;
    }
    // Handle custom sizes or old system
    return neonWidth * neonHeight * rate;
  }, [neonSizeLabel, neonLightMode, neonWidth, neonHeight]);
  const [pop, setPop] = useState(false);


  const generateNeonPreview = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 520;
    const ctx = canvas.getContext('2d')!;
    const bg = new Image();
    bg.src = BackImage as any;
    await new Promise<void>((resolve) => { bg.onload = () => resolve(); });
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const rectW = Math.floor(canvas.width * 0.6);
    const rectH = 120;
    const rectX = Math.floor((canvas.width - rectW) / 2);
    const rectY = Math.floor((canvas.height - rectH) / 2);
    ctx.strokeStyle = neonColor;
    ctx.lineWidth = 3;
    ctx.setLineDash(neonBackboard === 'Cut to shape' ? [8, 6] : []);
    ctx.strokeRect(rectX, rectY, rectW, rectH);
    ctx.setLineDash([]);
    const meta = FONTS_META.find(m => m.label === neonFont);
    const fam = (meta?.family || 'cursive').replace(/"/g, '')
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `64px ${fam}`;
    if (meta?.outline) {
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 2;
      ctx.strokeText(neonText, canvas.width / 2, canvas.height / 2);
      if (neonOn) { ctx.shadowColor = neonColor; ctx.shadowBlur = 18; }
      ctx.fillStyle = neonOn ? 'transparent' : '#9ca3af';
      ctx.fillText(neonText, canvas.width / 2, canvas.height / 2);
    } else {
      if (neonOn) { ctx.shadowColor = neonColor; ctx.shadowBlur = 18; }
      ctx.fillStyle = neonOn ? neonColor : '#9ca3af';
      ctx.fillText(neonText, canvas.width / 2, canvas.height / 2);
    }
    return canvas.toDataURL('image/png');
  };

  const imageContainerRef = useRef(null);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const touchXRef = useRef<number | null>(null);
  const mainImageTouchRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Main image swipe handlers for mobile
  const handleMainImageTouchStart = (e: React.TouchEvent) => {
    mainImageTouchRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleMainImageTouchEnd = (e: React.TouchEvent) => {
    const startX = mainImageTouchRef.current;
    const endX = e.changedTouches[0]?.clientX ?? null;
    mainImageTouchRef.current = null;

    if (startX !== null && endX !== null) {
      const diff = startX - endX;
      // Swipe threshold of 50px
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swiped left -> next image
          handleArrow('right');
        } else {
          // Swiped right -> previous image
          handleArrow('left');
        }
      }
    }
  };
  const scrollThumbs = (dir: 'left' | 'right') => {
    const el = thumbStripRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const itemWidth = firstChild?.offsetWidth ?? 80;
    const gap = parseFloat(getComputedStyle(el).gap || '12') || 12;
    const step = itemWidth + gap;
    const perPage = Math.max(1, Math.floor(el.clientWidth / step));
    const pageAmount = perPage * step - gap;
    el.scrollBy({ left: dir === 'right' ? pageAmount : -pageAmount, behavior: 'smooth' });
  };
  // Thumb wheel scroll handled via native event listener (see useEffect below)
  const updateThumbScrollState = () => {
    const el = thumbStripRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    const hasOverflow = el.scrollWidth > el.clientWidth + 2;
    if (hasOverflow) {
      setCanScrollLeft(left > 2);
      setCanScrollRight(left < maxScroll - 2);
    } else {
      const idx = selectedIndex;
      setCanScrollLeft(idx > 0);
      setCanScrollRight(idx < Math.max(0, thumbItems.length - 1));
    }
  };
  const handleThumbTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchXRef.current = e.touches[0]?.clientX ?? null;
  };
  const handleThumbTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = thumbStripRef.current;
    if (!el) return;
    const prev = touchXRef.current;
    const cur = e.touches[0]?.clientX ?? null;
    if (prev != null && cur != null) {
      const dx = prev - cur;
      el.scrollBy({ left: dx, behavior: 'instant' as ScrollBehavior });
      touchXRef.current = cur;
    }
  };
  const handleThumbTouchEnd = () => {
    touchXRef.current = null;
  };
  const handleThumbClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = thumbStripRef.current;
    if (!el) return;
    const target = (e.target as HTMLElement).closest('.thumb-item') as HTMLElement | null;
    if (!target || !el.contains(target)) return;
    const idx = Array.prototype.indexOf.call(el.children, target);
    const child = el.children[idx] as HTMLElement | undefined;
    if (child) {
      const centerLeft = child.offsetLeft - el.clientWidth / 2 + child.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, centerLeft), behavior: 'smooth' });
    }
  };
  const handleThumbKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleArrow('right');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleArrow('left');
    }
  };

  useEffect(() => {
    const el = thumbStripRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: 'smooth' });
    updateThumbScrollState();
  }, [selectedFormat, selectedColor]);

  const neonImageMap = useMemo(() => {
    const map: Record<string, string> = {};

    if (!product || !product.neon_images_by_color) return map;

    Object.entries(product.neon_images_by_color).forEach(([hex, url]) => {
      map[hex.toLowerCase().trim()] = url as string;
    });

    return map;
  }, [product]);

  const activeImage = useMemo(() => {
    if (selectedImage) return selectedImage;

    const lowerColor = (selectedColor || '').toLowerCase();

    // 1. Acrylic specific lighting variations
    const acrylicVariationImages = product?.acrylic_images_by_light || product?.acrylicImagesByLight;
    if (isAcrylic && acrylicVariationImages) {
      const mapping: Record<string, string> = {
        'without-light': 'withoutLight',
        'warm light': 'warmLight',
        'white light': 'whiteLight'
      };
      const key = mapping[lowerColor];
      if (key && acrylicVariationImages[key]) return acrylicVariationImages[key];
    }

    // 2. Neon/Lighting products
    if (islighting && neonImageMap[lowerColor]) {
      return neonImageMap[lowerColor];
    }

    // 2. Regular Products (Check imagesByColor for format or specific frame color)
    if (product?.imagesByColor) {
      const keys = Object.keys(product.imagesByColor);

      // A. Match specific formats (Canvas, Rolled) - check this first
      const foundFormatKey = keys.find(k => k.toLowerCase() === selectedFormat.toLowerCase());
      if (foundFormatKey) return product.imagesByColor[foundFormatKey];

      // B. Match specific frame colors (Black, White, Brown)
      if (selectedFormat === 'Frame') {
        const foundColorKey = keys.find(k => k.toLowerCase() === lowerColor);
        if (foundColorKey) return product.imagesByColor[foundColorKey];
      }
    }

    return product?.image || "";
  }, [selectedImage, selectedColor, selectedFormat, islighting, isAcrylic, product, neonImageMap]);

  const thumbItems = useMemo(() => {
    const items: Array<{ src: string; alt: string; onClick: () => void; selected: boolean; label?: string }> = [];
    if (!product) return items;
    items.push({
      src: product.image,
      alt: product?.name || 'Product',
      onClick: () => { userSelectedRef.current = true; setSelectedImage(product.image); },
      selected: activeImage === product.image || selectedImage === product.image,
    });
    if (product.imagesByColor) {
      const orderedColors = ['White', 'Black', 'Brown'];
      orderedColors.forEach((color) => {
        const url = product.imagesByColor[color];
        if (url) {
          items.push({
            src: url,
            alt: color,
            onClick: () => {
              userSelectedRef.current = true;
              setSelectedFormat('Frame');
              setSelectedImage(url);
              setSelectedColor(color.toLowerCase());
            },
            selected: activeImage === url || selectedImage === url,
          });
        }
      });
    }
    if (product.extraImages?.length) {
      product.extraImages.forEach((img: string, index: number) => {
        items.push({
          src: img,
          alt: `Product image ${index + 1} `,
          onClick: () => { userSelectedRef.current = true; setSelectedImage(img); },
          selected: activeImage === img || selectedImage === img,
        });
      });
    }

    // 1. Add Acrylic specific images as thumbnails
    const acrylicVariationImages = product.acrylic_images_by_light || product.acrylicImagesByLight;
    if (isAcrylic && acrylicVariationImages) {
      Object.entries(acrylicVariationImages).forEach(([lightType, url]) => {
        if (url) {
          let label = 'Without-light';
          let colorVal = 'Without-light';
          if (lightType === 'warmLight') { label = 'Warm Light'; colorVal = 'warm light'; }
          if (lightType === 'whiteLight') { label = 'White Light'; colorVal = 'white light'; }

          items.push({
            src: url as string,
            alt: label,
            label: label,
            onClick: () => {
              userSelectedRef.current = true;
              setSelectedImage(url as string);
              setSelectedColor(colorVal);
            },
            selected: activeImage === url || selectedImage === url,
          });
        }
      });
    }

    // // 2. Add Lighting specific images as thumbnails
    // const neonVariationImages = product.neon_images_by_color || product.neonImagesByColor;
    // if (islighting && neonVariationImages) {
    //   Object.entries(neonVariationImages).forEach(([hex, url]) => {
    //     if (url) {
    //       items.push({
    //         src: url as string,
    //         alt: `Color ${hex}`,
    //         onClick: () => {
    //           userSelectedRef.current = true;
    //           setSelectedImage(url as string);
    //           setSelectedColor(hex);
    //         },
    //         selected: activeImage === url || selectedImage === url,
    //       });
    //     }
    //   });
    // }

    let layoutImage = VerticalImg; // Default to vertical image
    if (product.layout) {
      const lower = product.layout.toLowerCase();
      if (lower === "landscape") layoutImage = LandscapeImg;
      else if (lower === "square") layoutImage = SquareImg;
      else if (lower === "circle") layoutImage = CircleImg;
      else if (lower === "portrait") layoutImage = VerticalImg;
    }

    // Skip layout image and material images for custom canvas products AND acrylic products AND lighting products
    if (!product.isCustomCanvas && !isAcrylic && !islighting) {
      items.push({
        src: layoutImage,
        alt: 'Frame Size Guide',
        onClick: () => { userSelectedRef.current = true; setSelectedImage(layoutImage); },
        selected: activeImage === layoutImage || selectedImage === layoutImage,
      });
    }

    // Skip guide images for acrylic and lighting
    if (!isAcrylic && !islighting && product.layout?.toLowerCase() !== 'circle') {
      const materialLabel =
        selectedFormat === 'Canvas'
          ? 'Canvas Material'
          : selectedFormat === 'Rolled'
            ? 'Rolled Material'
            : 'Frame Material';
      [Frame, CardBoard, Bubble].forEach((src) => {
        items.push({
          src,
          alt: materialLabel,
          onClick: () => { userSelectedRef.current = true; setSelectedImage(src); },
          selected: activeImage === src || selectedImage === src,
        });
      });
    }

    return items;
  }, [product, selectedImage, activeImage, selectedFormat, selectedColor, isAcrylic]);

  const optimizedThumbItems = useMemo(() => {
    return thumbItems.map((i) => ({ ...i, src: optimizeImage(i.src, 160) }));
  }, [thumbItems]);

  const selectedIndex = useMemo(() => {
    const idx = thumbItems.findIndex((i) => i.selected);
    return idx >= 0 ? idx : 0;
  }, [thumbItems]);

  const selectByIndex = (idx: number) => {
    if (!thumbItems.length) return;
    const safeIdx = ((idx % thumbItems.length) + thumbItems.length) % thumbItems.length;
    const item = thumbItems[safeIdx];
    if (item) {
      item.onClick();
    }
  };

  const handleArrow = (dir: 'left' | 'right') => {
    if (!thumbItems.length) return;
    let nextIdx = dir === 'left' ? selectedIndex - 1 : selectedIndex + 1;
    // Loop around
    if (nextIdx < 0) nextIdx = thumbItems.length - 1;
    if (nextIdx >= thumbItems.length) nextIdx = 0;
    selectByIndex(nextIdx);
  };

  useEffect(() => {
    updateThumbScrollState();
  }, [selectedIndex, thumbItems.length]);

  // Native wheel listener for thumbs - ONLY on desktop (mobile has touch scroll)
  useEffect(() => {
    // Skip on mobile/touch devices to prevent scroll jank
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const el = thumbStripRef.current;
    if (!el) return;
    const handleThumbWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: 'auto' }); // Changed from 'smooth' to 'auto' for better performance
      }
    };
    el.addEventListener('wheel', handleThumbWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleThumbWheel);
  }, []);

  const toggleZoom = () => {
    setZoom((prev) => (prev > 1 ? 1 : 2.5));
  };

  const updateOriginFromPoint = (clientX: number, clientY: number) => {
    const el = imageContainerRef.current as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setOrigin(`${xPct}% ${yPct}% `);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        document.querySelectorAll(".protect-image").forEach(el => {
          el.classList.add("screenshot");
          setTimeout(() => el.classList.remove("screenshot"), 1500);
        });
      }
    };

    window.addEventListener("keyup", handler);
    return () => window.removeEventListener("keyup", handler);
  }, []);


  // Reset user selection flag when navigating to a new product
  useEffect(() => {
    userSelectedRef.current = false;
    setSelectedImage(null);
  }, [id, nameParam]);

  // --- REACT QUERY INTEGRATION ---
  const { data: productData, isLoading: productLoading } = useProduct(id, nameParam);
  const { data: allProducts = [] } = useAllProducts();
  const { data: bestSellers = [] } = useBestSellers();
  const { data: budgetFinds = [] } = useBudgetFinds();

  useEffect(() => {
    if (productData) {
      const p = { ...productData };
      const effectiveSizes = p.layout?.toLowerCase() === 'landscape' ? ['36X18', '48X24', '20X30', '30X40'] : p.sizes || [];
      let autoSize = effectiveSizes.length > 0 ? effectiveSizes[0] : "";
      let autoColor = p.colors?.[0] || "";

      const isAcrylicProduct = categoryParam === 'acrylic' ||
        String(p.material || '').toLowerCase().includes('acrylic') ||
        String(p.layout || '').toLowerCase() === 'acrylic';

      if (isAcrylicProduct) {
        const layout = (p.layout || '').toLowerCase();
        const isSquare = layout === 'square' || layout === 'circle';
        // Default to the first size in our predetermined list
        autoSize = isSquare ? '12X12' : '12X15';
        autoColor = 'Without-light';
      }

      const pLayout = (p.layout || '').toLowerCase();
      const pCat = (p.category || '').toLowerCase();
      const hasNeonImages = (p?.neon_images_by_color && Object.keys(p.neon_images_by_color).length > 0) ||
        (p?.neonImagesByColor && Object.keys(p.neonImagesByColor).length > 0);
      const isNeonMaterial = (p.material || '').toLowerCase().includes('neon');

      const isLightingProduct = (categoryParam === 'lighting' || pLayout.includes('neon') || pCat.includes('neon') || hasNeonImages || isNeonMaterial)
        && !(pCat.includes('spiritual') || pCat.includes('shiv') || pCat.includes('god') || pCat.includes('canvas') && !pLayout.includes('neon') && !hasNeonImages);

      let autoFormat = p.format || "Rolled";
      if (isLightingProduct) autoFormat = "Neon Light";

      setProduct({
        ...p,
        selectedColor: autoColor,
        selectedSize: autoSize,
        selectedFormat: autoFormat,
        selectedFrameColor: p.frameColor || "Black",
      });

      // Update states
      setSelectedSize(autoSize);
      setSelectedFormat(autoFormat);

      // For Frame products, ensure we use the frameColor from data if no selection exists
      if (autoFormat === 'Frame' && !autoColor) {
        setSelectedColor(p.frameColor || 'Black');
      } else {
        setSelectedColor(autoColor);
      }
    }
  }, [productData, categoryParam]);

  // Utility to normalize strings (lowercase, remove special chars)
  const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  // Sync related/best/budget when data or product changes
  const { relatedProducts, bestProducts } = useMemo(() => {
    if (!product || allProducts.length === 0) {
      return { relatedProducts: [], bestProducts: [] };
    }

    const currentId = product.id;
    const currentMaterial = normalize(product.material || '');
    const currentFormat = normalize(product.format || '');
    const currentSubsection = normalize(product.subsection || '');

    // Determine product type keywords
    let typeKeywords: string[] = [];
    if (currentMaterial) typeKeywords.push(currentMaterial);
    if (currentFormat) typeKeywords.push(currentFormat);

    // Add keywords based on category/layout if explicit fields are missing
    if (typeKeywords.length === 0) {
      const pLayout = normalize(product.layout || '');
      const pCat = normalize(product.category || '');
      if (pLayout.includes('acrylic') || pCat.includes('acrylic')) typeKeywords.push('acrylic');
      else if (pLayout.includes('neon') || pCat.includes('neon')) typeKeywords.push('neon');
      else if (pLayout.includes('canvas') || pCat.includes('canvas')) typeKeywords.push('canvas');
      else if (pLayout.includes('frame') || pCat.includes('frame')) typeKeywords.push('frame');
    }

    // Determine strict product type
    const isNeon = currentFormat === 'neon' || currentMaterial === 'neon' || typeKeywords.includes('neon');
    const isAcrylic = currentFormat === 'acrylic' || currentMaterial === 'acrylic' || typeKeywords.includes('acrylic');

    const filterByType = (products: any[]) => {
      return products.filter((p: any) => {
        if (p.id === currentId) return false;

        const pMaterial = normalize(p.material || '');
        const pFormat = normalize(p.format || '');
        const pCat = normalize(p.category || '');
        const pLayout = normalize(p.layout || '');
        const pSubsection = normalize(p.subsection || '');

        // 1️⃣ Subsection match (Valentine's or any other)
        if (currentSubsection) {
          return pSubsection === currentSubsection;
        }

        // 2️⃣ Neon Logic
        if (isNeon) {
          return pFormat === 'neon' || pMaterial === 'neon' || pCat.includes('neon') || pLayout.includes('neon');
        }

        // 3️⃣ Acrylic Logic
        if (isAcrylic) {
          return pFormat === 'acrylic' || pMaterial === 'acrylic' || pCat.includes('acrylic') || pLayout.includes('acrylic');
        }

        // 4️⃣ Fallback: match format
        if (currentFormat) {
          return pFormat === currentFormat;
        }

        return false;
      });
    };

    return {
      relatedProducts: filterByType(allProducts).slice(0, 12),
      bestProducts: bestSellers.filter(p => p.id !== currentId).slice(0, 12)
    };
  }, [product, allProducts, bestSellers, budgetFinds]);

  const loading = productLoading;

  // Check if product is in wishlist
  const fetchWishlistStatus = async () => {
    if (!user || !product?.id) return;
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/wishlist`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      const ids: string[] = data.wishlist?.items || [];
      setIsInWishlist(ids.includes(product.id));
    } catch {
      // Ignore errors
    }
  };

  useEffect(() => {
    if (product?.id && user) {
      fetchWishlistStatus();
    }
  }, [product?.id, user]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      return;
    }

    if (!isNeon && !selectedSize && !isCustomSize) {
      toast.error('Please select size');
      return;
    }
    if (!isNeon && selectedFormat === 'Frame' && !selectedColor) {
      toast.error('Please select color');
      return;
    }
    // Require image upload for custom canvas products
    if (product?.isCustomCanvas && !customFile?.dataUrl) {
      toast.error('Please upload an image for your custom canvas');
      return;
    }

    setIsAddingToCart(true);
    try {
      const previewURL = isNeon ? await generateNeonPreview() : activeImage;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/cart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            productId: product?.id || id,
            quantity,
            size: isNeon ? neonSizeLabel : (isCustomSize ? `${customWidth}X${customHeight}` : selectedSize),
            color: (selectedFormat === 'Frame' || isAcrylic || islighting) ? selectedColor : undefined,
            format: selectedFormat,
            frameColor: selectedFormat === 'Frame' ? selectedColor : undefined,
            price: price,
            subsection: product?.subsection,
            name: isNeon ? `Custom Neon - ${neonText}` : product?.name,
            image: product?.isCustomCanvas && customFile?.dataUrl ? customFile.dataUrl : previewURL,
            customInstructions: customInstructions || undefined,
            customImage: product?.isCustomCanvas ? customFile?.dataUrl : undefined,
            customArtStyle: product?.isCustomCanvas ? selectedArtStyle : undefined,
            customNeon: isNeon ? {
              text: neonText,
              size: neonSizeLabel,
              width: neonWidth,
              height: neonHeight,
              lightMode: neonLightMode,
              color: neonColor,
              font: neonFont,
              backboard: neonBackboard,
              on: neonOn,
              previewURL
            } : undefined,
          }),
        }
      );

      if (response.ok) {
        cartEvents.emit();
        toast.success('Added to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to buy');
      return;
    }

    if (!isNeon && !selectedSize && !isCustomSize) {
      toast.error('Please select size');
      return;
    }
    if (!isNeon && selectedFormat === 'Frame' && !selectedColor) {
      toast.error('Please select color');
      return;
    }
    // Require image upload for custom canvas products
    if (product?.isCustomCanvas && !customFile?.dataUrl) {
      toast.error('Please upload an image for your custom canvas');
      return;
    }

    try {
      const previewURL = isNeon ? await generateNeonPreview() : activeImage;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/cart`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            productId: product?.id || id,
            quantity,
            size: isNeon ? neonSizeLabel : (isCustomSize ? `${customWidth}X${customHeight}` : selectedSize),
            color: (selectedFormat === 'Frame' || isAcrylic || islighting) ? selectedColor : undefined,
            format: selectedFormat,
            frameColor: selectedFormat === 'Frame' ? selectedColor : undefined,
            price: price,
            subsection: product?.subsection,
            name: isNeon ? `Custom Neon - ${neonText}` : product?.name,
            image: product?.isCustomCanvas && customFile?.dataUrl ? customFile.dataUrl : previewURL,
            customInstructions: customInstructions || undefined,
            customImage: product?.isCustomCanvas ? customFile?.dataUrl : undefined,
            customArtStyle: product?.isCustomCanvas ? selectedArtStyle : undefined,
            customNeon: isNeon ? {
              text: neonText,
              size: neonSizeLabel,
              width: neonWidth,
              height: neonHeight,
              lightMode: neonLightMode,
              color: neonColor,
              font: neonFont,
              backboard: neonBackboard,
              on: neonOn,
              previewURL
            } : undefined,
          }),
        }
      );

      if (response.ok) {
        cartEvents.emit();
        navigate('/checkout');
      } else {
        toast.error('Failed to proceed to checkout');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      toast.error('Failed to proceed to checkout');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }

    const productId = product?.id || id;
    const wasInWishlist = isInWishlist;

    // Optimistic UI update
    setIsInWishlist(!wasInWishlist);
    wishlistEvents.emit();
    toast.success(wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-52d68140/wishlist`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (!response.ok) {
        // Revert on failure
        setIsInWishlist(wasInWishlist);
        toast.error('Failed to update wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      // Revert on error
      setIsInWishlist(wasInWishlist);
      toast.error('Failed to update wishlist');
    }
  };

  const mainImage = useMemo(() => {
    if (!product) return "";

    // If user clicked a thumbnail → always priority
    if (selectedImage) {
      return optimizeImage(selectedImage, 800);
    }

    // If Frame selected → use frame color images (only if available)
    if (selectedFormat === "Frame" && product.imagesByColor?.[selectedColor]) {
      return optimizeImage(product.imagesByColor[selectedColor], 800);
    }

    // Default → main product image
    return optimizeImage(product.image, 800);
  }, [product, selectedImage, selectedColor, selectedFormat]);

  const mainSrcSet = useMemo(() => {
    // For Frame format, only use imagesByColor if it exists
    const frameColorImg = selectedFormat === 'Frame' ? product?.imagesByColor?.[selectedColor] : null;
    const base = selectedImage || frameColorImg || product?.image;
    if (!base) return undefined;
    return `${optimizeImage(base, 400)} 400w, ${optimizeImage(base, 800)} 800w, ${optimizeImage(base, 1200)} 1200w`;
  }, [product, selectedImage, selectedColor, selectedFormat]);

  const price = useMemo(() => {
    if (!product) return 0;

    if (isAcrylic) {
      if (!selectedSize) return product.price || 0;

      const sizeKey = normalizeSize(selectedSize);
      const colorKey = (selectedColor || 'Without-light').toLowerCase();

      // Determine which table to use based on layout
      const layout = product.layout?.toLowerCase();
      const isSquareFn = layout === 'square' || layout === 'circle';
      const table = isSquareFn ? ACRYLIC_SQUARE_PRICES : ACRYLIC_RECT_PRICES;

      const priceEntry = table[sizeKey];
      if (priceEntry) {
        // Map the selected color to the price key
        // We use 'Without-light', 'warm light', 'white light' as keys in our data
        // User selection might vary slightly so we ensure matching
        if (colorKey.includes('warm')) return priceEntry['warm light'];
        if (colorKey.includes('white')) return priceEntry['white light'];
        return priceEntry['Without-light'];
      }
      return product.price || 0;
    }

    if (isCustomSize) {
      if (isNeon) {
        // Rate fallback
        const rate = (typeof NEON_RATES !== 'undefined' && NEON_RATES?.NORMAL) || 13;
        return neonWidth * neonHeight * rate;
      }
      return calculateCustomPrice(customWidth, customHeight, selectedFormat);
    }
    return computePriceFor(selectedSize, selectedFormat, product.subsection) ?? product.price;
  }, [selectedSize, selectedFormat, product, isCustomSize, customWidth, customHeight, isAcrylic, selectedColor, neonWidth, neonHeight, isNeon]);

  // Loading is handled by RouteLoader - no need for individual page spinner

  // Shimmer Skeleton for loading state
  if (!product) {
    return (
      <div className="min-h-screen content-offset premium-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}

            <div className="space-y-4">
              <div className="skeleton skeleton-img rounded-2xl" style={{ aspectRatio: '1 / 1' }} />
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton w-16 h-16 rounded-lg" />
                ))}
              </div>
            </div>
            {/* Info Skeleton */}
            <div className="space-y-6">
              <div className="flex gap-2">
                <div className="skeleton skeleton-line w-20 h-8 rounded-lg" />
                <div className="skeleton skeleton-line w-24 h-8 rounded-lg" />
              </div>
              <div className="skeleton skeleton-line lg w-3/4 h-10" />
              <div className="flex gap-3 items-center">
                <div className="skeleton skeleton-line w-24 h-6" />
                <div className="skeleton skeleton-line w-32 h-8" />
              </div>
              <div className="skeleton skeleton-line w-1/2 h-4" />
              <div className="space-y-3 mt-6">
                <div className="skeleton skeleton-line w-24 h-6" />
                <div className="flex gap-3">
                  <div className="skeleton w-24 h-10 rounded-lg" />
                  <div className="skeleton w-24 h-10 rounded-lg" />
                </div>
              </div>
              <div className="space-y-3 mt-4">
                <div className="skeleton skeleton-line w-32 h-6" />
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton w-16 h-10 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <div className="skeleton flex-1 h-14 rounded-xl" />
                <div className="skeleton flex-1 h-14 rounded-xl" />
                <div className="skeleton w-14 h-14 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isCustomAcrylic) {
    return (
      <AcrylicProductDesigner
        price={neonPrice}
        sizeLabel={neonSizeLabel}
        setSizeLabel={setNeonSizeLabel}
        width={neonWidth}
        setWidth={setNeonWidth}
        height={neonHeight}
        setHeight={setNeonHeight}
        customFile={customFile}
        setCustomFile={setCustomFile}
        handleAddToCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
        backboard={neonBackboard}
        setBackboard={setNeonBackboard}
        backboardOpen={neonBackboardOpen}
        setBackboardOpen={setNeonBackboardOpen}
      />
    );
  }

  if (isNeon) {
    return (
      <NeonProductDesigner
        neonPrice={neonPrice}
        neonSize={neonSize}
        setNeonSize={setNeonSize}
        neonOn={neonOn}
        setNeonOn={setNeonOn}
        neonColor={neonColor}
        setNeonColor={setNeonColor}
        neonText={neonText}
        setNeonText={setNeonText}
        neonFont={neonFont}
        setNeonFont={setNeonFont}
        neonBackboard={neonBackboard}
        setNeonBackboard={setNeonBackboard}
        neonFontOpen={neonFontOpen}
        setNeonFontOpen={setNeonFontOpen}
        neonBackboardOpen={neonBackboardOpen}
        setNeonBackboardOpen={setNeonBackboardOpen}
        handleAddToCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
        neonLightMode={neonLightMode}
        setNeonLightMode={setNeonLightMode}
        neonSizeLabel={neonSizeLabel}
        setNeonSizeLabel={setNeonSizeLabel}
        neonWidth={neonWidth}
        setNeonWidth={setNeonWidth}
        neonHeight={neonHeight}
        setNeonHeight={setNeonHeight}
      />
    );
  }

  if (product?.isCustomCanvas) {
    return (
      <CanvasProductDesigner
        productName={product?.name}
        productImage={product?.image}
        price={neonPrice}
        sizeLabel={neonSizeLabel}
        setSizeLabel={setNeonSizeLabel}
        width={neonWidth}
        setWidth={setNeonWidth}
        height={neonHeight}
        setHeight={setNeonHeight}
        customFile={customFile}
        setCustomFile={setCustomFile}
        handleAddToCart={handleAddToCart}
        handleBuyNow={handleBuyNow}
        isMobile={isMobile}
        layout={product?.layout || 'Square'}
        productSizes={product?.sizes}
      />
    );
  }

  // Check if today is before or on Valentine's Day (Feb 14)
  const isValentinesPeriod = () => {
    const today = new Date();
    const year = today.getFullYear();
    const valentinesStart = new Date(`${year}-02-01`); // start of Feb
    const valentinesEnd = new Date(`${year}-02-14`);   // Feb 14
    return today >= valentinesStart && today <= valentinesEnd;
  };
  return (
    <div className="min-h-screen content-offset"
      style={{ backgroundColor: '#fafaf9' }}>
      <Navbar />

      {/* Decorative Squares (top) */}
      <div className="flex justify-between max-w-7xl mx-auto px-4 pt-12">
        <div className="flex gap-2">
          <div className="w-10 h-12 border-2 border-gray-600 rounded animate-pulse" style={{ animationDelay: '0.1s', animationDuration: '2s' }}></div>
          <div className="w-10 h-12 border-2 border-teal-300 rounded animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '3s' }}></div>
        </div>

        <div className="flex gap-2">
          <div className="w-10 h-12 border-2 border-teal-300 rounded animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '3s' }}></div>
          <div className="w-10 h-12 border-2 border-gray-600 rounded animate-pulse" style={{ animationDelay: '0.6s', animationDuration: '2s' }}></div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 text-sm flex items-center gap-2 text-gray-600">
        <Home className="w-4 h-4" color="#6b7280" />
        <Link to="/" className="hover:underline" style={{ color: '#1f2937' }}>Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/shop" className="hover:underline" style={{ color: '#1f2937' }}>Shop</Link>
        <ChevronRight className="w-4 h-4" />
        <span style={{ color: '#1f2937' }}>{product?.name || 'Product'}</span>
      </div>

      {/* Product Detail Section */}

      <div className="lg:max-w-7xl lg:mx-auto lg:px-4 lg:py-12 relative lg:static flex flex-col lg:block z-0 lg:z-auto bg-white lg:bg-transparent overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 h-auto overflow-visible">

          {/* Left Column Container (Isolated for Sticky isolation) */}
          {/* Product Detail Section */}

          {/* Mobile Img Only */}
          {isMobile && (
            <div
              className="fixed top-[85px] left-0 right-0 z-50 bg-gray-50"
              style={{ height: '45vh' }}
            >
              <div
                className="h-full px-4"
                onClick={toggleZoom}
              >
                <SmoothImage
                  src={activeImage}
                  alt={product?.name || 'Product image'}
                  logo={logo}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  crossfade={islighting}
                />
              </div>
            </div>
          )}

          {/* Left Column Container (Isolated for Sticky isolation) */}
          <div className="lg:sticky lg:top-[120px] lg:self-start lg:h-auto">
            {/* Image Box (Sticky height container) */}
            <div
              className={`soft-card lg:rounded-2xl p-2 ${isMobile ? 'h-auto' : 'h-auto'} w-full flex-none bg-white lg:bg-transparent shadow-md lg:shadow-lg lg:border border-gray-100`}
            >
              {isMobile && <div style={{ height: '25vh' }} />}

              <div
                ref={imageContainerRef}
                className={`rounded-lg overflow-hidden ${isMobile ? 'hidden' : ''}`}
                style={{
                  height: '65vh',
                  minHeight: '500px',
                  maxHeight: '800px',
                  cursor: zoom > 1 ? "zoom-in" : "default",
                  backgroundColor: '#fafaf9'
                }}
                onMouseMove={(e) => updateOriginFromPoint(e.clientX, e.clientY)}
                onTouchStart={handleMainImageTouchStart}
                onTouchEnd={handleMainImageTouchEnd}
                onClick={toggleZoom}
              >
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: origin,
                    width: "100%",
                    height: "100%",
                    transition: "transform 0.2s ease-out",
                    willChange: "transform",
                  }}
                >
                  {/* 🔥 Image + Watermark Added Here */}
                  <div
                    className="relative w-full h-full image-protected"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                  >
                    <SmoothImage
                      src={activeImage}
                      alt={product?.name || "Product image"}
                      logo={logo}
                      priority
                      sizes="(max-width: 768px) 100vw, 50vw"
                      crossfade={islighting}
                    />
                  </div>

                </div>
              </div>

              {/* --- THUMBNAIL STRIP (hide for neon) --- */}
              {!islighting && optimizedThumbItems.length > 0 && (
                <div className="relative overflow-hidden px-2 sm:px-4 mt-6">
                  {/* Left Arrow */}
                  <button
                    onClick={() => scrollThumbs("left")}
                    disabled={!canScrollLeft}
                    className={`hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-50 p-1.5 rounded-full border transition-all items-center justify-center shadow-md
        ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-gray-50 hover:scale-110'}
      `}
                    style={{ borderColor: "#e5e7eb", backgroundColor: "rgba(255,255,255,0.95)", color: "#1f2937" }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div
                    ref={thumbStripRef}
                    className="thumbs-strip pb-1 pt-1 overflow-x-auto scrollbar-hide"
                    style={{ scrollBehavior: 'smooth' }}
                    onKeyDown={handleThumbKeyDown}
                    onTouchStart={handleThumbTouchStart}
                    onTouchMove={handleThumbTouchMove}
                    onTouchEnd={handleThumbTouchEnd}
                  >
                    <div className="thumb-slider flex gap-3 px-1 w-max mx-auto">
                      {optimizedThumbItems.map((item, index) => (
                        <div
                          key={index}
                          className={`thumb-item w-14 h-16 sm:w-20 sm:h-24 rounded-lg border-2 cursor-pointer overflow-hidden shrink-0 transition-all duration-300
              ${item.selected
                              ? "border-teal-600 shadow-md scale-105"
                              : "border-gray-100 opacity-60 hover:opacity-100 hover:border-teal-300"
                            }`}
                          onClick={() => selectByIndex(index)}
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          <ImageWithFallback
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => scrollThumbs("right")}
                    disabled={!canScrollRight}
                    className={`hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-50 p-1.5 rounded-full border transition-all items-center justify-center shadow-md
        ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-gray-50 hover:scale-110'}
      `}
                    style={{ borderColor: "#e5e7eb", backgroundColor: "rgba(255,255,255,0.95)", color: "#1f2937" }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Product Info Left */}
          <div
            className={`flex-1 w-full bg-white relative z-20 p-4 lg:p-0 lg:pr-6 pb-20 lg:pb-8 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-teal-200 scrollbar-track-transparent ${isMobile ? 'order-2' : ''}`}
            // style={{ overscrollBehavior: 'contain' }}
            onWheel={(e) => {
              if (window.innerWidth >= 1024) {
                const element = e.currentTarget;
                const isAtTop = element.scrollTop === 0;
                const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;

                // Allow page scroll when at boundaries
                if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                  return; // Let the event propagate to page scroll
                }

                // Prevent page scroll when scrolling within container
                e.stopPropagation();
              }
            }}
          >

            <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: '#6b7280' }}>
              {Boolean(product?.category && String(product?.category).trim()) && (
                <span className="px-6 py-2 rounded-lg border text-[10px] uppercase font-black tracking-widest" style={{ borderColor: '#d1d5db', color: '#14b8a6', backgroundColor: 'white' }}>{String(product?.category).trim()}</span>
              )}
              {Boolean(product?.layout && String(product?.layout).trim()) && (
                <span className="px-6 py-2 rounded-lg border text-[10px] uppercase font-black tracking-widest" style={{ borderColor: '#d1d5db', color: '#374151', backgroundColor: 'white' }}>{String(product?.layout).trim()}</span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
              {product?.name}
            </h1>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xl" style={{ textDecoration: 'line-through' }}>
                    ₹{Math.round(price * 1.15).toLocaleString('en-IN')}
                  </span>
                  <span className="text-3xl font-black text-teal-600">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-bold">-15% OFF</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-tighter">Tax included. Shipping calculated at checkout.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="p-2.5 rounded-xl border border-gray-200 hover:border-teal-500 transition-colors bg-white shadow-sm cursor-pointer"
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }}
                >
                  <Copy className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                </button>
                <button
                  className="p-2.5 rounded-xl border border-gray-200 hover:border-teal-500 transition-colors bg-white shadow-sm cursor-pointer"
                  onClick={() => { if (navigator.share) navigator.share({ title: product?.name, url: window.location.href }); }}
                >
                  <Share2 className="w-5 h-5 text-gray-400 group-hover:text-teal-600" />
                </button>
              </div>
            </div>

            {(product.rating || product.reviewsCount) && (
              <div className="flex items-center gap-2 mt-4 bg-gray-50/50 w-fit px-3 py-1.5 rounded-full border border-gray-100">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(product.rating || 0)) ? 'fill-teal-500 text-teal-500' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-600">{Number(product.rating || 0).toFixed(1)} {product.reviewsCount ? `(${product.reviewsCount} reviews)` : ''}</span>
              </div>
            )}

            {/* Product Options */}
            <div className="mt-8 space-y-6">
              {/* 1. Select Material & Frame */}
              <div className="bg-white p-6 rounded-2xl border border-teal-50/50 shadow-sm transition-all duration-300 hover:shadow-md">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                  1. Select Material
                </h3>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(islighting ? ['Neon Light'] : isAcrylic ? ['Acrylic'] : ['Canvas']).map((fmt) => {
                      const available = !islighting ? computePriceFor(selectedSize, fmt as any, product.subsection) !== undefined : true;
                      const displayLabel = (fmt === 'Canvas') ? 'Canvas' : fmt;
                      return (
                        <button
                          key={fmt}
                          onClick={() => available && setSelectedFormat(fmt as any)}
                          className={`px-6 py-2.5 rounded-xl border-2 transition-all duration-300 font-bold text-xs uppercase tracking-widest cursor-pointer ${selectedFormat === fmt
                            ? 'border-teal-500 bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                            : 'border-gray-200 text-gray-500 hover:border-teal-200 hover:bg-teal-50/30'
                            } ${available ? '' : 'opacity-30 cursor-not-allowed'}`}
                          disabled={!available}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* 2. Choose Finishing & Frame */}
              {!islighting && !isAcrylic && !product.categories?.some((cat) => cat.toLowerCase().includes('neon')) && (
                <div className="bg-white p-6 rounded-2xl border border-teal-50/50 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                    2. Choose Finishing & Frame
                  </h3>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest px-1">Select your frame style</p>
                    <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide snap-x">
                      {[
                        { label: 'Stretched Canvas', sublabel: '(Without Frame)', fmt: 'Canvas' as const, color: '' },
                        { label: 'Rolled canvas', sublabel: '(Without Frame)', fmt: 'Rolled' as const, color: '' },
                        { label: 'Black Frame', fmt: 'Frame' as const, color: 'Black' },
                        { label: 'White Frame', fmt: 'Frame' as const, color: 'White' },
                        { label: 'Brown Frame', fmt: 'Frame' as const, color: 'Brown' },
                      ]
                        .filter(opt => product.layout?.toLowerCase() === 'circle' ? (opt.fmt === 'Rolled' || opt.fmt === 'Canvas') : true)
                        .map((opt) => {
                          const available = product.isCustomCanvas || computePriceFor(selectedSize, opt.fmt, product.subsection) !== undefined;
                          const isActive = selectedFormat === opt.fmt && (opt.fmt !== 'Frame' || selectedColor === opt.color || !opt.color);
                          return (
                            <button
                              key={opt.label}
                              onClick={() => {
                                if (!available) return;
                                setSelectedFormat(opt.fmt);
                                if (opt.fmt === 'Frame') setSelectedColor(opt.color);
                                else setSelectedColor('');
                                setSelectedImage(null); // Clear thumbnail selection to show frame image
                              }}
                              className={`px-5 py-3 rounded-xl border-2 transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer snap-start whitespace-nowrap min-w-[140px] flex flex-col items-center justify-center gap-0.5 ${isActive ? 'border-teal-600 bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'border-gray-100 text-gray-400 hover:border-teal-200 bg-gray-50/50'
                                } ${available ? '' : 'opacity-30 cursor-not-allowed'}`}
                              disabled={!available}
                            >
                              <span>{opt.label}</span>
                              {opt.sublabel && <span className={`text-[8px] normal-case opacity-80 ${isActive ? 'text-white' : 'text-gray-400'}`}>{opt.sublabel}</span>}
                              {isActive && <div className="w-1 h-1 bg-white rounded-full mt-0.5"></div>}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* 2.5 Acrylic/Neon Options (Special Finish) */}
              {(isAcrylic || islighting) && nameParam !== 'celestial-wings' && (
                <div className="bg-white p-6 rounded-2xl border border-teal-50/50 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                    2. Choose {isAcrylic ? 'Acrylic Type' : 'Light Color'}
                  </h3>
                  <div className="relative group">
                    <button
                      onClick={() => document.getElementById('color-slider')?.scrollBy({ left: -200, behavior: 'smooth' })}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-100 text-gray-400 hover:text-teal-600 hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div id="color-slider" className="flex overflow-x-auto gap-3 py-2 px-1 scrollbar-hide snap-x scroll-smooth">
                      {isAcrylic ? (
                        ['Without-light', 'Warm Light', 'White Light'].map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedColor(type.toLowerCase());
                              setSelectedImage(null);
                            }}
                            className={`px-6 py-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer snap-start whitespace-nowrap transition-all ${selectedColor === type.toLowerCase() ? 'border-teal-600 bg-teal-600 text-white shadow-md transfom scale-105' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                          >
                            {type}
                          </button>
                        ))
                      ) : (
                        ['#ffffff', //white
                          '#faf9f6', // Ice White
                          '#fff700', //Yellow
                          '#ff9f00', //Orange
                          '#ff1a1a', //Red
                          '#FF2ec4', //Pink
                          '#f425ee', //Purple
                          '#39ff14', // Green
                          '#00e5ff', //Cyan
                          '#1e4bff', //Blue
                        ].map((hex) => (
                          <button
                            key={hex}
                            onClick={() => setSelectedColor(hex.toLowerCase())}
                            className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 cursor-pointer snap-start flex-shrink-0 ${selectedColor?.toLowerCase() === hex.toLowerCase() ? 'border-teal-500 ring-4 ring-teal-50 scale-110 shadow-lg' : 'border-gray-100 shadow-sm'}`}
                            style={{ backgroundColor: hex }}
                          />
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => document.getElementById('color-slider')?.scrollBy({ left: 200, behavior: 'smooth' })}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center border border-gray-100 text-gray-400 hover:text-teal-600 hover:scale-110 transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              )}

              {/* 2. Select Size */}
              <div className="bg-white p-6 rounded-2xl border border-teal-50/50 shadow-sm transition-all duration-300 hover:shadow-md">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                  3. Choose Dimensions
                </h3>
                <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide snap-x">
                  {(product.layout?.toLowerCase() === 'landscape' ? ['36X18', '48X24', '20X30', '30X40'] : isAcrylic ? ((product.layout?.toLowerCase() === 'square' || product.layout?.toLowerCase() === 'circle') ? ['12X12', '18X18', '24X24', '30X30'] : ['12X15', '15X18', '20X24', '24X28']) : product.sizes).map((size: string) => {
                    const priceDisplay = isAcrylic
                      ? (() => {
                        const sizeKey = normalizeSize(size);
                        const layout = product.layout?.toLowerCase();
                        const table = (layout === 'square' || layout === 'circle') ? ACRYLIC_SQUARE_PRICES : ACRYLIC_RECT_PRICES;
                        if (table[sizeKey]) {
                          const colorKey = (selectedColor || 'Without-light').toLowerCase();
                          if (colorKey.includes('warm')) return table[sizeKey]['warm light'];
                          if (colorKey.includes('white')) return table[sizeKey]['white light'];
                          return table[sizeKey]['Without-light'];
                        }
                        return 0;
                      })()
                      : computePriceFor(size, selectedFormat, product.subsection);

                    const isAvailable = priceDisplay !== undefined && priceDisplay !== null && priceDisplay > 0;
                    return (
                      <button key={size} onClick={() => isAvailable && (setSelectedSize(size), setIsCustomSize(false))} className={`group relative py-3 px-6 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-0.5 cursor-pointer min-w-[100px] snap-start ${selectedSize === size ? 'border-teal-500 bg-teal-50 text-teal-900' : isAvailable ? 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-teal-200 hover:bg-white' : 'opacity-30 cursor-not-allowed border-dashed'}`} disabled={!isAvailable}>
                        <span className={`font-bold text-sm tracking-tight ${selectedSize === size ? 'text-teal-900' : 'text-gray-900'}`}>{size}"</span>
                        {isAvailable && <span className={`text-[11px] font-medium ${selectedSize === size ? 'text-teal-600' : 'text-gray-500'}`}>₹{Math.round(priceDisplay).toLocaleString('en-IN')}</span>}
                        {selectedSize === size && <CheckCircle className="absolute -top-1.5 -right-1.5 w-4 h-4 text-teal-600 fill-white" />}
                      </button>
                    );
                  })}
                </div>

                {(product.isCustomCanvas || islighting || isNeon) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                    <button onClick={() => { setIsCustomSize(!isCustomSize); if (!isCustomSize) setSelectedSize(''); }} className={`w-full text-xs font-black px-4 py-3 rounded-xl border-2 uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 ${isCustomSize ? 'border-teal-500 bg-teal-500 text-white shadow-md' : 'border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600'}`}>
                      {isCustomSize ? <CheckCircle className="w-4 h-4" /> : null}
                      {isCustomSize ? 'Using Custom Size' : 'Need a Specific Size?'}
                    </button>

                    {isCustomSize && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-3 items-center w-full">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Width (in)</label>
                            <div className="relative">
                              <select
                                value={isNeon ? neonWidth : customWidth}
                                onChange={(e) => isNeon ? setNeonWidth(Number(e.target.value)) : setCustomWidth(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-gray-200 text-sm font-bold text-gray-900 py-2.5 px-4 rounded-lg cursor-pointer focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                              >
                                {Array.from({ length: 41 }, (_, i) => i + 8).map(n => <option key={n} value={n} className="text-gray-900 bg-white">{n}"</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="pt-6 text-gray-300 font-light text-xl">×</div>

                          <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Height (in)</label>
                            <div className="relative">
                              <select
                                value={isNeon ? neonHeight : customHeight}
                                onChange={(e) => isNeon ? setNeonHeight(Number(e.target.value)) : setCustomHeight(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-gray-200 text-sm font-bold text-gray-900 py-2.5 px-4 rounded-lg cursor-pointer focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                              >
                                {Array.from({ length: 53 }, (_, i) => i + (isNeon ? 6 : 12)).map(n => <option key={n} value={n} className="text-gray-900 bg-white">{n}"</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Social Proof */}
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center animate-pulse"><Box className="w-5 h-5 text-orange-600" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-orange-900 uppercase tracking-tighter">Fast Delivery Guaranteed</p>
                  <p className="text-[10px] text-orange-700/80">Shipped in 24 hours. Delivered in 7-10 days across India.</p>
                </div>
              </div>
            </div>

            {/* ART STYLE for custom canvas (if not already in options) */}
            {product.isCustomCanvas && !isCustomSize && (
              <div className="mt-8">
                <p className="text-[10px] uppercase font-black text-gray-400 mb-3 tracking-widest">Optional Art Style</p>
                <div className="flex flex-wrap gap-2">
                  {['Royal', 'Gangster', 'Cartoon', 'Oil', 'Fantasy'].map(s => (
                    <button key={s} onClick={() => setSelectedArtStyle(s)} className={`px-4 py-1.5 rounded-full border text-[11px] font-bold cursor-pointer transition-all ${selectedArtStyle === s ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Final Action Buttons */}
            <div className="sticky bottom-0 lg:static bg-white/80 backdrop-blur-md lg:bg-transparent -mx-4 lg:mx-0 p-4 lg:p-0 mt-10 z-30 lg:z-auto">
              <div className="flex gap-4">
                <button onClick={handleAddToCart} className="flex-1 h-14 rounded-2xl border-2 border-teal-600 text-teal-600 font-black text-[11px] uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer bg-white">
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} className="flex-[1.5] h-14 rounded-2xl bg-teal-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer">
                  Buy Now
                </button>
                <button onClick={handleAddToWishlist} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${isInWishlist ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200'}`}>
                  <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-300'}`} />
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'On all orders' },
                { icon: Package, title: 'Safe Packing', desc: 'Secure layers' },
                { icon: Lock, title: 'Secure Pay', desc: 'SSL Protected' },
                { icon: Clock, title: '24/7 Support', desc: 'Email support' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-sm transition-all duration-300">
                  <item.icon className="w-5 h-5 text-teal-500 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-gray-900">{item.title}</h4>
                    <p className="text-[9px] text-gray-500">{item.desc}</p>
                  </div>

                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <details className="group border-b border-gray-100 pb-4" open={!isMobile}>
                <summary className="list-none flex justify-between items-center cursor-pointer">
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">Product Details</span>
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 prose prose-sm text-gray-600 text-[11px] leading-relaxed">
                  {product.description}
                </div>
              </details>
            </div>

            {/* Specifications */}
            {/* {product.material && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-2xl font-semibold mb-4">Specifications</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Material:</span>
                    <span>{product.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Colors:</span>
                    <span>{product.colors.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sizes:</span>
                    <span>{product.sizes.join(', ')}</span>
                </div>

        </div>

     
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-3 z-40" style={{ willChange: 'transform' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">₹{price.toFixed(0)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800">Add</button>
              <button onClick={handleBuyNow} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#14b8a6' }}>Buy Now</button>
            </div>
          </div>
         </div>
            )} */}
          </div >

        </div >
        {(islighting || isNeon) && (
          <div className="w-full overflow-x-hidden">
            <NeonProductDetails />
          </div>
        )}

       {relatedProducts.length > 0 && (
  <div
    className={`mt-16 p-8 lg:p-12 shadow-lg relative overflow-hidden
      ${isValentinesPeriod() ? 'rounded-2xl' : 'rounded-lg'}`}
    style={{
      background: isValentinesPeriod()
        ? "linear-gradient(135deg, #ffe6e6 0%, #fff0f5 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
      border: isValentinesPeriod() ? "1px solid #ffccd5" : "1px solid #f1f5f9",
    }}
  >
    {/* Valentine’s 50% Off Banner */}
    {isValentinesPeriod() && (
      <div className="absolute top-0 left-0 bg-red-500 text-white font-bold px-4 py-1 transform rotate-0 shadow-lg z-20">
        Up to 50% OFF
      </div>
    )}

    {/* Heading */}
    <div className="flex items-center justify-between mb-10">
      <h2
        className={`text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-2
          ${isValentinesPeriod() ? 'text-pink-600' : 'text-gray-900'}`}
      >
        {isValentinesPeriod() && (
          <span className="animate-heartbeat text-3xl lg:text-4xl">❤️</span>
        )}
        {isValentinesPeriod() ? "Valentine’s Special" : "Related Frames"}
        {isValentinesPeriod() && (
          <span className="animate-heartbeat text-3xl lg:text-4xl">❤️</span>
        )}
      </h2>

      {!isMobile && relatedProducts.length > 4 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => relatedScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
            className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer font-bold shadow-sm
              ${isValentinesPeriod()
                ? 'border-red-400 text-red-500 hover:bg-red-500 hover:text-white'
                : 'border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white'
              }`}
          >
            &larr;
          </button>

          <button
            onClick={() => relatedScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
            className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer font-bold shadow-sm
              ${isValentinesPeriod()
                ? 'border-red-400 text-red-500 hover:bg-red-500 hover:text-white'
                : 'border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white'
              }`}
          >
            &rarr;
          </button>
        </div>
      )}
    </div>

    {/* Products Scroll */}
    <div
      ref={relatedScrollRef}
      className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-transparent snap-x snap-mandatory"
    >
      {relatedProducts.map((p) => (
        <div key={p.id} className="min-w-[280px] sm:min-w-[320px] snap-start relative">
          {/* Heart on product card */}
          {isValentinesPeriod() && (
            <div className="absolute top-2 right-2 text-red-500 text-2xl animate-heartbeat">
              ❤️
            </div>
          )}
          <ProductCard product={p} hideCategory imageHeight={240} />
        </div>
      ))}
    </div>
  </div>
)}



        {/* Best Sellers */}
        {bestProducts.length > 0 && (
          <div className="mt-8 rounded-lg p-8 lg:p-12 shadow-sm border border-orange-100/30" style={{ backgroundColor: '#fffcf8' }}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                Best <span className="text-orange-600">Sellers</span>
              </h2>
              {!isMobile && bestProducts.length > 4 && (
                <div className="flex items-center gap-3">
                  <button onClick={() => bestScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })} className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all cursor-pointer font-bold shadow-sm">&larr;</button>
                  <button onClick={() => bestScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })} className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all cursor-pointer font-bold shadow-sm">&rarr;</button>
                </div>
              )}
            </div>

            <div
              ref={bestScrollRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-transparent snap-x snap-mandatory"
              style={{
                scrollbarWidth: 'thin',
                msOverflowStyle: 'none',
              }}
            >
              {bestProducts.map((p) => (
                <div key={p.id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                  <ProductCard product={p} hideCategory imageHeight={240} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Finds */}

        {/* Mobile Reviews & Footer */}
        <div className="block lg:hidden mt-6 space-y-12">
          <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div></div>}>
            <ProductReviews productId={product?.id || id || ''} />
          </Suspense>
          <Footer />
        </div>
      </div>

      {(product?.id || id) && (
        <FloatingProductVideo productId={product?.id || id || ''} />
      )}

      {/* Reviews Section (Desktop Only) */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-12 border-t border-gray-200">
        <Suspense fallback={<div className="h-40 flex items-center justify-center"><div className="animate-spin rounded-lg h-8 w-8 border-b-2 border-teal-500"></div></div>}>
          <ProductReviews productId={product?.id || id || ''} />
        </Suspense>
      </div>

      <div className="hidden lg:block mt-20">
        <Footer />
      </div>
    </div>
  );
}

const normalizeSize = (s?: string) => {
  if (!s) return '';
  const cleaned = s.replace(/\s+/g, '').toUpperCase().replace('×', 'X');
  const parts = cleaned.split('X');
  if (parts.length !== 2) return cleaned;
  return `${parts[0]}X${parts[1]}`;
};

const BASIC_PRICE: Record<string, { Rolled: number | null; Canvas: number | null; Frame: number | null }> = {
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

const TWOSET_PRICE: Record<string, { Rolled: number | null; Canvas: number | null; Frame: number | null }> = {
  '8X12': { Rolled: 1299, Canvas: 1599, Frame: 1999 },
  '12X18': { Rolled: 1699, Canvas: 2199, Frame: 2499 },
  '18X24': { Rolled: 2499, Canvas: 3399, Frame: 3599 },
  '20X30': { Rolled: 3499, Canvas: 5199, Frame: 5599 },
  '24X36': { Rolled: 3899, Canvas: 5999, Frame: 6599 },
  '30X40': { Rolled: 5799, Canvas: 9399, Frame: 10399 },
  '36X48': { Rolled: 6999, Canvas: 11599, Frame: 12999 },
  '48X66': { Rolled: 11799, Canvas: 18899, Frame: null },
};

const THREESET_PRICE: Record<string, { Rolled: number | null; Canvas: number | null; Frame: number | null }> = {
  '8X12': { Rolled: 2099, Canvas: 2499, Frame: 2999 },
  '12X18': { Rolled: 2699, Canvas: 3399, Frame: 3899 },
  '18X24': { Rolled: 3899, Canvas: 5099, Frame: 5399 },
  '20X30': { Rolled: 5399, Canvas: 7799, Frame: 8399 },
  '24X36': { Rolled: 6999, Canvas: 8899, Frame: 9599 },
  '30X40': { Rolled: 8699, Canvas: 14099, Frame: 15559 },
  '36X48': { Rolled: 10599, Canvas: 17399, Frame: 19499 },
  '48X66': { Rolled: 17699, Canvas: 28299, Frame: null },
};

const ACRYLIC_RECT_PRICES: Record<string, { 'Without-light': number; 'warm light': number; 'white light': number }> = {
  '12X15': { 'Without-light': 1599, 'warm light': 2699, 'white light': 2699 },
  '15X18': { 'Without-light': 2699, 'warm light': 3799, 'white light': 3799 },
  '20X24': { 'Without-light': 3699, 'warm light': 4799, 'white light': 4799 },
  '24X28': { 'Without-light': 5599, 'warm light': 6699, 'white light': 6699 },
};

const ACRYLIC_SQUARE_PRICES: Record<string, { 'Without-light': number; 'warm light': number; 'white light': number }> = {
  '12X12': { 'Without-light': 1299, 'warm light': 2399, 'white light': 2399 },
  '18X18': { 'Without-light': 2899, 'warm light': 3999, 'white light': 3999 },
  '24X24': { 'Without-light': 3899, 'warm light': 4999, 'white light': 4999 },
  '30X30': { 'Without-light': 5899, 'warm light': 6999, 'white light': 6999 },
};

const computePriceFor = (
  size: string,
  format: 'Rolled' | 'Canvas' | 'Frame' | 'Neon Light',
  subsection?: 'Basic' | '2-Set' | '3-Set' | 'Square'
) => {
  if (format === 'Neon Light') {
    // Robust parsing: remove everything except numbers and x/X/*/×
    const normalized = size.replace(/[×*x]/gi, 'X').replace(/[^0-9X]/g, '');
    const parts = normalized.split('X');

    if (parts.length >= 2) {
      const w = parseInt(parts[0]);
      const h = parseInt(parts[1]);
      if (!isNaN(w) && !isNaN(h)) {
        // Fallback to 13 if NEON_RATES or NORMAL is missing
        const rate = (typeof NEON_RATES !== 'undefined' && NEON_RATES?.NORMAL) || 13;
        return w * h * rate;
      }
    }
    return undefined;
  }

  const key = normalizeSize(size);
  const table = subsection === '2-Set' ? TWOSET_PRICE : subsection === '3-Set' ? THREESET_PRICE : BASIC_PRICE;
  const row = table[key];
  if (!row) return undefined;
  const value = row[format as 'Rolled' | 'Canvas' | 'Frame'];
  return value === null ? undefined : value ?? undefined;
};

const calculateCustomPrice = (w: number, h: number, fmt: 'Rolled' | 'Canvas' | 'Frame') => {
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
