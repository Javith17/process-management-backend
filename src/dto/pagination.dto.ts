import { IsArray, IsNumber, IsString } from "class-validator";
import { UUID } from "crypto";

export class Pagination{
    @IsNumber()
    limit:number;

    @IsNumber()
    page:number;

    @IsString()
    search: string;

    @IsString()
    type: string;

    @IsString()
    type_id: string;

    @IsArray()
    search_list: string[]
}

export class CheckNameDto {
    @IsString()
    checkName: string;

    @IsString()
    type: string;
}

export class DetailDto {
    @IsString()
    id: string;
}

export class RemoveAttachmentDto {
    @IsString()
    id: UUID;

    @IsString()
    file_name: string;
}