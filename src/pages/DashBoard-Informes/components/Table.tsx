import React, { useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import FilterPanel from './PanelFiltrosReportes'; // Asegúrate de importar el componente de filtros

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

const StickyHeadTable: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);

  // Datos originales de la tabla
  const rows: Row[] = [
    { name: 'Asesoramiento', code: 'memorando01', population: 1324171354, size: 3287263, density: 403 },
    { name: 'Reporte', code: 'memorando01', population: 1403500365, size: 9596961, density: 146 },
    { name: 'Caso', code: 'memorando02', population: 332915074, size: 9372610, density: 36 },
    { name: 'Dinnova', code: 'memorando02', population: 213993437, size: 8515767, density: 25 },
    { name: 'minecraft', code: 'memorando03', population: 145912025, size: 17098242, density: 9 },
  ];

  // Columnas de la tabla
  const columns: Column[] = [
    { id: 'Nombre', label: 'Name', minWidth: 170 },
    { id: 'Memorando', label: 'ISO\u00a0Code', minWidth: 100 },
    { id: 'numero', label: 'Population', minWidth: 100, align: 'right' },
    { id: 'etc', label: 'Size\u00a0(km\u00b2)', minWidth: 100, align: 'right' },
    { id: 'etc', label: 'Density', minWidth: 100, align: 'right' },
  ];

  // Maneja cambios de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Maneja cambios en el número de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Panel de Filtros */}
      <FilterPanel columns={columns} rows={rows} onFilter={setFilteredRows} />

      {/* Tabla */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id as keyof Row];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default StickyHeadTable;