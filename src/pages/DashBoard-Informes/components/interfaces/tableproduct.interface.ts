
export interface TableProps {
    headers: string[]; // Encabezados de la tabla
    rows: { name: string; description: string; category: string }[]; // Filas de la tabla
    className?: string; // Clases adicionales
  }
  