import React, { useMemo, useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { optimizeImage } from "../utils/optimizeImage";

interface HeroImage {
  id: string;
  imageUrl: string;
  imageUrlMobile?: string;
  page?: string;
  linkUrl?: string;
  active: boolean;
}

interface HeroCarouselProps {
  images: HeroImage[];
  loading?: boolean;
  variant?: "home" | "gallery" | "shop";
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  images,
  loading,
  variant = "gallery",
}) => {
  const heroPlugins = useMemo(
    () => [Autoplay({ delay: 4000, stopOnInteraction: false })],
    []
  );

  const [viewportW, setViewportW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const processedImages = useMemo(() => {
    if (!images.length) return [];
    return viewportW < 768
      ? images.map((h) => optimizeImage(h.imageUrlMobile || h.imageUrl, 900, 100))
      : images.map((h) => optimizeImage(h.imageUrl, 3000, 100));
  }, [images, viewportW]);

  if (loading) {
    return <div className="w-full h-[50vh] bg-gray-100 animate-pulse rounded-lg" />;
  }

  if (!images.length) return null;

  return (
    <section className="relative w-full overflow-hidden" aria-label="Hero Banner">
      <Carousel
        plugins={heroPlugins}
        opts={{ loop: true, align: "start", slidesToScroll: 1 }}
        className="w-full"
      >
        <CarouselContent className="flex">
          {processedImages.map((src, idx) => {
            const image = images[idx];
            const isMobile = viewportW < 768;

            const ImageNode = (
              <ImageWithFallback
                src={src}
                alt={`Hero Banner Slide ${idx + 1}`}
                className={`${isMobile
                    ? "w-full h-auto object-contain block" // full image, adjust div height automatically
                    : "w-full h-[50vh] lg:h-screen object-cover"
                  }`}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding={idx === 0 ? "auto" : "async"}
              />
            );

            return (
              <CarouselItem
                key={idx}
                className={`relative flex-shrink-0 w-full ${isMobile ? "flex justify-center" : "h-[50vh] lg:h-screen"
                  }`}
              >
                {image?.linkUrl ? <a href={image.linkUrl}>{ImageNode}</a> : ImageNode}
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-4 z-10 hidden lg:flex text-white bg-black/20 p-2 rounded-full hover:bg-black/40 transition" />
            <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-4 z-10 hidden lg:flex text-white bg-black/20  rounded-full hover:bg-black/40 transition" />
          </>
        )}
      </Carousel>
    </section>
  );
};
