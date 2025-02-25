import React from "react";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
const Reports: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex">
        <Sidebar /> {/* Sidebar donde se navegan las rutas */}
        <main className="flex-grow p-6 space-y-4 ml-0 md:ml-64">
        <Table/>
        </main>
      </div>
    </div>
  );
};

export default Reports;
