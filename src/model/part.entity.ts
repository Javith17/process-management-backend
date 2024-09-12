import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { PartProcessEntity } from "./part_process.entity";

@Entity('parts')
export abstract class PartEntity extends BaseEntity{
    @Column({ unique: true })
    part_name:string;

    @Column({ nullable:true })
    minimum_stock_qty:number;

    @Column({nullable: true})
    available_aty: number;

    @OneToMany(()=> PartProcessEntity, (partProcess)=>partProcess.part)
    part_process_list: PartProcessEntity[];
}