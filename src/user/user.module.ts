import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AttendanceEntity } from 'src/model/attendance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/model/user.entity';
import { LeaveRequestEntity } from 'src/model/leave_request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceEntity, UserEntity, LeaveRequestEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
