import { IsString } from "class-validator";
import { UUID } from "crypto";

export class UpdateAssemblyDto {
    @IsString()
    status: string;
    
    @IsString()
    id: UUID;

    @IsString()
    assembly_id: UUID;

    @IsString()
    assembly_type: string;

    @IsString()
    order_id: UUID;

    @IsString()
    name: string;

    @IsString()
    assembled_by: UUID;
}