import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    apellido: string;

    @Column({ unique: true })
    correo: string;

    @Column()
    contrasena: string;

    @Column()
    telefono: string;

    @Column({ nullable: true })
    rol?: 'administrador' | 'usuario';
}