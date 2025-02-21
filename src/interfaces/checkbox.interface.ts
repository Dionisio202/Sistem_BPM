export interface CheckboxProps {
    /** Etiqueta que aparece al lado del checkbox */
    label: string;
    /** Estado actual del checkbox */
    value: boolean;
    /** Función para manejar cambios */
    onChange: (value: boolean) => void;
  }