import React from 'react';

export default function NestLogo({ size = 24, color = "currentColor" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Outer Woven Nest Bowl */}
      <path d="M3 13C3 17.5 7 20.5 12 20.5C17 20.5 21 17.5 21 13" />
      <path d="M5 11.5C5 15.5 8 17.5 12 17.5C16 17.5 19 15.5 19 11.5" />
      <path d="M2.5 13.5H21.5" strokeWidth="1.8" />
      {/* Two cozy eggs inside the nest */}
      <ellipse cx="9.2" cy="8.8" rx="2.4" ry="3.2" fill={color} fillOpacity="0.25" />
      <ellipse cx="14.8" cy="8.8" rx="2.4" ry="3.2" fill={color} fillOpacity="0.25" />
    </svg>
  );
}
