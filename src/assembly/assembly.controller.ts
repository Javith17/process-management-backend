import { Body, Controller, Get, Param, Post, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthInterceptor } from 'src/auth/middleware/interceptor.middleware';
import { AssemblyService } from './assembly.service';
import { UUID } from 'crypto';
import { UpdateAssemblyDto } from 'src/dto/assembly.dto';
const fs = require('fs')

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('assembly')
export class AssemblyController {
    constructor(private readonly assemblyService: AssemblyService) { }

    @Get('/configureMachineAssemblies/:machineId/:orderId')
    configureMachineAssemblies(@Param('machineId') machineId: string, @Param('orderId') orderId: UUID) {
        return this.assemblyService.configureMachineAssemblies(machineId, orderId)
    }

    @Get('/configureSparesAssemblies/:machineId/:orderId')
    configureSparesAssemblies(@Param('machineId') machineId: string, @Param('orderId') orderId: UUID) {
        return this.assemblyService.configureSparesAssemblies(machineId, orderId)
    }

    @Get('/getMachineSubAssemblies/:machineId/:orderId')
    getMachineSubAssemblies(@Param('machineId') machineId: string, @Param('orderId') orderId: UUID) {
        return this.assemblyService.machineSubAssemblies(machineId, orderId)
    }

    @Get('/getMachineMainAssemblies/:machineId/:orderId')
    getMachineMainAssemblies(@Param('machineId') machineId: string, @Param('orderId') orderId: UUID) {
        return this.assemblyService.machineMainAssemblies(machineId, orderId)
    }

    @Get('/getMachineSectionAssemblies/:machineId/:orderId')
    getMachineSectionAssemblies(@Param('machineId') machineId: string, @Param('orderId') orderId: UUID) {
        return this.assemblyService.machineSectionAssemblies(machineId, orderId)
    }

    @Post('/updateAssembly')
    updateStartAssembly(@Body() cmd: UpdateAssemblyDto){
        return this.assemblyService.updateAssemblyStatus(cmd)
    }
}
