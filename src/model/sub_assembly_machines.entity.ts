import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";
import { MachineEntity } from "./machine.entity";
import { PartEntity } from "./part.entity";
import { SubAssemblyDetailEntity } from "./sub_assembly_detail.entity";

@Entity('sub_assembly_machines')
export abstract class SubAssemblyMachineEntity extends BaseEntity{
    @Column({ nullable: false })
    machine_id: UUID;

    @Column({nullable: false})
    sub_assembly_id: UUID;
}