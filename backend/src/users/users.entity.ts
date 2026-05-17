import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from './roles.enum';

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
}