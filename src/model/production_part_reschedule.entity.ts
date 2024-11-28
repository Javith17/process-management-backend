import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";

@Entity('production_part_reschedule')
export abstract class ProductionPartRescheduleEntity extends BaseEntity{
    @Column({ nullable: true })
    production_part_id:string;

    @Column({nullable: true})
    remarks: string;

    @Column({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    previous_reminder_date: Date;

    @Column({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    previous_delivery_date: Date;

    @Column({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    rescheduled_reminder_date: Date;

    @Column({ type: "timestamptz", default: () => 'CURRENT_TIMESTAMP'   })
    rescheduled_delivery_date: Date;

    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'rescheduled_by'})
    rescheduled_by: UserEntity;
}