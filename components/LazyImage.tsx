import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, placeholderClassName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          ref={placeholderRef}
          className={`absolute inset-0 bg-gray-200 animate-pulse ${placeholderClassName}`}
        ></div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
      />
    </div>
  );
};
