import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'compact' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  withLink = true,
}) => {
  const pixelDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 42, height: 42 },
    lg: { width: 56, height: 56 },
  }[size];

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon */}
      <div className="relative rounded-xl p-1 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(16,185,129,0.25)]">
        <Image
          src="/images/liderzy-jutra-logo.svg"
          alt="Liderzy Jutra Logo"
          width={pixelDimensions.width}
          height={pixelDimensions.height}
          priority
          className="object-contain"
          onError={(e) => {
            // If image fails, fallback gracefully to stylized text/vector
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Typography for horizontal variant */}
      {variant === 'horizontal' && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold tracking-wider text-xs md:text-sm text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 uppercase">
            Liderzy Jutra
          </span>
          <span className="font-black text-base md:text-lg tracking-tight text-white flex items-center gap-1.5">
            Teen<span className="text-emerald-400">Bond</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Core
            </span>
          </span>
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link href="/path" className="inline-block transition-transform hover:scale-[1.02] active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return content;
};
