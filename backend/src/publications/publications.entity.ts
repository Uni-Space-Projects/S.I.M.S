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

  @Column()
  description: string;

  @Column({ nullable: true })
  additionalInfo: string;

  @Column()
  type: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, (user) => user.publications)
  user: UserEntity;


  constructor(id: number, name: string, lote: string, expirationDate: Date, description: string, additionalInfo: string, type: string, isActive: boolean, user: UserEntity) {
    this.id = id;
    this.name = name;
    this.lote = lote;
    this.expirationDate = expirationDate;
    this.description = description;
    this.additionalInfo = additionalInfo;
    this.type = type;
    this.isActive = isActive;
    this.user = user;
  }
}
