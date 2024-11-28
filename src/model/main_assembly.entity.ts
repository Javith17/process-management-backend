import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";
import { MachineEntity } from "./machine.entity";
import { MainAssemblyDetailEntity } from "./main_assembly_detail.entity";
import { PartEntity } from "./part.entity";
import { SubAssemblyDetailEntity } from "./sub_assembly_detail.entity";

@Entity('main_assembly')
export abstract class MainAssemblyEntity extends BaseEntity{
    @Column({ nullable: false })
    serial_no:string;

    @Column({nullable: false})
    main_assembly_name: string;

    @OneToMany(()=> MainAssemblyDetailEntity, (mainAssemblyDetail)=>mainAssemblyDetail.main_assembly)
    main_assembly_detail: MainAssemblyDetailEntity[];

    @ManyToOne(()=> MachineEntity, (machine)=> machine.main_assembly)
    @JoinColumn({name:'machine_id'})
    machine: MachineEntity;

    // @Column({nullable: true})
    // days: number;
}