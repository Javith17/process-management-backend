import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { UUID } from "crypto";

export class CreateRole{
    @IsString()
    @IsNotEmpty()
    roleName:string;

    @IsString()
    roleCode:string;

    @IsArray()
    screens: string[];
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
    processName:string;
}

export class CreateVendor{
    @IsString()
    @IsNotEmpty()
    vendorName:string;

    @IsString()
    vendorCode:string;

    @IsString()
    @IsNotEmpty()
    vendorAddress:string;

    @IsString()
    vendorGST:string;

    @IsString()
    @IsNotEmpty()
    vendorAccountNo:string;

    @IsString()
    vendorLocation:string;

    @IsString()
    @IsNotEmpty()
    vendorMobileNo1:string;

    @IsString()
    @IsOptional()
    vendorMobileNo2:string;

    @IsArray()
    vendorProcessList: CreateVendorProcess[]
}

export class CreateVendorProcess{
    @IsString()
    processId: string;

    @IsString()
    processName: string;
}

export class CreateSupplier{
    @IsString()
    @IsNotEmpty()
    supplierName:string;

    @IsString()
    supplierCode:string;

    @IsString()
    @IsNotEmpty()
    supplierAddress:string;

    @IsString()
    @IsNotEmpty()
    supplierAccountNo:string;

    @IsString()
    supplierLocation:string;

    @IsString()
    @IsNotEmpty()
    supplierMobileNo1:string;

    @IsString()
    @IsOptional()
    supplierMobileNo2:string;
}