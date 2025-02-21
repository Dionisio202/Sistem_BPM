export interface DocumentType {
    [key: string]: boolean;
  }
  
  export interface FiltersProps {
    documentType: DocumentType;
    handleTypeChange: (type: string) => void;
    clearFilters?: () => void;
    disabled?: boolean;
  }