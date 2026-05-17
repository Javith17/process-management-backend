import { Body, Controller, Get, Param, Post, UploadedFiles, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthInterceptor } from 'src/auth/middleware/interceptor.middleware';
import { AddLocationAlertDto, AttendanceUpdateDto, DailyAttendanceDto, LeaveRequestDto, LeaveRequestListDto, MonthlyAttendanceDto, UpdateLeaveRequestDto } from 'src/dto/user.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AttendanceImageDto, FileDto } from 'src/dto/machine.dto';
import path, { extname, join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import { memoryStorage } from 'multer';

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }

  @Post('/attendance-update')
  checkInUser(@Body() updateAttendanceDto: AttendanceUpdateDto){
    return this.userService.attendanceUpdate(updateAttendanceDto);
  }

  @Post('/attendence-image-upload')
  @UseInterceptors(FilesInterceptor('files', 1 , { storage: memoryStorage() } ))
  async imageUpload(@UploadedFiles() files: Express.Multer.File[], @Body() fileDto: AttendanceImageDto) {
    const file = files[0];
    const folderName = fileDto.attendance_date;
    const uploadPath = path.join(
      process.cwd(),
      'images',
      'attendance',
      folderName,
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    const ext = path.extname(file.originalname);
    const fileName = `${fileDto.user_id}.png`;
    const filePath = path.join(uploadPath, fileName);
    fs.writeFileSync(filePath, file.buffer);
    return { message: 'Image uploaded successfully' };
  }

  @Get('/loadImage/:date/:imageName')
  getAttendanceImage(@Param('imageName') imageName: string, @Param('date') date: string, @Res() res: Response) {
    return res.sendFile(join(process.cwd(), `images/attendance/${date}/${imageName}`))
  }

  @Post('/monthly-user-attendance')
  monthlyUserAttendance(@Body() monthlyAttendanceDto: MonthlyAttendanceDto){
    return this.userService.getMonthlyAttendance(monthlyAttendanceDto);
  }

  @Post('/daily-user-attendance')
  dailyUserAttendance(@Body() dailyAttendanceDto: DailyAttendanceDto){
    return this.userService.getDailyAttendance(dailyAttendanceDto);
  }

  @Post('/employee-daily-attendance')
  dailyEmployeeAttendance(@Body() dailyAttendanceDto: DailyAttendanceDto){
    return this.userService.employeeDailyAttendance(dailyAttendanceDto);
  }

  @Post('/leave-request')
  leaveRequest(@Body() leaveRequestDto: LeaveRequestDto){
    return this.userService.newLeaveRequest(leaveRequestDto);
  }

  @Post('/update-leave-request')
  updateLeaveRequest(@Body() updateLeaveRequestDto: UpdateLeaveRequestDto){
    return this.userService.updateLeaveRequest(updateLeaveRequestDto);
  }

  @Post('/leave-request-list')
  fetchLeaveRequestList(@Body() leaveRequestListDto: LeaveRequestListDto){
    return this.userService.getLeaveRequestList(leaveRequestListDto);
  }

  @Post('/location-alert')
  addLocationAlert(@Body() locationAlertDto: AddLocationAlertDto){
    return this.userService.addLocationAlert(locationAlertDto);
  }

  @Post('/screen-alert')
  addScreenTimeAlert(@Body() screenTimeAlertDto: AddLocationAlertDto){
    return this.userService.addScreenTimeAlert(screenTimeAlertDto);
  }
}
