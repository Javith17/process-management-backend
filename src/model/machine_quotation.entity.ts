import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CustomerEntity } from "./customer.entity";
import { MachineEntity } from "./machine.entity";
import { UserEntity } from "./user.entity";

@Entity('machine_quotation')
export abstract class MachineQuotationEntity extends BaseEntity {
    @Column({ unique: true })
    quotation_no:string;

    @Column({ nullable:true })
    quotation_date:Date;

    @Column({ nullable:true })
    reminder_date:Date;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    remarks: string;

    @Column({ nullable: true })
    reason: string;

    @Column({ nullable: true })
    initial_cost: string;

    @Column({ nullable: true })
    approved_cost: string;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'follow_up_user_id'})
    user: UserEntity;

    @ManyToOne(() => MachineEntity, (machine) => machine.id)
    @JoinColumn({name: 'machine_id'})
    machine: MachineEntity;

    @ManyToOne(() => CustomerEntity, (customer) => customer.id)
    @JoinColumn({name: 'customer_id'})
    customer: CustomerEntity;

    @Column({ nullable:true })
    qty: number;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'created_by'})
    created_by: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'approved_by'})
    approved_by: UserEntity;

    @Column({ nullable: true })
    approval_remarks: string;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'verified_by'})
    verified_by: UserEntity;

    @Column({ nullable: true })
    verification_remarks: string;
}