import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface CowTeacherAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | '3d-mascot';
  className?: string;
  showBadge?: boolean;
  is3dInteractive?: boolean;
}

export const CowTeacherAvatar: React.FC<CowTeacherAvatarProps> = ({
  size = 'md',
  className = '',
  showBadge = false,
  is3dInteractive = false,
}) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3dInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate rotation (-12deg to 12deg)
    const rotateX = ((centerY - y) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    hero: 'w-full aspect-[4/5] max-w-[280px]',
    '3d-mascot': 'w-full aspect-[4/5] max-w-[320px] sm:max-w-[340px]',
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: is3dInteractive ? '1000px' : 'none',
      }}
      className={`relative inline-block select-none ${className}`}
    >
      <div
        style={{
          transform: is3dInteractive
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.03 : 1}, ${isHovered ? 1.03 : 1}, 1)`
            : undefined,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
        className={`${sizeMap[size]} rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-300/80 shadow-lg bg-gradient-to-b from-[#fef9c3] to-[#fed7aa] flex items-center justify-center relative group`}
      >
        {/* 3D Realistic Image */}
        <img
          src="/cow-teacher.svg"
          alt="Teacher Daisy - Official 3D Mascot"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 will-change-transform"
          loading="eager"
        />

        {/* 3D Gloss / Sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 3D Mascot Banner tag on Hero */}
        {(size === 'hero' || size === '3d-mascot') && (
          <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold py-1 px-2.5 rounded-xl border border-white/20 flex items-center justify-between shadow-md">
            <span className="flex items-center gap-1 text-amber-300 font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>3D Mascot</span>
            </span>
            <span className="text-[10px] text-stone-200">Teacher Daisy</span>
          </div>
        )}
      </div>

      {showBadge && (
        <div
          className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full p-1.5 border-2 border-white shadow-md flex items-center justify-center animate-bounce"
          title="නිල 3D සංකේතය - ඩේසි ගුරුතුමිය"
        >
          <span className="text-xs">🐮</span>
        </div>
      )}
    </div>
  );
};
