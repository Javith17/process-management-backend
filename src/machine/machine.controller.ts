import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthInterceptor } from 'src/auth/middleware/interceptor.middleware';
import { CreatePart } from 'src/dto/machine.dto';
import { Pagination } from 'src/dto/pagination.dto';
import { MachineService } from './machine.service';

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('machine')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}
 
    @Post('/createPart')
    createRole(@Body() createPart: CreatePart){
        return this.machineService.createNewPart(createPart)
    }
    
    @Get('/partsList')
    getPartsList(@Query() pagination: Pagination){
        return this.machineService.getPartsList(pagination)
    }
}
