import { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import ExportCard from "./ExportCard.tsx";
import { SERVER_BACK_URL } from "../../../config.ts";

import {
  TablaTarea,
  SocketResponse,
  Funcionario,
  Caso,
  Tarea,
} from "./interfaces/tableprops.interface.ts";

const Example = () => {
  const [data, setData] = useState<TablaTarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io(SERVER_BACK_URL);

    socket.emit("datos_proceso", (response: SocketResponse) => {
      if (response.success && response.jsonData) {
        try {
          const jsonData = JSON.parse(response.jsonData);
          const newData: TablaTarea[] = [];
          
          if (jsonData.Procesos && Array.isArray(jsonData.Procesos)) {
            jsonData.Procesos.forEach((proceso: any) => {
              const nombreProceso = proceso.NombreProceso;
              
              if (proceso.Funcionarios && Array.isArray(proceso.Funcionarios)) {
                proceso.Funcionarios.forEach((funcionario: Funcionario) => {
                  if (funcionario.Caso && Array.isArray(funcionario.Caso)) {
                    funcionario.Caso.forEach((caso: Caso) => {
                      if (caso.Tareas && Array.isArray(caso.Tareas)) {
                        caso.Tareas.forEach((tarea: Tarea) => {
                          newData.push({
                            NombreProceso: nombreProceso,
                            NombreTarea: tarea.Nombre,
                            EstadoDeProceso: tarea.EstadoDeProceso,
                            TipoProductos: tarea.TipoProductos,
                            NombreProductos: tarea.NombreProductos,
                            NombreProyecto: tarea.NombreProyecto,
                            Facultad: tarea.Facultad || "No especificado",
                            Carrera: tarea.Carrera || "No especificado",
                            TipoProyecto: tarea.TipoProyecto || "No especificado",
                            MemorandoInicial: tarea.DocumentoPrincipal ? tarea.DocumentoPrincipal.MemorandoInicial : "",
                            NumeroCaso: caso.NumeroCaso,
                            FechaRegistro: caso.FechaRegistro,
                            FechaFinalizacion: caso.FechaFinalizacion || "",
                            ProgresoGeneral: caso.ProgresoGeneral,
                            EstadoProcesoGeneral: caso.EstadoProcesoGeneral,
                            Funcionario: funcionario.Nombre,
                            Autores: tarea.Autores || "",
                          });
                        });
                      }
                    });
                  }
                });
              }
            });
          }

          setData(newData);
          setLoading(false);
        } catch (error) {
          console.error("Error al parsear jsonData:", error);
          setError("Error: Datos no válidos");
          setLoading(false);
        }
      } else {
        console.error("Error: Datos no válidos o jsonData vacío");
        setError("Error: Datos no válidos");
        setLoading(false);
      }
    });

    socket.on("connect_error", (err) => {
      setError("Error de conexión: " + err.message);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const columns = useMemo<MRT_ColumnDef<TablaTarea>[]>(() => [
    { accessorKey: "NombreProceso", header: "Nombre de Proceso", size: 150 },
    { accessorKey: "Funcionario", header: "Funcionario", size: 150 },
    { accessorKey: "NumeroCaso", header: "Número de Caso", size: 100 },
    { accessorKey: "NombreTarea", header: "Nombre de Tarea", size: 100 },
    { accessorKey: "EstadoDeProceso", header: "Estado de Tarea", size: 120 },
    { accessorKey: "TipoProductos", header: "Tipo de Productos", size: 120 },
    { accessorKey: "NombreProductos", header: "Nombre de Productos", size: 150 },
    { accessorKey: "NombreProyecto", header: "Nombre del Proyecto", size: 150 },
    { accessorKey: "Facultad", header: "Facultad", size: 120 },
    { accessorKey: "Carrera", header: "Carrera", size: 120 },
    { accessorKey: "TipoProyecto", header: "Tipo de Proyecto", size: 120 },
    { accessorKey: "MemorandoInicial", header: "Memorando Inicial", size: 120 },
    { accessorKey: "FechaRegistro", header: "Fecha de Registro", size: 120 },
    { accessorKey: "FechaFinalizacion", header: "Fecha de Finalización", size: 120 },
    { accessorKey: "ProgresoGeneral", header: "Progreso General", size: 100 },
    { accessorKey: "EstadoProcesoGeneral", header: "Estado General", size: 120 },
    { accessorKey: "Autores", header: "Autores", size: 200 },
  ], []);
  
  const table = useMaterialReactTable({
    columns,
    data,
    enableFullScreenToggle: true,
    initialState: {
      density: 'compact', // Makes the rows more compact
      columnVisibility: {
        // Hide less important columns by default to fit more content
        Facultad: false,
        Carrera: false,
        TipoProyecto: false,
        FechaFinalizacion: false,
      },
    },
    muiTableContainerProps: {
      sx: { 
        height: 'calc(100% - 58px)', // Subtracting export card height
        maxHeight: '100%',
      },
    },
    muiTableHeadCellProps: {
      style: {
        backgroundColor: "#1F2937",
        color: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 1,
      },
    },
    muiTableBodyCellProps: {
      style: {
        verticalAlign: "top",
      },
    },
    muiPaginationProps: {
      style: {
        backgroundColor: "#1F2937",
        color: "#ffffff",
      },
    },
    muiToolbarAlertBannerProps: {
      color: 'info',
    },
    positionToolbarAlertBanner: 'bottom',
  });

  const filteredData = useMemo(() => {
    return table.getFilteredRowModel().rows.map((row) => row.original);
  }, [table.getFilteredRowModel()]);

  if (loading) return <div className="flex h-full items-center justify-center">Cargando...</div>;
  if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-slate-800 text-white p-4">
        <h1 className="text-xl font-bold mb-2">TAREAS DE PROPIEDAD INTELECTUAL - GENERACIÓN DE REPORTES</h1>
        <ExportCard filteredData={filteredData} />
      </div>
      <div className="flex-1 overflow-hidden">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default Example;