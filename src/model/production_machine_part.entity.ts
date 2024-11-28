import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderConfirmationEntity } from "./order_confirmation.entity";
import { PartProcessEntity } from "./part_process.entity";
import { PartProcessVendorEntity } from "./part_process_vendor.entity";

@Entity('production_machine_part')
export abstract class ProductionMachinePartEntity extends BaseEntity{
    @Column({ nullable: true })
    serial_no:string;

    @Column({ nullable: true })
    part_id:string;

    @Column({ nullable: true })
    part_name:string;

    @Column({ nullable: true })
    vendor_id:string;
    
    @Column({ nullable: true })
    vendor_name:string;

    @Column({ nullable: true })
    process_id:string;

    @Column({ nullable: true })
    process_name:string;

    @Column({ nullable: true })
    required_qty:string;
    
    @Column({ nullable: true })
    available_qty:string;

    @Column({ nullable: true })
    order_qty:string;

    @Column({ nullable: true })
    cost:string;
    
    @Column({ nullable: true })
    delivery_date:string;

    @Column({ nullable: true })
    reminder_date:string;

    @Column({ nullable: true })
    status:string;

    @Column({ nullable: true })
    order_id:string;

    @Column({ nullable: true })
    machine_id:string;

    @Column({ nullable: true })
    remarks:string;

    @Column({ nullable: true })
    delivery_remarks:string;

    @Column({ nullable: true })
    vendor_accept_status: string;

    @Column({ nullable: true })
    vendor_accept_remarks: string;

    @Column({ nullable: true })
    vendor_accept_at: Date;

    @ManyToOne(() => OrderConfirmationEntity, (order) => order.id)
    @JoinColumn({name: 'order_id'})
    order: OrderConfirmationEntity;
}