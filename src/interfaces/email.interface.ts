import { Socket } from "socket.io-client";
import { temporalData } from "./actividad.interface";
export interface SaveTempStateResponse {
  success: boolean;
  message: string;
}

export interface EmailInputProps {
  json: temporalData | null;
  socket: Socket;
  stopAutoSave: () => void;
  saveFinalState: (data: temporalData) => Promise<SaveTempStateResponse>;
  attachments?: string[];  // Nombres de archivos a enviar
  docBasePath?: string;      // Ruta base para los adjuntos
}