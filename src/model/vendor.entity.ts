import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('vendors')
export abstract class VendorEntity extends BaseEntity{
    @Column({ unique: true })
    vendorName:string;

    @Column({ nullable:true })
    vendorCode:string;

    @Column({ nullable:true })
    vendorAddress:string;

    @Column({ nullable:true })
    vendorGST:string;

    @Column({ nullable:true })
    vendorMobileNo1:string;

    @Column({ nullable:true })
    vendorMobileNo2:string;

    @Column({ nullable:true })
    vendorAccountNo:string;

    @Column({ nullable:true })
    vendorLocation:string;
}