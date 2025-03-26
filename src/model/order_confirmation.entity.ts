import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";
import { CustomerEntity } from "./customer.entity";
import { MachineEntity } from "./machine.entity";
import { MachineQuotationEntity } from "./machine_quotation.entity";
import { SparesQuotationEntity } from "./spares_quotation.entity";

@Entity('order_confirmation')
export abstract class OrderConfirmationEntity extends BaseEntity{
    @Column({ nullable: true })
    machine_name:string;

    @ManyToOne(() => MachineEntity, (machine) => machine.id)
    @JoinColumn({name: 'machine_id'})
    machine: MachineEntity;

    @ManyToOne(() => CustomerEntity, (customer) => customer.id)
    @JoinColumn({name: 'customer_id'})
    customer: CustomerEntity;

    @ManyToOne(() => MachineQuotationEntity, (quotation) => quotation.id, { nullable: true })
    @JoinColumn({name: 'quotation_id'})
    quotation: MachineQuotationEntity;

    @ManyToOne(() => SparesQuotationEntity, (quotation) => quotation.id, { nullable: true })
    @JoinColumn({name: 'spares_quotation_id'})
    spares_quotation: SparesQuotationEntity;

    @Column({nullable: true})
    specification: string;

    @Column({nullable: true})
    remarks: string;

    @Column({ nullable: true })
    status:string;

    @Column({ nullable: true })
    order_type:string; //machine, spare, spm
}