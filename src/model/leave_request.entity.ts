import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";

@Entity('leave_request')
export abstract class LeaveRequestEntity extends BaseEntity{
    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({name: 'user_id'})
    user: UserEntity;

    @ManyToOne(() => UserEntity, (user) => user.id, { nullable: true })
    @JoinColumn({name: 'approved_user_id'})
    approved_user: UserEntity;

    @Column({ nullable: false })
    emp_code:string;

    @Column({ nullable: false })
    leave_date:Date;

    @Column({ nullable:false })
    description:string;

    @Column({ nullable:true })
    status:string;

    @Column({ nullable:true })
    remarks:string;
}