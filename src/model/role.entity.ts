import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('roles')
export abstract class RoleEntity extends BaseEntity{
    @Column({ unique: true })
    role_name:string;

    @Column({ nullable:true })
    role_code:string;

    @Column({
        name: 'screens',
        type: 'jsonb',
        default: () => "'[]'",
        nullable: true,
      })
    screens: [];
}