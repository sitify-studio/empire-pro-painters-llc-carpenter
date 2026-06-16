'use client';

import type { MutableRefObject } from 'react';
import { useEffect, useRef } from 'react';

const C = {
  blue: '#4A7FD4',
  blueDark: '#3B6BC0',
  yellow: '#F5C842',
  white: '#F5F5F5',
  skinDark: '#8B5E3C',
  skinLight: '#F0C9A8',
  hair: '#2A2A2A',
  wall: '#A8D8F8',
  wallPatch: '#5BAEE8',
  floor: '#D4B896',
  grey: '#A0A8B0',
  sneaker: '#4A90D9',
};

interface HeroPaintersSceneProps {
  mouse: MutableRefObject<{ x: number; y: number }>;
  className?: string;
  reducedMotion?: boolean;
}

function PaintRollerShort({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-3" y="-42" width="6" height="38" rx="2" fill={C.yellow} />
      <rect x="-14" y="-48" width="28" height="8" rx="4" fill={C.white} />
      <rect x="-10" y="-52" width="20" height="6" rx="3" fill={C.white} />
    </g>
  );
}

function PaintRollerPole({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-2" y="-155" width="4" height="148" rx="2" fill={C.yellow} />
      <rect x="-12" y="-162" width="24" height="8" rx="4" fill={C.yellow} />
      <rect x="-16" y="-170" width="32" height="10" rx="5" fill={C.white} />
      <rect x="-12" y="-176" width="24" height="8" rx="4" fill={C.white} />
    </g>
  );
}

function PaintBucket({ x, y, color = C.grey }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <ellipse cx="0" cy="14" rx="16" ry="5" fill={C.blueDark} opacity="0.15" />
      <path d="M-14 0 L-12 22 Q0 28 12 22 L14 0 Z" fill={color} />
      <ellipse cx="0" cy="0" rx="14" ry="5" fill={color} />
      <ellipse cx="0" cy="2" rx="11" ry="4" fill={C.white} opacity="0.5" />
      <path d="M-16 -2 Q-18 -8 -10 -10" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function PainterLeft() {
  return (
    <g>
      {/* legs */}
      <rect x="72" y="298" width="22" height="72" rx="6" fill={C.blue} />
      <rect x="102" y="298" width="22" height="72" rx="6" fill={C.blueDark} />
      {/* sneakers */}
      <ellipse cx="83" cy="372" rx="16" ry="7" fill={C.sneaker} />
      <ellipse cx="113" cy="372" rx="16" ry="7" fill={C.white} />
      <ellipse cx="113" cy="370" rx="10" ry="4" fill={C.yellow} />
      {/* torso */}
      <rect x="68" y="228" width="58" height="78" rx="10" fill={C.blue} />
      <rect x="74" y="234" width="46" height="38" rx="6" fill={C.yellow} />
      <rect x="80" y="248" width="12" height="52" rx="4" fill={C.blueDark} />
      <rect x="102" y="248" width="12" height="52" rx="4" fill={C.blueDark} />
      {/* head */}
      <circle cx="97" cy="210" r="24" fill={C.skinDark} />
      <path d="M78 198 Q97 178 118 198 Q115 188 97 186 Q79 188 78 198" fill={C.hair} />
      {/* smile */}
      <path d="M88 218 Q97 226 106 218" stroke={C.hair} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* left arm + bucket */}
      <g transform="rotate(18 62 262)">
        <rect x="48" y="248" width="14" height="42" rx="7" fill={C.yellow} />
        <PaintBucket x={42} y={286} color={C.grey} />
      </g>
      {/* right arm + roller */}
      <g transform="rotate(-32 128 250)">
        <rect x="118" y="238" width="14" height="40" rx="7" fill={C.yellow} />
        <PaintRollerShort x={125} y={232} />
      </g>
    </g>
  );
}

function PainterRight() {
  return (
    <g>
      {/* legs */}
      <rect x="262" y="300" width="22" height="70" rx="6" fill={C.blue} />
      <rect x="292" y="300" width="22" height="70" rx="6" fill={C.blueDark} />
      {/* sneakers */}
      <ellipse cx="273" cy="372" rx="16" ry="7" fill={C.white} />
      <ellipse cx="273" cy="370" rx="10" ry="4" fill={C.yellow} />
      <ellipse cx="303" cy="372" rx="16" ry="7" fill={C.white} />
      {/* torso back */}
      <rect x="258" y="230" width="58" height="78" rx="10" fill={C.blue} />
      <rect x="264" y="236" width="46" height="66" rx="8" fill={C.white} />
      <rect x="278" y="248" width="18" height="54" rx="4" fill={C.blueDark} />
      {/* cap */}
      <ellipse cx="287" cy="206" rx="22" ry="8" fill={C.blueDark} />
      <path d="M265 206 Q287 188 309 206 L305 214 Q287 202 269 214 Z" fill={C.blue} />
      {/* head back */}
      <circle cx="287" cy="214" r="20" fill={C.skinLight} />
      {/* arm + long roller */}
      <g transform="rotate(-8 310 250)">
        <rect x="300" y="240" width="14" height="48" rx="7" fill={C.white} />
        <PaintRollerPole x={307} y={236} />
      </g>
    </g>
  );
}

function SceneSvg() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* floor */}
      <rect x="0" y="318" width="400" height="82" fill={C.floor} />

      {/* wall blob */}
      <path
        d="M30 60 C60 20 140 10 200 30 C280 55 360 40 380 90 C395 130 385 200 360 250 C330 300 250 310 180 295 C100 278 20 250 25 180 C28 130 10 95 30 60 Z"
        fill={C.wall}
      />
      {/* painted patches */}
      <path d="M90 120 Q130 100 170 125 L165 175 Q120 185 85 160 Z" fill={C.wallPatch} />
      <path d="M210 95 Q260 85 300 110 L290 155 Q240 165 205 140 Z" fill={C.wallPatch} />
      <path d="M155 200 Q200 185 245 205 L235 245 Q190 258 150 235 Z" fill={C.wallPatch} opacity="0.85" />

      {/* center bucket */}
      <PaintBucket x={198} y={292} color={C.white} />

      {/* paint tray stand */}
      <g transform="translate(318, 300)">
        <rect x="-3" y="0" width="6" height="42" fill={C.grey} />
        <rect x="-18" y="38" width="36" height="5" rx="2" fill={C.grey} />
        <rect x="-22" y="8" width="44" height="10" rx="3" fill={C.white} />
        <rect x="-18" y="2" width="36" height="8" rx="2" fill={C.white} />
      </g>

      <PainterLeft />
      <PainterRight />
    </svg>
  );
}

export default function HeroPaintersScene({
  mouse,
  className,
  reducedMotion = false,
}: HeroPaintersSceneProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const smooth = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (reducedMotion) return;

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.06;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.06;
      const { x, y } = smooth.current;
      const el = parallaxRef.current;
      if (el) {
        el.style.transform = `translate(${x * 10}px, ${y * 6}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mouse, reducedMotion]);

  return (
    <div
      className={className ?? 'absolute inset-0'}
      aria-hidden
      style={{ background: `linear-gradient(180deg, ${C.wall}22 0%, transparent 55%)` }}
    >
      <div ref={parallaxRef} className="flex h-full w-full items-center justify-center will-change-transform">
        <div className={reducedMotion ? 'h-full w-full' : 'hero-painters-float h-full w-full'}>
          <SceneSvg />
        </div>
      </div>
      <style jsx>{`
        .hero-painters-float {
          animation: hero-painters-float 5s ease-in-out infinite;
        }
        @keyframes hero-painters-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
}
