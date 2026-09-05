import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'vertical' | 'mark-only';
  className?: string;
  lightText?: boolean;
}

export const UrduBazarsLogo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  className = '',
  lightText = false
}) => {
  const iconHeights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const taglineSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'mark-only') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 450 300" className={`${iconHeights[size]} w-auto`} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pixel squares */}
          <rect x="80" y="30" width="18" height="18" fill="#082B4C" rx="2" />
          <rect x="105" y="30" width="18" height="18" fill="#082B4C" rx="2" />
          <rect x="105" y="55" width="18" height="18" fill="#082B4C" rx="2" />
          <rect x="130" y="55" width="18" height="18" fill="#082B4C" rx="2" />
          <rect x="130" y="80" width="18" height="18" fill="#082B4C" rx="2" />
          <rect x="155" y="80" width="18" height="18" fill="#082B4C" rx="2" />

          {/* Letter U */}
          <path d="M 160 110 L 195 110 L 195 195 C 195 220 210 235 235 235 C 260 235 275 220 275 195 L 275 60 L 310 60 L 310 195 C 310 242 278 270 235 270 C 192 270 160 242 160 195 Z" fill="#082B4C" />

          {/* Letter B */}
          <path d="M 275 60 L 350 60 C 385 60 405 80 405 112 C 405 135 390 150 370 156 C 395 162 412 182 412 212 C 412 248 385 270 345 270 L 275 270 L 275 235 L 345 235 C 365 235 380 225 380 211 C 380 197 365 187 340 187 L 305 187 L 305 155 L 340 155 C 360 155 375 145 375 131 C 375 117 360 92 340 92 L 275 92 Z" fill="#F47700" />
        </svg>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center select-none text-center ${className}`}>
        <svg viewBox="0 0 450 280" className={`${iconHeights[size]} w-auto mb-1`} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="80" y="30" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
          <rect x="105" y="30" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
          <rect x="105" y="55" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
          <rect x="130" y="55" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
          <rect x="130" y="80" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
          <rect x="155" y="80" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />

          <path d="M 160 110 L 195 110 L 195 195 C 195 220 210 235 235 235 C 260 235 275 220 275 195 L 275 60 L 310 60 L 310 195 C 310 242 278 270 235 270 C 192 270 160 242 160 195 Z" fill={lightText ? "#FFFFFF" : "#082B4C"} />
          <path d="M 275 60 L 350 60 C 385 60 405 80 405 112 C 405 135 390 150 370 156 C 395 162 412 182 412 212 C 412 248 385 270 345 270 L 275 270 L 275 235 L 345 235 C 365 235 380 225 380 211 C 380 197 365 187 340 187 L 305 187 L 305 155 L 340 155 C 360 155 375 145 375 131 C 375 117 360 92 340 92 L 275 92 Z" fill="#F47700" />
        </svg>

        <div className="flex items-baseline tracking-tight font-extrabold leading-none">
          <span className={`${textSizes[size]} ${lightText ? 'text-white' : 'text-[#082B4C]'}`}>Urdu</span>
          <span className={`${textSizes[size]} text-[#F47700] ml-1`}>Bazars</span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 w-full justify-center opacity-90">
          <div className="flex items-center gap-1">
            <span className={`h-0.5 w-8 ${lightText ? 'bg-white/60' : 'bg-[#082B4C]'}`}></span>
            <span className={`h-1.5 w-1.5 rounded-full ${lightText ? 'bg-white' : 'bg-[#082B4C]'}`}></span>
          </div>
          <span className={`font-urdu font-semibold ${taglineSizes[size]} ${lightText ? 'text-amber-200' : 'text-[#082B4C]'}`}>
            کتاب سے دنیا تک
          </span>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F47700]"></span>
            <span className="h-0.5 w-8 bg-[#F47700]"></span>
          </div>
        </div>
      </div>
    );
  }

  // Horizontal layout (Default for Header & Navbar)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg viewBox="0 0 450 300" className={`${iconHeights[size]} w-auto shrink-0`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="80" y="30" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
        <rect x="105" y="30" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
        <rect x="105" y="55" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
        <rect x="130" y="55" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
        <rect x="130" y="80" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />
        <rect x="155" y="80" width="18" height="18" fill={lightText ? "#FFFFFF" : "#082B4C"} rx="2" />

        <path d="M 160 110 L 195 110 L 195 195 C 195 220 210 235 235 235 C 260 235 275 220 275 195 L 275 60 L 310 60 L 310 195 C 310 242 278 270 235 270 C 192 270 160 242 160 195 Z" fill={lightText ? "#FFFFFF" : "#082B4C"} />
        <path d="M 275 60 L 350 60 C 385 60 405 80 405 112 C 405 135 390 150 370 156 C 395 162 412 182 412 212 C 412 248 385 270 345 270 L 275 270 L 275 235 L 345 235 C 365 235 380 225 380 211 C 380 197 365 187 340 187 L 305 187 L 305 155 L 340 155 C 360 155 375 145 375 131 C 375 117 360 92 340 92 L 275 92 Z" fill="#F47700" />
      </svg>

      <div className="flex flex-col justify-center">
        <div className="flex items-baseline font-extrabold tracking-tight leading-none">
          <span className={`${textSizes[size]} ${lightText ? 'text-white' : 'text-[#082B4C]'}`}>Urdu</span>
          <span className={`${textSizes[size]} text-[#F47700] ml-1`}>Bazars</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`h-px w-3 ${lightText ? 'bg-white/40' : 'bg-[#082B4C]/40'}`}></span>
          <span className={`font-urdu font-medium text-[11px] leading-tight ${lightText ? 'text-amber-200' : 'text-[#082B4C]'}`}>
            کتاب سے دنیا تک
          </span>
          <span className="h-px w-3 bg-[#F47700]/50"></span>
        </div>
      </div>
    </div>
  );
};
