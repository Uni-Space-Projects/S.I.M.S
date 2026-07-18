export type EstadoInsumo = 'ABIERTO' | 'CERRADO';

export interface UserBasic {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
}

export interface PublicacionInsumo {
  id: number;
  name: string;
  lote: string; 
  expirationDate: string;
  description: string;
  additionalInfo?: string;
  type: string;
  isActive: boolean;
  cantidad: number;
  user?: UserBasic;
}
