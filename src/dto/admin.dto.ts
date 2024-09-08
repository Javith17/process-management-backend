import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";

export class CreateRole{
    @IsString()
    @IsNotEmpty()
    role_name:string;

    @IsString()
    role_code:string;

    @IsArray()
    screens: [];
}


export class CreateUser{
    @IsString()
    @IsNotEmpty()
    empName:string;

    @IsString()
    @IsNotEmpty()
    empCode:string;

    @IsString()
    password:string;

    @IsUUID()
    roleId:UUID;
}

export class UpdateUserPassword{
    @IsString()
    @IsNotEmpty()
    userId:UUID;

    @IsNotEmpty()
    @IsString()
    password:string;
}

export class CreateProcess{
    @IsString()
    @IsNotEmpty()
    process_name:string;
}

export class CreateVendor{
    @IsString()
    @IsNotEmpty()
    vendor_name:string;

    @IsString()
    vendor_code:string;

    @IsString()
    @IsNotEmpty()
    vendor_address:string;

    @IsString()
    vendor_gst:string;

    @IsString()
    @IsNotEmpty()
    vendor_account_no:string;

    @IsString()
    vendor_location:string;

    @IsString()
    @IsNotEmpty()
    vendor_mobile_no1:string;

    @IsString()
    @IsOptional()
    vendor_mobile_no2:string;

    @IsArray()
    vendor_process_list: CreateVendorProcess[]
}

export class CreateVendorProcess{
    @IsString()
    process_id: string;

    @IsString()
    process_name: string;
}

export class CreateSupplier{
    @IsString()
    @IsNotEmpty()
    supplier_name:string;

    @IsString()
    supplier_code:string;

    @IsString()
    @IsNotEmpty()
    supplier_address:string;

    @IsString()
    @IsNotEmpty()
    supplier_account_no:string;

    @IsString()
    supplier_location:string;

    @IsString()
    @IsNotEmpty()
    supplier_mobile_no1:string;

    @IsString()
    @IsOptional()
    supplier_mobile_no2:string;
}

export class CreateCustomer{
    @IsString()
    @IsNotEmpty()
    customer_name:string;

    @IsString()
    @IsNotEmpty()
    customer_address:string;

    @IsString()
    customer_account_detail:string;

    @IsString()
    customer_mobile_no1:string;

    @IsString()
    customer_mobile_no2:string;

    @IsBoolean()
    is_machine:boolean;

    @IsBoolean()
    is_sares:boolean;

    @IsBoolean()
    is_spm:boolean;
}