'use client';

import Image from 'next/image';
import { useState } from 'react';

interface MDXImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  variant?: 'thumbnail' | 'full' | 'default';
}

const MDXImage: React.FC<MDXImageProps> = ({ src, alt, title, className, variant = 'default' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  let imageSrc = src;
  if (src.startsWith('/')) {
    imageSrc = src;
  } else if (variant === 'thumbnail') {
    imageSrc = `/img/posts/thumbnails/${src}`;
  } else {
    imageSrc = `/img/posts/${src}`;
  }

  const aspectRatio = variant === 'thumbnail' ? 'aspect-[16/9]' : 'aspect-[16/9]';
  const imageStyle = variant === 'thumbnail' ? 'object-cover' : 'object-contain';

  return (
    <figure className={`my-${variant === 'thumbnail' ? '4' : '8'}`}>
      <div className={`relative w-full overflow-hidden ${className || ''}`}>
        <div className={`${aspectRatio} w-full`}>
          <div
            className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={imageSrc}
              alt={alt}
              title={title || alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 800px"
              className={`rounded-lg ${imageStyle}`}
              onLoadingComplete={() => setIsLoaded(true)}
              unoptimized
            />
          </div>
        </div>
      </div>
      {title && <figcaption className="mt-2 text-center text-sm text-gray-600">{title}</figcaption>}
    </figure>
  );
};

export default MDXImage;
