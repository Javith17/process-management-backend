import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";
import { MachineEntity } from "./machine.entity";
import { PartEntity } from "./part.entity";
import { SubAssemblyDetailEntity } from "./sub_assembly_detail.entity";

@Entity('sub_assembly')
export abstract class SubAssemblyEntity extends BaseEntity{
    @Column({ nullable: false })
    serial_no:string;

    @Column({nullable: false})
    sub_assembly_name: string;

    @OneToMany(()=> SubAssemblyDetailEntity, (subAssemblyDetail)=>subAssemblyDetail.sub_assembly)
    sub_assembly_detail: SubAssemblyDetailEntity[];

    // @Column({nullable: true})
    // days: number;

    // @ManyToOne(()=> MachineEntity, (machine)=> machine.sub_assembly)
    // @JoinColumn({name:'machine_id'})
    // machine: MachineEntity;
}