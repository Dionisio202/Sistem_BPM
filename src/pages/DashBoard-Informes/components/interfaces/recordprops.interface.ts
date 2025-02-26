export interface NumericRecord {
  label: string; // Etiqueta del registro (ej: "Proyectos")
  value: number; // Valor numérico (ej: 120)
}

// Props del componente
export interface NumericCardsProps {
  records: NumericRecord[];
}
