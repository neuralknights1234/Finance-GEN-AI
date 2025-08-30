import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, alt, className, fallback }) => {
  const [error, setError] = useState(false);
  if (error) {
    return <>{fallback || null}</>;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default ImageWithFallback;

