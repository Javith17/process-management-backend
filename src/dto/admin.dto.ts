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
    vendor_id: UUID;
    
    @IsString()
    @IsNotEmpty()
    vendor_name:string;

    @IsString()
    @IsNotEmpty()
    vendor_address1:string;

    @IsString()
    vendor_address2:string;

    @IsString()
    vendor_gst:string;

    @IsString()
    @IsNotEmpty()
    vendor_account_no:string;

    @IsString()
    @IsNotEmpty()
    vendor_bank_name:string;

    @IsString()
    @IsNotEmpty()
    vendor_ifsc:string;

    @IsString()
    @IsNotEmpty()
    vendor_city:string;

    @IsString()
    @IsNotEmpty()
    vendor_state:string;

    @IsString()
    @IsNotEmpty()
    vendor_pincode:string;

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
    supplier_id:string;

    @IsString()
    @IsNotEmpty()
    supplier_name:string;

    @IsString()
    supplier_address1:string;

    @IsString()
    @IsNotEmpty()
    supplier_address2:string;

    @IsString()
    @IsNotEmpty()
    supplier_account_no:string;

    @IsString()
    @IsNotEmpty()
    supplier_bank_name:string;

    @IsString()
    @IsNotEmpty()
    supplier_ifsc:string;

    @IsString()
    supplier_location:string;

    @IsString()
    @IsNotEmpty()
    supplier_mobile_no1:string;

    @IsString()
    @IsOptional()
    supplier_mobile_no2:string;

    @IsString()
    @IsNotEmpty()
    supplier_city:string;

    @IsString()
    @IsNotEmpty()
    supplier_state:string;

    @IsString()
    @IsNotEmpty()
    supplier_pincode:string;
}

export class CreateCustomer{
    @IsString()
    customer_id:string;

    @IsString()
    @IsNotEmpty()
    customer_name:string;

    @IsString()
    @IsNotEmpty()
    customer_address1:string;

    @IsString()
    @IsNotEmpty()
    customer_city:string;
    
    @IsString()
    @IsNotEmpty()
    customer_state:string;
    
    @IsString()
    @IsNotEmpty()
    customer_pincode:string;

    @IsString()
    customer_address2:string;

    @IsString()
    customer_account_no:string;

    @IsString()
    customer_bank_name:string;
    
    @IsString()
    customer_ifsc:string;

    @IsString()
    customer_mobile_no1:string;

    @IsString()
    customer_mobile_no2:string;

    @IsBoolean()
    is_machine:boolean;

    @IsBoolean()
    is_spares:boolean;

    @IsBoolean()
    is_spm:boolean;
}