"use client";

import React from 'react';

export const RainbowButton = ({ 
  children, 
  onClick, 
  disabled,
  className = ""
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  disabled?: boolean,
  className?: string
}) => {
  return (
    <>
      <style>{`
        .rainbow-border::before,
        .rainbow-border::after {
          content: '';
          position: absolute;
          left: -3px;
          top: -3px;
          border-radius: 9999px; /* full rounded for pill shape */
          background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000);
          background-size: 400%;
          width: calc(100% + 6px);
          height: calc(100% + 6px);
          z-index: -1;
          animation: rainbow 20s linear infinite;
        }
        .rainbow-border::after {
          filter: blur(25px);
        }
        @keyframes rainbow {
          0% { background-position: 0 0; }
          50% { background-position: 400% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
      <button 
        onClick={onClick}
        disabled={disabled}
        className={`rainbow-border relative inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white bg-slate-900 rounded-full border-none cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    </>
  );
};
