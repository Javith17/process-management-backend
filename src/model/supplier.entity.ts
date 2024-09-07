import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('suppliers')
export abstract class SupplierEntity extends BaseEntity{
    @Column({ unique: true })
    supplierName:string;

    @Column({ nullable:true })
    supplierCode:string;

    @Column({ nullable:true })
    supplierAddress:string;

    @Column({ nullable:true })
    supplierMobileNo1:string;

    @Column({ nullable:true })
    supplierMobileNo2:string;

    @Column({ nullable:true })
    supplierAccountNo:string;

    @Column({ nullable:true })
    supplierLocation:string;
}