import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { SupplierEntity } from "./supplier.entity";

@Entity('bought_out_supplier')
export abstract class BoughtOutSuppliertEntity extends BaseEntity{

    @ManyToOne(()=> BoughtOutEntity, (boughtOut)=> boughtOut.bought_out_suppliers)
    @JoinColumn({name:'bought_out_id'})
    bought_out: BoughtOutEntity;

    @ManyToOne(() => SupplierEntity, (supplier) => supplier.id)
    @JoinColumn({name: 'supplier_id'})
    supplier: SupplierEntity;

    @Column({nullable: true})
    cost: string;

    @Column({nullable: true})
    delivery_time: string;
}