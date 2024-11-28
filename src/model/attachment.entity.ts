import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { BoughtOutSuppliertEntity } from "./bought_out_supplier.entity";

@Entity('attachment')
export abstract class AttachmentEntity extends BaseEntity{
    @Column({ nullable: true })
    parent_id:string;

    @Column({nullable: true})
    parent_type: string;

    @Column({nullable: true})
    file_name: string;

    @Column({nullable: true})
    file_type: string;

    @Column({nullable: true})
    file_size: string;

    @Column({nullable: true})
    generated_name: string;
}