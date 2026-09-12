import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { UUID } from "crypto";

export class CreateMachineQuotationDto {
    @IsDateString()
    @IsNotEmpty()
    quotation_date:Date;

    @IsString()
    machine_id?: UUID;

    @IsString()
    @IsNotEmpty()
    customer_id: UUID;

    @IsDateString()
    @IsNotEmpty()
    reminder_date:Date;

    @IsNumber()
    qty: number;

    @IsNumber()
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
    quotation_id?: UUID;

    @IsArray()
    quotation_terms: Array<string>;

    @IsArray()
    spares?: Array<any>;

    @IsOptional()
    @IsString()
    status?: string;
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

    @IsArray()
    spares: Array<any>;

    @IsNumber()
    @IsOptional()
    qty: number;
}

export class UpdateProductionMachinePartDto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    vendor_id: UUID;

    @IsString()
    vendor_name: string;

    @IsOptional()
    @IsString()
    delivery_date: string;

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

export class CloseOrderDto {
    @IsString()
    order_id: UUID;

    @IsString()
    remarks: string;

    @IsString()
    created_by: UUID;
}

export class DeliverProductionMachinePartDto {
    @IsString()
    production_part_id: UUID;

    @IsString()
    production_boughtout_id: UUID;

    @IsString()
    order_id: UUID;

    @IsString()
    part_name: string;

    @IsString()
    bought_out_name: string;

    @IsNumber()
    delivered_qty: number;

    @IsNumber()
    assembly_qty: number;

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
    bought_out_id: UUID;

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

    @IsString()
    @IsOptional()
    delivery_date: string;

    @IsString()
    @IsOptional()
    reminder_date: string;

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

export class RecordSupplierPaymentDto {
    @IsString()
    @IsNotEmpty()
    production_boughtout_id: UUID;

    @IsNumber()
    @IsNotEmpty()
    paid_amount: number;

    @IsString()
    @IsOptional()
    mode: string;

    @IsString()
    @IsOptional()
    remarks: string;

    @IsString()
    paid_by: UUID;
}

export class ReviseMachineQuotationDto {
    @IsDateString()
    @IsNotEmpty()
    reminder_date:Date;

    @IsNumber()
    qty: number;

    @IsNumber()
    cost: number;

    @IsString()
    remarks: string;

    @IsString()
    @IsNotEmpty()
    quotation_id: UUID;

    @IsString()
    @IsNotEmpty()
    user_id: UUID;

    @IsArray()
    quotation_terms: Array<string>;
}

export class GenerateDeliveryChallanDto {
    @IsString()
    @IsNotEmpty()
    order_id: UUID;

    @IsString()
    @IsNotEmpty()
    part_id: UUID;

    @IsString()
    @IsNotEmpty()
    vendor_id: UUID;

    @IsString()
    @IsNotEmpty()
    challan_date: string;

    @IsString()
    @IsNotEmpty()
    dispatch_mode: string;

    @IsString()
    @IsOptional()
    vehicle_no: string;

    @IsString()
    @IsNotEmpty()
    total_value: string;

    @IsString()
    created_by: UUID;
}

export class PurchaseOrderLineItemDto {
    @IsString()
    @IsOptional()
    production_boughtout_id: UUID;

    @IsString()
    description: string;

    @IsNumber()
    qty: number;

    @IsString()
    @IsOptional()
    uom: string;

    @IsNumber()
    rate: number;

    @IsString()
    @IsOptional()
    remarks: string;
}

export class GeneratePurchaseOrderDto {
    @IsString()
    @IsNotEmpty()
    order_id: UUID;

    @IsString()
    @IsNotEmpty()
    supplier_id: UUID;

    @IsString()
    @IsNotEmpty()
    po_date: string;

    @IsString()
    @IsOptional()
    reference_doc_no: string;

    @IsString()
    @IsOptional()
    payment_terms: string;

    @IsString()
    @IsOptional()
    delivery_schedule: string;

    @IsNumber()
    gst_percent: number;

    @IsArray()
    line_items: Array<PurchaseOrderLineItemDto>;

    @IsArray()
    terms: Array<string>;

    @IsString()
    created_by: UUID;
}

export class RecordVendorProcessPaymentDto {
    @IsString()
    @IsNotEmpty()
    production_part_id: UUID;

    @IsNumber()
    @IsNotEmpty()
    paid_amount: number;

    @IsString()
    @IsOptional()
    mode: string;

    @IsString()
    @IsOptional()
    remarks: string;

    @IsString()
    paid_by: UUID;
}

export class UploadVendorInvoiceDto {
    @IsString()
    @IsOptional()
    order_id: UUID;

    @IsString()
    @IsOptional()
    vendor_id: UUID;

    @IsString()
    @IsOptional()
    machine_id: UUID;

    @IsString()
    @IsOptional()
    part_id: UUID;

    @IsString()
    @IsOptional()
    process: string;

    @IsString()
    uploaded_by: UUID;
}