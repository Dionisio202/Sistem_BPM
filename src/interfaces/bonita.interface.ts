export interface TaskDetails {
  caseId: string;
  [key: string]: any;
}

export interface BonitaContext {
  [key: string]: {
    link?: string;
    [key: string]: any;
  };
}

export interface FormDataContract {
  [key: string]: {
    [key: string]: string;
  };
}

export interface VariableValue {
  value: any;
  type: string;
}

export interface Proceso {
  id: string;
  name: string;
  displayName: string;
}

export interface Tarea {
  id: string;
  name: string;
  processId: string;
  caseId: string;
  displayName: string;
  assigned_id: string;
  last_update_date : string;
}
