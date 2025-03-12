// Funciones para cargar datos de cada filtro de forma independiente
  export const cargarEstados = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/estados`);
      // return response.data;
      
      // Datos simulados para desarrollo
      return ["En Proceso", "Finalizado"];
    } catch (error) {
      console.error("Error al cargar estados:", error);
      return [];
    }
  };

  export const cargarProyectos = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/proyectos`);
      // return response.data;
      
      return ["Investigación", "Vinculación", "Carrera"];
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      return [];
    }
  };

 export  const cargarProductos = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/productos`);
      // return response.data;
      
      return ["R. Obras Literarias", "Software", "Libro", "R.Obras Artisticas", "R. P Radio", "R. Fonogramas"];
    } catch (error) {
      console.error("Error al cargar productos:", error);
      return [];
    }
  };

  export const cargarFuncionarios = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/funcionarios`);
      // return response.data;
      
      return ["Jimmy", "Fanny"];
    } catch (error) {
      console.error("Error al cargar funcionarios:", error);
      return [];
    }
  };

 export  const cargarFacultades = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/facultades`);
      // return response.data;
      
      return ["FISEI", "FCHE", "FDA", "FCS"];
    } catch (error) {
      console.error("Error al cargar facultades:", error);
      return [];
    }
  };

 export const cargarCarreras = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/carreras`);
      // return response.data;
      
      return [
        "Ingeniería Civil",
        "Ingeniería de Sistemas",
        "Medicina",
        "Derecho",
        "Arquitectura",
        "Software",
        "TI",
        "Administración",
        "Diseño"
      ];
    } catch (error) {
      console.error("Error al cargar carreras:", error);
      return [];
    }
  };

  // Función para cargar la relación entre facultades y carreras
 export const cargarCarrerasPorFacultad = async () => {
    try {
      // En un entorno real, reemplazar con la llamada a la API
      // const response = await axios.get(`${API_URL}/facultades-carreras`);
      // Construir el mapa a partir de la respuesta
      
      // Datos simulados para desarrollo
      const relaciones = [
        { facultad: "FISEI", carreras: ["Ingeniería Civil", "Ingeniería de Sistemas", "Software", "TI"] },
        { facultad: "FCHE", carreras: ["Derecho", "Administración"] },
        { facultad: "FDA", carreras: ["Arquitectura", "Diseño"] },
        { facultad: "FCS", carreras: ["Medicina"] }
      ];
      
      const mapa = new Map<string, string[]>();
      relaciones.forEach(rel => {
        mapa.set(rel.facultad, rel.carreras);
      });
      
      return mapa;
    } catch (error) {
      console.error("Error al cargar relación facultades-carreras:", error);
      return new Map<string, string[]>();
    }
  };