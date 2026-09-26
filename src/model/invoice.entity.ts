import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderConfirmationEntity } from "./order_confirmation.entity";

@Entity('invoice')
export abstract class InvoiceEntity extends BaseEntity{
    @Column({ unique: true })
    invoice_no:string;

    @Column({ nullable: true })
    order_id:string;

    @ManyToOne(() => OrderConfirmationEntity, (order) => order.id)
    @JoinColumn({name: 'order_id'})
    order: OrderConfirmationEntity;

    @Column({ nullable: true })
    customer_name:string;

    @Column({ nullable: true })
    customer_address:string;

    @Column({ nullable: true })
    customer_gst:string;

    @Column({ nullable: true })
    customer_state:string;

    @Column({ nullable: true })
    invoice_date:string;

    @Column({ nullable: true })
    delivery_note:string;

    @Column({ nullable: true })
    delivery_note_date:string;

    @Column({ nullable: true })
    dispatch_doc_no:string;

    @Column({ nullable: true })
    dispatched_through:string;

    @Column({ nullable: true })
    bill_of_lading_no:string;

    @Column({ nullable: true })
    bill_of_lading_date:string;

    @Column({ nullable: true })
    destination:string;

    @Column({ nullable: true })
    vehicle_no:string;

    @Column({ nullable: true })
    terms_of_delivery:string;

    @Column({ nullable: true })
    mode_of_payment:string;

    @Column({ type: 'json', nullable: true })
    line_items:any;

    @Column({ nullable: true })
    insurance_charges:string;

    @Column({ nullable: true })
    igst_percent:string;

    @Column({ nullable: true })
    subtotal:string;

    @Column({ nullable: true })
    igst_amount:string;

    @Column({ nullable: true })
    total:string;

    @Column({ nullable: true })
    amount_in_words:string;

    @Column({ nullable: true })
    tax_amount_in_words:string;

    @Column({ nullable: true })
    created_by:string;
}
