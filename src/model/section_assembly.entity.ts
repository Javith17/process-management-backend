import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";
import { MachineEntity } from "./machine.entity";
import { MainAssemblyDetailEntity } from "./main_assembly_detail.entity";
import { PartEntity } from "./part.entity";
import { SectionAssemblyDetailEntity } from "./section_assembly_detail.entity";
import { SubAssemblyDetailEntity } from "./sub_assembly_detail.entity";

@Entity('section_assembly')
export abstract class SectionAssemblyEntity extends BaseEntity{
    @Column({ nullable: false })
    serial_no:string;

    @Column({nullable: false})
    section_assembly_name: string;

    @OneToMany(()=> SectionAssemblyDetailEntity, (sectionAssemblyDetail)=>sectionAssemblyDetail.section_assembly)
    section_assembly_detail: SectionAssemblyDetailEntity[];

    @ManyToOne(()=> MachineEntity, (machine)=> machine.section_assembly)
    @JoinColumn({name:'machine_id'})
    machine: MachineEntity;

    // @Column({nullable: true})
    // days: number;
}