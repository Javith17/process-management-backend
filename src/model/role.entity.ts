import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('roles')
export abstract class RoleEntity extends BaseEntity{
    @Column({ unique: true })
    roleName:string;

    @Column({ nullable:true })
    roleCode:string;

    @Column('text',{ nullable: true, array: true })
    screens: string[];
}