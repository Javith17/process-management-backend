import { IsNotEmpty, IsString } from "class-validator";

export class SignIn{
    @IsString()
    @IsNotEmpty()
    empCode:string;

    @IsString()
    @IsNotEmpty()
    password:string;
}