import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import UploadFile from "../components/UploadFile"; // Componente para cargar archivos
import {
  ModalProps,
  TipoProducto,
} from "../../../interfaces/registros.interface";
import { SERVER_BACK_URL } from "../../../config.ts";
import { Facultad } from "../../../interfaces/facultades.interface.ts";

const socket = io(SERVER_BACK_URL); // Conecta con el backend

const Modal: React.FC<ModalProps> = ({
  showModal,
  closeModal,
  modalData,
  onSave,
  tipoMemorando,
  handleTipoMemorandoChange,
}) => {
  const [editedData, setEditedData] = useState(modalData.productos);
  const [tiposProductos, setTiposProductos] = useState<TipoProducto[]>([]);
  const [facultadesCarreras, setFacultadesCarreras] = useState<Facultad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facultadSeleccionada, setFacultadSeleccionada] = useState("");
  const [hasMissingData, setHasMissingData] = useState(false);

  // Cargar los tipos de productos al abrir el modal
  useEffect(() => {
    if (showModal) {
      setError(null);
      setLoading(true);

      socket.emit("obtener_tipos_productos", (response: any) => {
        if (response.success) {
          const tiposMapeados = response.data.map((tipo: any) => ({
            id: tipo.id_tipo_producto,
            nombre: tipo.nombre,
          }));

          setTiposProductos(tiposMapeados);

          if (editedData.tipoMemorando) {
            const tipoSeleccionado = tiposMapeados.find(
              (t: any) => t.nombre === editedData.tipoMemorando
            );
            if (tipoSeleccionado) {
              setEditedData((prev: any) => ({
                ...prev,
                tipoMemorando: tipoSeleccionado.id.toString(),
              }));
            }
          }
        } else {
          console.error("Error al obtener tipos:", response.message);
          setError("Error al cargar tipos de productos");
        }
        setLoading(false);
      });
    }
  }, [showModal]);

  // Cargar facultades y carreras de forma dinámica
  useEffect(() => {
    if (showModal) {
      socket.emit("obtener_facultades_carreras", (response: any) => {
        if (response.success && response.data && response.data.length > 0) {
          try {
            // Se espera que la respuesta tenga una propiedad ResultadoJSON con el string JSON
            const parsedData = JSON.parse(response.data[0].ResultadoJSON);
            setFacultadesCarreras(parsedData);
          } catch (parseError) {
            console.error("Error al parsear facultades:", parseError);
            setError("Error al cargar facultades y carreras");
          }
        } else {
          console.error("Error al obtener facultades:", response.message);
          setError("Error al cargar facultades y carreras");
        }
      });
    }
  }, [showModal]);

  const handleFacultadChange = (e: any) => {
    setFacultadSeleccionada(e.target.value);
    setEditedData((prev: any) => ({
      ...prev,
      solicitante: {
        ...prev.solicitante,
        facultad: e.target.value,
      },
    }));
  };

  const handleMemoFileChange = async (file: File | null) => {
    if (!file) return;
    try {
      const memoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64String = result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
      });

      socket.emit(
        "subir_documento",
        { documento: memoBase64 },
        (response: any) => {
          if (response.success) {
            setEditedData((prev: any) => ({
              ...prev,
              codigoMemorando: response.codigo,
            }));
          } else {
            console.error("Error al subir el documento:", response.message);
            alert("Error al subir el documento");
          }
        }
      );
    } catch (err) {
      console.error("Error procesando el archivo:", err);
      alert("Error al procesar el archivo");
    }
  };

  const handleChange = (path: string, value: string) => {
    const keys = path.split(".");
    const updatedData = { ...editedData };
    let current: any = updatedData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditedData(updatedData);
  };

  const checkMissingData = () => {
    const requiredFields = [
      "codigoMemorando",
      "lugar",
      "destinatario.nombre",
      "destinatario.titulo",
      "destinatario.cargo",
      "destinatario.institucion",
      "solicitante.nombre",
      "solicitante.cargo",
      "solicitante.facultad",
      "proyecto.tipo",
      "proyecto.titulo",
      "proyecto.resolucion.numero",
      "proyecto.resolucion.fecha",
    ];
    const missingFields = requiredFields.filter((field) => {
      const keys = field.split(".");
      let value = editedData;
      for (const key of keys) {
        value = value[key];
        if (value === undefined || value === "") return true;
      }
      return false;
    });
    return missingFields;
  };

  const handleSave = () => {
    const missingFields = checkMissingData();
    if (missingFields.length > 0) {
      setError(`Faltan los siguientes campos: ${missingFields.join(", ")}`);
      setHasMissingData(true);
      return;
    }
    setError(null);
    setHasMissingData(false);
    onSave(editedData);
    closeModal();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-700/50 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-amber-50 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-zinc-800">
          {modalData.success && (
            <>
              <h2 className="text-2xl font-bold mb-2 text-center">
                Registro de Propiedad Intelectual
              </h2>
              <p className="text-base text-center font-medium mb-10">
                Revise que los datos de registro sean correctos y edite en caso
                de incongruencias.
              </p>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <div className="mb-4">
                  <UploadFile
                    id="memo-file"
                    onFileChange={handleMemoFileChange}
                    label="Subir archivo del memorando"
                  />
                </div>
                <label
                  htmlFor="codigoMemorando"
                  className="block text-xs font-medium text-gray-700"
                >
                  Código de Memorando:
                </label>
                <input
                  id="codigoMemorando"
                  type="text"
                  value={editedData.codigoMemorando}
                  onChange={(e) =>
                    handleChange("codigoMemorando", e.target.value)
                  }
                  className="mt-1 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                />
                <div>
                  <label
                    htmlFor="tipoMemorando"
                    className="block text-xs font-medium text-orange-700"
                  >
                    Tipo de Registro
                  </label>
                  <select
                    id="tipoMemorando"
                    value={tipoMemorando}
                    onChange={handleTipoMemorandoChange}
                    className="mt-1 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                    disabled={loading}
                  >
                    <option value="">Seleccione una opción</option>
                    {tiposProductos.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">
                    Lugar:
                  </label>
                  <input
                    type="text"
                    value={editedData.lugar}
                    onChange={(e) => handleChange("lugar", e.target.value)}
                    className="mt-1 mb-5 block w-full text-xs p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                  />
                </div>
                <div className="bg-gray-50 rounded-lg">
                  <h4 className="text-xss font-semibold text-orange-700 mb-1">
                    Destinatario
                  </h4>
                  <div className="space-y-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Nombre:
                      </label>
                      <input
                        type="text"
                        value={editedData.destinatario.nombre}
                        onChange={(e) =>
                          handleChange("destinatario.nombre", e.target.value)
                        }
                        className="mt-1 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Título:
                      </label>
                      <input
                        type="text"
                        value={editedData.destinatario.titulo}
                        onChange={(e) =>
                          handleChange("destinatario.titulo", e.target.value)
                        }
                        className="mt-1 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                    <div>
                      <label className="text-xs block font-medium text-gray-700">
                        Cargo:
                      </label>
                      <input
                        type="text"
                        value={editedData.destinatario.cargo}
                        onChange={(e) =>
                          handleChange("destinatario.cargo", e.target.value)
                        }
                        className="mt-1 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Institución:
                      </label>
                      <input
                        type="text"
                        value={editedData.destinatario.institucion}
                        onChange={(e) =>
                          handleChange(
                            "destinatario.institucion",
                            e.target.value
                          )
                        }
                        className="mt-1 mb-5 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg">
                  <h4 className="text-xss font-semibold text-orange-700">
                    Solicitante:
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Nombre:
                      </label>
                      <input
                        type="text"
                        value={editedData.solicitante.nombre}
                        onChange={(e) =>
                          handleChange("solicitante.nombre", e.target.value)
                        }
                        className="mt-1 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Cargo:
                      </label>
                      <select
                        value={editedData.solicitante.cargo}
                        onChange={(e) => handleChange("solicitante.cargo", e.target.value)}
                        className="mt-1 mb-5 text-xs block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      >
                        <option value="">Seleccione un cargo</option>
                        <option value="Director">Director</option>
                        <option value="Docente">Docente</option>
                        <option value="Rector">Rector</option>
                        <option value="Decano">Decano</option>
                      </select>
                    </div>
                    <div>
                    <label className="block text-xs font-medium text-gray-700">
                        Facultad:
                      </label>
                      <select
                        id="facultad"
                        value={facultadSeleccionada}
                        onChange={handleFacultadChange}
                        className="mt-1 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                        disabled={loading}
                      >
                        <option value="">Seleccione una facultad</option>
                        {facultadesCarreras.map((facultad) => (
                          <option
                            key={facultad.id_facultad}
                            value={facultad.id_facultad}
                          >
                            {facultad.nombre_facultad}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg">
                  <h4 className="text-xss font-semibold text-orange-700">
                    Productos:
                  </h4>
                  {editedData.productos.map((producto: any, index: number) => (
                    <div key={producto.id || index} className="mb-4">
                      <label className="block text-xs font-medium text-gray-700">
                        Nombre del Producto:
                      </label>
                      <input
                        type="text"
                        value={producto.nombre}
                        onChange={(e) =>
                          handleChange(
                            `productos.${index}.nombre`,
                            e.target.value
                          )
                        }
                        className="mt-1 mb-5 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-lg">
                  <h4 className="text-xss font-semibold text-orange-700">
                    Proyecto:
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs block font-medium text-gray-700">
                        Tipo:
                      </label>
                      <input
                        type="text"
                        value={editedData.proyecto.tipo}
                        onChange={(e) =>
                          handleChange("proyecto.tipo", e.target.value)
                        }
                        className="mt-1 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Título:
                      </label>
                      <input
                        type="text"
                        value={editedData.proyecto.titulo}
                        onChange={(e) =>
                          handleChange("proyecto.titulo", e.target.value)
                        }
                        className="mt-1 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Resolución Número:
                      </label>
                      <input
                        type="text"
                        value={editedData.proyecto.resolucion.numero}
                        onChange={(e) =>
                          handleChange(
                            "proyecto.resolucion.numero",
                            e.target.value
                          )
                        }
                        className="mt-1 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Resolución Fecha:
                      </label>
                      <input
                        type="text"
                        value={editedData.proyecto.resolucion.fecha}
                        onChange={(e) =>
                          handleChange(
                            "proyecto.resolucion.fecha",
                            e.target.value
                          )
                        }
                        className="mt-1 text-xs block w-full p-1 border border-gray-300 rounded-md shadow-sm focus:ring-[#931D21] focus:border-[#931D21]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-600 mr-2"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-[#931D21] text-white text-xs px-4 py-2 rounded-lg hover:bg-red-700"
            disabled={hasMissingData} // Deshabilitar si hay datos faltantes
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;