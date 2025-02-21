import { useState, useEffect } from "react";
import CardContainer from "./components/CardContainer";
// @ts-ignore
import BonitaUtilities  from "../bonita/bonita-utilities";
import Title from "./components/TitleProps";
import { SERVER_BACK_URL } from "../../config.ts";
import { useBonitaService } from "../../services/bonita.service";
export default function MemoCodeForm() {
  const [memoCode, setMemoCode] = useState("");
  const [loading, setLoading] = useState(false);
  // @ts-ignore
  const [error2, setError] = useState("");
  const bonita: BonitaUtilities = new BonitaUtilities();

  // Valores que deberías obtener de tu aplicación (pueden venir por props o contexto)
  const id_tipo_documento = 3; // Ejemplo, reemplazar con valor real
  const { obtenerUsuarioAutenticado, obtenerDatosBonita, error } = useBonitaService();
  const [usuario, setUsuario] = useState<{
    user_id: string;
    user_name: string;
  } | null>(null);
  const [bonitaData, setBonitaData] = useState<{
    processId: string;
    taskId: string;
    caseId: string;
    processName: string;
  } | null>(null);
 

 

  // 🔹 Obtener el usuario autenticado al montar el componente
    useEffect(() => {
      const fetchUser = async () => {
        const userData = await obtenerUsuarioAutenticado();
        if (userData) {
          setUsuario(userData);
        }
      };
      fetchUser();
    }, [obtenerUsuarioAutenticado]);
  
    // 🔹 Obtener datos de Bonita una vez que se tenga el usuario
    useEffect(() => {
      if (!usuario) return;
      const fetchData = async () => {
        try {
          const data = await obtenerDatosBonita(usuario.user_id);
          if (data) {
            setBonitaData(data);
          }
        } catch (error) {
          console.error("❌ Error obteniendo datos de Bonita:", error);
        }
      };
      fetchData();
    }, [usuario, obtenerDatosBonita]);

  // 🔹 Obtener el usuario autenticado al montar el componente
    useEffect(() => {
      const fetchUser = async () => {
        const userData = await obtenerUsuarioAutenticado();
        if (userData) {
          setUsuario(userData);
        }
      };
      fetchUser();
    }, [obtenerUsuarioAutenticado]);
  
    // 🔹 Obtener datos de Bonita una vez que se tenga el usuario
    useEffect(() => {
      if (!usuario) return;
      const fetchData = async () => {
        try {
          const data = await obtenerDatosBonita(usuario.user_id);
          if (data) {
            setBonitaData(data);
          }
        } catch (error) {
          console.error("❌ Error obteniendo datos de Bonita:", error);
        }
      };
      fetchData();
    }, [usuario, obtenerDatosBonita]);

    const handleSubmit = async () => {
  
      try {
        setError("");
        alert("Avanzando a la siguiente página...");
        bonita.changeTask();
  
        const response = await fetch(`${SERVER_BACK_URL}/api/save-memorando?key=${memoCode}&id_tipo_documento=${id_tipo_documento}&id_registro=${bonitaData?.processId}-${bonitaData?.caseId}`);
        
        if (!response.ok) {
          throw new Error('Error al guardar el memorando');
        }
        
        const data = await response.json();
        console.log("Memorando guardado:", data);
  
       
      } catch (err) {
        setError("Error al guardar el memorando. Verifica el código e intenta nuevamente.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

  return (
    <CardContainer title="Contrato Cesión de Derechos Patrimoniales">
      <Title
        text="Solicitud para firma de Rector"
        className="text-center text-gray-800 mb-3 text-lg"
      />
      <div  className="flex flex-col space-y-4">
        <div>
          <label htmlFor="memoCode" className="block font-semibold">
            Ingrese el código del memorando generado para solicitud
          </label>
          <input
            id="memoCode"
            type="text"
            className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-[#931D21]"
            value={memoCode}
            onChange={(e) => setMemoCode(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <button
          type="submit"
          className="w-full bg-[#931D21] hover:bg-[#7A171A] text-white py-2 rounded-lg font-semibold hover:scale-105 transition-transform duration-300 disabled:opacity-50"
          onClick={handleSubmit}
        >
          {loading ? "Enviando..." : "Siguiente"}
        </button>
      </div>
    </CardContainer>
  );
}