export interface Autor {
  id_persona: number | null;
  id_rol: number;
  id_facultad_carrera: number;
  ciudad: string | null;
  identificacion: string;
  nombre: string;
  telefono: string;
  fecha_nacimiento: Date | null;
  direccion: string;
  correo: string;
  id_autor_producto?: number;
  id_producto?: number;
  id_autor?: number;
  porcentaje_participacion: number | string;
  facultad_seleccionada?: number | null;
  carrera_seleccionada?: number | null;
}
