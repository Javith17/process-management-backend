import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('customers')
export abstract class CustomerEntity extends BaseEntity{
    @Column({ unique: true })
    customer_name:string;

    @Column({ nullable:true })
    customer_address:string;

    @Column({ nullable:true })
    customer_account_detail:string;

    @Column({ nullable:true })
    customer_mobile_no1:string;

    @Column({ nullable:true })
    customer_mobile_no2:string;

    @Column({ type:'boolean', default:false })
    is_machine: boolean;

    @Column({ type:'boolean', default:false })
    is_spares: boolean;

    @Column({ type:'boolean', default:false })
    is_spm: boolean;
}