
import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 py-2 px-4 rounded-full bg-secondary/50 dark:bg-secondary/30 inline-flex">
      <span className="w-2 h-2 rounded-full bg-gold animate-typing-1"></span>
      <span className="w-2 h-2 rounded-full bg-gold animate-typing-2"></span>
      <span className="w-2 h-2 rounded-full bg-gold animate-typing-3"></span>
    </div>
  );
};
