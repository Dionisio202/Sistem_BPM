import React from "react";
import Sidebar from "./components/Sidebar";

const DashboardLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex">
        <Sidebar /> {/* Sidebar donde se navegan las rutas */}
      </div>
    </div>
  );
};

export default DashboardLayout;
