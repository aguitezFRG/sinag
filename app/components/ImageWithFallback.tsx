'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = ERROR_IMG_SRC,
  className,
  style,
  fill,
  width,
  height,
  ...rest
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  if (didError) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 ${className ?? ''}`}
        style={{
          ...style,
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackSrc}
          alt={alt || 'Error loading image'}
          className="max-w-full max-h-full"
          data-original-url={src}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      {...rest}
    />
  );
}

export const PLACEHOLDER_IMAGE = '/images/placeholder.png';
export const LOGO_IMAGE = '/images/logo.png';
export const SESAM_BUILDING_1 = '/images/placeholder.png';
export const SESAM_BUILDING_2 = '/images/placeholder.png';
export const SESAM_INTERIOR = '/images/placeholder.png';
