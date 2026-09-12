import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('supplier_payments')
export abstract class SupplierPaymentEntity extends BaseEntity{
    @Column({ nullable: true })
    supplier_id:string;

    @Column({ nullable: true })
    order_id:string;

    @Column({ nullable: true })
    machine_id:string;

    @Column({ nullable: true })
    production_boughtout_id:string;

    @Column({ nullable: true })
    bought_out_id:string;

    @Column({ nullable: true })
    paid_amount:string;

    @Column({ nullable: true })
    mode:string;

    @Column({ nullable: true })
    remarks:string;

    @Column({ nullable: true })
    paid_by:string;
}
