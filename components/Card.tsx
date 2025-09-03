import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-[#1A1F2A]/50 border border-white/10 rounded-xl p-4 md:p-6 glow-card transition-all duration-300 hover:border-[#00E5FF]/50 ${className}`}
    >
      {children}
    </div>
  );
};
