import { useState, useEffect } from "react";
import { SERVER_BACK_URL } from "../../config.ts";
import io from "socket.io-client";
import Button from "../../components/UI/button.tsx";
import { Input } from "../../components/UI/input.tsx";
import { Card } from "../../components/UI/card.tsx";
import CardContent from "../../components/cards/cardcontent.tsx";
import DocumentViewer from "../../components/files/DocumentViewer.tsx";
// @ts-ignore

const socket = io(SERVER_BACK_URL);

// Definición de interfaces para tipar la data
interface Proceso {
  id: number;
  nombre: string;
}

interface Tarea {
  id: number;
  nombre_tarea: string;
}

interface Documento {
  id: number;
  nombre: string;
  archivo: string;
}

export default function Trazabilidad() {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [tareas, setTareas] = useState<Tarea[]>([]);
  // @ts-ignore

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  // @ts-ignore

  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);

  useEffect(() => {
    fetch(`${SERVER_BACK_URL}/api/procesos`)
      .then((res) => res.json())
      .then((data: Proceso[]) => setProcesos(data));
  }, []);

  const buscarProceso = () => {
    fetch(`${SERVER_BACK_URL}/api/procesos?query=${busqueda}`)
      .then((res) => res.json())
      .then((data: Proceso[]) => setProcesos(data));
  };

  const seleccionarProceso = (idProceso: number) => {
    fetch(`${SERVER_BACK_URL}/api/tareas?proceso=${idProceso}`)
      .then((res) => res.json())
      .then((data: Tarea[]) => setTareas(data));
  };

  const seleccionarTarea = (idTarea: number) => {
    fetch(`${SERVER_BACK_URL}/api/documentos?tarea=${idTarea}`)
      .then((res) => res.json())
      .then((data: Documento[]) => setDocumentos(data));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <Input 
          placeholder="Buscar proceso..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Button onClick={buscarProceso}>Buscar</Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {procesos.map((proceso) => (
          <div key={proceso.id} onClick={() => seleccionarProceso(proceso.id)}>
            <Card>
              <CardContent>{proceso.nombre}</CardContent>
            </Card>
          </div>
        ))}
      </div>
      {tareas.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {tareas.map((tarea) => (
            <div key={tarea.id} onClick={() => seleccionarTarea(tarea.id)}>
              <Card>
                <CardContent>{tarea.nombre_tarea}</CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
      {selectedDocument && (
        <DocumentViewer 
          keyDocument={selectedDocument.id.toString()} 
          title={selectedDocument.nombre} 
          documentName={selectedDocument.archivo} 
          mode="view" 
          callbackUrl={`${SERVER_BACK_URL}/api/save-document`} 
        />
      )}
    </div>
  );
}
