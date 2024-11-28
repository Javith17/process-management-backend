import { IsNumber, IsString } from "class-validator";
import { UUID } from "crypto";

export class Pagination{
    @IsNumber()
    limit:number;

    @IsNumber()
    page:number;

    @IsString()
    search: string;
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