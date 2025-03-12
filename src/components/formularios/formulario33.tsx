import { useState } from "react";
import Button from "../UI/button";
import Title from "./components/TitleProps";
import ModalP from "./components/ModalP";
import { FaFileAlt, FaRegFilePdf } from "react-icons/fa";
import Form3Modal1 from "./Form3Modales/Form3Modal1";
import Form3Modal2 from "./Form3Modales/Form3Modal2";

export default function UploadForm() {
  // Estados para controlar la apertura y cierre de los modales
  const [isModal1Open, setIsModal1Open] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);
  
  // Estado para manejar el tipo de memorando
  const [tipoMemorando, setTipoMemorando] = useState("Tipo A");
  
  // Estado para almacenar los datos del formulario (para ser compartido entre modales)
  const [formData, setFormData] = useState({});

  // Funciones para abrir los modales
  const openModal1 = () => setIsModal1Open(true);
  const openModal2 = () => setIsModal2Open(true);

  // Funciones para cerrar los modales
  const closeModal1 = () => setIsModal1Open(false);
  const closeModal2 = () => setIsModal2Open(false);

  // Función para manejar el guardado de datos
  const handleSave = (data) => {
    console.log("Datos guardados:", data);
    setFormData(data); // Actualizar los datos del formulario
    closeModal1(); // Cierra el modal después de guardar
  };

  const handleTipoMemorandoChange = (e) => {
    setTipoMemorando(e.target.value);
  };

  return (
    <div className="flex flex-col items-center p-1 bg-gradient-to-r to-gray-100 min-h-screen">
      <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow-xl border border-gray-700">
        <Title
          text="Atención de Solicitud de Registro de Propiedad Intelectual"
          size="2xl"
          className="text-center text-gray-800 mb-3 text-lg"
        />
        <h1 className="text-sm font-bold text-center text-gray-900 mb-9">
          Revisión y Análisis de Requerimiento
        </h1>

        {/* Contenedor de las Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaFileAlt className="text-[#931D21] text-4xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Formato de Registro de Propiedad Intelectual
              </h2>
              <p className="text-gray-600 mb-4">
                Ingrese, Revise y guarde los datos de los productos a registrar.
              </p>
              <Button
                className="bg-[#931D21] text-white rounded-lg px-6 py-2 hover:bg-[#7A171A] transition-colors duration-200"
                onClick={openModal1}
              >
                Ver Detalles
              </Button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <FaRegFilePdf className="text-blue-600 text-4xl mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Registro de Autores
              </h2>
              <p className="text-gray-600 mb-4">
                Ingrese, Revise y Guarde los datos de los autores.
              </p>
              <Button
                className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors duration-200"
                onClick={openModal2}
              >
                Ver Detalles
              </Button>
            </div>
          </div>
        </div>

        {/* Botones de Acción en la Parte Inferior */}
        <div className="flex justify-center mt-6 space-x-4">
          <Button
            className="bg-[#931D21] text-white rounded-lg px-6 py-2 hover:bg-[#7A171A] transition-colors duration-200"
            onClick={() => console.log("Siguiente")}
          >
            Siguiente
          </Button>
          <Button
            className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors duration-200"
            onClick={() => console.log("Guardar")}
          >
            Guardar
          </Button>
        </div>
      </div>

      {/* Modal 1 */}
      <ModalP
        isOpen={isModal1Open}
        onClose={closeModal1}
        title="Formato de Registro de Propiedad Intelectual"
      >
        <Form3Modal1
          showModal={isModal1Open}
          closeModal={closeModal1}
          onSave={handleSave}
          tipoMemorando={tipoMemorando}
          handleTipoMemorandoChange={handleTipoMemorandoChange}
        />
      </ModalP>

      {/* Modal 2 */}
      <ModalP
        isOpen={isModal2Open}
        onClose={closeModal2}
        title="Registro de Autores"
      >
        <Form3Modal2
          showModal={isModal2Open}
          closeModal={closeModal2}
          modalData={formData} // Pasamos los datos del formulario aquí
          onSave={handleSave}
          tipoMemorando={tipoMemorando}
          handleTipoMemorandoChange={handleTipoMemorandoChange}
        />
      </ModalP>
    </div>
  );
}
