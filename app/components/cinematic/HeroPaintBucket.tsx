'use client';

import { cn } from '@/app/lib/utils';

/** Content-safe zone inside bucket body (viewBox 480×520). */
export const BUCKET_CONTENT_ZONE = {
  top: '34%',
  bottom: '15%',
  left: '17%',
  right: '17%',
  aspectRatio: '480 / 520',
} as const;

interface HeroPaintBucketProps {
  fillColor: string;
  className?: string;
  reducedMotion?: boolean;
}

export function HeroPaintBucket({
  fillColor,
  className,
  reducedMotion = false,
}: HeroPaintBucketProps) {
  const motionClass = reducedMotion ? '' : 'hero-bucket-animated';

  return (
    <svg
      viewBox="0 0 480 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full', motionClass, className)}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      style={
        {
          '--bucket': fillColor,
          '--bucket-light': `color-mix(in srgb, ${fillColor} 82%, white)`,
          '--bucket-mid': fillColor,
          '--bucket-dark': `color-mix(in srgb, ${fillColor} 62%, #1a1a1a)`,
          '--bucket-shadow': `color-mix(in srgb, ${fillColor} 48%, #0f0f0f)`,
          '--bucket-rim': `color-mix(in srgb, ${fillColor} 55%, #3a3a3a)`,
          '--metal': '#b8bec8',
          '--metal-dark': '#6b7280',
          '--metal-light': '#e8ecf2',
          '--paint-surface': `color-mix(in srgb, ${fillColor} 70%, white)`,
        } as React.CSSProperties
      }
    >
      <defs>
        <linearGradient id="body-front" x1="140" y1="150" x2="340" y2="470" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--bucket-light)" />
          <stop offset="35%" stopColor="var(--bucket-mid)" />
          <stop offset="100%" stopColor="var(--bucket-dark)" />
        </linearGradient>
        <linearGradient id="body-left" x1="40" y1="160" x2="120" y2="460" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--bucket-shadow)" />
          <stop offset="100%" stopColor="var(--bucket-dark)" />
        </linearGradient>
        <linearGradient id="body-right" x1="400" y1="160" x2="320" y2="460" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--bucket-shadow)" />
          <stop offset="100%" stopColor="var(--bucket-dark)" />
        </linearGradient>
        <linearGradient id="rim-top" x1="60" y1="110" x2="420" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--bucket-light)" />
          <stop offset="40%" stopColor="var(--bucket-rim)" />
          <stop offset="100%" stopColor="var(--bucket-dark)" />
        </linearGradient>
        <linearGradient id="rim-inner" x1="100" y1="130" x2="380" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--bucket-shadow)" />
          <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="metal-handle" x1="90" y1="20" x2="390" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--metal-dark)" />
          <stop offset="35%" stopColor="var(--metal-light)" />
          <stop offset="65%" stopColor="var(--metal)" />
          <stop offset="100%" stopColor="var(--metal-dark)" />
        </linearGradient>
        <radialGradient id="front-shine" cx="0.32" cy="0.28" r="0.55">
          <stop offset="0%" stopColor="white" stopOpacity="0.28" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="paint-shimmer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="50%" stopColor="white" stopOpacity="0.14" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id="bucket-drop" x="-15%" y="-8%" width="130%" height="125%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#0a0a0a" floodOpacity="0.2" />
        </filter>
        <clipPath id="bucket-interior">
          <path d="M82 162 Q82 174 88 182 L94 448 Q94 472 240 478 Q386 472 392 448 L398 182 Q404 174 404 162 Q404 150 240 150 Q82 150 82 162 Z" />
        </clipPath>
      </defs>

      {/* floor shadow */}
      <ellipse cx="240" cy="508" rx="158" ry="10" fill="#0a0a0a" opacity="0.12" />

      <g filter="url(#bucket-drop)">
        {/* handle behind rim */}
        <path
          d="M98 128 C98 48 155 18 240 18 C325 18 382 48 382 128"
          stroke="url(#metal-handle)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />

        {/* left side panel */}
        <path
          d="M48 148 C42 210 50 340 72 462 Q120 488 148 468 C108 360 98 240 108 148 Q78 138 48 148 Z"
          fill="url(#body-left)"
        />

        {/* right side panel */}
        <path
          d="M432 148 C438 210 430 340 408 462 Q360 488 332 468 C372 360 382 240 372 148 Q402 138 432 148 Z"
          fill="url(#body-right)"
        />

        {/* main front body — tapered with belly curve */}
        <path
          d="M108 148
             C88 200 82 300 88 400
             Q92 455 148 472
             Q240 488 332 472
             Q388 455 392 400
             C398 300 392 200 372 148
             Q240 128 108 148 Z"
          fill="url(#body-front)"
        />

        {/* horizontal contour bands */}
        <path d="M96 220 Q240 235 384 220" stroke="white" strokeWidth="1.5" opacity="0.08" fill="none" />
        <path d="M90 310 Q240 325 390 310" stroke="white" strokeWidth="1.5" opacity="0.06" fill="none" />
        <path d="M88 395 Q240 408 392 395" stroke="black" strokeWidth="1" opacity="0.06" fill="none" />

        {/* front specular */}
        <path
          d="M108 148 C88 200 82 300 88 400 Q92 455 148 472 Q240 488 332 472 Q388 455 392 400 C398 300 392 200 372 148 Q240 128 108 148 Z"
          fill="url(#front-shine)"
        />
        <path
          d="M128 168 L118 420 Q118 448 155 458"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.12"
          fill="none"
        />

        {/* rim underside lip */}
        <ellipse cx="240" cy="142" rx="198" ry="34" fill="var(--bucket-shadow)" />

        {/* rolled rim top */}
        <ellipse cx="240" cy="128" rx="204" ry="36" fill="url(#rim-top)" />
        <ellipse cx="240" cy="122" rx="196" ry="28" fill="var(--bucket-light)" opacity="0.35" />

        {/* inner opening depth */}
        <ellipse cx="240" cy="138" rx="178" ry="26" fill="url(#rim-inner)" />
        <ellipse cx="240" cy="134" rx="168" ry="20" fill="#0a0a0a" opacity="0.35" />

        {/* metal lugs + handle front */}
        <g>
          <rect x="86" y="118" width="24" height="16" rx="4" fill="url(#metal-handle)" />
          <rect x="370" y="118" width="24" height="16" rx="4" fill="url(#metal-handle)" />
          <path
            d="M98 128 C98 48 155 18 240 18 C325 18 382 48 382 128"
            stroke="url(#metal-handle)"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M98 128 C98 48 155 18 240 18 C325 18 382 48 382 128"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
        </g>

        {/* subtle interior paint animation */}
        <g clipPath="url(#bucket-interior)">
          <g className="hero-bucket-liquid">
            <ellipse cx="240" cy="360" rx="118" ry="14" fill="var(--paint-surface)" opacity="0.18" />
            <ellipse cx="240" cy="357" rx="96" ry="8" fill="white" opacity="0.08" />
          </g>
          <rect
            className="hero-bucket-shimmer"
            x="100"
            y="180"
            width="90"
            height="280"
            fill="url(#paint-shimmer)"
            opacity="0.5"
          />
          <circle className="hero-bucket-blob hero-bucket-blob-1" cx="175" cy="310" r="6" fill="white" opacity="0.1" />
          <circle className="hero-bucket-blob hero-bucket-blob-2" cx="305" cy="330" r="5" fill="white" opacity="0.08" />
        </g>
      </g>

      {!reducedMotion && (
        <style>{`
          .hero-bucket-animated .hero-bucket-liquid {
            animation: bucket-liquid 4.5s ease-in-out infinite;
            transform-origin: 240px 360px;
          }
          .hero-bucket-animated .hero-bucket-shimmer {
            animation: bucket-shimmer 7s ease-in-out infinite;
          }
          .hero-bucket-animated .hero-bucket-blob-1 {
            animation: bucket-blob 5s ease-in-out infinite;
          }
          .hero-bucket-animated .hero-bucket-blob-2 {
            animation: bucket-blob 6s ease-in-out infinite 0.7s;
          }
          @keyframes bucket-liquid {
            0%, 100% { transform: translateY(0) scaleX(1); }
            50% { transform: translateY(-3px) scaleX(1.02); }
          }
          @keyframes bucket-shimmer {
            0%, 100% { transform: translateX(-40px); opacity: 0; }
            25% { opacity: 0.4; }
            55% { transform: translateX(260px); opacity: 0.25; }
            80% { opacity: 0; }
          }
          @keyframes bucket-blob {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(5px, -8px); }
          }
        `}</style>
      )}
    </svg>
  );
}

export default HeroPaintBucket;
