import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('vendorprocess')
export abstract class VendorProcessEntity extends BaseEntity{
    @Column({ nullable:true })
    vendorId:string;

    @Column({ nullable:true })
    processId:string;

    @Column({ nullable:true })
    processName:string;
}