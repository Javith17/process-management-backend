import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderConfirmationEntity } from "./order_confirmation.entity";

@Entity('purchase_order')
export abstract class PurchaseOrderEntity extends BaseEntity{
    @Column({ unique: true })
    po_no:string;

    @Column({ nullable: true })
    order_id:string;

    @ManyToOne(() => OrderConfirmationEntity, (order) => order.id)
    @JoinColumn({name: 'order_id'})
    order: OrderConfirmationEntity;

    @Column({ nullable: true })
    supplier_id:string;

    @Column({ nullable: true })
    supplier_name:string;

    @Column({ nullable: true })
    supplier_address:string;

    @Column({ nullable: true })
    supplier_gst:string;

    @Column({ nullable: true })
    po_date:string;

    @Column({ nullable: true })
    reference_doc_no:string;

    @Column({ nullable: true })
    payment_terms:string;

    @Column({ nullable: true })
    delivery_schedule:string;

    @Column({ type: 'json', nullable: true })
    line_items:any;

    @Column({ nullable: true })
    subtotal:string;

    @Column({ nullable: true })
    gst_percent:string;

    @Column({ nullable: true })
    gst_amount:string;

    @Column({ nullable: true })
    net_total:string;

    @Column({ nullable: true })
    amount_in_words:string;

    @Column({ type: 'json', nullable: true })
    terms:any;

    @Column({ nullable: true })
    created_by:string;
}
