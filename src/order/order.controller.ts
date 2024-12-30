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
import { ApproveQuotationDto, CloseOrderDto, CreateMachineQuotationDto, DeliverProductionMachinePartDto, MoveProductionMachinePartToVendorDto, RescheduleProductionMachinePartDto, SupplierQuotationDto, UpdateBoughtoutPaymentDto, UpdateProductionMachineBODto, UpdateProductionMachinePartDto, VendorQuotationDto } from 'src/dto/quotation.dto';
import { OrderService } from './order.service';
const fs = require('fs')

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
 
    @Get('/ordersList')
    getOrdersList(@Query() pagination: Pagination){
        return this.orderService.getOrdersList(pagination)
    }

    @Get('/order/:id/:type')
    async getOrderDetail(@Param('id') id: string, @Param('type') type: string){
        const parts = await this.orderService.getOrderDetail(id, type)
        const boughtouts = await this.orderService.getOrderDetailBoughtout(id, type)
        return { parts, boughtouts }
    }

    @Post('/updateProductionMachineBO')
    updateProductionMachineBO(@Body() updateProductionMachineBO: UpdateProductionMachineBODto){
        return this.orderService.updateProductionMachineBO(updateProductionMachineBO)
    }

    @Post('/updateProductionMachinePart')
    updateProductionMachinePart(@Body() updateProductionMachinePart: UpdateProductionMachinePartDto){
        return this.orderService.updateProductionMachinePart(updateProductionMachinePart)
    }

    @Post('/moveProductionMachinePartToVendor')
    moveProductionMachineParttoVendor(@Body() moveProductionMachinePartToVendor: MoveProductionMachinePartToVendorDto){
        return this.orderService.moveProductionMachinePartToVendor(moveProductionMachinePartToVendor)
    }

    @Post('/deliverProductionMachinePart')
    deliverProductionMachinePart(@Body() deliverProductionMachinePart: DeliverProductionMachinePartDto){
        return this.orderService.deliverProductionMachinePart(deliverProductionMachinePart)
    }

    @Post('/deliverProductionMachineBO')
    deliverProductionMachineBO(@Body() deliverProductionMachineBO: DeliverProductionMachinePartDto){
        return this.orderService.deliverProductionMachineBO(deliverProductionMachineBO)
    }

    @Post('/completeProductionPartProcess')
    completeProductionPartProcess(@Body() completeDto: DeliverProductionMachinePartDto) {
        return this.orderService.completeProductionMachinePart(completeDto)
    }

    @Post('/rescheduleProductionPartProcess')
    rescheduleProductionPartProcess(@Body() rescheduleDto: RescheduleProductionMachinePartDto) {
        return this.orderService.rescheduleProductionMachinePart(rescheduleDto)
    }

    @Get('/pendingPaymentBoughtouts')
    getPendingPaymentBoughtouts(@Query() pagination: Pagination){
        return this.orderService.getOrderDetailForAdmin(pagination)
    }

    @Post('/updateBoughtoutPayment')
    updateBoughtoutPayment(@Body() updateBoughtoutPaymentDto: UpdateBoughtoutPaymentDto){
        return this.orderService.updateBoughtoutPayment(updateBoughtoutPaymentDto)
    }

    @Get('/deliveryPendingParts')
    getDeliveryPendingPartsForStore(@Query() pagination: Pagination){
        return this.orderService.deliveryPendingParts()
    }

    @Get('/deliveryPendingBoughtouts')
    getDeliveryPendingBoughtoutsForStore(@Query() pagination: Pagination){
        return this.orderService.deliveryPendingBOs()
    }

    @Get('/partListFilter/:filter_by/:from_date/:to_date')
    getPartsListByReminderDate(@Query() pagination:Pagination, 
    @Param('filter_by') filter_by: string, @Param('from_date') from_date: string,
    @Param('to_date') to_date: string){
        return this.orderService.partsListFilter(filter_by, from_date, to_date)
    }

    @Get('/dashboardDetails')
    getDashboardDetails(){
        return this.orderService.dashboardDetails()
    }

    @Get('/orderParts')
    getOrderVendorParts(){
        return this.orderService.orderPartBO()
    }

    @Post('/movePartsToAssembly')
    movePartsToAssembly(@Body() movePartAssemblyDto: DeliverProductionMachinePartDto) {
        return this.orderService.movePartToAssembly(movePartAssemblyDto)
    }

    @Post('/moveBoughtoutsToAssembly')
    moveBoughtoutsToAssembly(@Body() moveBoughtoutsAssemblyDto: DeliverProductionMachinePartDto) {
        return this.orderService.moveBoughtoutToAssembly(moveBoughtoutsAssemblyDto)
    }

    @Post('/closeAssemblyPart')
    closeAssemblyPart(@Body() movePartAssemblyDto: DeliverProductionMachinePartDto) {
        return this.orderService.closePartAssembly(movePartAssemblyDto)
    }

    @Post('/closeAssemblyBoughtout')
    closeAssemblyBoughtout(@Body() moveBoughtoutsAssemblyDto: DeliverProductionMachinePartDto) {
        return this.orderService.closeBoughtoutAssembly(moveBoughtoutsAssemblyDto)
    }

    @Post('/closeAssembly')
    closeAssembly(@Body() closeOrderDto: CloseOrderDto) {
        return this.orderService.closeAssembly(closeOrderDto)   
    }    

    @Post('/closeOrder')
    closeOrder(@Body() closeOrderDto: CloseOrderDto) {
        return this.orderService.closeOrder(closeOrderDto)   
    }    

    @Get('/orderHistory/:orderId')
    getOrderHistory(@Param('orderId') orderId: UUID){
        return this.orderService.getOrderHistory(orderId)
    }
}
