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
}