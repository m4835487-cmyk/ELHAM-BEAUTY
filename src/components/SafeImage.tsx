import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({ src, alt, className = '', fallbackTitle }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF7FA] via-[#FCE8F0] to-[#FFFFFF] text-[#CC4B7C] p-6 text-center select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Sparkles className="w-7 h-7 mb-2 opacity-75 stroke-[1.5]" />
        <span className="font-display text-sm font-semibold tracking-wider text-[#2A1620]">
          {fallbackTitle || 'ELHAM BEAUTY'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
