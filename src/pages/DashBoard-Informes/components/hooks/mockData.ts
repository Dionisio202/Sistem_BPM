// data/mockData.ts

import { RegistroPI } from "../interfaces/dashboard.interface";

export const simulatedData : RegistroPI[] = [
    {
      id: "1",
      numero: 1,
      nombre: "Software BPM",
      tipoProducto: "Software",
      tipoProyecto: "Investigación",
      facultades: [
        { nombre: "FISEI", carreras: ["Software", "TI"] },
        { nombre: "FCHE", carreras: ["Administración"] } // Ejemplo de otra relación
        
      ],
      funcionario: "Jimmy",
      estado: "Finalizado",
      progreso: 100,
      fechaInicio: "2024-09-01",
      fechaFin: "2024-09-05",
      subtareas: [
        {
          id: "1.1",
          nombre: "Asesoría para Registro de Propiedad Intelectual",
          fechaInicio: "2023-09-01",
          fechaFin: "2023-09-03",
          estado: "Completado",
          archivos: [
            { id: "f1", name: "Informe_Asesoria.pdf", path: "/ruta/al/archivo/Informe_Asesoria.pdf" },
            { id: "f2", name: "Formulario_PI.docx" }
          ]
        },
        {
          id: "1.2",
          nombre: "Atención de Solicitud de Registro de Propiedad Intelectual",
          fechaInicio: "2023-09-03",
          fechaFin: "2023-09-05",
          estado: "Completado"
        }
      ]
    },
    {
      id: "2",
      numero: 2,
      nombre: "Mini Película",
      tipoProducto: "R.Obras Artisticas",
      tipoProyecto: "Vinculación",
      facultades: [
        { nombre: "FCHE", carreras: ["Diseño"] },
        { nombre: "FDA", carreras: ["Administración"] }
      ],
      funcionario: "Fanny",
      estado: "En Proceso",
      progreso: 30,
      fechaInicio: "2024-09-03",
      fechaFin: "2024-09-15",
      subtareas: []
    },
    {
      id: "3",
      numero: 3,
      nombre: "Libro: Vida en la UTA",
      tipoProducto: "R. Obras Literarias",
      tipoProyecto: "Carrera",
      facultades: [
        { nombre: "FDA", carreras: ["Administración"] }
      ],
      funcionario: "Jimmy",
      estado: "Finalizado",
      progreso: 100,
      fechaInicio: "2024-08-25",
      fechaFin: "2024-09-10",
      subtareas: []
    },
    {
      id: "4",
      numero: 4,
      nombre: "Manual de Programación",
      tipoProducto: "R. Obras Literarias",
      tipoProyecto: "Investigación",
      facultades: [
        { nombre: "FISEI", carreras: ["Software", "TI"] }
      ],
      funcionario: "Jimmy",
      estado: "En Proceso",
      progreso: 60,
      fechaInicio: "2023-10-01",
      fechaFin: "2023-10-30",
      subtareas: []
    },
    {
        id: "5",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software", "TI"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      },
      {
        id: "6",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software2"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      },
      {
        id: "7",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software3"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      }
      ,
      {
        id: "8",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software4"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      }
      ,
      {
        id: "9",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software5"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      }
      ,
      {
        id: "10",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software6"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      }
      ,
      {
        id: "11",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software7"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      }
      ,
      {
        id: "12",
        numero: 4,
        nombre: "Manual de Programación",
        tipoProducto: "R. Obras Literarias",
        tipoProyecto: "Investigación",
        facultades: [
          { nombre: "FISEI", carreras: ["Software8"] }
        ],
        funcionario: "Jimmy",
        estado: "En Proceso",
        progreso: 60,
        fechaInicio: "2023-10-01",
        fechaFin: "2023-10-30",
        subtareas: []
      }
  ];
  