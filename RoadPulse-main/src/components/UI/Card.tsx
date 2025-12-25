import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700';
  const hoverClasses = hover ? 'cursor-pointer transition-transform duration-200 hover:shadow-md' : '';
  
  const CardComponent = onClick || hover ? motion.div : 'div';
  const motionProps = onClick || hover ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: onClick ? { scale: 0.98 } : undefined,
  } : {};

  return (
    <CardComponent
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </CardComponent>
  );
};

export default Card;