import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { PartEntity } from "./part.entity";
import { PartProcessVendorEntity } from "./part_process_vendor.entity";
import { ProcessEntity } from "./process.entity";
import { VendorEntity } from "./vendor.entity";
import { MachineEntity } from "./machine.entity";

@Entity('part_machine')
export abstract class PartMachineEntity extends BaseEntity{
    
    @ManyToOne(()=> PartEntity, (part)=> part.id)
    @JoinColumn({name:'part_id'})
    part: PartEntity;

    @ManyToOne(() => MachineEntity, (machine) => machine.id)
    @JoinColumn({name: 'machine_id'})
    machine: MachineEntity;    
}