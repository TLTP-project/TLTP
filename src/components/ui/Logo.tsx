import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  showText = true,
  showTagline = false,
  className = "",
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 34, text: "text-sm", badge: "text-[10px]", sub: "text-[9px]" },
    md: { icon: 42, text: "text-base", badge: "text-[11px]", sub: "text-[11px]" },
    lg: { icon: 56, text: "text-xl", badge: "text-xs", sub: "text-xs" },
    xl: { icon: 72, text: "text-2xl", badge: "text-xs", sub: "text-sm" },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Premium Vector Brand Mark */}
      <div
        className="relative flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Outer Squircle Gradient */}
            <linearGradient id="tltp-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="45%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>

            {/* Inner Glow Gradient */}
            <linearGradient id="tltp-inner-glow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Heart-Dialogue Path Gradient */}
            <linearGradient id="tltp-heart-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>

          {/* Rounded Squircle Container */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="26"
            fill="url(#tltp-grad-bg)"
          />

          {/* Inner Highlight Rim */}
          <rect
            x="6"
            y="6"
            width="88"
            height="88"
            rx="24"
            stroke="url(#tltp-inner-glow)"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Two speech bubbles forming a heart silhouette in the center */}
          {/* Left Dialogue Bubble */}
          <path
            d="M26 42C26 31 34 23 48 23C62 23 70 31 70 42C70 51 63 58 52 59L50 67C50 67.8 49 68.2 48.4 67.6L41.5 60C32 59 26 51 26 42Z"
            fill="#ffffff"
            fillOpacity="0.18"
          />

          {/* Listening Heart Contour */}
          <path
            d="M50 35C44 26 32 28 32 38C32 49 48 61 50 62C52 61 68 49 68 38C68 28 56 26 50 35Z"
            fill="url(#tltp-heart-glow)"
            className="drop-shadow-sm"
          />

          {/* Center Brand Monogram: TLTP */}
          <text
            x="50"
            y="46"
            textAnchor="middle"
            fill="#ea580c"
            fontSize="15"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.5"
          >
            TLTP
          </text>

          {/* Small decorative sparkle stars */}
          <circle cx="75" cy="24" r="3" fill="#ffffff" fillOpacity="0.8" />
          <circle cx="25" cy="74" r="2.5" fill="#ffffff" fillOpacity="0.6" />
        </svg>
      </div>

      {/* Brand Text Details */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-stone-900 ${currentSize.text}`}>
              Trải Lòng <span className="text-amber-600 font-bold">Trần Phú</span>
            </span>
            <span className={`rounded-md bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 font-extrabold text-amber-700 ${currentSize.badge}`}>
              TLTP
            </span>
          </div>
          {showTagline && (
            <span className={`font-medium text-stone-500 ${currentSize.sub}`}>
              Lắng nghe • Thấu hiểu • Cải thiện
            </span>
          )}
        </div>
      )}
    </div>
  );
}
