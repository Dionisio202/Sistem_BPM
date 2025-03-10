//Interfaz de Facultades
export interface Facultad {
    id_facultad: number;
    nombre_facultad: string;
    carreras: Carrera[];
}
//Interfaz de Carrera
export interface Carrera {
    id_carrera: number;
    nombre_carrera: string;
}