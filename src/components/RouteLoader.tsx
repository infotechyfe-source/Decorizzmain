import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function RouteLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const prevPathRef = useRef(location.pathname);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only show loader when the path actually changes
    if (prevPathRef.current !== location.pathname) {
      setLoading(true);
      prevPathRef.current = location.pathname;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Hide after a brief delay - content should be loaded by then
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
      }, 1000); // Short 300ms - just for visual feedback during navigation
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm"
      style={{
        animation: 'fadeIn 0.15s ease-out',
        pointerEvents: 'none' // Don't block interactions
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
        <p className="text-gray-900 font-bold tracking-widest text-sm">LOADING...</p>
      </div>
    </div>
  );
}
