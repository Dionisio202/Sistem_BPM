// Definición de tipos
export interface Filters {
  estado: string;
  proyecto: string[];
  producto: string[];
  funcionario: string;
  facultades: string[]; // Array para soportar múltiples facultades
  carreras: string[]; 
  fechaInicio: string;
  fechaFin: string;
}

export interface FilterPanelProps {
  onFilterChange: (filters: Filters) => void;
  estados: string[];
  proyectos: string[];
  productos: string[];
  funcionarios: string[];
  facultades: string[];
  carreras: string[];
  currentFilters: Filters; // Nueva prop para mantener sincronizados los filtros
}