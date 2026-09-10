import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('vendor_payments')
export abstract class VendorPaymentEntity extends BaseEntity{
    @Column({ nullable: true })
    vendor_id:string;

    @Column({ nullable: true })
    order_id:string;

    @Column({ nullable: true })
    machine_id:string;

    @Column({ nullable: true })
    part_id:string;

    @Column({ nullable: true })
    process:string;

    @Column({ nullable: true })
    paid_amount:string;

    @Column({ nullable: true })
    mode:string;

    @Column({ nullable: true })
    remarks:string;

    @Column({ nullable: true })
    paid_by:string;
}
