import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthInterceptor } from 'src/auth/middleware/interceptor.middleware';
import { CreateBoughtOut, CreateMachine, CreatePart, CreateSubAssembly } from 'src/dto/machine.dto';
import { CheckNameDto, Pagination } from 'src/dto/pagination.dto';
import multer, { diskStorage } from 'multer';
import path, { extname, join } from 'path';
import { mkdir } from 'fs';
import { QuotationService } from './quotation.service';
import { ApproveQuotationDto, CreateMachineQuotationDto, DeliverProductionMachinePartDto, MoveProductionMachinePartToVendorDto, RescheduleProductionMachinePartDto, SupplierQuotationDto, UpdateProductionMachineBODto, UpdateProductionMachinePartDto, VendorQuotationDto } from 'src/dto/quotation.dto';
const fs = require('fs')

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('quotation')
export class QuotationController {
  constructor(private readonly quotationService: QuotationService) {}
 
    @Post('/createMachineQoutation')
    createMachineQuotation(@Body() machineQuotation: CreateMachineQuotationDto) {
        return this.quotationService.createMachineQuotation(machineQuotation)   
    }

    @Post('/createVendorQuotation')
    createVendorQuotation(@Body() vendorQuotation: VendorQuotationDto) {
        return this.quotationService.createVendorQuotation(vendorQuotation)
    }

    @Post('/createSupplierQuotation')
    createSupplierQuotation(@Body() supplierQuotation: SupplierQuotationDto) {
        return this.quotationService.createSupplierQuotation(supplierQuotation)
    }

    @Delete('/deleteQuotation/:type/:id')
    removeVendorQuotation(@Param("id") id: UUID, @Param("type") type: string) {
        return this.quotationService.deleteQuotation(id, type)
    }

    @Get('/machineQuotationList')
    getMachineQuotationList(@Query() pagination: Pagination){
        return this.quotationService.machineQuotationList(pagination)
    }

    @Get('/machineQuotationListReminder/:date')
    getMachineQuotationListReminder(@Query() pagination: Pagination, @Param("date") date: string){
        return this.quotationService.machineQuotationListReminder(pagination, date)
    }

    @Get('/vendorQuotationList')
    getVendorQuotationList(@Query() pagination: Pagination){
        return this.quotationService.vendorQuotationList(pagination)
    }

    @Get('/supplierQuotationList')
    getSupplierQuotationList(@Query() pagination: Pagination){
        return this.quotationService.supplierQuotationList(pagination)
    }

    @Post('/approveRejectQuotation')
    approveRejectQuotation(@Body() approveRejectDto: ApproveQuotationDto) {
        return this.quotationService.approveRejectQuotation(approveRejectDto)
    }
}
