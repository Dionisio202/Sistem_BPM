// src/interfaces/actividad.interface.ts
export interface Actividad {
    nombre_actividad: string;
    indicador_actividad: string;
    proyeccion_actividad: string;
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    gastos_t_humanos: number;
    gasto_b_capital: number;
    total_actividad: number;
    responsables: string[];
  }
  
  export interface DataFetcherProps {
    setActividad: React.Dispatch<React.SetStateAction<Actividad[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
  }
  
  export interface ServerResponse {
    success: boolean;
    data: RawActivityData[];
  }
  
  export interface RawActivityData {
    nombre_actividad: string;
    indicador_actividad: string;
    proyeccion_actividad: string;
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    gastos_t_humanos: number;
    gasto_b_capital: number;
    total_actividad: number;
    responsables: string;
  }

  export interface temporalData{
    id_registro: string;
    id_funcionario: number,
    jsonData: string,
    id_tarea: number,
  }