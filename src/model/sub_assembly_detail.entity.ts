import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { PartEntity } from "./part.entity";
import { SubAssemblyEntity } from "./sub_assembly.entity";
import { SupplierEntity } from "./supplier.entity";

@Entity('sub_assembly_detail')
export abstract class SubAssemblyDetailEntity extends BaseEntity{

    @ManyToOne(()=> SubAssemblyEntity, (subAssembly)=> subAssembly.sub_assembly_detail)
    @JoinColumn({name:'sub_assembly_id'})
    sub_assembly: SubAssemblyEntity;

    @ManyToOne(() => PartEntity, (part) => part.id)
    @JoinColumn({name: 'part_id'})
    part: PartEntity;

    @ManyToOne(() => BoughtOutEntity, (bought_out) => bought_out.id)
    @JoinColumn({name: 'bought_out_id'})
    bought_out: BoughtOutEntity;

    @Column({nullable: true})
    qty: number;
}