import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { PartEntity } from "./part.entity";
import { PartProcessVendorEntity } from "./part_process_vendor.entity";
import { ProcessEntity } from "./process.entity";
import { VendorEntity } from "./vendor.entity";
import { MachineEntity } from "./machine.entity";
import { BoughtOutEntity } from "./bought_out.entity";

@Entity('bought_out_machine')
export abstract class BoughtoutMachineEntity extends BaseEntity{
    
    @ManyToOne(()=> BoughtOutEntity, (bought_out)=> bought_out.id)
    @JoinColumn({name:'bought_out_id'})
    bought_out: BoughtOutEntity;

    @ManyToOne(() => MachineEntity, (machine) => machine.id)
    @JoinColumn({name: 'machine_id'})
    machine: MachineEntity;    
}