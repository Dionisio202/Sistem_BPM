// components/cards/cardcontent.tsx
import React from "react";

interface CardContentProps {
  children: React.ReactNode;
  className?: string; // Permitir className
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export default CardContent;
