import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddLocationAlertDto, AttendanceUpdateDto, DailyAttendanceDto, LeaveRequestDto, LeaveRequestListDto, MonthlyAttendanceDto, UpdateLeaveRequestDto } from 'src/dto/user.dto';
import { AttendanceEntity } from 'src/model/attendance.entity';
import { UserEntity } from 'src/model/user.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { LeaveRequestEntity } from 'src/model/leave_request.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(AttendanceEntity) private attendanceRepository: Repository<AttendanceEntity>,
    @InjectRepository(LeaveRequestEntity) private leaveRequestRepository: Repository<LeaveRequestEntity>,
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async attendanceUpdate(updateDto: AttendanceUpdateDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: updateDto.user_id } });
      if (!user) {
        return { message: "Invalid User" }
      }

      const attendanceEntry = await this.attendanceRepository.findOne({ where: { user: { id: updateDto.user_id }, attendance_date: updateDto.attendance_date } });

      switch (updateDto.type) {
        case 'check-in':
          await this.attendanceRepository.save({
            user: user,
            attendance_date: updateDto.attendance_date,
            check_in_time: updateDto.time,
            emp_code: user.emp_code,
            location_details: {
              check_in_location: updateDto.location
            }
          });
          return {
            message: 'Checked In Successfully'
          }

        case 'check-out':
          if (attendanceEntry) {
            const totalBreak = attendanceEntry.break_details?.reduce((total, item) => {
              return total + (Number(item.break_out) - Number(item.break_in));
            }, 0) || 0;

            await this.attendanceRepository.createQueryBuilder()
              .update(AttendanceEntity).set({
                check_out_time: updateDto.time,
                location_details: { ...attendanceEntry.location_details, check_out_location: updateDto.location },
                total_working_hrs: (Number(updateDto.time) - Number(attendanceEntry.check_in_time) - totalBreak).toString()
              })
              .where('id =:id', { id: attendanceEntry.id })
              .execute()
          }
          return {
            message: 'Checked Out Successfully'
          }

        case 'break-in':
          if (attendanceEntry) {
            await this.attendanceRepository.createQueryBuilder()
              .update(AttendanceEntity).set({
                is_break: true,
                break_details: attendanceEntry.break_details ?
                  [...attendanceEntry.break_details, { break_in: updateDto.time }] : [{ break_in: updateDto.time }]
              })
              .where('id =:id', { id: attendanceEntry.id })
              .execute()
          }
          return {
            message: 'Break In Added'
          }

        case 'break-out':
          const updatedBreaks = attendanceEntry.break_details.map(item => {
            if (!item.break_out) {
              return {
                ...item,
                break_out: updateDto.time
              };
            }
            return item;
          });

          const totalSeconds = updatedBreaks.reduce((total, item) => {
            return total + (Number(item.break_out) - Number(item.break_in));
          }, 0);

          await this.attendanceRepository.createQueryBuilder()
            .update(AttendanceEntity).set({
              break_details: updatedBreaks,
              total_break_hrs: totalSeconds,
              is_break: false
            })
            .where('id =:id', { id: attendanceEntry.id })
            .execute()

          return {
            message: 'Break Out Added'
          }

        case 'verify':
          await this.attendanceRepository.createQueryBuilder()
            .update(AttendanceEntity).set({
              status: updateDto.status,
              remarks: updateDto.remarks,
              is_verified: updateDto?.status == 'Verified' ? true : false
            })
            .where('id =:id', { id: attendanceEntry.id })
            .execute()

            const filePath = `./images/attendance/${updateDto.attendance_date}/${updateDto.user_id}.png`;

            fs.unlink(filePath, (err) => {
              if (err) {
                console.error('Error deleting file:', err);
                return;
            }})

          return {
            message: 'Verification updated'
          }
      }
    } catch (error: any) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: error.message,
      }, HttpStatus.FORBIDDEN, {
        cause: error.message
      });
    }
  }

  async getMonthlyAttendance(monthlyAttendanceDto: MonthlyAttendanceDto) {  
    const startDate = `${monthlyAttendanceDto.attendance_year}-${String(monthlyAttendanceDto.attendance_month).padStart(2, '0')}-01`;

    const endDate = new Date(monthlyAttendanceDto.attendance_year, monthlyAttendanceDto.attendance_month, 0)
      .toISOString()
      .split('T')[0];

    const attendanceData = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.user_id',
        'attendance.attendance_date',
        'attendance.check_in_time',
        'attendance.check_out_time',
        'attendance.is_leave',
        'attendance.total_working_hrs',
      ])
      .where('attendance.user_id = :userId', { userId: monthlyAttendanceDto.user_id })
      .andWhere(
        'attendance.attendance_date BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      )
      .orderBy('attendance.attendance_date', 'ASC')
      .getMany();

    // Leave Days
    const leaveDays = attendanceData.filter(
      (item) => item.is_leave === true,
    ).length;

    // Working Days
    const workingDays = attendanceData.filter(
      (item) => item.is_leave === false,
    ).length;

    // Total Working Hours
    const totalWorkingHours = attendanceData.reduce((sum, item) => {
      return sum + Number(item.total_working_hrs || 0);
    }, 0);

    // Attendance List
    const attendanceList = attendanceData.map((item) => ({
      date: item.attendance_date.toString(),
      check_in_time: item.check_in_time,
      check_out_time: item.check_out_time,
      total_working_hrs: item.total_working_hrs,
      is_leave: item.is_leave,
    }));

    return {
      message: "Attendance Detail",
      data: {
        no_of_leave_days: leaveDays,
        no_of_working_days: workingDays,
        total_working_hrs: totalWorkingHours,
        attendance_list: attendanceList
      }
    };
  }

  async getDailyAttendance(dailyAttendanceDto: DailyAttendanceDto) {
    const attendanceData = await this.attendanceRepository
      .createQueryBuilder('attendance')
      .select([
        'attendance.user_id',
        'attendance.attendance_date',
        'attendance.check_in_time',
        'attendance.check_out_time',
        'attendance.is_leave',
        'attendance.total_working_hrs',
        'attendance.break_details',
        'attendance.is_break',
        'attendance.is_leave',
        'attendance.total_break_hrs',
        'attendance.is_verified',
        'attendance.remarks',
        'attendance.location_details'
      ])
      .where('attendance.attendance_date = :date', { date: dailyAttendanceDto.attendance_date })
      .andWhere('attendance.user_id = :userId', { userId: dailyAttendanceDto.user_id })
      .getOne();

    return {
      message: 'Attendance Details',
      data: attendanceData
    }
  }

  async employeeDailyAttendance(dailyAttendanceDto: DailyAttendanceDto) {
    const query = await this.userRepository
    .createQueryBuilder('user')

    .leftJoin(
      'attendance',
      'attendance',
      `
        attendance.user_id = "user"."id"
        AND attendance.attendance_date = :date
      `,
      {
        date: dailyAttendanceDto.attendance_date,
      },
    )

    .select([
      'attendance.id as id',
      'user.emp_code as emp_code',
      'user.emp_name as emp_name',

      'attendance.user_id as attendance_user_id',
      'attendance.attendance_date as attendance_date',

      'attendance.check_in_time as check_in_time',
      'attendance.check_out_time as check_out_time',

      'attendance.is_leave as is_leave',
      'attendance.total_working_hrs as total_working_hrs',

      'attendance.break_details as break_details',
      'attendance.total_break_hrs as total_break_hrs',

      'attendance.is_verified as is_verified',
      'attendance.remarks as remarks',
      'attendance.location_details as location_details',
    ])

    // Dynamic Status
    .addSelect(
      `
      CASE
        WHEN attendance.is_leave = true THEN 'Leave'
        WHEN attendance.check_in_time IS NOT NULL THEN 'Present'
        WHEN attendance.id IS NULL
            AND :date < CURRENT_DATE THEN 'Absent'
        ELSE ''
      END
      `,
      'status',
    )

    .where('user.is_active = :isActive', {
      isActive: true,
    })

    .setParameter('date', dailyAttendanceDto.attendance_date)

    .orderBy('user.emp_name', 'ASC');

    const users = await query.getRawMany();

    return {
      message: 'Attendance List',
      list: users
    };
  }

  async newLeaveRequest(leaveRequestDto: LeaveRequestDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: leaveRequestDto.user_id } });
      await this.leaveRequestRepository.save({
        user: user,
        emp_code: user.emp_code,
        leave_date: leaveRequestDto.leave_date,
        description: leaveRequestDto.description,
        status: 'Pending'
      });
      return {
        message: 'Applied Successfully'
      }
    } catch(error:any) {
      throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: error.message,
        }, HttpStatus.FORBIDDEN, {
          cause: error.message
        });
    }
  }

  async updateLeaveRequest(updateLeaveRequestDto: UpdateLeaveRequestDto) {
    try {
      const leaveRequest = await this.leaveRequestRepository.findOne({ where: { id: updateLeaveRequestDto.id } });
      const approvedBy = await this.userRepository.findOne({ where: { id: updateLeaveRequestDto.approved_by } });

      await this.leaveRequestRepository.createQueryBuilder()
        .update(LeaveRequestEntity).set({
          status: updateLeaveRequestDto.status,
          remarks: updateLeaveRequestDto.remarks,
          approved_user: approvedBy
        })
        .where('id =:id', { id: updateLeaveRequestDto.id })
        .execute();

      if (updateLeaveRequestDto.status == 'Approved') {
        await this.attendanceRepository.save({
            user: leaveRequest.user,
            attendance_date: leaveRequest.leave_date,
            emp_code: leaveRequest.user.emp_code,
            is_leave: true
          });
      }
      return {
        message: 'Updated Successfully'
      }
    } catch(error:any) {
      throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: error.message,
        }, HttpStatus.FORBIDDEN, {
          cause: error.message
        });
    }
  }

  async getLeaveRequestList(leaveRequestListDto: LeaveRequestListDto) {
    let query = await this.leaveRequestRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.user', 'user')
      .leftJoinAndSelect('leave.approved_user', 'approved_user')
      .select([
        'leave.id',
        'leave.emp_code',
        'leave.leave_date',
        'leave.description',
        'leave.status',
        'leave.remarks',
        'leave.created_at',
        'user.emp_name',
        'approved_user.emp_name'
      ])
      .orderBy('leave.created_at', 'DESC');

    if (leaveRequestListDto.user_id) {
      query = query.andWhere('user.id = :userId', { userId: leaveRequestListDto.user_id });
    }
    if (leaveRequestListDto.status) {
      query = query.andWhere('leave.status = :status', { status: leaveRequestListDto.status });
    }
    if (leaveRequestListDto.search) {
      query = query.andWhere('LOWER(user.emp_name) LIKE :empName', { empName: `%${leaveRequestListDto.search.toLowerCase()}%` })
    }

    const leaveData = await query.getMany();

    return {
      message: 'Leave Details',
      list: leaveData
    }
  }

  
  async addLocationAlert(locationAlertDto: AddLocationAlertDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: locationAlertDto.user_id } });
      const attendance = await this.attendanceRepository.findOne({ where: { user: user, attendance_date: new Date(locationAlertDto.attendance_date) } });

      let currentLocationAlerts = attendance.location_alerts ? attendance.location_alerts : [];
      await this.attendanceRepository.createQueryBuilder()
        .update(AttendanceEntity).set({
          location_alerts: [...currentLocationAlerts, {
            location: locationAlertDto.location_detail,
            time: locationAlertDto.current_time
          }]
        })
        .where('id =:id', { id: attendance.id })
        .execute();
      return {
        message: 'Added Alert'
      }
    } catch(error: any) {
      throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: error.message,
        }, HttpStatus.FORBIDDEN, {
          cause: error.message
        });
    }
  }

  async addScreenTimeAlert(screenTimeAlertDto: AddLocationAlertDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id: screenTimeAlertDto.user_id } });
      const attendance = await this.attendanceRepository.findOne({ where: { user: user, attendance_date: new Date(screenTimeAlertDto.attendance_date) } });

      let currentScreenTimeAlerts = attendance.screen_time_alerts ? attendance.screen_time_alerts : [];
      await this.attendanceRepository.createQueryBuilder()
        .update(AttendanceEntity).set({
          screen_time_alerts: [...currentScreenTimeAlerts, {
            screen_time: screenTimeAlertDto.screen_time,
            time: new Date()
          }]
        })
        .where('id =:id', { id: attendance.id })
        .execute();
      return {
        message: 'Added Alert'
      }
    } catch(error: any) {
      throw new HttpException({
          status: HttpStatus.FORBIDDEN,
          error: error.message,
        }, HttpStatus.FORBIDDEN, {
          cause: error.message
        });
    }
  }
}
