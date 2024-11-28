import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { PartEntity } from "./part.entity";
import { PartProcessVendorEntity } from "./part_process_vendor.entity";
import { ProcessEntity } from "./process.entity";
import { VendorEntity } from "./vendor.entity";

@Entity('part_process')
export abstract class PartProcessEntity extends BaseEntity{
    
    @ManyToOne(()=> PartEntity, (part)=> part.part_process_list)
    @JoinColumn({name:'part_id'})
    part: PartEntity;

    @ManyToOne(() => ProcessEntity, (process) => process.id)
    @JoinColumn({name: 'process_id'})
    process: ProcessEntity;

    @OneToMany(()=> PartProcessVendorEntity, (partProcessVendor)=>partProcessVendor.part_process)
    part_process_vendor_list: PartProcessVendorEntity[];

    @Column({ nullable:true })
    process_cost:string;

    @Column({nullable: true})
    process_time: string
    
}