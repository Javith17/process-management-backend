import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { UUID } from "crypto";

export class CreateMachineQuotationDto {
    @IsDateString()
    @IsNotEmpty()
    quotation_date:Date;

    @IsString()
    @IsNotEmpty()
    machine_id: UUID;

    @IsString()
    @IsNotEmpty()
    customer_id: UUID;

    @IsDateString()
    @IsNotEmpty()
    reminder_date:Date;

    @IsNumber()
    @IsNotEmpty()
    qty: number;

    @IsNumber()
    @IsNotEmpty()
    cost: number;

    @IsString()
    user_id: UUID;

    @IsString()
    remarks: string;

    @IsString()
    created_by: UUID;

    @IsString()
    type: string;

    @IsString()
    quotation_id: UUID;
}

export class ApproveQuotationDto {
    @IsString()
    status: string; //Approved, Rejected

    @IsString()
    quotation_id: UUID;

    @IsString()
    approval_reject_remarks: UUID;

    @IsString()
    quotation_type: string; // machine, vendor, spares

    @IsString()
    approved_rejected_by: UUID;

    @IsNumber()
    approved_cost: number;
}

export class UpdateProductionMachinePartDto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    vendor_id: UUID;

    @IsString()
    vendor_name: string;

    // @IsString()
    // delivery_date: string;

    // @IsString()
    // reminder_date: string;

    @IsString()
    status: string;

    @IsString()
    cost: string;

    @IsString()
    created_by: UUID;
}

export class MoveProductionMachinePartToVendorDto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    delivery_date: string;

    @IsString()
    reminder_date: string;

    @IsString()
    status: string;

    @IsString()
    created_by: UUID;
}

export class DeliverProductionMachinePartDto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    remarks: string;

    @IsString()
    created_by: UUID;
}

export class RescheduleProductionMachinePartDto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    remarks: string;

    @IsString()
    @IsNotEmpty()
    reschedule_reminder_date:string;

    @IsString()
    @IsNotEmpty()
    reschedule_delivery_date:string;

    @IsString()
    created_by: UUID;
}

export class VendorQuotationDto {
    @IsDateString()
    @IsNotEmpty()
    quotation_date:Date;

    @IsString()
    @IsNotEmpty()
    vendor_id: UUID;

    @IsString()
    @IsNotEmpty()
    part_id: UUID;

    @IsString()
    remarks: string;

    @IsString()
    created_by: UUID;

    @IsString()
    quotation_id: UUID;

    @IsString()
    type: string;

    @IsArray()
    process_list: Array<VendorQuotationProcessDto>;
}

export class VendorQuotationProcessDto {
    @IsString()
    process_id: UUID;

    @IsNumber()
    cost: number;

    @IsNumber()
    delivery_time: number;
}

export class SupplierQuotationDto {
    @IsDateString()
    @IsNotEmpty()
    quotation_date:Date;

    @IsString()
    @IsNotEmpty()
    supplier_id: UUID;

    @IsString()
    @IsNotEmpty()
    boughtout_id: UUID;

    @IsString()
    remarks: string;

    @IsString()
    created_by: UUID;

    @IsString()
    quotation_id: UUID;

    @IsString()
    type: string;

    @IsNumber()
    cost: number;

    @IsNumber()
    delivery_time: number;
}

export class UpdateProductionMachineBODto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    supplier_id: UUID;

    @IsString()
    supplier_name: string;

    // @IsString()
    // delivery_date: string;

    // @IsString()
    // reminder_date: string;

    @IsString()
    status: string;

    @IsString()
    cost: string;

    @IsString()
    created_by: UUID;
}

export class UpdateBoughtoutPaymentDto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    status: string;

    @IsString()
    paid_amount: string;

    @IsString()
    remarks: string;

    @IsString()
    created_by: UUID;
}