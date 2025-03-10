import { useState, useEffect } from "react";
import { SERVER_BACK_URL } from "../../config.ts";
import io from "socket.io-client";
import Button from "../../components/UI/button.tsx";
import { Input } from "../../components/UI/input.tsx";
import { Card } from "../../components/UI/card.tsx";
import CardContent from "../../components/cards/cardcontent.tsx";
import DocumentViewer from "../../components/files/DocumentViewer.tsx";

// Crear la conexión WebSocket
const socket = io(SERVER_BACK_URL);

// Definición de interfaces para tipar la data
interface Registro {
  id_registro: string;
  fecha_registro: string;
  nombre_registro: string;
  funcionario_registro: string;
}

interface Tarea {
  id_tareas: string;
  nombre_tarea: string;
  estado: string;
}

interface Documento {
  codigo_documento: string;
  codigo_almacenamiento: string;
  fecha_doc: string;
}

export default function Trazabilidad() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [registrosOriginales, setRegistrosOriginales] = useState<Registro[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroFuncionario, setFiltroFuncionario] = useState("");
  const [funcionariosUnicos, setFuncionariosUnicos] = useState<string[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [selectedRegistro, setSelectedRegistro] = useState<string | null>(null);
  const [selectedTarea, setSelectedTarea] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar registros al iniciar el componente
  useEffect(() => {
    cargarRegistros();
    
    // Limpieza al desmontar el componente
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  // Efecto para extraer funcionarios únicos cuando cambian los registros
  useEffect(() => {
    if (registrosOriginales.length > 0) {
      const funcionarios = [...new Set(registrosOriginales.map(r => r.funcionario_registro))].sort();
      setFuncionariosUnicos(funcionarios);
    }
  }, [registrosOriginales]);

  // Función para cargar registros usando WebSocket
  const cargarRegistros = () => {
    setLoading(true);
    setError(null);
    
    socket.emit("obtener_registros", {}, (response: any) => {
      setLoading(false);
      if (response.success) {
        setRegistros(response.data);
        setRegistrosOriginales(response.data);
      } else {
        setError(`Error al cargar registros: ${response.message}`);
        console.error("Error al cargar registros:", response.error);
      }
    });
  };

  // Función para aplicar todos los filtros
  const aplicarFiltros = () => {
    let filtrados = [...registrosOriginales];
    
    // Filtrar por texto de búsqueda
    if (busqueda.trim()) {
      filtrados = filtrados.filter(registro => 
        registro.id_registro.toLowerCase().includes(busqueda.toLowerCase()) ||
        registro.nombre_registro.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    // Filtrar por fecha
    if (filtroFecha) {
      const fechaSeleccionada = new Date(filtroFecha);
      fechaSeleccionada.setHours(0, 0, 0, 0);
      
      filtrados = filtrados.filter(registro => {
        const fechaRegistro = new Date(registro.fecha_registro);
        fechaRegistro.setHours(0, 0, 0, 0);
        return fechaRegistro.getTime() === fechaSeleccionada.getTime();
      });
    }
    
    // Filtrar por funcionario
    if (filtroFuncionario) {
      filtrados = filtrados.filter(registro => 
        registro.funcionario_registro === filtroFuncionario
      );
    }
    
    setRegistros(filtrados);
  };

  // Función para buscar registros
  const buscarRegistro = () => {
    aplicarFiltros();
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroFecha("");
    setFiltroFuncionario("");
    setRegistros(registrosOriginales);
  };

  // Función para seleccionar un registro y cargar sus tareas
  const seleccionarRegistro = (id_registro: string) => {
    setSelectedRegistro(id_registro);
    setSelectedTarea(null);
    setLoading(true);
    setError(null);
    
    socket.emit("obtener_tareas_con_documentos", { id_registro }, (response: any) => {
      setLoading(false);
      if (response.success) {
        setTareas(response.data);
        setDocumentos([]);
        setSelectedDocumento(null);
      } else {
        setError(`Error al cargar tareas: ${response.message}`);
        console.error("Error al cargar tareas:", response.error);
      }
    });
  };

  // Función para seleccionar una tarea y cargar sus documentos
  const seleccionarTarea = (id_tarea: string) => {
    setSelectedTarea(id_tarea);
    setLoading(true);
    setError(null);
    
    // Limpiar documentos anteriores inmediatamente
    setDocumentos([]);
    setSelectedDocumento(null);
    
    socket.emit("obtener_documentos_tarea", { id_tarea }, (response: any) => {
      setLoading(false);
      if (response.success) {
        // Reemplazar completamente los documentos anteriores
        setDocumentos(response.data);
      } else {
        setError(`Error al cargar documentos: ${response.message}`);
        console.error("Error al cargar documentos:", response.error);
      }
    });
  };

  // Función para visualizar un documento
  const visualizarDocumento = (documento: Documento) => {
    setSelectedDocumento(documento);
  };

  // Comprobar si un documento tiene código de almacenamiento válido
  const tieneCodigoAlmacenamiento = (documento: Documento): boolean => {
    return !!documento.codigo_almacenamiento && documento.codigo_almacenamiento.trim() !== '';
  };

  // Formatear fecha para mostrar en formato local
  const formatearFecha = (fechaStr: string): string => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString();
    } catch (e) {
      return fechaStr;
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-red-800">Trazabilidad de Documentos</h1>
      
      {/* Filtros de registros */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h3 className="font-medium text-gray-700">Filtros de búsqueda</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buscador de texto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID o nombre de registro
            </label>
            <Input 
              placeholder="Buscar registro..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Filtro de fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de registro
            </label>
            <Input 
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Filtro de funcionario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Funcionario
            </label>
            <select
              value={filtroFuncionario}
              onChange={(e) => setFiltroFuncionario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Todos los funcionarios</option>
              {funcionariosUnicos.map(funcionario => (
                <option key={funcionario} value={funcionario}>
                  {funcionario}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={buscarRegistro} className="bg-red-800 hover:bg-red-900 text-white">
            Aplicar filtros
          </Button>
          <Button onClick={limpiarFiltros} variant="outline" className="border-red-300 text-red-800">
            Limpiar filtros
          </Button>
          <Button onClick={cargarRegistros} variant="outline" className="border-red-300 text-red-800">
            Recargar datos
          </Button>
        </div>
      </div>
      
      {/* Mostrar errores si hay */}
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 shadow-sm">
          {error}
        </div>
      )}
      
      {/* Mostrar indicador de carga */}
      {loading && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg animate-pulse flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      )}
      
      {/* Visualización de flujo de trabajo */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className={`px-4 py-2 rounded-lg ${selectedRegistro ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
            1. Seleccionar Registro
          </div>
          <div className="border-t-2 border-gray-300 flex-grow mx-2"></div>
          <div className={`px-4 py-2 rounded-lg ${selectedTarea ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
            2. Seleccionar Tarea
          </div>
          <div className="border-t-2 border-gray-300 flex-grow mx-2"></div>
          <div className={`px-4 py-2 rounded-lg ${selectedDocumento ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-500'}`}>
            3. Visualizar Documento
          </div>
        </div>
      </div>
      
      {/* Lista de registros */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-red-800 flex items-center">
          <span className="mr-2 bg-red-800 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-sm">1</span>
          Registros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registros.length > 0 ? (
            registros.map((registro) => (
              <div 
                key={registro.id_registro} 
                onClick={() => seleccionarRegistro(registro.id_registro)}
                className={`cursor-pointer transition-all duration-200 transform hover:scale-102 hover:shadow-md 
                  ${selectedRegistro === registro.id_registro ? 'ring-2 ring-red-500 bg-red-50 shadow-md' : 'hover:bg-gray-50'}`}
              >
                <Card>
                  <CardContent>
                    <div className="font-medium text-gray-800">
                      {selectedRegistro === registro.id_registro && (
                        <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                      )}
                      {registro.id_registro}
                    </div>
                    <div className="text-sm text-gray-700 mt-1 font-medium">
                      {registro.nombre_registro}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Fecha: {formatearFecha(registro.fecha_registro)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Funcionario: {registro.funcionario_registro}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
              No hay registros disponibles
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de tareas asociadas al registro seleccionado */}
      {tareas.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-800 flex items-center">
            <span className="mr-2 bg-red-800 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-sm">2</span>
            Tareas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tareas.map((tarea) => (
              <div 
                key={tarea.id_tareas} 
                onClick={() => seleccionarTarea(tarea.id_tareas)}
                className={`cursor-pointer transition-all duration-200 transform hover:scale-102 hover:shadow-md
                  ${selectedTarea === tarea.id_tareas ? 'ring-2 ring-red-500 bg-red-50 shadow-md' : 'hover:bg-gray-50'}`}
              >
                <Card>
                  <CardContent>
                    <div className="font-medium text-gray-800">
                      {selectedTarea === tarea.id_tareas && (
                        <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                      )}
                      {tarea.nombre_tarea}
                    </div>
                    <div className="text-sm mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tarea.estado === 'Completada' ? 'bg-green-100 text-green-800' :
                        tarea.estado === 'En Progreso' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tarea.estado}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Lista de documentos asociados a la tarea seleccionada */}
      {documentos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-800 flex items-center">
            <span className="mr-2 bg-red-800 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-sm">3</span>
            Documentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentos.map((documento) => (
              <div 
                key={documento.codigo_documento} 
                onClick={() => visualizarDocumento(documento)}
                className={`cursor-pointer transition-all duration-200 transform
                  ${selectedDocumento && selectedDocumento.codigo_documento === documento.codigo_documento 
                    ? 'ring-2 ring-red-500 bg-red-50 shadow-md' 
                    : 'hover:bg-gray-50 hover:shadow-md'}
                  ${tieneCodigoAlmacenamiento(documento) ? '' : 'opacity-70'}`}
              >
                <Card>
                  <CardContent>
                    <div className="font-medium text-gray-800">
                      {selectedDocumento && selectedDocumento.codigo_documento === documento.codigo_documento && (
                        <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-2"></span>
                      )}
                      Código: {documento.codigo_documento}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Nombre: {documento.codigo_almacenamiento || 'No disponible'}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Fecha: {formatearFecha(documento.fecha_doc)}
                    </div>
                    {!tieneCodigoAlmacenamiento(documento) && (
                      <div className="mt-2 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                        Sin archivo asociado
                      </div>
                    )}
                    {tieneCodigoAlmacenamiento(documento) && (
                      <div className="mt-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md">
                        Clic para visualizar
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Visualizador de documentos - Solo si tiene código de almacenamiento */}
      {selectedDocumento && tieneCodigoAlmacenamiento(selectedDocumento) && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-800 mb-4">Visor de Documento</h2>
          <DocumentViewer 
            keyDocument={selectedDocumento.codigo_almacenamiento} 
            title={`Documento: ${selectedDocumento.codigo_almacenamiento}`} 
            documentName={selectedDocumento.codigo_almacenamiento} 
            mode="view" 
            callbackUrl={`${SERVER_BACK_URL}/api/save-document`} 
          />
        </div>
      )}
      
      {/* Mensaje cuando se selecciona un documento sin código de almacenamiento */}
      {selectedDocumento && !tieneCodigoAlmacenamiento(selectedDocumento) && (
        <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-lg shadow-sm text-amber-700">
          <h2 className="text-xl font-semibold mb-2">Documento no visualizable</h2>
          <p>El documento seleccionado no tiene un archivo asociado para visualizar.</p>
          <p className="mt-2 text-sm">Por favor, contacte con el administrador del sistema si cree que esto es un error.</p>
        </div>
      )}
    </div>
  );
}