import { UUID } from "crypto";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: UUID;

    @Column({ type:'boolean', default:true })
    is_active: boolean;
    
    // @Column({nullable:true})
    // createdBy: string;

    @CreateDateColumn({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    updated_at: Date;
}