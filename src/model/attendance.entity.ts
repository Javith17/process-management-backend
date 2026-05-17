import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";

@Entity('attendance')
export abstract class AttendanceEntity extends BaseEntity{
    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'user_id'})
    user: UserEntity;

    @Column({ nullable: false })
    emp_code:string;

    @Column({ nullable: false })
    attendance_date:Date;

    @Column({ nullable:true })
    check_in_time:string;

    @Column({ nullable:true })
    check_out_time:string;

    @Column({ nullable:true })
    total_working_hrs:string;

    @Column({ nullable:true, type: 'simple-json' })
    location_details: any;
    
    @Column({ default: false })
    is_break: boolean;
    
    @Column({ nullable:true, type: 'simple-json' })
    break_details: any;

    @Column({ nullable:true })
    total_break_hrs:string;

    @Column({ default: false })
    is_leave: boolean;

    @Column({ default: false })
    is_verified: boolean;

    @Column({ nullable:true })
    remarks: string;

    @Column({ nullable:true })
    status: string;

    @Column({ nullable:true, type: 'simple-json' })
    location_alerts: any[];

    @Column({ nullable:true, type: 'simple-json' })
    screen_time_alerts: any[];
}