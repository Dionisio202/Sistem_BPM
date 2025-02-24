import React from "react";
import { NumericCardsProps } from "./interfaces/recordprops.interface";

const NumericCards: React.FC<NumericCardsProps> = ({ records }) => {
  return (
    <div className="flex gap-4 justify-center">
      {records.map((record, index) => (
        <div
          key={index}
          className="min-w-[188px] text-center border border-gray-300 bg-gray-800 rounded-lg p-9 shadow-sm"
        >
          <h3 className="text-2xl font-bold text-white">{record.value}</h3>
          <p className="text-lg text-white">{record.label}</p>
        </div>
      ))}
    </div>
  );
};

export default NumericCards;