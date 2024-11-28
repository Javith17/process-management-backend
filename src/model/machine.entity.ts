import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { MachineSubAssemblyEntity } from "./machine_sub_assembly.entity";
import { MainAssemblyEntity } from "./main_assembly.entity";
import { SectionAssemblyEntity } from "./section_assembly.entity";
import { SubAssemblyEntity } from "./sub_assembly.entity";

@Entity('machines')
export abstract class MachineEntity extends BaseEntity {
    @Column({ nullable: false })
    model_no:string;

    @Column({ nullable: false })
    machine_name:string;

    @Column({ nullable: false })
    side_type:string;

    @Column({ nullable: false })
    spindles:number;
    
    @Column({ nullable: false })
    max_spindles:number;

    @Column({ nullable: false })
    min_spindles:number;

    @OneToMany(()=> MachineSubAssemblyEntity, (subAssembly)=>subAssembly.machine)
    machine_sub_assembly: MachineSubAssemblyEntity[];

    @OneToMany(()=> MainAssemblyEntity, (mainAssembly)=>mainAssembly.machine)
    main_assembly: MainAssemblyEntity[];

    @OneToMany(()=> SectionAssemblyEntity, (sectionAssembly)=>sectionAssembly.machine)
    section_assembly: SectionAssemblyEntity[];
}