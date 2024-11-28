import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutEntity } from "./bought_out.entity";
import { MainAssemblyEntity } from "./main_assembly.entity";
import { PartEntity } from "./part.entity";
import { SectionAssemblyEntity } from "./section_assembly.entity";
import { SubAssemblyEntity } from "./sub_assembly.entity";
import { SupplierEntity } from "./supplier.entity";

@Entity('section_assembly_detail')
export abstract class SectionAssemblyDetailEntity extends BaseEntity{

    @ManyToOne(()=> SectionAssemblyEntity, (sectionAssembly)=> sectionAssembly.section_assembly_detail)
    @JoinColumn({name:'section_assembly_id'})
    section_assembly: SectionAssemblyEntity;

    @ManyToOne(() => PartEntity, (part) => part.id)
    @JoinColumn({name: 'part_id'})
    part: PartEntity;

    @ManyToOne(() => BoughtOutEntity, (bought_out) => bought_out.id)
    @JoinColumn({name: 'bought_out_id'})
    bought_out: BoughtOutEntity;

    @ManyToOne(() => SubAssemblyEntity, (sub_assembly) => sub_assembly.id)
    @JoinColumn({name: 'sub_assembly_id'})
    sub_assembly: SubAssemblyEntity;

    @ManyToOne(() => MainAssemblyEntity, (main_assembly) => main_assembly.id)
    @JoinColumn({name: 'main_assembly_id'})
    main_assembly: MainAssemblyEntity;

    @Column({nullable: true})
    qty: number;
}