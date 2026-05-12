import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UUID } from "crypto";

export class AttendanceUpdateDto {
    @IsDateString()
    @IsNotEmpty()
    attendance_date:Date;

    @IsString()
    @IsNotEmpty()
    user_id: UUID;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    time: string;

    @IsString()
    location: string;

    @IsString()
    status: string;

    @IsString()
    remarks: string;
}

export class MonthlyAttendanceDto {
    @IsString()
    @IsNotEmpty()
    attendance_month:number;

    @IsString()
    @IsNotEmpty()
    attendance_year:number;

    @IsString()
    @IsNotEmpty()
    user_id: UUID;
}

export class DailyAttendanceDto {
    @IsString()
    @IsNotEmpty()
    attendance_date:string;

    @IsString()
    @IsOptional()
    user_id: UUID;
}

export class LeaveRequestDto {
    @IsDateString()
    @IsNotEmpty()
    leave_date:Date;

    @IsString()
    @IsNotEmpty()
    user_id: UUID;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class UpdateLeaveRequestDto {
    @IsString()
    @IsNotEmpty()
    id: UUID;

    @IsString()
    @IsNotEmpty()
    status: string;

    @IsString()
    @IsOptional()
    remarks: string;

    @IsString()
    approved_by: UUID;
}

export class LeaveRequestListDto {
    @IsString()
    user_id: UUID;

    @IsString()
    status: string;

    @IsString()
    search: string;
}