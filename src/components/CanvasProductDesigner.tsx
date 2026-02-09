import React, { useRef, useEffect } from 'react';
import { optimizeImage } from '../utils/optimizeImage';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Home, ChevronRight, Star, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    NEON_LANDSCAPE_SIZES,
    NEON_SQUARE_SIZES,
    CANVAS_LANDSCAPE_SIZES,
    CANVAS_PORTRAIT_SIZES,
    CANVAS_SQUARE_SIZES
} from '../utils/neonConstants';

interface CanvasProductDesignerProps {
    productName: string;
    productImage: string;
    price: number;
    sizeLabel: string;
    setSizeLabel: (label: string) => void;
    width: number;
    setWidth: (w: number) => void;
    height: number;
    setHeight: (h: number) => void;
    customFile: { name: string; dataUrl: string } | null;
    setCustomFile: (file: { name: string; dataUrl: string } | null) => void;
    handleAddToCart: () => void;
    handleBuyNow: () => void;
    isMobile?: boolean;
    layout: string;
    productSizes?: string[];
}

export const CanvasProductDesigner: React.FC<CanvasProductDesignerProps> = ({
    productName,
    productImage,
    price,
    sizeLabel,
    setSizeLabel,
    width,
    setWidth,
    height,
    setHeight,
    customFile,
    setCustomFile,
    handleAddToCart,
    handleBuyNow,
    isMobile,
    layout,
    productSizes = []
}) => {
    const [sizeCategory, setSizeCategory] = React.useState<'STANDARD' | 'CUSTOM'>('STANDARD');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const original = Math.round(price * 1.05);

    // Determine Size List: Use productSizes from DB if available, else derive from layout constants
    const getSizeList = () => {
        if (productSizes && productSizes.length > 0) {
            return productSizes.map(s => {
                // Parse "24X36" or "24x36" to numbers
                const [w, h] = s.toLowerCase().split('x').map(n => parseInt(n.trim()));
                return {
                    label: s,
                    width: w || 12,
                    height: h || 12
                };
            });
        }

        const l = layout?.toLowerCase() || '';
        if (l.includes('portrait')) return CANVAS_PORTRAIT_SIZES;
        if (l.includes('landscape')) return CANVAS_LANDSCAPE_SIZES;
        if (l.includes('square') || l.includes('circle') || l.includes('round')) return CANVAS_SQUARE_SIZES;
        return CANVAS_SQUARE_SIZES; // Fallback
    };

    const activeSizes = getSizeList();

    // Reset size label if it doesn't match current list (optional, but good for switching)
    // useEffect(() => {
    //     if (activeSizes.length > 0 && !activeSizes.find(s => s.label === sizeLabel)) {
    //         setSizeLabel(activeSizes[0].label);
    //     }
    // }, [layout]);

    // Parse current dimensions for display
    const activeSize = activeSizes.find(s => s.label === sizeLabel);
    const widthInches = sizeCategory === 'CUSTOM' ? width : (activeSize?.width || parseInt(sizeLabel, 10) || 12);
    const heightInches = sizeCategory === 'CUSTOM' ? height : (activeSize?.height || Math.max(6, Math.round(widthInches * (layout.toLowerCase().includes('landscape') ? 0.6 : 1.5))));
    const widthCm = Math.round(widthInches * 2.54);
    const heightCm = Math.round(heightInches * 2.54);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid image file (SVG, PNG, JPG, WEBP).');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                if (dataUrl) {
                    setCustomFile({ name: file.name, dataUrl });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen content-offset" style={{ backgroundColor: '#fafaf9' }}>
            <Navbar />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 pt-6 text-sm flex items-center gap-2 text-gray-600">
                <Home className="w-4 h-4" color="#6b7280" />
                <Link to="/" className="hover:underline" style={{ color: '#1f2937' }}>Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/shop" className="hover:underline" style={{ color: '#1f2937' }}>Shop</Link>
                <ChevronRight className="w-4 h-4" />
                <span style={{ color: '#1f2937' }}>{productName}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start overflow-visible">

                <div className="sticky top-[105px] self-start z-30 space-y-4">
                    {/* Preview Area - Mimics the Mockup View from ProductDetailPage */}
                    <div className="rounded-xl overflow-hidden relative shadow-lg bg-gray-100" style={{ minHeight: isMobile ? 300 : 500 }}>
                        {/* Background Room/Template Image
                        <div className="absolute inset-0 w-full h-full">
                            <img src={optimizeImage(productImage, 1200)} alt="Room Preview" className="w-full h-full object-cover opacity-90" />
                        </div> */}

                        {/* Overlay Container */}
                        <div className="absolute inset-0 flex items-center justify-center p-8 sm:p-12 z-10 transition-all duration-300">
                            {customFile ? (
                                <img
                                    src={customFile.dataUrl}
                                    alt="Custom Preview"
                                    className={`max-w-full max-h-full object-contain shadow-2xl transition-transform duration-500 hover:scale-105 ${layout.toLowerCase() === 'circle' ? 'rounded-full aspect-square object-cover' : ''}`}
                                    style={{
                                        maxHeight: '60%',

                                    }}
                                />
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="cursor-pointer bg-black/40 backdrop-blur-sm border-2 border-dashed border-white/60 rounded-xl p-8 flex flex-col items-center justify-center text-white hover:bg-black/50 transition-all group"
                                >
                                    <Upload className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-lg">Upload Your Image</span>
                                    <span className="text-xs text-white/80 mt-1">Tap to browse files</span>
                                </div>
                            )}
                        </div>

                        {/* Dimensions Badge */}
                        {customFile && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/70 backdrop-blur px-4 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg border border-white/20">
                                Size: {widthInches}x{heightInches}"
                            </div>
                        )}
                    </div>

                    {/* Upload Controls */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        <div>
                            <div className="mb-2 font-semibold text-gray-700">Upload Your Design:</div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept=".svg,.png,.jpg,.jpeg,.webp"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-teal-500 text-teal-600 font-bold hover:bg-teal-50 transition-colors"
                            >
                                <Upload className="w-5 h-5" />
                                {customFile ? 'Change File' : 'Choose File'}
                            </button>
                            {customFile && (
                                <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-2">
                                    <span className="truncate max-w-[200px]">{customFile.name}</span>
                                </div>
                            )}
                            {/* <p className="text-xs text-gray-400 mt-2">Supported formats: SVG, PNG, JPG, WEBP.</p> */}
                            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">.JPG</span>
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">.PNG</span>
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">.WEBP</span>
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">.SVG</span>
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 whitespace-nowrap">Max 10MB</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customization Controls */}
                <div>
                    <div className="mb-6">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900 font-serif">
                            {productName}
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">(Custom Order)</span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                            {original > price && (
                                <>
                                    <span className="text-gray-500 text-lg line-through">₹{original.toLocaleString('en-IN')}</span>
                                    <span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded text-sm">
                                        Sale
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="h-px bg-gray-200 w-full mb-6"></div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Customize Dimensions</h2>

                        <div className="mt-6 space-y-6">
                            <div>
                                <div className="mb-2" style={{ color: '#374151' }}>Choose Size: <span className="font-bold text-teal-600">{layout}</span> (Inches)</div>
                                {sizeCategory === 'CUSTOM' ? (
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm text-gray-700">Custom Dimensions</span>
                                            <button onClick={() => setSizeCategory('STANDARD')} className="text-xs text-teal-600 underline">Back to Standard</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Width (in)</label>
                                                <select
                                                    value={width}
                                                    onChange={(e) => setWidth(parseInt(e.target.value))}
                                                    className="w-full p-2 rounded border border-gray-600 text-sm text-gray-900 bg-white"
                                                >
                                                    {Array.from({ length: 41 }, (_, i) => i + 8).map(w => (
                                                        <option key={w} value={w} className="text-gray-900 bg-white">{w}"</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Height (in)</label>
                                                <select
                                                    value={height}
                                                    onChange={(e) => setHeight(parseInt(e.target.value))}
                                                    className="w-full p-2 rounded border border-gray-600 text-sm text-gray-900 bg-white"
                                                >
                                                    {Array.from({ length: 53 }, (_, i) => i + 12).map(h => (
                                                        <option key={h} value={h} className="text-gray-900 bg-white">{h}"</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 italic">Price is calculated automatically based on area.</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {activeSizes.map(s => (
                                            <button
                                                key={s.label}
                                                onClick={() => {
                                                    setSizeLabel(s.label);
                                                    setSizeCategory('STANDARD');
                                                    setWidth(s.width);
                                                    setHeight(s.height);
                                                }}
                                                className={`h-12 px-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center ${sizeLabel === s.label ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                        {/* Hide Custom Size button if using productSizes (because product specific sizes usually don't allow arbitrary custom)
                                            Actually, user might still want custom. But usually fixed set.
                                            Let's keep Custom Size button for now, but ensure it works.
                                        */}
                                        <button
                                            onClick={() => {
                                                setSizeCategory('CUSTOM');
                                                setSizeLabel('Custom');
                                            }}
                                            className={`h-12 px-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center border-gray-200 text-gray-600 hover:border-gray-300`}
                                        >
                                            Custom Size
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleAddToCart} className="w-full py-4 text-lg font-bold bg-white text-teal-600 border-2 border-teal-600 rounded-xl hover:bg-teal-50 transition-colors">Add to Cart</button>
                                <button onClick={handleBuyNow} className="w-full py-4 text-lg font-bold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200/50">Buy Now</button>
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <span>🔒 Secure Checkout</span>
                                <span>•</span>
                                <span>✨ 1 Year Warranty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
