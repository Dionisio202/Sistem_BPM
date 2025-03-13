import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Example from "../components/Table";

const Reports: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Listen for sidebar toggle events and check screen size on mount
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarOpen(e.detail.isOpen);
    };
    
    // Set sidebar closed by default on mobile
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    // Initialize based on current screen size
    handleResize();
    
    // Add event listeners
    window.addEventListener('sidebarToggle' as any, handleSidebarChange);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`${sidebarOpen ? 'w-10' : 'w-10'} transition-all duration-300 ease-in-out`}>
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full w-full ">
          <div className="h-full bg-white rounded-lg shadow-sm">
            <Example />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;