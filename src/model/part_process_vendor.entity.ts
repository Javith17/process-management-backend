import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { PartEntity } from "./part.entity";
import { PartProcessEntity } from "./part_process.entity";
import { ProcessEntity } from "./process.entity";
import { VendorEntity } from "./vendor.entity";

@Entity('part_process_vendor')
export abstract class PartProcessVendorEntity extends BaseEntity{
    
    @ManyToOne(()=> PartProcessEntity, (partProcess)=> partProcess.part_process_vendor_list)
    @JoinColumn({name:'part_process_id'})
    part_process: PartProcessEntity;

    @ManyToOne(() => VendorEntity, (vendor) => vendor.id)
    @JoinColumn({name: 'vendor_id'})
    vendor: VendorEntity;

    @Column({ nullable:true })
    part_process_vendor_price:string;

    @Column({ nullable:true })
    part_process_vendor_delivery_time:string;
}