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
  calificacion: number;

  @OneToMany(() => TransactionDetail, (detail) => detail.transaccion, {
    cascade: true,
  })
  detalles: TransactionDetail[];

  constructor(
    id?: number,
    estado?: TransactionState,
    calificacion?: number,
    detalles?: TransactionDetail[],
  ) {
    if (id) this.id = id;
    if (estado) this.estado = estado;
    if (calificacion) this.calificacion = calificacion;
    if (detalles) this.detalles = detalles;
  }
}
