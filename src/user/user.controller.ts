import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.userService.getHello();
  }
}
