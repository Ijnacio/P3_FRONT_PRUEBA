/**
 * Obtiene la fecha actual en formato YYYY-MM-DD usando la zona horaria local
 * Esto asegura que el día se maneje correctamente de medianoche a medianoche
 */
export function getFechaHoy(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');
  const day = String(ahora.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extrae solo la fecha (YYYY-MM-DD) de un string de fecha
 * Soporta ambos formatos:
 * - ISO: "2025-11-30T14:30:00Z"
 * - Database: "2025-11-29 23:52:06.524083"
 * @param fechaString - String de fecha
 * @returns String en formato YYYY-MM-DD
 */
export function extraerFecha(fechaString: string): string {
  if (!fechaString) return '';
  // Si tiene T, es ISO format
  if (fechaString.includes('T')) {
    return fechaString.split('T')[0];
  }
  // Si tiene espacio, es formato de DB (YYYY-MM-DD HH:MM:SS)
  if (fechaString.includes(' ')) {
    return fechaString.split(' ')[0];
  }
  // Si ya es YYYY-MM-DD, retornarlo tal cual
  return fechaString;
}

/**
 * Verifica si una fecha ISO es del día actual
 * @param fechaISO - String de fecha en formato ISO
 * @returns true si es del día actual, false en caso contrario
 */
export function esHoy(fechaISO: string): boolean {
  if (!fechaISO) return false;
  return extraerFecha(fechaISO) === getFechaHoy();
}
