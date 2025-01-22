import { Body, Controller, Get, Param, Post, Query, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UUID } from 'crypto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthInterceptor } from 'src/auth/middleware/interceptor.middleware';
import { AddSubAssemblyMachine, CreateBoughtOut, CreateMachine, CreateMainAssembly, CreatePart, CreateSectionAssembly, CreateSubAssembly, FileDto, PartsByMachines, UpdateAssemblyDetail, UpdateBoughtoutDto, UpdatePartDto, VendorAttachmentDto } from 'src/dto/machine.dto';
import { CheckNameDto, Pagination, RemoveAttachmentDto } from 'src/dto/pagination.dto';
import { MachineService } from './machine.service';
import multer, { diskStorage } from 'multer';
import path, { extname, join } from 'path';
import { mkdir } from 'fs';
const fs = require('fs')

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('machine')
export class MachineController {
  constructor(private readonly machineService: MachineService) {}
 
    @Post('/createPart')
    createPart(@Body() createPart: CreatePart){
        return this.machineService.createNewPart(createPart)
    }
    
    @Get('/partsList')
    getPartsList(@Query() pagination: Pagination){
        return this.machineService.getPartsList(pagination)
    }

    @Post('/partsListByMachine')
    getPartsListByMachine(@Body() partsByMachineDto: PartsByMachines){
        return this.machineService.getPartsListByMachine(partsByMachineDto)
    }

    @Get('/partsInStoresList')
    getPartsInStoresList(@Query() pagination: Pagination){
        return this.machineService.getPartsListInStore(pagination)
    }

    @Get('/parts/:id')
    getPartDetail(@Param('id') id: UUID){
        return this.machineService.getPartDetail(id)
    }

    @Post('/createBoughtOut')
    createBoughtOut(@Body() createBoughtOut: CreateBoughtOut){
        return this.machineService.createNewBoughtOut(createBoughtOut)
    }

    @Get('/boughtOutList')
    getBoughtOutList(@Query() pagination: Pagination){
        return this.machineService.getBoughtOutList(pagination)
    }

    @Post('/boughtOutListByMachine')
    getBoughtOutListByMachine(@Body() boughtoutByMachineDto: PartsByMachines){
        return this.machineService.getBoughtoutListByMachine(boughtoutByMachineDto)
    }

    @Get('/boughtouts/:id')
    getBoughtoutDetail(@Param('id') id: UUID){
        return this.machineService.getBoughtoutDetail(id)
    }

    @Get('/supplierBoughtouts/:supplier_id')
    getSupplierBoughtouts(@Param('supplier_id') supplier_id: UUID){
        return this.machineService.getSupplierBoughtouts(supplier_id)
    }

    @Post('/createSubAssembly')
    createSubAssembly(@Body() createSubAssembly: CreateSubAssembly){
        return this.machineService.createSubAssembly(createSubAssembly)
    }

    @Post('/createMainAssembly')
    createMainAssembly(@Body() createMainAssembly: CreateMainAssembly){
        return this.machineService.createMainAssembly(createMainAssembly)
    }

    @Post('/createSectionAssembly')
    createSectionAssembly(@Body() createSectionAssembly: CreateSectionAssembly){
        return this.machineService.createSectionAssembly(createSectionAssembly)
    }

    @Get('/subAssemblyList')
    getSubAssemblyList(@Query() pagination: Pagination){
        return this.machineService.getSubAssemblyList(pagination)
    }

    @Get('/subAssemblyDetail/:id')
    getSubAssemblyDetail(@Param('id') id: UUID){
        return this.machineService.getSubAssemblyDetail(id)
    }

    @Get('/mainAssemblyList')
    getMainAssemblyList(@Query() pagination: Pagination){
        return this.machineService.getMainAssemblyList(pagination)
    }

    @Get('/mainAssemblyDetail/:id')
    getMainAssemblyDetail(@Param('id') id: UUID){
        return this.machineService.getMainAssemblyDetail(id)
    }

    @Get('/sectionAssemblyList')
    getSectionAssemblyList(@Query() pagination: Pagination){
        return this.machineService.getSectionAssemblyList(pagination)
    }

    @Get('/sectionAssemblyDetail/:id')
    getSectionAssemblyDetail(@Param('id') id: UUID){
        return this.machineService.getSectionAssemblyDetail(id)
    }

    @Get('/subAssemblyList/:machineId')
    getSubAssemblyListByMachine(@Param('machineId') machine_id: string){
        return this.machineService.getSubAssemblyListByMachine(machine_id)
    }

    @Get('/mainAssemblyList/:machineId')
    getMainAssemblyListByMachine(@Param('machineId') machine_id: string){
        return this.machineService.getMainAssemblyListByMachine(machine_id)
    }

    @Post('/createNewMachine')
    createNewMachine(@Body() createMachine: CreateMachine){
        return this.machineService.createNewMachine(createMachine)
    }

    @Post('/addSubAssemblyToMachine')
    addSubAssemblyToMachine(@Body() addSubAssemblyMachine: AddSubAssemblyMachine){
        return this.machineService.addSubAssemblyToMachine(addSubAssemblyMachine)
    }

    @Post('updateAssembly')
    updateAssemblyDetail(@Body() updateAssemblyDetail: UpdateAssemblyDetail){
        return this.machineService.updateAssemblyDetail(updateAssemblyDetail)
    }

    @Post('/createMachine')
    createMachine(@Body() createMachine: CreateMachine){
        return this.machineService.createMachine(createMachine)
    }

    @Get('/machineList')
    getMachineList(@Query() pagination: Pagination){
        return this.machineService.getMachineList(pagination)
    }

    @Get('/machineDetail/:id')
    getMachineDetail(@Param('id') id: UUID){
        return this.machineService.getMachineDetail(id)
    }

    @Post('/checkAssemblyName')
    checkAssemblyName(@Body() checkName: CheckNameDto){
        return this.machineService.checkName(checkName)
    }

    @Post('/fileUpload')
    @UseInterceptors(FilesInterceptor('files', 3
    , {
        storage: diskStorage({
            destination: (req, file, cb)=>{
                cb(null,'./uploads')
            },
            filename: (req,file,cb)=>{
                cb(null, file.originalname)
            }
        })
    }
    ))
    async uploadFile(@UploadedFiles() files: Express.Multer.File[], @Body() fileDto: FileDto){
        await this.machineService.createAttachment(fileDto)
        return { message: 'File uploaded successfully' }
    }

    @Post('/removeAttachment')
    async removeAttachment(@Body() removeAttachment: RemoveAttachmentDto){
        return this.machineService.removeAttachment(removeAttachment)
    }

    @Get('/loadAttachment/:attachmentName')
    getAttachment(@Param('attachmentName') attachmentName:string,@Res() res: Response){
        return res.sendFile(join(process.cwd(), 'uploads/' + attachmentName))
    }

    @Post('/updatePart')
    async updateParts(@Body() updatePart: UpdatePartDto){
        return this.machineService.updatePart(updatePart)
    }

    @Post('/updateBoughtout')
    async updateBoughtout(@Body() updateBoughtoutDto: UpdateBoughtoutDto){
        return this.machineService.updateBoughtout(updateBoughtoutDto)
    }

    @Post('/vendorAttachment')
    async vendorAttachment(@Body() vendorAttachmentDto: VendorAttachmentDto){
        return this.machineService.vendorAttachment(vendorAttachmentDto)
    }
}
