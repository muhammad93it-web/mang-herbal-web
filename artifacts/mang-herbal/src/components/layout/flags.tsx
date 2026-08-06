import React from 'react';

/**
 * Hand-drawn SVG flags (3:2). We never use emoji in this project, so the
 * language switcher uses these small vector flags instead.
 * Kurdish -> Kurdistan flag, Arabic -> Iraq flag, English -> UK flag.
 */

export function KurdistanFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true" preserveAspectRatio="none">
      <rect width="60" height="40" fill="#ffffff" />
      <rect width="60" height="13.33" fill="#ED2024" />
      <rect y="26.66" width="60" height="13.34" fill="#278E43" />
      <g fill="#FEBD11">
        {Array.from({ length: 21 }).map((_, i) => (
          <polygon
            key={i}
            points="30,11.6 31.5,16.6 28.5,16.6"
            transform={`rotate(${(360 / 21) * i} 30 20)`}
          />
        ))}
        <circle cx="30" cy="20" r="5" />
      </g>
    </svg>
  );
}

export function IraqFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true" preserveAspectRatio="none">
      <rect width="60" height="40" fill="#ffffff" />
      <rect width="60" height="13.33" fill="#CE1126" />
      <rect y="26.66" width="60" height="13.34" fill="#000000" />
      <text
        x="30"
        y="23.6"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#007A3D"
        style={{ fontFamily: "'Noto Sans Arabic', 'Noto Naskh Arabic', 'Segoe UI', sans-serif" }}
      >
        الله أكبر
      </text>
    </svg>
  );
}

export function UKFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true" preserveAspectRatio="none">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#ffffff" strokeWidth="8" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3.4" />
      <path d="M30,0 V40 M0,20 H60" stroke="#ffffff" strokeWidth="13" />
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7.5" />
    </svg>
  );
}
