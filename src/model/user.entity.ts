import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { RoleEntity } from "./role.entity";

@Entity('users')
export abstract class UserEntity extends BaseEntity{

    @Column()
    empName: string;

    @Column({ unique:true })
    empCode: string;

    @Column()
    password: string;

    @Column()
    roleId: UUID;
}