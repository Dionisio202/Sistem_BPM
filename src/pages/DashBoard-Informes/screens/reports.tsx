import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";

const Reports: React.FC = () => {
    // @ts-ignore
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