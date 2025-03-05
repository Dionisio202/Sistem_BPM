import React from "react";
import { TitleProps } from "../../../interfaces/title.interface";
const Title: React.FC<TitleProps> = ({ text, size = "xl", className = "" }) => {
  return <h2 className={`font-bold text-${size} ${className}`}>{text}</h2>;
};
export default Title;