import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignIn{
    @IsString()
    @IsNotEmpty()
    emp_code:string;

    @IsString()
    @IsNotEmpty()
    password:string;
}

export class AcceptByVendorDto{
    @IsArray()
    @IsNotEmpty()
    id: string[];

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsString()
    @IsOptional()
    remarks: string;
}