import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRole } from './dto/admin.dto';
import { RoleEntity } from './model/role.entity';

@Injectable()
export class AppService {

  getHello(): string {
    return 'Hello World!';
  }
}
