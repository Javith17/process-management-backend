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
}