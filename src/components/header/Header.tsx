import React from "react";
import logoUTA from "../../assets/img/logoUTA.png"; 

const Header: React.FC = () => {
  return (
    <header 
      className="bg-[#931D21] text-white p-4 flex items-center" 
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      <img 
        src={logoUTA}
        alt="Logo UTA"
        className="h-20 mr-4"
      />
      
      <div>
        <h1 className="text-xl font-bold">DINNOVA</h1>
        <p className="text-sm">DIRECCION DE INNOVACION Y EMPRENDIMIENTO</p>
      </div>
    </header>
  );
};

export default Header;
