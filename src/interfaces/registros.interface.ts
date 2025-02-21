export interface Autor {
  nombre: string;
  apellido: string;
  id: number;
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
  onSave: (editedData: any) => void;
  tipoMemorando: string;
  handleTipoMemorandoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
