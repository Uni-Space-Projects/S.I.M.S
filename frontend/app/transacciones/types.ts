export type TransactionState = 'pendiente' | 'completada' | 'cancelada' | 'rechazada';

export interface UserBasicInfo {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface PublicationBasicInfo {
  id: number;
  name: string;
  category: string;
  image: string;
  cantidad: number;
  isActive: boolean;
  dueDate: string;
}

export interface TransactionDetail {
  id: number;
  usuarioEmisor: UserBasicInfo;
  usuarioReceptor: UserBasicInfo;
  publicacion: PublicationBasicInfo;
  cantidad: number;
}

export interface Transaction {
  id: number;
  fecha_transaccion: string;
  estado: TransactionState;
  calificacionAlIniciador: number | null;
  calificacionAlReceptor: number | null;
  iniciadorConfirmo: boolean;
  receptorConfirmo: boolean;
  detalles: TransactionDetail[];
}
