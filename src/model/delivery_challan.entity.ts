import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderConfirmationEntity } from "./order_confirmation.entity";

@Entity('delivery_challan')
export abstract class DeliveryChallanEntity extends BaseEntity{
    @Column({ unique: true })
    challan_no:string;

    @Column({ nullable: true })
    order_id:string;

    @ManyToOne(() => OrderConfirmationEntity, (order) => order.id)
    @JoinColumn({name: 'order_id'})
    order: OrderConfirmationEntity;

    @Column({ nullable: true })
    part_id:string;

    @Column({ nullable: true })
    part_name:string;

    @Column({ nullable: true })
    part_code:string;

    @Column({ nullable: true })
    vendor_id:string;

    @Column({ nullable: true })
    vendor_name:string;

    @Column({ nullable: true })
    vendor_address:string;

    @Column({ nullable: true })
    vendor_gst:string;

    @Column({ nullable: true })
    challan_date:string;

    @Column({ nullable: true })
    dispatch_mode:string;

    @Column({ nullable: true })
    vehicle_no:string;

    @Column({ nullable: true })
    total_value:string;

    @Column({ type: 'json', nullable: true })
    line_items:any;

    @Column({ nullable: true })
    created_by:string;
}
