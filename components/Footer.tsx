import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B0F14] border-t border-white/10 mt-8">
      <div className="container mx-auto py-4 px-4 md:px-6 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Zenith Invest. All Rights Reserved.</p>
        <p className="mt-1 font-semibold text-amber-400">
            Educational purposes only. Not investment advice. Data is mocked.
        </p>
      </div>
    </footer>
  );
};
