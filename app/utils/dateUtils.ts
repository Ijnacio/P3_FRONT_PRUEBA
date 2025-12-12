export function getFechaHoy(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');
  const day = String(ahora.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function extraerFecha(fechaString: string): string {
  if (!fechaString) return '';
  
  const fecha = new Date(fechaString);
  
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
