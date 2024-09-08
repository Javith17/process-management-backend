import { UUID } from "crypto";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { VendorEntity } from "./vendor.entity";

@Entity('vendorprocess')
export abstract class VendorProcessEntity extends BaseEntity{

    @Column({ nullable:true })
    vendor_id:UUID;

    @Column({ nullable:true })
    process_id:string;

    @Column({ nullable:true })
    process_name:string;

    @ManyToOne(()=> VendorEntity, (vendor)=> vendor.process_list)
    @JoinColumn({name:'vendor_id'})
    process: VendorEntity;
}