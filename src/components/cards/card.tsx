// components/cards/card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string; // Permitir className como propiedad opcional
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;
