// obtener la fecha de hoy en formato YYYY-MM-DD
export function getFechaHoy(): string {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');
  const day = String(ahora.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// sacar solo la fecha de un string que viene del backend
// funciona con formato ISO (2025-11-30T14:30:00Z) o formato de base de datos (2025-11-29 23:52:06)
export function extraerFecha(fechaString: string): string {
  if (!fechaString) return '';
  if (fechaString.includes('T')) {
    return fechaString.split('T')[0];
  }
  if (fechaString.includes(' ')) {
    return fechaString.split(' ')[0];
  }
  return fechaString;
}

// verificar si una fecha es de hoy
export function esHoy(fechaISO: string): boolean {
  if (!fechaISO) return false;
  return extraerFecha(fechaISO) === getFechaHoy();
}
