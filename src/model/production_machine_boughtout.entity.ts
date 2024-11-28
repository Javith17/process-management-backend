import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";
import { CustomerEntity } from "./customer.entity";
import { MachineEntity } from "./machine.entity";
import { MachineQuotationEntity } from "./machine_quotation.entity";
import { OrderConfirmationEntity } from "./order_confirmation.entity";
import { PartEntity } from "./part.entity";

@Entity('production_machine_boughtout')
export abstract class ProductionMachineBoughtoutEntity extends BaseEntity{
    @Column({ nullable: true })
    serial_no:string;

    @Column({ nullable: true })
    bought_out_id:string;

    @Column({ nullable: true })
    bought_out_name:string;

    @Column({ nullable: true })
    supplier_id:string;
    
    @Column({ nullable: true })
    supplier_name:string;

    @Column({ nullable: true })
    required_qty:string;
    
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

    @ManyToOne(() => OrderConfirmationEntity, (order) => order.id)
    @JoinColumn({name: 'order_id'})
    order: OrderConfirmationEntity;
}