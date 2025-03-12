// utils/dataUtils.ts
import React from "react";
import { DatosFiltros, RegistroPI } from "../../components/interfaces/dashboard.interface";
import { FiPackage } from "react-icons/fi";
// Función para generar datos derivados para los gráficos
export const generarDatosGraficos = (registros: RegistroPI[], datosFiltros: DatosFiltros) => {
  // Mapa para contar registros por facultad
  const conteoFacultades = new Map<string, number>();
  datosFiltros.facultades.forEach(facultad => {
    conteoFacultades.set(facultad, 0);
  });
  
  // Contar registros para cada facultad
  registros.forEach(registro => {
    registro.facultades.forEach(facultad => {
      const contador = conteoFacultades.get(facultad) || 0;
      conteoFacultades.set(facultad, contador + 1);
    });
  });
  
  // Convertir a formato para gráfico
  const datosFacultades = Array.from(conteoFacultades.entries()).map(([facultad, count]) => ({
    name: facultad,
    value: count,
    facultad: facultad
  }));

  // Mapa para contar registros por carrera
  const conteoCarreras = new Map<string, number>();
  datosFiltros.carreras.forEach(carrera => {
    conteoCarreras.set(carrera, 0);
  });
  
  // Contar registros para cada carrera
  registros.forEach(registro => {
    registro.carreras.forEach(carrera => {
      const contador = conteoCarreras.get(carrera) || 0;
      conteoCarreras.set(carrera, contador + 1);
    });
  });
  
  // Convertir a formato para gráfico
  const datosCarreras = Array.from(conteoCarreras.entries()).map(([carrera, count]) => ({
    key: carrera,
    value: count,
    carrera: carrera
  }));

  // Datos para gráfico de barras apiladas (por tipo de producto)
  const datosTipoProducto = Array.from(
    datosFiltros.productos.reduce((acc, producto) => {
      const registrosProducto = registros.filter(reg => reg.tipoProducto === producto);
      const investigacion = registrosProducto.filter(reg => reg.tipoProyecto === "Investigación").length;
      const vinculacion = registrosProducto.filter(reg => reg.tipoProyecto === "Vinculación").length;
      const carrera = registrosProducto.filter(reg => reg.tipoProyecto === "Carrera").length;
      
      acc.set(producto, { 
        name: producto, 
        value1: investigacion, // Investigación
        value2: vinculacion, // Vinculación
        value3: carrera, // Carrera
        tipo: producto 
      });
      
      return acc;
    }, new Map())
  ).map(([_, value]) => value);

  // Datos para categorías de proyectos
  const datosProyectos = Array.from(
    datosFiltros.proyectos.reduce((acc, proyecto) => {
      const count = registros.filter(reg => reg.tipoProyecto === proyecto).length;
      acc.set(proyecto, { 
        name: proyecto, 
        count: count, 
        proyecto: proyecto 
      });
      return acc;
    }, new Map())
  ).map(([_, value]) => value);

  return {
    datosFacultades,
    datosCarreras,
    datosTipoProducto,
    datosProyectos
  };
};

// Preparar datos para Gantt
export const prepararDatosGantt = (registros: RegistroPI[]) => {
  return registros.map(registro => ({
    id: registro.id,
    name: `Caso ${registro.numero} - ${registro.nombre}`,
    startDate: new Date(registro.fechaInicio),
    endDate: new Date(registro.fechaFin),
    progress: registro.progreso,
    status: registro.estado,
    facultades: registro.facultades.join(", "),
    proyecto: registro.tipoProyecto,
    producto: registro.tipoProducto,
    funcionario: registro.funcionario,
    carreras: registro.carreras.join(", "),
    subtasks: registro.subtareas ? registro.subtareas.map(subtarea => ({
      id: subtarea.id,
      name: subtarea.nombre,
      startDate: new Date(subtarea.fechaInicio),
      endDate: new Date(subtarea.fechaFin),
      status: subtarea.estado,
      files: subtarea.archivos
    })) : []
  }));
};

// Preparar datos para tabla de productos
export const prepararDatosTabla = (registros: RegistroPI[]) => {
  return registros.map(registro => ({
    number: registro.numero,
    name: registro.nombre,
    description: registro.tipoProducto,
    category: registro.tipoProyecto,
    facultades: registro.facultades.join(", "),
    carreras: registro.carreras.join(", ")
  }));
};

// Preparar datos para las tarjetas de productos
export const prepararTarjetasProductos = (registros: RegistroPI[], productos: string[]) => {
  return productos.map(producto => ({
    title: producto,
    value: registros.filter(reg => reg.tipoProducto === producto).length,
    icon: React.createElement(FiPackage, { className: "h-8 w-8 text-blue-500" })
  }));
};