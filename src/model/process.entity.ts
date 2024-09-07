import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('process')
export abstract class ProcessEntity extends BaseEntity {
    @Column({ unique: true })
    processName:string;
}