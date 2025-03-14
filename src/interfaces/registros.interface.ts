export interface Persona {
  id_persona?: number;
  id_rol?: number;
  id_facultad_carrera?: number;
  ciudad?: number;
  identificacion?: string;
  nombre: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  direccion?: string;
  correo?: string;
}

export interface Autor extends Persona {
  id_autor_producto?: number;
  id_producto?: number;
  id_autor?: number;
  porcentaje_participacion?: number;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
}

export interface ModalData {
  success: boolean;
  message: string;
  autores: Autor[];
  productos: Producto[];
}

export interface TipoProducto {
  id: number;
  nombre: string;
}

export interface ModalProps {
  showModal: boolean;
  closeModal: () => void;
  modalData: any; // Ajusta según tu interfaz
  onSave?: (editedData: any) => void;
  tipoMemorando: string;
  handleTipoMemorandoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
