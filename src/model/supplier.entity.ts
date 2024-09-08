import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('suppliers')
export abstract class SupplierEntity extends BaseEntity{
    @Column({ unique: true })
    supplier_name:string;

    @Column({ nullable:true })
    supplier_code:string;

    @Column({ nullable:true })
    supplier_address:string;

    @Column({ nullable:true })
    supplier_mobile_no1:string;

    @Column({ nullable:true })
    supplier_mobile_no2:string;

    @Column({ nullable:true })
    supplier_account_no:string;

    @Column({ nullable:true })
    supplier_location:string;
}