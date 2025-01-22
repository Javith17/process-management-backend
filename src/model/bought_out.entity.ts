import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";

@Entity('bought_out')
export abstract class BoughtOutEntity extends BaseEntity{
    @Column({ unique: true })
    bought_out_name:string;

    @Column({nullable: true})
    bought_out_category: string;

    @OneToMany(()=> BoughtOutSuppliertEntity, (boughtOutSupplier)=>boughtOutSupplier.bought_out)
    bought_out_suppliers: BoughtOutSuppliertEntity[];

    @Column({nullable: true})
    days: number;

    @Column({nullable: true, default: false})
    is_machine: boolean;

    @Column({nullable: true, default: false})
    is_spm: boolean;

    @Column({nullable: true, default: false})
    is_spare: boolean;
}