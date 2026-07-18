import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TransactionDetail } from './transaction-details.entity';

export enum TransactionState {
  PENDING = 'pendiente',
  COMPLETED = 'completada',
  CANCELLED = 'cancelada',
  REJECTED = 'rechazada',
}

@Entity('transacciones')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_transaccion: Date;

  @Column({
    type: 'enum',
    enum: TransactionState,
    default: TransactionState.PENDING,
  })
  estado: TransactionState;

  @Column({ type: 'int', nullable: true })
  calificacionAlIniciador: number;

  @Column({ type: 'int', nullable: true })
  calificacionAlReceptor: number;

  @Column({ type: 'boolean', default: false })
  iniciadorConfirmo: boolean;

  @Column({ type: 'boolean', default: false })
  receptorConfirmo: boolean;

  @OneToMany(() => TransactionDetail, (detail) => detail.transaccion, {
    cascade: true,
  })
  detalles: TransactionDetail[];

  constructor(
    id?: number,
    estado?: TransactionState,
    calificacionAlIniciador?: number,
    calificacionAlReceptor?: number,
    iniciadorConfirmo?: boolean,
    receptorConfirmo?: boolean,
    detalles?: TransactionDetail[],
  ) {
    if (id) this.id = id;
    if (estado) this.estado = estado;
    if (calificacionAlIniciador !== undefined) this.calificacionAlIniciador = calificacionAlIniciador;
    if (calificacionAlReceptor !== undefined) this.calificacionAlReceptor = calificacionAlReceptor;
    if (iniciadorConfirmo !== undefined) this.iniciadorConfirmo = iniciadorConfirmo;
    if (receptorConfirmo !== undefined) this.receptorConfirmo = receptorConfirmo;
    if (detalles) this.detalles = detalles;
  }
}
