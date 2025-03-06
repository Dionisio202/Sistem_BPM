import React from "react";
import { CardContainerProps } from "../../../interfaces/cardcontainer.interface";

const CardContainer: React.FC<CardContainerProps> = ({ title, children }) => {
  return (
    <div className="min-h-[300px] flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-100">
      <div className="p-8 bg-white text-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#931D21]">
          {title}
        </h1>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default CardContainer;
