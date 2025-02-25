export interface Column {
  id: string;
  label: string;
  minWidth: number;
  align?: "left" | "right" | "center";
  format?: (value: number) => string;
}

export interface Row {
  name: string;
  code: string;
  population: number;
  size: number;
  density: number;
}
