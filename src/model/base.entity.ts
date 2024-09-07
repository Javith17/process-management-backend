import { UUID } from "crypto";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity{
    @PrimaryGeneratedColumn('increment')
    id: UUID;

    @Column({ type:'boolean', default:true })
    isActive: boolean;
    
    // @Column({nullable:true})
    // createdBy: string;

    @CreateDateColumn({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    updatedAt: Date;
}