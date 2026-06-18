import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Role } from './roles.enum';
import { Publication } from '../publications/publications.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true })
  email: string;

  @Column()
  contrasena: string;

  @Column()
  telefono: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  rol: Role;

  @OneToMany(() => Publication, (publication) => publication.user)
  publications: Publication[];


  constructor(id: number, nombre: string, apellido: string, email: string, contrasena: string, telefono: string, rol: Role, publications: Publication[]) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.contrasena = contrasena;
    this.telefono = telefono;
    this.rol = rol;
    this.publications = publications;
  }
}
