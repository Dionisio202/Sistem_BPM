import React from "react";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
const Reports: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex">
        <Sidebar /> {/* Sidebar donde se navegan las rutas */}
        <main className="flex-grow p-1 space-y-2 ml-0 md:ml-15 ">
          <div className="flex justify-end bg-gray-100 p-2 rounded-lg w-full h-full">

            <Table />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;
