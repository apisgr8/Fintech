import React, { useState, useEffect } from 'react';

interface CandleMeltProps {
  expenseRatio: number;
}

export const CandleMelt: React.FC<CandleMeltProps> = ({ expenseRatio }) => {
  const [meltHeight, setMeltHeight] = useState(100);

  useEffect(() => {
    // A higher expense ratio means more "melting" (smaller final height)
    const finalHeight = 100 - (expenseRatio * 50); // Scale factor for visual effect
    const timer = setTimeout(() => setMeltHeight(finalHeight > 0 ? finalHeight : 0), 100);
    return () => clearTimeout(timer);
  }, [expenseRatio]);
  
  const getColor = () => {
      if(expenseRatio < 0.7) return 'bg-[#00D084]'; // Success
      if(expenseRatio < 1.2) return 'bg-[#FFC400]'; // Warning
      return 'bg-[#FF5252]'; // Error
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-32 bg-gray-700/50 rounded-md flex items-end">
        <div 
          className={`w-full rounded-md ${getColor()}`}
          style={{ height: `${meltHeight}%`, transition: 'height 1.5s ease-in-out' }}
        />
      </div>
      <span className="text-xs mt-2 font-mono">{expenseRatio}%</span>
    </div>
  );
};
