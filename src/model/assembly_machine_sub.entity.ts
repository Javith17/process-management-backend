import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderConfirmationEntity } from "./order_confirmation.entity";
import { UserEntity } from "./user.entity";

@Entity('assembly_machine_sub')
export abstract class AssemblyMachineSubEntity extends BaseEntity {

    @Column({ nullable: true })
    sub_assembly_id: string;

    @Column({ nullable: true })
    sub_assembly_name: string;

    @Column({ nullable: true })
    part_id: string;

    @Column({ nullable: true })
    part_name: string;

    @Column({ nullable: true })
    bought_out_id: string;

    @Column({ nullable: true })
    bought_out_name: string;

    @Column({ nullable: true })
    qty: number;

    @Column({ nullable: true })
    sub_assembly_qty: number;

    @Column({ nullable: true })
    status: string;

    @ManyToOne(() => OrderConfirmationEntity, (order) => order.id)
    @JoinColumn({ name: 'order_id' })
    order: OrderConfirmationEntity;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'approved_by' })
    assembled_by: UserEntity;
}