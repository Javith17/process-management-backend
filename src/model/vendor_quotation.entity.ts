import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CustomerEntity } from "./customer.entity";
import { MachineEntity } from "./machine.entity";
import { PartEntity } from "./part.entity";
import { UserEntity } from "./user.entity";
import { VendorEntity } from "./vendor.entity";

@Entity('vendor_quotation')
export abstract class VendorQuotationEntity extends BaseEntity {
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

    @Column({ type: 'jsonb', nullable: true })
    data: Array<any>;

    @ManyToOne(() => VendorEntity, (vendor) => vendor.id)
    @JoinColumn({name: 'vendor_id'})
    vendor: VendorEntity;

    @ManyToOne(() => PartEntity, (part) => part.id)
    @JoinColumn({name: 'part_id'})
    part: PartEntity

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'created_by'})
    created_by: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'approved_by'})
    approved_by: UserEntity;

    @Column({ nullable: true })
    approval_remarks: string;
}