import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderConfirmationEntity } from "./order_confirmation.entity";
import { PartProcessEntity } from "./part_process.entity";
import { PartProcessVendorEntity } from "./part_process_vendor.entity";

@Entity('production_machine_history')
export abstract class ProductionMachineHistoryEntity extends BaseEntity{
    @Column({ nullable: true })
    parent_id:string; // production_part_id/production_bought_out_id

    @Column({ nullable: true })
    type:string; // part/bought_out

    @Column({ nullable: true })
    type_id:string; // part_id/bought_out_id

    @Column({ nullable: true })
    type_name:string; // part_name/ bought_out_name

    @Column({ type:'json', nullable: true })
    data:any;
    
    @Column({ nullable: true })
    from_status:string;

    @Column({ nullable: true })
    to_status:string;

    @Column({ nullable: true })
    changed_by:string;

    @Column({ nullable: true })
    remarks:string;

    @ManyToOne(() => OrderConfirmationEntity, (order) => order.id)
    @JoinColumn({name: 'order_id'})
    order: OrderConfirmationEntity;
}