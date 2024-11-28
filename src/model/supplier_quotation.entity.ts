import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { SupplierEntity } from "./supplier.entity";
import { UserEntity } from "./user.entity";

@Entity('supplier_quotation')
export abstract class SupplierQuotationEntity extends BaseEntity {
    @Column({ unique: true })
    quotation_no:string;

    @Column({ nullable:true })
    quotation_date:Date;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    remarks: string;

    @Column({ nullable: true })
    reason: string;

    @Column({ nullable: true })
    cost: number;

    @Column({ nullable: true })
    delivery_time: number;

    @ManyToOne(() => SupplierEntity, (supplier) => supplier.id)
    @JoinColumn({name: 'supplier_id'})
    supplier: SupplierEntity;

    @ManyToOne(() => BoughtOutEntity, (bought_out) => bought_out.id)
    @JoinColumn({name: 'bought_out_id'})
    boughtout: BoughtOutEntity

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'created_by'})
    created_by: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'approved_by'})
    approved_by: UserEntity;

    @Column({ nullable: true })
    approval_remarks: string;
}