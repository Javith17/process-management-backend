import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('users')
export abstract class UserEntity extends BaseEntity{

    @Column()
    emp_name: string;

    @Column({ unique:true })
    emp_code: string;

    @Column()
    password: string;

    @Column()
    role_id: UUID;
}