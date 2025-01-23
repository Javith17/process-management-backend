import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('suppliers')
export abstract class SupplierEntity extends BaseEntity{
    @Column({ unique: true })
    supplier_name:string;

    @Column({ nullable:true })
    supplier_code:string;

    @Column({ nullable:true })
    supplier_address1:string;

    @Column({ nullable:true })
    supplier_address2:string;

    @Column({ nullable:true })
    supplier_city:string;

    @Column({ nullable:true })
    supplier_state:string;

    @Column({ nullable:true })
    supplier_pincode:string;

    @Column({ nullable:true })
    supplier_gst:string;

    @Column({ nullable:true })
    supplier_mobile_no1:string;

    @Column({ nullable:true })
    supplier_mobile_no2:string;

    @Column({ nullable:true })
    supplier_account_no:string;

    @Column({ nullable:true })
    supplier_bank_name:string;

    @Column({ nullable:true })
    supplier_ifsc:string;

    @Column({ nullable:true })
    supplier_location:string;
}