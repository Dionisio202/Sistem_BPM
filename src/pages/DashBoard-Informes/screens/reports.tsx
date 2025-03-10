import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";

const Reports: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Escuchar los cambios en el sidebar mediante un evento personalizado
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarOpen(e.detail.isOpen);
    };

    window.addEventListener('sidebarToggle' as any, handleSidebarChange);
    
    // También detectar si se está en móvil al inicio
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }

    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarChange);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex">
        <Sidebar />
        <main 
          className={`flex-grow transition-all duration-300 ${
            sidebarOpen ? "ml-0 md:ml-64" : "ml-0 w-full"
          }`}
        >
          <div className="bg-gray-100 p-2 rounded-lg w-full h-full">
            <Table />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reports;