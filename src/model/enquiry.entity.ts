import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { UserEntity } from "./user.entity";

@Entity("enquiries")
export class EnquiryEntity extends BaseEntity {

  @Column()
  customer_name: string;

  @Column()
  machine_name: string;

  @Column({ nullable: true })
  existing_machine_id: string;

  @Column({ nullable: true })
  existing_customer_id: string;

  @Column()
  contact_no: string;

  @Column({ type: "json", nullable: true })
  address: { 
    address_1:string; 
    city:string;
    state:string;
    postal_code:string
  };

  @Column({ nullable: true })
  gst_no: string;

  @Column({ nullable: true })
  enquiry_resource: string;

  @Column({ nullable: true })
  enquiry_status: string;

  @Column({ nullable: true, type: 'jsonb' })
  quotation_terms: string[];

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: "level1_user" })
  level1_user: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: "level2_user" })
  level2_user: UserEntity;

  @Column({ nullable: true })
  remarks: string;

  @Column({ type: "json", nullable: true })
  approval_detail: {
    quotation_date: Date;
    reminder_date: Date;
    remarks: string;
    cost: number;
    quantity: number;
    approved_by: string;
  };
}
