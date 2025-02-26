import { Card } from "../../UI/card";
import Button from "../../UI/button";
import { Send } from "lucide-react";
import { useState } from "react";
import { Socket } from "socket.io-client";
// @ts-ignore
import BonitaUtilities from "../../bonita/bonita-utilities";
import { temporalData } from "../../../interfaces/actividad.interface";

export interface SaveTempStateResponse {
  success: boolean;
  message: string;
}

interface EmailInputProps {
  json: temporalData | null;
  socket: Socket;
  stopAutoSave: () => void;
  saveFinalState: (data: temporalData) => Promise<SaveTempStateResponse>;
  attachments?: string[];  // Nombres de archivos a enviar
  docBasePath?: string;      // Ruta base para los adjuntos
}

export function EmailInput(emailInputProps: EmailInputProps) {
  const [email, setEmail] = useState<string>("");         // Campo de entrada individual
  const [emailList, setEmailList] = useState<string[]>([]); // Lista de correos
  const [error, setError] = useState<string>("");
  const [subject, setSubject] = useState<string>("UNIVERSIDAD TECNICA DE AMBATO DINNOVA"); // Asunto fijo
  const [message, setMessage] = useState<string>("Este es el contenido del correo."); // Campo para mensaje
  const bonita: BonitaUtilities = new BonitaUtilities();

  // Regex para validar formato de correo
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Manejar cambio en el campo de correo
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  // Añade el correo a la lista
  const handleAddEmail = () => {
    if (emailRegex.test(email)) {
      if (!emailList.includes(email)) {
        setEmailList([...emailList, email]);
        setEmail("");
      } else {
        setError("Este correo ya ha sido agregado.");
      }
    } else {
      setError("Por favor ingrese un correo válido.");
    }
  };

  // Elimina un correo de la lista
  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter((email) => email !== emailToRemove));
  };

  // Lógica para enviar correos a través de Socket.io
  const handleSubmit = () => {
    if (emailList.length === 0) {
      setError("Por favor, agregue al menos un correo electrónico.");
      return;
    }

    // Construir el payload usando las props opcionales o valores por defecto
    const payload = {
      to: emailList,                              // Array de destinatarios
      subject,                                    // Asunto del correo
      message,                                    // Cuerpo del correo (input para el mensaje)
      attachments: emailInputProps.attachments ?? ["jfda-001.docx", "jfsr-001.docx"],
      docBasePath: emailInputProps.docBasePath ?? "/app/documents"
    };

    emailInputProps.socket.emit("send_email", payload, (response: any) => {
      console.log("📩 Respuesta del servidor:", response);
      if (response.success) {
        alert("Correo enviado exitosamente.");
      } else {
        alert("Error al enviar correo: " + response.message);
      }
    });
  };

  // Avanzar a la siguiente página / tarea
  const handleNext = async () => {
    try {
      if (emailInputProps.json) {
        await emailInputProps.saveFinalState(emailInputProps.json);
        await bonita.changeTask();
        alert("Avanzando...");
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <Card className="w-full md:w-1/2 p-5 bg-white shadow-lg rounded-lg">
      <h2 className="font-bold text-lg text-gray-800 mb-4">
        Envío de formatos a:
      </h2>

      {/* Campo para Asunto */}
      <div className="mt-4">
        <label className="block font-semibold text-xs text-gray-700 mb-1">
          Asunto
        </label>
        <input
          type="text"
          className="w-full text-xs mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto del correo"
        />
      </div>

      {/* Campo para Mensaje */}
      <div className="mt-4">
        <label className="block font-semibold text-xs text-gray-700 mb-1">
          Mensaje
        </label>
        <textarea
          className="w-full text-xs mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Este es el contenido del correo."
        />
      </div>

      {/* Campo para ingresar un correo */}
      <div className="mt-4">
        <label
          htmlFor="email"
          className="block font-semibold text-xs text-gray-700 mb-1"
        >
          Dirección de Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          className="w-full text-xs mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={handleEmailChange}
          placeholder="Ingrese correo destinatario"
        />
      </div>

      {/* Mostrar mensaje de error */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Botón para agregar correo */}
      <Button
        className="mt-4 text-xs w-full flex items-center justify-center gap-2 bg-[#931D21] text-white rounded-lg p-2 hover:border-y-orange-600 transition-colors duration-300"
        onClick={handleAddEmail}
        disabled={!email}
      >
        Agregar Correo
      </Button>

      {/* Lista de correos agregados */}
      {emailList.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-xs text-gray-700">
            Correos agregados:
          </h3>
          <ul className="list-disc pl-6 mt-2">
            {emailList.map((email) => (
              <li
                key={email}
                className="text-xs flex justify-between items-center text-gray-800 mb-2"
              >
                <span>{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón para enviar correos */}
      <Button
        className="text-xs mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg p-2 hover:bg-green-700 transition-colors duration-200"
        onClick={handleSubmit}
        disabled={emailList.length === 0}
      >
        <Send size={16} /> Enviar Correos
      </Button>

      {/* Botón "Siguiente" */}
      <div className="flex justify-center mt-6">
        <Button
          className="bg-[#931D21] text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors duration-200"
          onClick={handleNext}
        >
          Siguiente Proceso
        </Button>
      </div>
    </Card>
  );
}
