// FilterActions.tsx
import React from 'react';
import { Button, Box } from '@mui/material';

interface FilterActionsProps {
  onApplyFilters: () => void;
  onExportToExcel: () => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({ onApplyFilters, onExportToExcel }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
      <Button variant="contained" onClick={onApplyFilters}>
        Aplicar Filtros
      </Button>
      <Button variant="outlined" onClick={onExportToExcel}>
        Exportar a Excel
      </Button>
    </Box>
  );
};

export default FilterActions;