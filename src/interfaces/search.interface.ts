export interface SearchProps {
    search: string;
    setSearch: (value: string) => void;
    year: string;
    setYear: (value: string) => void;
    disabled?: boolean;
  }