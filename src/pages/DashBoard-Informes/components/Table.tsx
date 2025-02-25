import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Tarea } from "./interfaces/tableprops.interface.ts";
import ExportCard from "./ExportCard.tsx";

// Datos del JSON que recibe para la tabla
const jsonData = {
  NombreProceso: "Gestión de Proyectos Académicos",
  Funcionarios: [
    {
      Nombre: "Jimmy",
      Caso: [
        {
          NumeroCaso: "2001",
          NombreTarea: [
            {
              Nombre: "Revisión de Documentos",
              Progreso: "30%",
              EstadoDeProceso: "Iniciado",
              TipoProductos: "R.Obras",
              NombreProductos: "Estudio sobre Cambio Climático",
              NombreProyecto: "Proyecto Verde",
              Facultad: "Ciencias Ambientales",
              MemorandoInicial: "MI-2023-001",
            },
            {
              Nombre: "Aprobación de Presupuesto",
              Progreso: "10%",
              EstadoDeProceso: "Pendiente",
              TipoProductos: "R.Obras",
              NombreProductos: "Estudio sobre Cambio Climático",
              NombreProyecto: "Proyecto Verde",
              Facultad: "Ciencias Ambientales",
              MemorandoInicial: "MI-2023-001",
            },
            {
              Nombre: "Entrega de Informe Final",
              Progreso: "0%",
              EstadoDeProceso: "No Iniciado",
              TipoProductos: "R.Obras",
              NombreProductos: "Estudio sobre Cambio Climático",
              NombreProyecto: "Proyecto Verde",
              Facultad: "Ciencias Ambientales",
              MemorandoInicial: "MI-2023-001",
            },
          ],
          FechaRegistro: "2023-01-15",
          FechaFinalizacion: "2023-06-30",
          ProgresoGeneral: "13%",
          EstadoProcesoGeneral: "En Progreso",
        },
      ],
    },
    {
      Nombre: "Ana",
      Caso: [
        {
          NumeroCaso: "2002",
          NombreTarea: [
            {
              Nombre: "Análisis de Datos",
              Progreso: "50%",
              EstadoDeProceso: "En Progreso",
              TipoProductos: "R.Artículos",
              NombreProductos: "Impacto del Calentamiento Global",
              NombreProyecto: "Proyecto Azul",
              Facultad: "Ciencias Ambientales",
              MemorandoInicial: "MI-2023-002",
            },
            {
              Nombre: "Redacción del Informe Parcial",
              Progreso: "20%",
              EstadoDeProceso: "Iniciado",
              TipoProductos: "R.Artículos",
              NombreProductos: "Impacto del Calentamiento Global",
              NombreProyecto: "Proyecto Azul",
              Facultad: "Ciencias Ambientales",
              MemorandoInicial: "MI-2023-002",
            },
            {
              Nombre: "Presentación de Resultados",
              Progreso: "0%",
              EstadoDeProceso: "No Iniciado",
              TipoProductos: "R.Artículos",
              NombreProductos: "Impacto del Calentamiento Global",
              NombreProyecto: "Proyecto Azul",
              Facultad: "Ciencias Ambientales",
              MemorandoInicial: "MI-2023-002",
            },
          ],
          FechaRegistro: "2023-02-01",
          FechaFinalizacion: "2023-07-15",
          ProgresoGeneral: "25%",
          EstadoProcesoGeneral: "En Progreso",
        },
      ],
    },
  ],
};

// Convertir JSON a filas para la tabla
const data: Tarea[] = jsonData.Funcionarios.flatMap((funcionario) =>
  funcionario.Caso.flatMap((caso) =>
    caso.NombreTarea.map((tarea) => ({
      NumeroCaso: caso.NumeroCaso,
      NombreTarea: tarea.Nombre,
      Progreso: tarea.Progreso,
      EstadoDeProceso: tarea.EstadoDeProceso,
      TipoProductos: tarea.TipoProductos,
      NombreProductos: tarea.NombreProductos,
      NombreProyecto: tarea.NombreProyecto,
      Facultad: tarea.Facultad,
      MemorandoInicial: tarea.MemorandoInicial,
      FechaRegistro: caso.FechaRegistro,
      FechaFinalizacion: caso.FechaFinalizacion,
      ProgresoGeneral: caso.ProgresoGeneral,
      EstadoProcesoGeneral: caso.EstadoProcesoGeneral,
    }))
  )
);

const Example = () => {
  // Definir las columnas de la tabla
  const columns = useMemo<MRT_ColumnDef<Tarea>[]>(
    () => [
      {
        accessorKey: "NumeroCaso",
        header: "Número de Caso",
        size: 100,
      },
      {
        accessorKey: "NombreTarea",
        header: "Nombre de la Tarea",
        size: 100,
      },
      {
        accessorKey: "Progreso",
        header: "Progreso",
        size: 100,
      },
      {
        accessorKey: "EstadoDeProceso",
        header: "Estado de Proceso",
        size: 120,
      },
      {
        accessorKey: "TipoProductos",
        header: "Tipo de Productos",
        size: 120,
      },
      {
        accessorKey: "NombreProductos",
        header: "Nombre de Productos",
        size: 150,
      },
      {
        accessorKey: "NombreProyecto",
        header: "Nombre del Proyecto",
        size: 150,
      },
      {
        accessorKey: "Facultad",
        header: "Facultad",
        size: 120,
      },
      {
        accessorKey: "MemorandoInicial",
        header: "Memorando Inicial",
        size: 120,
      },
      {
        accessorKey: "FechaRegistro",
        header: "Fecha de Registro",
        size: 120,
      },
      {
        accessorKey: "FechaFinalizacion",
        header: "Fecha de Finalización",
        size: 120,
      },
      {
        accessorKey: "ProgresoGeneral",
        header: "Progreso General",
        size: 100,
      },
      {
        accessorKey: "EstadoProcesoGeneral",
        header: "Estado General",
        size: 120,
      },
    ],
    []
  );
  const table = useMaterialReactTable({
    columns,
    data,
    // Personalizar el encabezado
    muiTableHeadCellProps: {
      style: {
        backgroundColor: "#1F2937", // Color de fondo del encabezado
        color: "#ffffff", // Color del texto del encabezado
      },
    },
    // Personalizar la paginación
    muiPaginationProps: {
      style: {
        backgroundColor: "#1F2937", // Color de fondo de la paginación
        color: "#ffffff",
      },
    },
    muiFilterTextFieldProps: {
      style: {
        backgroundColor: "#1F2937", // Color de fondo de los filtros
        color: "#ffffff", // Color del texto de los filtros
      },
    },
  });
  // Obtener los datos filtrados
  const filteredData = table
    .getFilteredRowModel()
    .rows.map((row) => row.original);

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
