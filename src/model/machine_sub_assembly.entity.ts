import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { MachineEntity } from "./machine.entity";
import { PartEntity } from "./part.entity";
import { SubAssemblyEntity } from "./sub_assembly.entity";
import { SupplierEntity } from "./supplier.entity";

@Entity('machine_sub_assembly')
export abstract class MachineSubAssemblyEntity extends BaseEntity{

    @ManyToOne(()=> MachineEntity, (machine)=> machine.machine_sub_assembly)
    @JoinColumn({name:'machine_id'})
    machine: MachineEntity;

    @ManyToOne(()=> SubAssemblyEntity, (subAssembly)=> subAssembly.id)
    @JoinColumn({name:'sub_assembly_id'})
    sub_assembly: SubAssemblyEntity;

    @Column({nullable: true})
    qty: number;
}