// obtener la fecha de hoy en formato YYYY-MM-DD
export function getFechaHoy(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');
  const day = String(ahora.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// sacar solo la fecha de un string que viene del backend
// convierte a hora de Chile (UTC-3) para evitar problemas de zona horaria
export function extraerFecha(fechaString: string): string {
  if (!fechaString) return '';
  
  // convertir a Date y usar la zona horaria de Chile
  const fecha = new Date(fechaString);
  
  // obtener la fecha en hora local del navegador
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// verificar si una fecha es de hoy
export function esHoy(fechaISO: string): boolean {
  if (!fechaISO) return false;
  return extraerFecha(fechaISO) === getFechaHoy();
}
