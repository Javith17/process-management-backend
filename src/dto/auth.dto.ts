import { IsNotEmpty, IsString } from "class-validator";

export class SignIn{
    @IsString()
    @IsNotEmpty()
    emp_code:string;

    @IsString()
    @IsNotEmpty()
    password:string;
}