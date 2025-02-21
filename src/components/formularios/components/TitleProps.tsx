import React from "react";

interface TitleProps {
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const Title: React.FC<TitleProps> = ({ text, size = "xl", className = "" }) => {
  return <h2 className={`font-bold text-${size} ${className}`}>{text}</h2>;
};

export default Title;