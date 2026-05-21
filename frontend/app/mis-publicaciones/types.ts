export type EstadoInsumo = 'ABIERTO' | 'CERRADO';

export interface PublicacionInsumo {
  id: number;
  name: string;
  lote: string; 
  expirationDate: string;
  description: string;
  additionalInfo?: string;
  type: string;
  isActive: boolean;
  // TODO: we could include User entity relation here if needed later
}
