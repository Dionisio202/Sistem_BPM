export interface UploadFileProps {
    onFileChange: (file: File | null) => void;
    label?: string; // Prop opcional para el título
    id: string; // id único para cada input
    className?: string; // Clases CSS personalizadas
  }