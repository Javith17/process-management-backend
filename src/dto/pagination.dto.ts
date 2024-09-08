import { IsNumber, IsString } from "class-validator";

export class Pagination{
    @IsNumber()
    limit:number;

    @IsNumber()
    page:number;

    @IsString()
    search: string;
}