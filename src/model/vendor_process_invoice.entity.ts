import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('vendor_process_invoices')
export abstract class VendorProcessInvoiceEntity extends BaseEntity{
    @Column({ nullable: true })
    order_id:string;

    @Column({ nullable: true })
    vendor_id:string;

    @Column({ nullable: true })
    machine_id:string;

    @Column({ nullable: true })
    part_id:string;

    @Column({ nullable: true })
    process:string;

    @Column({ nullable: true })
    file_name:string;

    @Column({ nullable: true })
    file_type:string;

    @Column({ nullable: true })
    file_size:string;

    @Column({ nullable: true })
    uploaded_by:string;
}
