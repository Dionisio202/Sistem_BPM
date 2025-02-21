// src/interfaces/format.interface.ts
  export interface PDFConfig {
    tableColumn: string[];
    headStyles: {
      fillColor: number[];
      textColor: number[];
      fontStyle: string;
    };
    bodyStyles: {
      fontSize: number;
    };
  }
  
  // Interface para los estilos de la tabla en la UI
  export interface TableStyles {
    headerClass: string;
    cellClass: string;
    loadingClass: string;
    errorClass: string;
  }