import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';
import { Role } from './roles.enum';
import {Publication} from "../publications/publications.entity";

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
}