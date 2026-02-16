import React, { memo, useMemo, useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Home, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackImage from '../assets/back.jpg';
import { NEON_PRICE, FONTS_META, NEON_SWATCHES, NEON_LANDSCAPE_SIZES, NEON_SQUARE_SIZES } from '../utils/neonConstants';

interface NeonProductDesignerProps {
  neonPrice: number;
  neonSize: string;
  setNeonSize: (size: string) => void;
  neonOn: boolean;
  setNeonOn: (on: boolean) => void;
  neonColor: string;
  setNeonColor: (color: string) => void;
  neonText: string;
  setNeonText: (text: string) => void;
  neonFont: string;
  setNeonFont: (font: string) => void;
  neonBackboard: string;
  setNeonBackboard: (backboard: string) => void;
  neonFontOpen: boolean;
  setNeonFontOpen: (open: boolean) => void;
  neonBackboardOpen: boolean;
  setNeonBackboardOpen: (open: boolean) => void;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  neonLightMode: 'NORMAL' | 'RGB';
  setNeonLightMode: (mode: 'NORMAL' | 'RGB') => void;
  neonSizeLabel: string;
  setNeonSizeLabel: (label: string) => void;
  neonWidth: number;
  setNeonWidth: (w: number) => void;
  neonHeight: number;
  setNeonHeight: (h: number) => void;
}

const NeonProductDesignerContent: React.FC<NeonProductDesignerProps> = ({
  neonPrice,
  neonSize,
  setNeonSize,
  neonOn,
  setNeonOn,
  neonColor,
  setNeonColor,
  neonText,
  setNeonText,
  neonFont,
  setNeonFont,
  neonBackboard,
  setNeonBackboard,
  neonFontOpen,
  setNeonFontOpen,
  neonBackboardOpen,
  setNeonBackboardOpen,
  handleAddToCart,
  handleBuyNow,
  neonLightMode,
  setNeonLightMode,
  neonSizeLabel,
  setNeonSizeLabel,
  neonWidth,
  setNeonWidth,
  neonHeight,
  setNeonHeight
}) => {
  const [sizeCategory, setSizeCategory] = useState<'LANDSCAPE' | 'SQUARE' | 'CUSTOM'>('LANDSCAPE');

  const original = useMemo(() => Math.round(neonPrice * 1.05), [neonPrice]);

  const activeSize = useMemo(() =>
    [...NEON_LANDSCAPE_SIZES, ...NEON_SQUARE_SIZES].find(s => s.label === neonSizeLabel),
    [neonSizeLabel]
  );

  const { widthInches, heightInches, widthCm, heightCm } = useMemo(() => {
    const w = sizeCategory === 'CUSTOM' ? neonWidth : (activeSize?.width || parseInt(neonSize, 10) || 24);
    const h = sizeCategory === 'CUSTOM' ? neonHeight : (activeSize?.height || Math.max(6, Math.round(w * 0.3)));
    return {
      widthInches: w,
      heightInches: h,
      widthCm: Math.round(w * 2.54),
      heightCm: Math.round(h * 2.54)
    };
  }, [sizeCategory, neonWidth, neonHeight, activeSize, neonSize]);

  const backboardStyle = useMemo(() => {
    const base: React.CSSProperties = {
      border: `2px solid ${neonOn ? neonColor : '#9ca3af'}`,
      boxShadow: neonOn ? `0 0 12px ${neonColor}66` : 'none',
      background: 'rgba(0,0,0,0.25)',
      transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
    };
    switch (neonBackboard) {
      case 'Rectangle': return { ...base, borderRadius: 8 };
      case 'Rounded Rectangle': return { ...base, borderRadius: 16 };
      case 'Pill shape': return { ...base, borderRadius: 9999 };
      case 'Circle': return { ...base, borderRadius: '50%', padding: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
      case 'Ornate': return { ...base, borderRadius: 12, borderStyle: 'double', borderWidth: 4, borderColor: neonOn ? neonColor : '#9ca3af' };
      case 'Cut to shape': default: return { ...base, borderStyle: 'dashed', borderRadius: 6 };
    }
  }, [neonOn, neonColor, neonBackboard]);

  return (
    <div className="min-h-screen content-offset" style={{ backgroundColor: '#fafaf9' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-10 text-sm flex items-center gap-2 text-gray-600">
        <Home className="w-4 h-4" color="#6b7280" />
        <Link to="/" className="hover:underline" style={{ color: '#1f2937' }}>Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/custom-designs" className="hover:underline" style={{ color: '#1f2937' }}>Custom-Designs</Link>
        <ChevronRight className="w-4 h-4" />
        <span style={{ color: '#1f2937' }}>Custom Neon Sign</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start overflow-visible">
        {/* Helper/Preview Area */}
        <div className="sticky top-[105px] self-start z-30 space-y-4">
          <div className="rounded-xl overflow-hidden relative shadow-lg" style={{ background: `url(${BackImage}) center/cover`, minHeight: 500 }}>
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 0 }} />
            <div className="absolute top-4 left-4 flex items-center gap-2" style={{ zIndex: 10 }}>
              <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {widthInches}" Wide
              </div>
              <button onClick={() => setNeonOn(!neonOn)} className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-colors ${neonOn ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-200 text-gray-600'}`}>
                {neonOn ? 'LIGHTS ON' : 'LIGHTS OFF'}
              </button>
            </div>

            <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-8" style={{ zIndex: 5 }}>
              <div style={{ position: 'relative', display: 'inline-block', padding: '12px 24px', ...backboardStyle }}>
                {neonOn && (
                  <div style={{ position: 'absolute', inset: -16, borderRadius: 16, background: neonColor, filter: 'blur(24px)', opacity: 0.25, pointerEvents: 'none', transition: 'background 0.4s ease' }}></div>
                )}
                {(() => {
                  const meta = FONTS_META.find(m => m.label === neonFont);
                  const fam = (meta?.family || 'cursive').replace(/"/g, '');
                  const isOutline = meta?.outline;

                  const style: React.CSSProperties = {
                    fontFamily: fam,
                    fontSize: 'clamp(32px, 5vw, 64px)',
                    lineHeight: 1.2,
                    textAlign: 'center',
                    color: isOutline ? 'transparent' : (neonOn ? neonColor : '#9ca3af'),
                    textShadow: (!isOutline && neonOn) ? `0 0 10px ${neonColor}, 0 0 20px ${neonColor}` : 'none',
                    WebkitTextStroke: isOutline ? `2px ${neonOn ? neonColor : '#9ca3af'}` : undefined,
                    filter: (isOutline && neonOn) ? `drop-shadow(0 0 8px ${neonColor})` : undefined,
                    transition: 'color 0.4s ease, text-shadow 0.4s ease, -webkit-text-stroke 0.4s ease, filter 0.4s ease',
                    display: 'inline-block',
                    willChange: 'color, text-shadow, filter'
                  };

                  return (
                    <div style={{ ...style, whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                      {neonText}
                    </div>
                  );
                })()}

                <div style={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  <div className="h-px bg-white/50 w-full absolute top-0"></div>
                  <div className="h-2 w-px bg-white/50 absolute top-[-4px] left-0"></div>
                  <div className="h-2 w-px bg-white/50 absolute top-[-4px] right-0"></div>
                  <div className="text-center text-xs" style={{ marginTop: 6 }}>{widthCm}cm / {widthInches}in</div>
                </div>
              </div>
            </div>
          </div>
          {/* Product Header Info - Matching Standard Page */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900 font-serif">
              Custom Name Neon Sign
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(128 reviews)</span>
            </div>

            {/* Price moved to top */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold text-gray-900">₹{neonPrice.toLocaleString('en-IN')}</span>
              <span className="text-gray-500 text-lg line-through">₹{original.toLocaleString('en-IN')}</span>
              <span className="text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded text-sm">
                5% OFF
              </span>
            </div>
            <div className="h-px bg-gray-200 w-full mb-6"></div>
          </div>
        </div>

        {/* Customization Controls */}
        <div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#1f2937' }}>Design Your Sign</h2>
            <a href="#" className="section-cta-text uppercase text-xs mb-6 block">WANT TO GET A CUSTOM LOGO/DESIGN? CLICK HERE.</a>
            <div className="mt-6 space-y-6">

              <div>
                {/* MOVED CONTROLS: Text & Color */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                  <div>
                    <div className="mb-2 font-semibold text-gray-700">Write your Text:</div>
                    <textarea
                      value={neonText}
                      onChange={(e) => {
                        // Split into lines
                        let lines = e.target.value.split('\n').map(line => line.slice(0, 10));
                        // Limit total lines to 5
                        if (lines.length > 5) lines = lines.slice(0, 5);
                        setNeonText(lines.join('\n'));

                        // Auto-resize
                        const textarea = e.target;
                        textarea.style.height = 'auto'; // reset
                        textarea.style.height = textarea.scrollHeight + 'px'; // expand
                      }}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:outline-none text-lg font-medium transition-colors text-gray-900 placeholder-gray-400 resize-none overflow-hidden"
                      placeholder="Enter text..."
                    />
                    <div className="text-right text-xs text-gray-400 mt-1">
                      {neonText.split('\n').map(line => line.length).join(' / ')} characters per line
                    </div>

                    <div className="text-right text-xs text-gray-400 mt-1">{neonText.length}/20</div>
                  </div>

                  <div>
                    <div className="mb-3 font-semibold text-gray-700">Select Your Colour:</div>
                    <div className="flex flex-wrap gap-2">
                      {NEON_SWATCHES.map(c => (
                        <button
                          key={c}
                          onClick={() => setNeonColor(c)}
                          className="w-8 h-8 rounded-full transition-transform hover:scale-110 border-2"
                          style={{
                            backgroundColor: c,
                            borderColor: neonColor === c ? '#14b8a6' : 'transparent',
                            boxShadow: neonColor === c ? `0 0 0 2px white, 0 0 0 4px #14b8a6` : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                      Selected: <span className="w-4 h-4 rounded-sm block" style={{ backgroundColor: neonColor }}></span>
                      <span className="font-medium text-gray-900">{neonColor}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-2" style={{ color: '#374151' }}>Select Font Style</div>

                <div
                  className="relative w-full rounded-lg border-2 px-3 py-2 mb-3 flex items-center justify-between"
                  onClick={() => setNeonFontOpen(!neonFontOpen)}
                  style={{
                    borderColor: '#14b8a6',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    cursor: 'pointer',
                    minHeight: 40, // <- ensures consistent height even when empty
                  }}
                >
                  <span style={{ fontFamily: neonFont ? FONTS_META.find(f => f.label === neonFont)?.family.replace(/"/g, '') : 'inherit', color: neonFont ? '#1f2937' : '#9ca3af' }}>
                    {neonFont || 'Select a font'}
                  </span>
                  <span style={{ color: '#14b8a6' }}>{neonFontOpen ? '∧' : '∨'}</span>
                </div>

                {neonFontOpen && (
                  <div
                    className="dropdown-scroll"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 12,
                      maxHeight: 300,
                      overflowY: 'auto',
                      backgroundColor: '#ffffff',
                      padding: 8,
                      borderRadius: 12,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {FONTS_META.map(f => {
                      const selected = neonFont === f.label;
                      const tileStyle: React.CSSProperties = {
                        border: `1px solid ${selected ? '#14b8a6' : '#d1d5db'}`,
                        backgroundColor: '#ffffff',
                        color: selected ? '#14b8a6' : '#1f2937',
                        fontFamily: f.family,
                        borderRadius: 12,
                        padding: '14px 12px',
                        textAlign: 'center',
                        textTransform: f.uppercase ? 'uppercase' : 'none',
                        letterSpacing: f.letterSpacing || 'normal',
                        WebkitTextStroke: f.outline ? (selected ? '1.2px #14b8a6' : '1px #1f2937') : undefined,
                        boxShadow: selected ? '0 0 14px #14b8a655' : 'none',
                      };
                      return (
                        <button
                          key={f.label}
                          onClick={() => { setNeonFont(f.label); setNeonFontOpen(false); }}
                          style={tileStyle}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>

              <div>
                <div className="mb-2" style={{ color: '#374151' }}>Pick the Backboard shape for your Neon sign</div>
                <div className="relative w-full rounded-lg border-2 px-3 py-2 mb-3" onClick={() => setNeonBackboardOpen(!neonBackboardOpen)} style={{ borderColor: '#14b8a6', backgroundColor: '#ffffff', color: '#1f2937', cursor: 'pointer' }}>
                  <span>{neonBackboard}</span>
                  <span style={{ position: 'absolute', right: 16, top: 6, color: '#14b8a6' }}>{neonBackboardOpen ? '∧' : '∨'}</span>
                </div>
                {neonBackboardOpen && (
                  <div className="dropdown-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, backgroundColor: '#ffffff', padding: 8, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    {['Rectangle', 'Cut to shape', 'Pill shape', 'Circle', 'Ornate', 'Rounded Rectangle'].map(b => (
                      <button key={b} onClick={() => { setNeonBackboard(b); setNeonBackboardOpen(false); }} className={`p-2 text-xs font-medium rounded border ${neonBackboard === b ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="mb-2" style={{ color: '#374151' }}>Light Type:</div>
                <div className="flex gap-2">
                  {(['NORMAL', 'RGB'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setNeonLightMode(mode)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-all ${neonLightMode === mode ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>

                <div className="mb-2" style={{ color: '#374151' }}>Choose Size (Dimensions):</div>
                
                <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg">
                  {['LANDSCAPE', 'SQUARE', 'CUSTOM'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSizeCategory(cat as any);
                        // Reset selection to first option when switching categories if not custom
                        if (cat === 'LANDSCAPE') setNeonSizeLabel(NEON_LANDSCAPE_SIZES[0].label);
                        if (cat === 'SQUARE') setNeonSizeLabel(NEON_SQUARE_SIZES[0].label);
                      }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${sizeCategory === cat
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {cat === 'LANDSCAPE' ? 'Landscape' : cat === 'SQUARE' ? 'Square / Circle' : 'Custom'}
                    </button>
                  ))}
                </div>

                {sizeCategory === 'CUSTOM' ? (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-gray-700">Custom Dimensions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Width (in)</label>
                        <select
                          value={neonWidth}
                          onChange={(e) => setNeonWidth(parseInt(e.target.value))}
                          className="w-full p-2 rounded border border-gray-600 text-sm text-gray-900 bg-white shadow-sm"
                        >
                          {Array.from({ length: 29 }, (_, i) => i + 8).map(w => (
                            <option key={w} value={w} className="text-gray-900 bg-white">{w}"</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Height (in)</label>
                        <select
                          value={neonHeight}
                          onChange={(e) => setNeonHeight(parseInt(e.target.value))}
                          className="w-full p-2 rounded border border-gray-600 text-sm text-gray-900 bg-white shadow-sm"
                        >
                          {Array.from({ length: 59 }, (_, i) => i + 6).map(h => (
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
                          setNeonSizeLabel(s.label);
                        }}
                        className={`h-12 px-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center ${neonSizeLabel === s.label
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        {s.label}
                      </button>
                    ))}
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

export const NeonProductDesigner = memo(NeonProductDesignerContent);

export default NeonProductDesigner;
