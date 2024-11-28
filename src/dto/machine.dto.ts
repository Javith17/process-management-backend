import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";

export class CreatePart {
    @IsString()
    @IsNotEmpty()
    part_name:string;

    @IsNumber()
    minimum_stock_qty:number;

    @IsNumber()
    available_qty:number;

    @IsString()
    part_category:string;

    @IsArray()
    part_process_list: CreatePartProcess[]
}

export class CreatePartProcess {    
    @IsString()
    process_id: UUID;

    @IsString()
    process_cost: string;

    @IsString()
    process_time: string;

    @IsArray()
    part_process_vendor_list: CreatePartProcessVendor[]
}

export class CreatePartProcessVendor {
    @IsString()
    vendor_id: UUID;

    @IsString()
    part_process_vendor_price: string;

    @IsString()
    part_process_vendor_delivery_time: string;
}

export class CreateBoughtOut {
    @IsString()
    @IsNotEmpty()
    bought_out_name:string;

    @IsString()
    bought_out_category:string;

    @IsArray()
    bought_out_supplier_list: CreateBoughtOutSupplier[]
}

export class CreateBoughtOutSupplier {
    @IsString()
    supplier_id: UUID;   

    @IsString()
    cost: string;

    @IsString()
    delivery_time: string;
}

export class CreateMachine {
    @IsString()
    @IsNotEmpty()
    type:string;

    @IsString()
    id:string;

    @IsString()
    @IsNotEmpty()
    model_no:string;

    @IsString()
    @IsNotEmpty()
    machine_name:string;

    @IsString()
    @IsNotEmpty()
    side_type:string;

    @IsNumber()
    spindles:number;

    @IsNumber()
    max_spindles:number;

    @IsNumber()
    min_spindles:number;

    @IsArray()
    sub_assembly: CreateMachineSubAssembly[]

    @IsArray()
    main_assembly: CreateMainAssembly[]

    @IsArray()
    section_assembly: CreateSectionAssembly[]
}

export class CreateMachineSubAssembly {
    @IsString()
    @IsNotEmpty()
    sub_assembly_id:string;

    @IsNumber()
    @IsNotEmpty()
    qty: number;
}

export class CreateSubAssembly {
    @IsString()
    @IsNotEmpty()
    sub_assembly_name:string;

    @IsString()
    @IsNotEmpty()
    serial_no:string;

    @IsArray()
    machine_list: UUID[];

    @IsArray()
    sub_assembly_detail: CreateSubAssemblyDetail[]
}

export class CreateSubAssemblyDetail {
    @IsString()
    part_id:UUID;

    @IsString()
    bought_out_id:UUID;

    @IsNumber()
    @IsNotEmpty()
    qty:number;
}

export class CreateMainAssembly {
    @IsString()
    @IsNotEmpty()
    main_assembly_name:string;

    @IsString()
    @IsNotEmpty()
    serial_no:string;

    @IsString()
    @IsNotEmpty()
    machine_id:UUID;

    @IsArray()
    main_assembly_detail: CreateMainAssemblyDetail[]
}

export class CreateMainAssemblyDetail {
    @IsString()
    part_id:UUID;

    @IsString()
    bought_out_id:UUID;

    @IsString()
    sub_assembly_id: UUID;
    
    @IsNumber()
    @IsNotEmpty()
    qty:number;
}

export class CreateSectionAssembly {
    @IsString()
    @IsNotEmpty()
    section_assembly_name:string;

    @IsString()
    @IsNotEmpty()
    serial_no:string;

    @IsString()
    @IsNotEmpty()
    machine_id:UUID;

    @IsArray()
    section_assembly_detail: CreateSectionAssemblyDetail[]
}

export class CreateSectionAssemblyDetail {
    @IsString()
    part_id:UUID;

    @IsString()
    bought_out_id:UUID;

    @IsString()
    sub_assembly_id: UUID;
    
    @IsString()
    main_assembly_id: UUID;

    @IsString()
    main_assembly_name: string;

    @IsNumber()
    @IsNotEmpty()
    qty:number;
}

export class AddSubAssemblyMachine {
    @IsString()
    type: string;

    @IsString()
    id: UUID;

    @IsString()
    sub_assembly_id: UUID;

    @IsNumber()
    qty: number;

    @IsString()
    machine_id: UUID;
}

export class UpdateAssemblyDetail {
    @IsString()
    assembly_type: string;

    @IsString()
    assembly_type_id: UUID;

    @IsString()
    assembly_udpate_type: string;

    @IsString()
    id: UUID;

    @IsString()
    qty: number;

    @IsString()
    update_type;
}

export class FileDto {
    @IsString()
    type_id: string;

    @IsString()
    type: string;

    @IsArray()
    file_list: Array<FileDetailsDto>;
}

export class FileDetailsDto {
    @IsString()
    file_name: string;

    @IsString()
    file_type: string;

    @IsString()
    file_size: string;

    @IsString()
    generated_name: string;
}

export class UpdateBoughtoutDto {
    @IsString()
    boughtout_id: UUID;

    @IsString()
    boughtout_name: string;

    @IsString()
    update_type: string; // update, delete

    @IsString()
    update_type_entity: string; // boughtout, boughtout_supplier

    @IsString()
    id: UUID;

    @IsString()
    cost: string;

    @IsString()
    delivery_time: string;
}
export class UpdatePartDto {
    @IsString()
    part_id: UUID;
    
    @IsString()
    update_type: string; // update, delete

    @IsString()
    update_type_entity: string; // part, process, vendor

    @IsString()
    id: UUID;

    @IsString()
    cost: string;

    @IsString()
    delivery_time: string;

    @IsString()
    minimum_stock_qty: string;

    @IsString()
    available_qty: string;

    @IsString()
    process_id: UUID;

    @IsString()
    vendor_id: UUID;
}

export class VendorAttachmentDto {
    @IsString()
    vendor_id: UUID;

    @IsString()
    part_id: UUID;
}