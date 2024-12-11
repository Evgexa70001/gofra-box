import { useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage = ({ src, alt, className }: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('placeholder.png');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
    };
  }, [src]);

  return <img src={imageSrc} alt={alt} className={className} loading="lazy" />;
};

export default LazyImage;
