import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transactions.entity';
import { UserEntity } from '../../users/users.entity';
import { Publication } from '../../publications/publications.entity';

@Entity('detalle_transaccion')
export class TransactionDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction, (transaccion) => transaccion.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaccion_id' })
  transaccion: Transaction;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'usuario_emisor_id' })
  usuarioEmisor: UserEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'usuario_receptor_id' })
  usuarioReceptor: UserEntity;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publicacion_id' })
  publicacion: Publication;

  @Column({ type: 'int' })
  cantidad: number;

  constructor(
    id?: number,
    transaccion?: Transaction,
    usuarioEmisor?: UserEntity,
    usuarioReceptor?: UserEntity,
    publicacion?: Publication,
    cantidad?: number,
  ) {
    if (id) this.id = id;
    if (transaccion) this.transaccion = transaccion;
    if (usuarioEmisor) this.usuarioEmisor = usuarioEmisor;
    if (usuarioReceptor) this.usuarioReceptor = usuarioReceptor;
    if (publicacion) this.publicacion = publicacion;
    if (cantidad) this.cantidad = cantidad;
  }
}
