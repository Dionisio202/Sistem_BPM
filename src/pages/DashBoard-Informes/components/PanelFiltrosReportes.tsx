// FilterPanel.tsx
import React, { useState } from 'react';
import { Paper, Box } from '@mui/material';
import * as XLSX from 'xlsx';
import FilterActions from '../components/UI/FilterActions';
import FilterInput from '../components/UI/FilterInput';

// Definición de interfaces
interface Column {
  id: string;
  label: string;
  minWidth: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: number) => string;
}

interface Row {
  name: string;
  code: string;
  population: number;
  size: number;
  density: number;
}

// Props del componente FilterPanel
interface FilterPanelProps {
  columns: Column[]; // Columnas de la tabla
  rows: Row[]; // Datos de la tabla
  onFilter: (filteredRows: Row[]) => void; // Función para pasar los datos filtrados a la tabla
}

const FilterPanel: React.FC<FilterPanelProps> = ({ columns, rows, onFilter }) => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Maneja cambios en los campos de filtro
  const handleFilterChange = (columnId: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [columnId]: value,
    }));
  };

  // Aplica los filtros a los datos
  const applyFilters = () => {
    const filteredRows = rows.filter((row) =>
      columns.every((column) => {
        const filterValue = filters[column.id];
        if (!filterValue) return true; // Si no hay filtro, incluir la fila
        const rowValue = row[column.id as keyof Row].toString().toLowerCase();
        return rowValue.includes(filterValue.toLowerCase());
      }),
    );
    onFilter(filteredRows); // Pasa los datos filtrados a la tabla
  };

  // Exporta la tabla a un archivo Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tabla');
    XLSX.writeFile(workbook, 'tabla.xlsx');
  };

  return (
    <Paper sx={{ padding: 2, marginBottom: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {columns.map((column) => (
          <FilterInput
            key={column.id}
            label={`Filtrar por ${column.label}`}
            value={filters[column.id] || ''}
            onChange={(value) => handleFilterChange(column.id, value)}
          />
        ))}
      </Box>
      <FilterActions onApplyFilters={applyFilters} onExportToExcel={exportToExcel} />
    </Paper>
  );
};

export default FilterPanel;