import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../users/users.entity';
import { Publication } from '../publications/publications.entity';

@Entity()
export class ReportesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'usuario_reporta_id' })
  usuarioReporta: UserEntity;

  @ManyToOne(() => Publication)
  @JoinColumn({ name: 'publicacion_id' })
  publicacion: Publication;

  @Column()
  motivo: string;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'aceptado', 'rechazado'],
    default: 'pendiente',
  })
  estado: 'pendiente' | 'aceptado' | 'rechazado';

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  fechaReporte: Date;

  constructor(
    id?: number,
    usuarioReporta?: UserEntity,
    publicacion?: Publication,
    motivo?: string,
    estado?: 'pendiente' | 'aceptado' | 'rechazado',
    fechaReporte?: Date,
  ) {
    if (id !== undefined) this.id = id;
    if (usuarioReporta) this.usuarioReporta = usuarioReporta;
    if (publicacion) this.publicacion = publicacion;
    if (motivo) this.motivo = motivo;
    if (estado) this.estado = estado;
    if (fechaReporte) this.fechaReporte = fechaReporte;
  }
}
