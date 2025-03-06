import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars } from "react-icons/fa"; // Importa el ícono de menú (hamburguesa)
import { DropdownCardProps } from "../../../interfaces/dropdowncard.interface";

export default function DropdownCard({
  options,
  onSelect,
  defaultLabel = "Menú Documentos", // Cambié el defaultLabel a "Menú Documentos"
}: DropdownCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle option selection
  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false); // Close the menu after selecting
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Button to open/close the menu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#931D21] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#7a161a] transition flex items-center gap-2"
      >
        {/* Ícono de menú y texto */}
        <FaBars className="text-white" />
        {selectedOption ?? defaultLabel} {/* Usa el defaultLabel */}
      </button>

      {/* Dropdown menu with animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-64 bg-[#e6e0e0] shadow-lg rounded-lg p-4 border border-[#E0E0E0]"
          >
            <h3 className="text-lg font-semibold text-[#333333]">Elegir Documento</h3>
            <ul className="mt-2 space-y-2">
              {options.map((option) => (
                <li key={option}>
                  <button
                    onClick={() => handleSelect(option)}
                    className="w-full text-left px-2 py-1 bg-white text-black hover:bg-[#cac4c4] rounded"
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
