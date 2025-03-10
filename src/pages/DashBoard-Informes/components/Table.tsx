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

    // Emitir el evento 'datos_proceso' y manejar la respuesta
    socket.emit("datos_proceso", (response: SocketResponse) => {
      console.log(
        "Respuesta completa del servidor:",
        JSON.stringify(response, null, 2)
      );

      // Validar la respuesta
      if (response.success && response.jsonData) {
        try {
          // Parsear el campo jsonData a un objeto JavaScript
          const jsonData = JSON.parse(response.jsonData);

          console.log("Datos recibidos:", jsonData);

          // Convertir JSON a filas para la tabla
const newData: TablaTarea[] = jsonData.Funcionarios.flatMap(
  (funcionario: Funcionario) =>
    funcionario.Caso.flatMap((caso: Caso) =>
      Array.isArray(caso.NombreTarea)
        ? caso.NombreTarea.map((tarea: Tarea) => ({
            NombreProceso: "Registro Propiedad Intelectual",
            NombreTarea: tarea.Nombre,
            Progreso: tarea.Progreso,
            EstadoDeProceso: tarea.EstadoDeProceso,
            TipoProductos: tarea.TipoProductos,
            NombreProductos: tarea.NombreProductos,
            NombreProyecto: tarea.NombreProyecto,
            Facultad: tarea.Facultad,
            Carrera: tarea.Carrera || "No especificado", // Nueva propiedad agregada
            TipoProyecto: tarea.TipoProyecto || "No especificado", // Nueva propiedad agregada
            MemorandoInicial: tarea.MemorandoInicial,
            NumeroCaso: caso.NumeroCaso,
            FechaRegistro: caso.FechaRegistro,
            FechaFinalizacion: caso.FechaFinalizacion || "",
            ProgresoGeneral: caso.ProgresoGeneral,
            EstadoProcesoGeneral: caso.EstadoProcesoGeneral,
            Funcionario: funcionario.Nombre,
            Autores: tarea.Autores || "", // nueva propiedad agregada
          }))
        : []
    )
);


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

    // Manejo de errores del socket
    socket.on("connect_error", (err) => {
      setError("Error de conexión: " + err.message);
      setLoading(false);
    });

    // Desconectar el socket al desmontar el componente
    return () => {
      socket.disconnect();
    };
  }, []);

  const columns = useMemo<MRT_ColumnDef<TablaTarea>[]>(() => [
    { accessorKey: "NombreProceso", header: "Nombre de Proceso", size: 150 },
    { accessorKey: "Funcionario", header: "Funcionario", size: 150 },
    { accessorKey: "NumeroCaso", header: "Número de Caso", size: 100 },
    { accessorKey: "NombreTarea", header: "Nombre de Tarea", size: 100 },
    { accessorKey: "Progreso", header: "Progreso", size: 100 },
    { accessorKey: "EstadoDeProceso", header: "Estado de Proceso", size: 120 },
    { accessorKey: "TipoProductos", header: "Tipo de Productos", size: 120 },
    { accessorKey: "NombreProductos", header: "Nombre de Productos", size: 150 },
    { accessorKey: "NombreProyecto", header: "Nombre del Proyecto", size: 150 },
    { accessorKey: "Facultad", header: "Facultad", size: 120 },
    { accessorKey: "Carrera", header: "Carrera", size: 120 }, // Nueva columna
    { accessorKey: "TipoProyecto", header: "Tipo de Proyecto", size: 120 }, // Nueva columna
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
    muiTableHeadCellProps: {
      style: {
        backgroundColor: "#1F2937",
        color: "#ffffff",
      },
    },
    muiTableBodyCellProps: {
      style: {
        verticalAlign: "top", // Alinea el contenido hacia arriba
      },
    },
    muiPaginationProps: {
      style: {
        backgroundColor: "#1F2937",
        color: "#ffffff",
      },
    },
    muiFilterTextFieldProps: {
      style: {
        backgroundColor: "#1F2937",
        color: "#ffffff",
      },
    },
  });

  const filteredData = useMemo(() => {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original);
    console.log("Datos filtrados en el componente principal:", rows); // Verifica los datos filtrados
    return rows;
  }, [table.getFilteredRowModel()]); // Dependencia del modelo de filas filtradas

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <ExportCard filteredData={filteredData} />
      <div className="h-[95vh] w-full max-w-5xl overflow-y-auto mx-auto p-1 border border-gray-200 shadow-lg rounded-lg">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default Example;