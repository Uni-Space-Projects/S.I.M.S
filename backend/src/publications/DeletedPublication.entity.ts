import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../users/users.entity';

@Entity()
export class DeletedPublication {
    @PrimaryColumn()
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

    @Column()
    expiresIn: Date;


    constructor(id: number, name: string, lote: string, expirationDate: Date, description: string, type: string, isActive: boolean, cantidad: number, user: UserEntity, expiresIn: Date) {
        this.id = id;
        this.name = name;
        this.lote = lote;
        this.expirationDate = expirationDate;
        this.description = description;
        this.type = type;
        this.isActive = isActive;
        this.cantidad = cantidad;
        this.user = user;
        this.expiresIn = expiresIn;
    }
}
