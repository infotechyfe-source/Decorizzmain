import React, { useRef } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Home, ChevronRight, Star, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackImage from '../assets/back.jpg';
import LandscapeImg from '../assets/landscape.jpeg';
import { NEON_LANDSCAPE_SIZES, NEON_SQUARE_SIZES } from '../utils/neonConstants';

interface AcrylicProductDesignerProps {
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
    backboard: string;
    setBackboard: (b: string) => void;
    backboardOpen: boolean;
    setBackboardOpen: (o: boolean) => void;
}

export const AcrylicProductDesigner: React.FC<AcrylicProductDesignerProps> = ({
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
    backboard,
    setBackboard,
    backboardOpen,
    setBackboardOpen
}) => {
    const [sizeCategory, setSizeCategory] = React.useState<'LANDSCAPE' | 'SQUARE' | 'CUSTOM'>('LANDSCAPE');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const original = Math.round(price * 1.05);

    const activeSize = [...NEON_LANDSCAPE_SIZES, ...NEON_SQUARE_SIZES].find(s => s.label === sizeLabel);
    const widthInches = sizeCategory === 'CUSTOM' ? width : (activeSize?.width || parseInt(sizeLabel, 10) || 24);
    const heightInches = sizeCategory === 'CUSTOM' ? height : (activeSize?.height || Math.max(6, Math.round(widthInches * 0.3)));
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

    const backboardStyle = (() => {
        const base: React.CSSProperties = { border: 'none', background: 'transparent' };
        // We can add specific backboard logic here if needed, or just keep it simple for now
        switch (backboard) {
            case 'Rectangle': return { ...base, borderRadius: 8, border: '1px solid #ddd' };
            case 'Rounded Rectangle': return { ...base, borderRadius: 16, border: '1px solid #ddd' };
            case 'Pill shape': return { ...base, borderRadius: 9999, border: '1px solid #ddd' };
            case 'Circle': return { ...base, borderRadius: '50%', padding: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' };
            case 'Ornate': return { ...base, borderRadius: 12, border: '1px solid #ddd' }; // Simplified for acrylic
            case 'Cut to shape': default: return { ...base };
        }
    })();

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
                <span style={{ color: '#1f2937' }}>Custom Acrylic Artwork</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start overflow-visible">

                <div className="sticky top-[105px] self-start z-30 space-y-4">
                    <div className="rounded-xl overflow-hidden relative shadow-lg" style={{ background: `url(${LandscapeImg}) center/cover`, minHeight: 400 }}>
                        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 0 }} />
                        <div className="absolute top-4 left-4 flex items-center gap-2" style={{ zIndex: 10 }}>
                            <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                {widthInches}" Wide
                            </div>
                        </div>

                        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-8" style={{ zIndex: 5 }}>
                            <div style={{ position: 'relative', display: 'inline-block', padding: '12px 24px', transition: 'all 0.5s ease-in-out', ...backboardStyle }}>
                                {customFile ? (
                                    <img src={customFile.dataUrl} alt="Custom Design" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                                ) : (
                                    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer border-2 border-dashed border-white/50 rounded-xl p-8 flex flex-col items-center justify-center text-white/80 hover:bg-white/10 transition-colors">
                                        <Upload className="w-12 h-12 mb-2" />
                                        <span className="font-bold">Upload Image</span>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                                    <div className="h-px bg-white/50 w-full absolute top-0"></div>
                                    <div className="h-2 w-px bg-white/50 absolute top-[-4px] left-0"></div>
                                    <div className="h-2 w-px bg-white/50 absolute top-[-4px] right-0"></div>
                                    <div className="text-center text-xs text-white" style={{ marginTop: 6 }}>{widthCm}cm / {widthInches}in</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                        <div>
                            <div className="mb-2 font-semibold text-gray-700">Upload Your Design (SVG):</div>
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
                            <p className="text-xs text-gray-400 mt-2">Supported formats: SVG, PNG, JPG, WEBP. Best quality with SVG.</p>
                        </div>
                    </div>
                </div>

                {/* Customization Controls */}
                <div>
                    <div className="mb-6">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900 font-serif">
                            Custom Acrylic Artwork
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                            {/* Fixed Rating for now */}
                            <div className="flex text-yellow-500">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">(New Arrival)</span>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                            <span className="text-gray-500 text-lg line-through">₹{original.toLocaleString('en-IN')}</span>
                            <span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded text-sm">
                                5% OFF
                            </span>
                        </div>
                        <div className="h-px bg-gray-200 w-full mb-6"></div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Customize Dimensions</h2>

                        <div className="mt-6 space-y-6">

                            <div>
                                <div className="mb-2" style={{ color: '#374151' }}>Pick Backboard Shape</div>
                                <div className="relative w-full rounded-lg border-2 px-3 py-2 mb-3" onClick={() => setBackboardOpen(!backboardOpen)} style={{ borderColor: '#14b8a6', backgroundColor: '#ffffff', color: '#1f2937', cursor: 'pointer' }}>
                                    <span>{backboard}</span>
                                    <span style={{ position: 'absolute', right: 16, top: 6, color: '#14b8a6' }}>{backboardOpen ? '∧' : '∨'}</span>
                                </div>
                                {backboardOpen && (
                                    <div className="dropdown-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, backgroundColor: '#ffffff', padding: 8, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                                        {['Rectangle', 'Cut to shape', 'Pill shape', 'Circle', 'Ornate', 'Rounded Rectangle'].map(b => (
                                            <button key={b} onClick={() => { setBackboard(b); setBackboardOpen(false); }} className={`p-2 text-xs font-medium rounded border ${backboard === b ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <div className="mb-2" style={{ color: '#374151' }}>Choose Size (Dimensions):</div>
                                {sizeCategory === 'CUSTOM' ? (
                                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm text-gray-700">Custom Dimensions</span>
                                            <button onClick={() => setSizeCategory('LANDSCAPE')} className="text-xs text-teal-600 underline">Back to Standard</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Width (in)</label>
                                                <select
                                                    value={width}
                                                    onChange={(e) => setWidth(parseInt(e.target.value))}
                                                    className="w-full p-2 rounded border border-gray-600 text-sm text-gray-900 bg-white"
                                                >
                                                    {Array.from({ length: 29 }, (_, i) => i + 8).map(w => (
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
                                                    {Array.from({ length: 43 }, (_, i) => i + 6).map(h => (
                                                        <option key={h} value={h} className="text-gray-900 bg-white">{h}"</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 italic">Price is calculated automatically based on area.</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {(sizeCategory === 'LANDSCAPE' ? NEON_LANDSCAPE_SIZES : NEON_SQUARE_SIZES).map(s => (
                                            <button
                                                key={s.label}
                                                onClick={() => {
                                                    setSizeLabel(s.label);
                                                    setSizeCategory('LANDSCAPE');
                                                }}
                                                className={`h-12 px-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center ${sizeLabel === s.label ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                setSizeCategory('CUSTOM');
                                                setSizeLabel('Custom');
                                            }}
                                            className={`h-12 px-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center ${sizeCategory === 'CUSTOM' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
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
