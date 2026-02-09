import React, { useState, useEffect, useRef } from 'react';
import { optimizeImage } from '../utils/optimizeImage';

interface SmoothImageProps {
  src: string;
  alt: string;
  className?: string;
  logo?: string;
  sizes?: string;
  priority?: boolean;
  crossfade?: boolean;
}

export const SmoothImage: React.FC<SmoothImageProps> = ({
  src,
  alt,
  className,
  logo,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  crossfade = false
}) => {
  const [activeSrc, setActiveSrc] = useState(src);
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [nextLoaded, setNextLoaded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (src !== activeSrc) {
      setNextSrc(src);
      setNextLoaded(false);
    } else {
      setNextSrc(null);
      setNextLoaded(false);
    }
  }, [src, activeSrc]);

  const onNextLoad = () => {
    if (mountedRef.current) {
      setNextLoaded(true);

      // Small delay to ensure browser has painted the new image over the old one
      setTimeout(() => {
        if (mountedRef.current && src === nextSrc) {
          setActiveSrc(src);
          setNextSrc(null);
          setNextLoaded(false);
        }
      }, crossfade ? 320 : 60);
    }
  };

  const getSrcSet = (s: string) =>
    `${optimizeImage(s, 400)} 400w, ${optimizeImage(s, 800)} 800w, ${optimizeImage(s, 1200)} 1200w`;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {/* 🖼️ Base Image: The stable source. Never removed until next is ready and painted. */}
      <img
        key={`base-${activeSrc}`}
        src={optimizeImage(activeSrc, 800)}
        srcSet={getSrcSet(activeSrc)}
        sizes={sizes}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain select-none z-[1]"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />

      {/* 🖼️ Next Image: Preloads silently, then covers the base. */}
      {nextSrc && (
        <img
          key={`next-${nextSrc}`}
          src={optimizeImage(nextSrc, 800)}
          srcSet={getSrcSet(nextSrc)}
          sizes={sizes}
          alt={alt}
          onLoad={onNextLoad}
          className="absolute inset-0 w-full h-full object-contain select-none z-[2]"
          style={{
            opacity: nextLoaded ? 1 : 0,
            transition: crossfade ? 'opacity 0.25s ease-in-out' : 'none',
            pointerEvents: 'none'
          }}
          loading="eager"
          decoding="async"
        />
      )}

      {logo && (
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '60px', height: '60px', opacity: 0.35, pointerEvents: 'none', zIndex: 100 }}>
          <img src={logo} alt="Watermark" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} draggable={false} />
        </div>
      )}
    </div>
  );
};
