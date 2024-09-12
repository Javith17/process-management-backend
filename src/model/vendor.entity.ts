import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { PartProcessEntity } from "./part_process.entity";
import { VendorProcessEntity } from "./vendorProcess.entity";

@Entity('vendors')
export abstract class VendorEntity extends BaseEntity{
    @Column({ unique: true })
    vendor_name:string;

    @Column({ nullable:true })
    vendor_code:string;

    @Column({ nullable:true })
    vendor_address:string;

    @Column({ nullable:true })
    vendor_gst:string;

    @Column({ nullable:true })
    vendor_mobile_no1:string;

    @Column({ nullable:true })
    vendor_mobile_no2:string;

    @Column({ nullable:true })
    vendor_account_no:string;

    @Column({ nullable:true })
    vendor_location:string;

    @OneToMany(()=> VendorProcessEntity, (vendorProcess)=>vendorProcess.process)
    process_list: VendorProcessEntity[];

    // @ManyToOne(()=> PartProcessEntity, (partProcess)=> partProcess.part_process_vendor_list)
    // @JoinColumn({name:'part_process_id'})
    // part_process_vendor: PartProcessEntity;
}