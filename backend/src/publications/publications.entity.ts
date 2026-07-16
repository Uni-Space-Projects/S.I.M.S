import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../users/users.entity';

@Entity()
export class Publication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lote: string;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ nullable: true })
  description?: string;

  @Column()
  type: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @ManyToOne(() => UserEntity, (user) => user.publications)
  user: UserEntity;


  constructor(id: number, name: string, lote: string, expirationDate: Date, description: string, type: string, isActive: boolean, cantidad: number, user: UserEntity) {
    this.id = id;
    this.name = name;
    this.lote = lote;
    this.expirationDate = expirationDate;
    this.description = description;
    this.type = type;
    this.isActive = isActive;
    this.cantidad = cantidad;
    this.user = user;
  }
}
