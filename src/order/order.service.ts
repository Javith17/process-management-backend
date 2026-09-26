import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Pagination } from 'src/dto/pagination.dto';
import { ApproveQuotationDto, CloseOrderDto, CreateMachineQuotationDto, DeliverProductionMachinePartDto, GenerateDeliveryChallanDto, GenerateInvoiceDto, GeneratePurchaseOrderDto, MoveProductionMachinePartToVendorDto, RecordSupplierPaymentDto, RecordVendorProcessPaymentDto, RescheduleProductionMachinePartDto, SupplierQuotationDto, UpdateBoughtoutPaymentDto, UpdateProductionMachineBODto, UpdateProductionMachinePartDto, UploadVendorInvoiceDto, VendorQuotationDto } from 'src/dto/quotation.dto';
import { AssemblyMachineMainEntity } from 'src/model/assembly_machine_main.entity';
import { AssemblyMachineSectionEntity } from 'src/model/assembly_machine_section.entity';
import { AssemblyMachineSubEntity } from 'src/model/assembly_machine_sub.entity';
import { BoughtOutEntity } from 'src/model/bought_out.entity';
import { BoughtOutSuppliertEntity } from 'src/model/bought_out_supplier.entity';
import { CustomerEntity } from 'src/model/customer.entity';
import { MachineEntity } from 'src/model/machine.entity';
import { MachineQuotationEntity } from 'src/model/machine_quotation.entity';
import { OrderConfirmationEntity } from 'src/model/order_confirmation.entity';
import { PartEntity } from 'src/model/part.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { ProductionMachineBoughtoutEntity } from 'src/model/production_machine_boughtout.entity';
import { ProductionMachineHistoryEntity } from 'src/model/production_machine_history.entity';
import { ProductionMachinePartEntity } from 'src/model/production_machine_part.entity';
import { ProductionPartRescheduleEntity } from 'src/model/production_part_reschedule.entity';
import { SupplierEntity } from 'src/model/supplier.entity';
import { UserEntity } from 'src/model/user.entity';
import { VendorEntity } from 'src/model/vendor.entity';
import { DeliveryChallanEntity } from 'src/model/delivery_challan.entity';
import { VendorPaymentEntity } from 'src/model/vendor_payment.entity';
import { VendorProcessInvoiceEntity } from 'src/model/vendor_process_invoice.entity';
import { SupplierPaymentEntity } from 'src/model/supplier_payment.entity';
import { PurchaseOrderEntity } from 'src/model/purchase_order.entity';
import { InvoiceEntity } from 'src/model/invoice.entity';
import { Repository } from 'typeorm';
import { template_head } from 'src/common/constants';
import { amountToWordsIndian } from 'src/common/utils';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(OrderConfirmationEntity) private orderConfirmationRepository: Repository<OrderConfirmationEntity>,
        @InjectRepository(ProductionMachinePartEntity) private productionMachinePartRepo: Repository<ProductionMachinePartEntity>,
        @InjectRepository(ProductionMachineBoughtoutEntity) private productionMachineBoughtoutRepo: Repository<ProductionMachineBoughtoutEntity>,
        @InjectRepository(PartProcessEntity) private partProcessRepo: Repository<PartProcessEntity>,
        @InjectRepository(BoughtOutSuppliertEntity) private boughoutSupplierRepo: Repository<BoughtOutSuppliertEntity>,
        @InjectRepository(ProductionPartRescheduleEntity) private reschedulePartRepo: Repository<ProductionPartRescheduleEntity>,
        @InjectRepository(ProductionMachineHistoryEntity) private historyRepo: Repository<ProductionMachineHistoryEntity>,
        @InjectRepository(VendorEntity) private vendorRepo: Repository<VendorEntity>,
        @InjectRepository(MachineEntity) private machineRepo: Repository<MachineEntity>,
        @InjectRepository(CustomerEntity) private customerRepo: Repository<CustomerEntity>,
        @InjectRepository(PartEntity) private partsRepo: Repository<PartEntity>,
        @InjectRepository(BoughtOutEntity) private boughtoutRepo: Repository<BoughtOutEntity>,
        @InjectRepository(AssemblyMachineSubEntity) private assemblySubRepo: Repository<AssemblyMachineSubEntity>,
        @InjectRepository(AssemblyMachineMainEntity) private assemblyMainRepo: Repository<AssemblyMachineMainEntity>,
        @InjectRepository(AssemblyMachineSectionEntity) private assemblySectionRepo: Repository<AssemblyMachineSectionEntity>,
        @InjectRepository(DeliveryChallanEntity) private deliveryChallanRepo: Repository<DeliveryChallanEntity>,
        @InjectRepository(VendorPaymentEntity) private vendorPaymentRepo: Repository<VendorPaymentEntity>,
        @InjectRepository(VendorProcessInvoiceEntity) private vendorInvoiceRepo: Repository<VendorProcessInvoiceEntity>,
        @InjectRepository(SupplierEntity) private supplierRepository: Repository<SupplierEntity>,
        @InjectRepository(SupplierPaymentEntity) private supplierPaymentRepo: Repository<SupplierPaymentEntity>,
        @InjectRepository(PurchaseOrderEntity) private purchaseOrderRepo: Repository<PurchaseOrderEntity>,
        @InjectRepository(InvoiceEntity) private invoiceRepo: Repository<InvoiceEntity>,
    ) { }

    async getOrdersList(pagination: Pagination) {
        let query = await this.orderConfirmationRepository.createQueryBuilder('orders')
            .leftJoinAndSelect('orders.machine', 'machine')
            .leftJoinAndSelect('orders.customer', 'customer')
            .leftJoinAndSelect('orders.quotation', 'quotation')
            .leftJoinAndSelect('orders.spares_quotation', 'spares_quotation')
            .select(['orders.id', 'orders.machine_name', 'customer.id',
                'machine.id',
                'customer.customer_name',
                'customer.customer_address1',
                'customer.customer_address2',
                'customer.customer_city',
                'customer.customer_state',
                'customer.customer_pincode',
                'customer.customer_gst',
                'quotation.id',
                'orders.status',
                'orders.invoice_id',
                'orders.invoice_no',
                'quotation.quotation_no',
                'quotation.approved_cost',
                'spares_quotation.id',
                'orders.status',
                'spares_quotation.quotation_no',
                'spares_quotation.approved_cost'])
            .orderBy('orders.created_at', 'DESC')
            .where('orders.status IS NOT NULL')

            if (pagination?.search_list){
                query = query.andWhere('orders.status IN (:...status)', { status: pagination?.search_list })
            }
    
            if (pagination?.search) {
                query = query.andWhere('LOWER(machine.machine_name) LIKE :machineName', { machineName: `%${pagination.search.toLowerCase()}%` })
            }
            
        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }

    async updateProductionMachinePart(updateProductionMachinePart: UpdateProductionMachinePartDto) {
        const currentObj = await this.productionMachinePartRepo.findOne({ where: { id: updateProductionMachinePart.production_part_id } })

        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({
                vendor_id: updateProductionMachinePart.vendor_id,
                vendor_name: updateProductionMachinePart.vendor_name,
                cost: updateProductionMachinePart.cost,
                delivery_date: updateProductionMachinePart.delivery_date,
                // reminder_date: updateProductionMachinePart.reminder_date,
                status: updateProductionMachinePart.status
            })
            .where('id=:id', { id: updateProductionMachinePart.production_part_id })
            .returning('*')
            .execute()

        await this.historyRepo.save({
            parent_id: updateProductionMachinePart.production_part_id,
            type: 'Part',
            type_id: currentObj.part_id,
            type_name: currentObj.part_name,
            data: { action: 'Assigned Vendor' },
            remarks: '',
            from_status: currentObj.status,
            to_status: updateProductionMachinePart.status,
            order: currentObj.order,
            changed_by: updateProductionMachinePart.created_by
        })

        return { message: 'Vendor added successfully' }
    }

    async moveProductionMachinePartToVendor(moveProductionMachinePartToVendor: MoveProductionMachinePartToVendorDto) {
        const currentObj = await this.productionMachinePartRepo.findOne({ where: { id: moveProductionMachinePartToVendor.production_part_id } })

        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({
                delivery_date: moveProductionMachinePartToVendor.delivery_date,
                reminder_date: moveProductionMachinePartToVendor.reminder_date,
                status: moveProductionMachinePartToVendor.status
            })
            .where('id=:id', { id: moveProductionMachinePartToVendor.production_part_id })
            .returning('*')
            .execute()

        await this.historyRepo.save({
            parent_id: moveProductionMachinePartToVendor.production_part_id,
            type: 'Part',
            type_id: currentObj.part_id,
            type_name: currentObj.part_name,
            data: { action: 'Moved Order to Vendor' },
            remarks: '',
            from_status: currentObj.status,
            to_status: moveProductionMachinePartToVendor.status,
            order: currentObj.order,
            changed_by: moveProductionMachinePartToVendor.created_by
        })
        return { message: 'Moved to vendor successfully' }
    }

    async deliverProductionMachinePart(deliverProductionMachinePart: DeliverProductionMachinePartDto) {
        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({
                delivery_remarks: deliverProductionMachinePart.remarks,
                status: 'In-Stores'
            })
            .where('order_id=:order_id', { order_id: deliverProductionMachinePart.order_id })
            .andWhere('part_name=:part_name', { part_name: deliverProductionMachinePart.part_name })
            .returning('*')
            .execute()

        const existingPart = await this.partsRepo.findOne({ where: { part_name: deliverProductionMachinePart.part_name } })
        await this.partsRepo.createQueryBuilder()
            .update(PartEntity)
            .set({
                available_aty: Number(existingPart.available_aty) + Number(deliverProductionMachinePart.delivered_qty)
            })
            .where('id= :part_id', { part_id: existingPart.id })
            .execute()

        const order = await this.orderConfirmationRepository.findOne({ where: { id: deliverProductionMachinePart.order_id } })
        await this.historyRepo.save({
            parent_id: deliverProductionMachinePart.production_part_id,
            type: 'Part',
            type_id: existingPart.id,
            type_name: existingPart.part_name,
            data: { action: 'Accepted Delivery', delivered_qty: deliverProductionMachinePart.delivered_qty },
            remarks: deliverProductionMachinePart.remarks,
            from_status: 'Vendor process completed',
            to_status: 'In-Stores',
            order: order,
            changed_by: deliverProductionMachinePart.created_by
        })

        return { message: 'Delivery status updated successfully' }
    }

    async deliverProductionMachineBO(deliverProductionMachineBO: DeliverProductionMachinePartDto) {
        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({
                remarks: deliverProductionMachineBO.remarks,
                status: 'In-Stores'
            })
            .where('id=:id', { id: deliverProductionMachineBO.production_boughtout_id })
            .returning('*')
            .execute()

        const existingBo = await this.boughtoutRepo.findOne({ where: { bought_out_name: deliverProductionMachineBO.bought_out_name } })
        const order = await this.orderConfirmationRepository.findOne({ where: { id: deliverProductionMachineBO.order_id } })
        await this.historyRepo.save({
            parent_id: deliverProductionMachineBO.production_boughtout_id,
            type: 'Boughtout',
            type_id: existingBo.id,
            type_name: existingBo.bought_out_name,
            data: { action: 'Accepted Delivery', delivered_qty: deliverProductionMachineBO.delivered_qty },
            remarks: deliverProductionMachineBO.remarks,
            from_status: 'In-Progress',
            to_status: 'In-Stores',
            order: order,
            changed_by: deliverProductionMachineBO.created_by
        })

        return { message: 'Delivery status updated successfully' }
    }

    async completeProductionMachinePart(deliverProductionMachinePart: DeliverProductionMachinePartDto) {
        const currentObj = await this.productionMachinePartRepo.findOne({ where: { id: deliverProductionMachinePart.production_part_id } })

        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({
                delivery_remarks: deliverProductionMachinePart.remarks,
                status: 'Vendor process completed'
            })
            .where('id=:id', { id: deliverProductionMachinePart.production_part_id })
            .returning('*')
            .execute()

        await this.historyRepo.save({
            parent_id: deliverProductionMachinePart.production_part_id,
            type: 'Part',
            type_id: currentObj?.part_id,
            type_name: currentObj?.part_name,
            data: { action: 'Order process completed by vendor' },
            remarks: deliverProductionMachinePart.remarks,
            from_status: currentObj?.status,
            to_status: 'Completed',
            order: currentObj?.order,
            changed_by: deliverProductionMachinePart.created_by
        })
        return { message: 'Complete status updated successfully' }
    }

    async rescheduleProductionMachinePart(rescheduleDto: RescheduleProductionMachinePartDto) {
        const productionPart = await this.productionMachinePartRepo.findOne({ where: { id: rescheduleDto.production_part_id } })
        if (productionPart) {
            const createdByObj = await this.userRepository.findOne({ where: { id: rescheduleDto.created_by } })

            await this.reschedulePartRepo.save({
                previous_reminder_date: productionPart.reminder_date,
                previous_delivery_date: productionPart.delivery_date,
                reminder_date: rescheduleDto.reschedule_reminder_date,
                delivery_date: rescheduleDto.reschedule_delivery_date,
                remarks: rescheduleDto.remarks,
                rescheduled_by: createdByObj
            })

            await this.historyRepo.save({
                parent_id: rescheduleDto.production_part_id,
                type: 'Part',
                type_id: productionPart?.part_id,
                type_name: productionPart?.part_name,
                data: { action: `Order process delivery rescheduled from ${productionPart?.delivery_date} to ${rescheduleDto.reschedule_delivery_date}` },
                remarks: rescheduleDto.remarks,
                from_status: productionPart?.status,
                to_status: productionPart?.status,
                order: productionPart?.order,
                changed_by: rescheduleDto.created_by
            })

            await this.productionMachinePartRepo.createQueryBuilder()
                .update(ProductionMachinePartEntity)
                .set({
                    reminder_date: rescheduleDto.reschedule_reminder_date,
                    delivery_date: rescheduleDto.reschedule_delivery_date
                })
                .where('id=:id', { id: rescheduleDto.production_part_id })
                .returning('*')
                .execute()
            return { message: 'Rescheduled updated successfully' }
        } else {
            return { message: 'Unable to reschedule' }
        }

    }

    async movePartToAssembly(movePartAssembly: DeliverProductionMachinePartDto) {
        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({
                status: 'Assembly In-Progress'
            })
            .where('order_id=:order_id', { order_id: movePartAssembly.order_id })
            .andWhere('part_name=:part_name', { part_name: movePartAssembly.part_name })
            .returning('*')
            .execute()

        const existingPart = await this.partsRepo.findOne({ where: { part_name: movePartAssembly.part_name } })
        await this.partsRepo.createQueryBuilder()
            .update(PartEntity)
            .set({
                available_aty: Number(existingPart.available_aty) - Number(movePartAssembly.assembly_qty)
            })
            .where('id= :part_id', { part_id: existingPart.id })
            .execute()

        // Change status in assembly tables

        await this.assemblySubRepo.createQueryBuilder()
            .update(AssemblyMachineSubEntity)
            .set({
                status: 'Ready to Assemble'
            })
            .where('part_id=:id', { id: existingPart.id })
            .andWhere('order_id=:orderId', { orderId: movePartAssembly.order_id })
            .execute()

        await this.assemblyMainRepo.createQueryBuilder()
            .update(AssemblyMachineMainEntity)
            .set({
                status: 'Ready to Assemble'
            })
            .where('part_id=:id', { id: existingPart.id })
            .andWhere('order_id=:orderId', { orderId: movePartAssembly.order_id })
            .execute()

        await this.assemblySectionRepo.createQueryBuilder()
            .update(AssemblyMachineSectionEntity)
            .set({
                status: 'Ready to Assemble'
            })
            .where('part_id=:id', { id: existingPart.id })
            .andWhere('order_id=:orderId', { orderId: movePartAssembly.order_id })
            .execute()


        const order = await this.orderConfirmationRepository.findOne({ where: { id: movePartAssembly.order_id } })
        await this.historyRepo.save({
            parent_id: movePartAssembly.production_part_id,
            type: 'Part',
            type_id: existingPart.id,
            type_name: existingPart.part_name,
            data: { action: 'Moved to Assembly', assembly_qty: movePartAssembly.delivered_qty },
            remarks: movePartAssembly.remarks,
            from_status: 'In-Stores',
            to_status: 'Assembly In-Progress',
            order: order,
            changed_by: movePartAssembly.created_by
        })

        return { message: 'Parts moved to assembly successfully' }
    }

    async moveBoughtoutToAssembly(moveBoughtoutAssembly: DeliverProductionMachinePartDto) {
        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({
                status: 'Assembly In-Progress'
            })
            .where('id=:id', { id: moveBoughtoutAssembly.production_boughtout_id })
            .returning('*')
            .execute()

        const existingBoughtout = await this.boughtoutRepo.findOne({ where: { bought_out_name: moveBoughtoutAssembly.bought_out_name } })

        // Change status in assembly tables

        await this.assemblySubRepo.createQueryBuilder()
            .update(AssemblyMachineSubEntity)
            .set({
                status: 'Ready to Assemble'
            })
            .where('bought_out_id=:id', { id: existingBoughtout.id })
            .andWhere('order_id=:orderId', { orderId: moveBoughtoutAssembly.order_id })
            .execute()

        await this.assemblyMainRepo.createQueryBuilder()
            .update(AssemblyMachineMainEntity)
            .set({
                status: 'Ready to Assemble'
            })
            .where('bought_out_id=:id', { id: existingBoughtout.id })
            .andWhere('order_id=:orderId', { orderId: moveBoughtoutAssembly.order_id })
            .execute()

        await this.assemblySectionRepo.createQueryBuilder()
            .update(AssemblyMachineSectionEntity)
            .set({
                status: 'Ready to Assemble'
            })
            .where('bought_out_id=:id', { id: existingBoughtout.id })
            .andWhere('order_id=:orderId', { orderId: moveBoughtoutAssembly.order_id })
            .execute()

        const order = await this.orderConfirmationRepository.findOne({ where: { id: moveBoughtoutAssembly.order_id } })
        await this.historyRepo.save({
            parent_id: moveBoughtoutAssembly.production_boughtout_id,
            type: 'Boughtout',
            type_id: existingBoughtout.id,
            type_name: existingBoughtout.bought_out_name,
            data: { action: 'Moved to Assembly', assembly_qty: moveBoughtoutAssembly.delivered_qty },
            remarks: moveBoughtoutAssembly.remarks,
            from_status: 'In-Stores',
            to_status: 'Assembly In-Progress',
            order: order,
            changed_by: moveBoughtoutAssembly.created_by
        })

        return { message: 'Boughtout moved to assembly successfully' }
    }

    async closePartAssembly(movePartAssembly: DeliverProductionMachinePartDto) {
        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({
                status: 'Assembly Completed'
            })
            .where('order_id=:order_id', { order_id: movePartAssembly.order_id })
            .andWhere('part_name=:part_name', { part_name: movePartAssembly.part_name })
            .returning('*')
            .execute()

        const existingPart = await this.partsRepo.findOne({ where: { part_name: movePartAssembly.part_name } })

        const order = await this.orderConfirmationRepository.findOne({ where: { id: movePartAssembly.order_id } })
        await this.historyRepo.save({
            parent_id: movePartAssembly.production_part_id,
            type: 'Part',
            type_id: existingPart.id,
            type_name: existingPart.part_name,
            data: { action: 'Assembly Completed', assembly_qty: movePartAssembly.delivered_qty },
            remarks: movePartAssembly.remarks,
            from_status: 'Assembly In-Progress',
            to_status: 'Assembly Completed',
            order: order,
            changed_by: movePartAssembly.created_by
        })

        return { message: 'Parts assembled successfully' }
    }

    async closeBoughtoutAssembly(moveBoughtoutAssembly: DeliverProductionMachinePartDto) {
        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({
                status: 'Assembly Completed'
            })
            .where('id=:id', { id: moveBoughtoutAssembly.production_boughtout_id })
            .returning('*')
            .execute()

        const existingBoughtout = await this.boughtoutRepo.findOne({ where: { bought_out_name: moveBoughtoutAssembly.bought_out_name } })

        const order = await this.orderConfirmationRepository.findOne({ where: { id: moveBoughtoutAssembly.order_id } })
        await this.historyRepo.save({
            parent_id: moveBoughtoutAssembly.production_boughtout_id,
            type: 'Boughtout',
            type_id: existingBoughtout.id,
            type_name: existingBoughtout.bought_out_name,
            data: { action: 'Assembly completed' },
            remarks: moveBoughtoutAssembly.remarks,
            from_status: 'Assembly In-Progress',
            to_status: 'Assembly completed',
            order: order,
            changed_by: moveBoughtoutAssembly.created_by
        })

        return { message: 'Boughtout assembled successfully' }
    }

    async getOrderDetail(order_id: string, type: string) {
        if (type === "order") {
            const result = await this.productionMachinePartRepo.createQueryBuilder('production_part')
                .leftJoinAndSelect('production_part.order', 'order')
                .leftJoinAndSelect('order.customer', 'customer')
                .leftJoinAndSelect('order.quotation', 'quotation')
                .leftJoinAndSelect('order.spares_quotation', 'spares_quotation')
                .select([
                    'production_part.id',
                    'production_part.part_id',
                    'order.id',
                    'order.machine_name',
                    'order.status',
                    'production_part.machine_id',
                    'customer.id',
                    'customer.customer_name',
                    'quotation.id',
                    'quotation.quotation_no',
                    'quotation.qty',
                    'quotation.approved_cost',
                    'spares_quotation.id',
                    'spares_quotation.quotation_no',
                    'spares_quotation.qty',
                    'spares_quotation.approved_cost',
                    'production_part.part_name',
                    'production_part.part_code',
                    'production_part.vendor_id',
                    'production_part.vendor_name',
                    'production_part.process_id',
                    'production_part.process_name',
                    'production_part.order_qty',
                    'production_part.cost',
                    'production_part.delivery_date',
                    'production_part.reminder_date',
                    'production_part.status',
                    'production_part.challan_no',
                    'production_part.dc_id'
                ])
                .where('order.id=:id', { id: order_id })
                .orderBy('production_part.part_id')
                .getMany()

            const partIds = await result.map((part: any) => part.part_id)

            const process_vendor = await this.partProcessRepo.createQueryBuilder('part_process')
                .leftJoinAndSelect('part_process.process', 'process')
                .leftJoinAndSelect('part_process.part', 'part')
                .leftJoinAndSelect('part_process.part_process_vendor_list', 'part_process_vendor_list')
                .leftJoinAndSelect('part_process_vendor_list.vendor', 'vendor')
                .select([
                    'part_process.id',
                    'process.id',
                    'process.process_name',
                    'part.id',
                    'part.part_name',
                    'part.part_code',
                    'part_process_vendor_list.id',
                    'part_process_vendor_list.part_process_vendor_price',
                    'part_process_vendor_list.part_process_vendor_delivery_time',
                    'vendor.id',
                    'vendor.vendor_name',
                    'vendor.vendor_mobile_no1'
                ])
                .where('part.id IN (:...ids)', { ids: partIds })
                .getMany()

            return { orderDetail: result, partVendors: process_vendor }
        } else {
            const result = await this.productionMachinePartRepo.createQueryBuilder('production_part')
                .leftJoinAndSelect('production_part.order', 'order')
                .leftJoinAndSelect('order.customer', 'customer')
                .leftJoinAndSelect('order.quotation', 'quotation')
                .leftJoinAndSelect('order.spares_quotation', 'spares_quotation')
                .select([
                    'production_part.part_id',
                    'order.id',
                    'order.machine_name',
                    'order.status',
                    'production_part.machine_id',
                    'customer.id',
                    'customer.customer_name',
                    'quotation.id',
                    'quotation.quotation_no',
                    'quotation.qty',
                    'quotation.approved_cost',
                    'spares_quotation.id',
                    'spares_quotation.quotation_no',
                    'spares_quotation.qty',
                    'spares_quotation.approved_cost',
                    'production_part.part_name',
                    'production_part.part_code',
                    'production_part.order_qty',
                    'production_part.cost',
                    'production_part.status'
                ])
                .distinct(true)
                .where('order.id=:id', { id: order_id })
                .andWhere(`production_part.status IN (:...status)`, { status: ['Assembly In-Progress', 'Assembly Completed'] })
                .orderBy('production_part.part_id')
                .getMany()

            return {
                orderDetail: result.filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.part_id === value.part_id
                    ))
                )
            }
        }
    }

    async getOrderDetailBoughtout(order_id: string, type: string) {
        if (type === "order") {
            const result = await this.productionMachineBoughtoutRepo.createQueryBuilder('production_boughtout')
                .leftJoinAndSelect('production_boughtout.order', 'order')
                .leftJoinAndSelect('order.customer', 'customer')
                .leftJoinAndSelect('order.quotation', 'quotation')
                .select([
                    'production_boughtout.id',
                    'production_boughtout.bought_out_id',
                    'order.id',
                    'order.machine_name',
                    'customer.id',
                    'customer.customer_name',
                    'quotation.id',
                    'quotation.quotation_no',
                    'quotation.qty',
                    'quotation.approved_cost',
                    'production_boughtout.bought_out_name',
                    'production_boughtout.supplier_id',
                    'production_boughtout.supplier_name',
                    'production_boughtout.order_qty',
                    'production_boughtout.cost',
                    'production_boughtout.paid_amount',
                    'production_boughtout.delivery_date',
                    'production_boughtout.reminder_date',
                    'production_boughtout.status',
                    'production_boughtout.supplier_accept_status',
                    'production_boughtout.po_no',
                    'production_boughtout.po_id'
                ])
                .where('order.id=:id', { id: order_id })
                .orderBy('production_boughtout.bought_out_id')
                .getMany()

            const boughtoutIds = await result.map((bo: any) => bo.bought_out_id)

            let boughtout_supplier = [];
            if (boughtoutIds.length > 0) {
                boughtout_supplier = await this.boughoutSupplierRepo.createQueryBuilder('boughtout_supplier')
                    .leftJoinAndSelect('boughtout_supplier.bought_out', 'bought_out')
                    .leftJoinAndSelect('boughtout_supplier.supplier', 'supplier')
                    .select([
                        'bought_out.id',
                        'bought_out.bought_out_name',
                        'boughtout_supplier.id',
                        'boughtout_supplier.cost',
                        'boughtout_supplier.delivery_time',
                        'supplier.id',
                        'supplier.supplier_name',
                        'supplier.supplier_mobile_no1'
                    ])
                    .where('bought_out.id IN (:...ids)', { ids: boughtoutIds })
                    .getMany()
            }

            return { orderDetailBoughtout: result, boughtoutSupplier: boughtout_supplier }
        } else {
            const result = await this.productionMachineBoughtoutRepo.createQueryBuilder('production_boughtout')
                .leftJoinAndSelect('production_boughtout.order', 'order')
                .leftJoinAndSelect('order.customer', 'customer')
                .leftJoinAndSelect('order.quotation', 'quotation')
                .select([
                    'production_boughtout.id',
                    'production_boughtout.bought_out_id',
                    'order.id',
                    'order.machine_name',
                    'customer.id',
                    'customer.customer_name',
                    'quotation.id',
                    'quotation.quotation_no',
                    'quotation.qty',
                    'quotation.approved_cost',
                    'production_boughtout.bought_out_name',
                    'production_boughtout.supplier_id',
                    'production_boughtout.supplier_name',
                    'production_boughtout.order_qty',
                    'production_boughtout.cost',
                    'production_boughtout.status'
                ])
                .where('order.id=:id', { id: order_id })
                .andWhere(`production_boughtout.status IN (:...status)`, { status: ['Assembly In-Progress', 'Assembly Completed'] })
                .orderBy('production_boughtout.bought_out_id')
                .getMany()

            return { orderDetailBoughtout: result }
        }
    }

    async updateProductionMachineBO(updateProductionMachineBO: UpdateProductionMachineBODto) {
        const currentObj = await this.productionMachineBoughtoutRepo.findOne({ where: { id: updateProductionMachineBO.production_part_id } })
        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({
                supplier_id: updateProductionMachineBO.supplier_id,
                supplier_name: updateProductionMachineBO.supplier_name,
                cost: updateProductionMachineBO.cost,
                delivery_date: updateProductionMachineBO.delivery_date,
                reminder_date: updateProductionMachineBO.reminder_date,
                status: updateProductionMachineBO.status
            })
            .where('id=:id', { id: updateProductionMachineBO.production_part_id })
            .returning('*')
            .execute()

        if (updateProductionMachineBO.supplier_id) {
            const supplier = await this.supplierRepository.findOne({ where: { id: updateProductionMachineBO.supplier_id } })
            if (supplier) {
                await this.supplierRepository.createQueryBuilder()
                    .update(SupplierEntity)
                    .set({ pending_payment: String((Number(supplier.pending_payment) || 0) + (Number(updateProductionMachineBO.cost) || 0)) })
                    .where('id = :id', { id: supplier.id })
                    .execute()
            }
        }

        await this.historyRepo.save({
            parent_id: updateProductionMachineBO.production_part_id,
            type: 'Boughtout',
            type_id: currentObj.bought_out_id,
            type_name: currentObj.bought_out_name,
            data: { action: 'Assigned Supplier' },
            remarks: '',
            from_status: currentObj.status,
            to_status: updateProductionMachineBO.status,
            order: currentObj.order,
            changed_by: updateProductionMachineBO.created_by
        })

        return { message: 'Supplier added successfully' }
    }

    async getOrderDetailForAdmin(pagination: Pagination) {
        let query = await this.productionMachineBoughtoutRepo.createQueryBuilder('production_boughtout')
            .leftJoinAndSelect('production_boughtout.order', 'order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.quotation', 'quotation')
            .select([
                'production_boughtout.id',
                'production_boughtout.bought_out_id',
                'order.id',
                'order.machine_name',
                'customer.id',
                'customer.customer_name',
                'quotation.id',
                'quotation.quotation_no',
                'quotation.qty',
                'quotation.approved_cost',
                'production_boughtout.bought_out_name',
                'production_boughtout.supplier_id',
                'production_boughtout.supplier_name',
                'production_boughtout.order_qty',
                'production_boughtout.cost',
                'production_boughtout.paid_amount',
                'production_boughtout.delivery_date',
                'production_boughtout.reminder_date',
                'production_boughtout.status'
            ])
            .where('production_boughtout.status=:status', { status: 'Payment Pending' })
            .orderBy('production_boughtout.bought_out_id')

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        const [list, count] = await query.getManyAndCount()

        return { list, count }
    }

    async updateBoughtoutPayment(updateBoughtoutPaymentDto: UpdateBoughtoutPaymentDto) {
        const currentObj = await this.productionMachineBoughtoutRepo.findOne({ where: { id: updateBoughtoutPaymentDto.production_part_id } })
        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({
                status: updateBoughtoutPaymentDto.status
            })
            .where('id=:id', { id: updateBoughtoutPaymentDto.production_part_id })
            .returning('*')
            .execute()

        await this.historyRepo.save({
            parent_id: updateBoughtoutPaymentDto.production_part_id,
            type: 'Boughtout',
            type_id: currentObj.bought_out_id,
            type_name: currentObj.bought_out_name,
            data: { action: 'Payment done', paid_amount: updateBoughtoutPaymentDto.paid_amount },
            remarks: updateBoughtoutPaymentDto.remarks,
            from_status: currentObj.status,
            to_status: updateBoughtoutPaymentDto.status,
            order: currentObj.order,
            changed_by: updateBoughtoutPaymentDto.created_by
        })

        return { message: 'Payment status updated successfully' }
    }

    async recordBoughtoutPayment(dto: RecordSupplierPaymentDto) {
        const bo = await this.productionMachineBoughtoutRepo.findOne({ where: { id: dto.production_boughtout_id } })
        if (!bo) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Boughtout not found'
            }, HttpStatus.NOT_FOUND)
        }

        const totalCost = Number(bo.cost) || 0
        const newPaidAmount = (Number(bo.paid_amount) || 0) + Number(dto.paid_amount)
        const balance = Math.max(0, totalCost - newPaidAmount)
        const newStatus = balance <= 0 ? 'In-Progress' : bo.status

        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({
                paid_amount: String(newPaidAmount),
                status: newStatus
            })
            .where('id=:id', { id: bo.id })
            .execute()

        if (bo.supplier_id) {
            const supplier = await this.supplierRepository.findOne({ where: { id: bo.supplier_id as UUID } })
            if (supplier) {
                const remainingPending = Math.max(0, (Number(supplier.pending_payment) || 0) - Number(dto.paid_amount))
                await this.supplierRepository.createQueryBuilder()
                    .update(SupplierEntity)
                    .set({ pending_payment: String(remainingPending) })
                    .where('id = :id', { id: supplier.id })
                    .execute()
            }
        }

        if (Number(dto.paid_amount) > 0) {
            await this.supplierPaymentRepo.save({
                supplier_id: bo.supplier_id,
                order_id: bo.order_id,
                machine_id: bo.machine_id,
                production_boughtout_id: bo.id,
                bought_out_id: bo.bought_out_id,
                paid_amount: String(dto.paid_amount),
                mode: dto.mode,
                remarks: dto.remarks,
                paid_by: dto.paid_by
            })
        }

        await this.historyRepo.save({
            parent_id: bo.id,
            type: 'Boughtout',
            type_id: bo.bought_out_id,
            type_name: bo.bought_out_name,
            data: { action: 'Payment recorded', paid_amount: dto.paid_amount, balance },
            remarks: dto.remarks,
            from_status: bo.status,
            to_status: newStatus,
            order: bo.order,
            changed_by: dto.paid_by
        })

        return { message: 'Payment recorded successfully', balance }
    }

    async deliveryPendingParts() {
        const queryBuilder = this.orderConfirmationRepository
            .createQueryBuilder('o')
            .innerJoin(ProductionMachinePartEntity, 'pm', 'o.id = pm.order_id')
            .innerJoin(MachineQuotationEntity, 'q', 'q.id = o.quotation_id')
            .select([
                'q.quotation_no',
                'pm.part_name',
                'pm.part_code',
                'pm.order_qty',
                'o.machine_name',
                'pm.order_id',
                'COUNT(pm.part_name) AS part_name_count',
                'SUM(CASE WHEN pm.status = :status THEN 1 ELSE 0 END) AS completed_count',
            ])
            .groupBy('q.quotation_no')
            .addGroupBy('pm.part_name')
            .addGroupBy('pm.part_code')
            .addGroupBy('pm.order_qty')
            .addGroupBy('o.machine_name')
            .addGroupBy('pm.order_id')
            .having('COUNT(pm.part_name) = SUM(CASE WHEN pm.status = :status THEN 1 ELSE 0 END)')
            .orderBy('q.quotation_no', 'ASC')
            .setParameters({
                status: 'Vendor process completed',
            });

        const result = await queryBuilder.getRawMany();

        if (result.length > 0) {
            const processRows = await this.productionMachinePartRepo.createQueryBuilder('pm')
                .select([
                    'pm.id', 'pm.order_id', 'pm.part_name', 'pm.part_code', 'pm.vendor_id', 'pm.vendor_name',
                    'pm.process_id', 'pm.process_name', 'pm.machine_id', 'pm.part_id', 'pm.cost', 'pm.order_qty'
                ])
                .where('pm.order_id IN (:...order_ids)', { order_ids: result.map((r: any) => r.pm_order_id) })
                .andWhere('pm.status = :status', { status: 'Vendor process completed' })
                .getMany()

            result.forEach((group: any) => {
                group.processes = processRows.filter((p: any) =>
                    p.order_id == group.pm_order_id && p.part_name == group.pm_part_name)
            })
        }

        return result;
    }

    async deliveryPendingBOs() {
        const queryBuilder = this.orderConfirmationRepository
            .createQueryBuilder('o')
            .innerJoin(ProductionMachineBoughtoutEntity, 'bo', 'o.id = bo.order_id')
            .innerJoin(MachineQuotationEntity, 'q', 'q.id = o.quotation_id')
            .select([
                'bo.id',
                'q.quotation_no',
                'bo.bought_out_name',
                'bo.order_qty',
                'o.machine_name',
                'bo.order_id',
                'bo.supplier_id',
                'bo.supplier_name',
                'bo.cost',
                'bo.paid_amount'
            ])
            .where(`bo.status='In-Progress'`)
            .orderBy('q.quotation_no', 'ASC')

        const result = await queryBuilder.getRawMany();

        return result;
    }

    async partsListFilter(filter_by: string, from_date: string, to_date: string) {
        let queryBuilder = this.orderConfirmationRepository
            .createQueryBuilder('o')
            .innerJoin(ProductionMachinePartEntity, 'pm', 'o.id = pm.order_id')
            .innerJoin(MachineQuotationEntity, 'q', 'q.id = o.quotation_id')
            .innerJoin(VendorEntity, 'v', 'pm.vendor_id = v.id::VARCHAR')
            .select([
                'q.quotation_no',
                'pm.part_name',
                'pm.part_code',
                'pm.order_qty',
                'o.machine_name',
                'pm.process_name',
                'pm.vendor_name',
                'v.vendor_mobile_no1'
            ])
        if (filter_by == "reminder") {
            queryBuilder = queryBuilder.where(`to_char(to_date(pm.reminder_date, 'YYYY-MM-dd'), 'dd-MM-YYYY')=:date`, { date: from_date })
        } else if (filter_by == "delivery") {
            queryBuilder = queryBuilder.where(`to_char(to_date(pm.delivery_date, 'YYYY-MM-dd'), 'dd-MM-YYYY')=:date`, { date: from_date })
        }


        const result = await queryBuilder.getRawMany();

        return result;
    }

    async dashboardDetails() {
        const vendors = await this.vendorRepo.count({ where: { is_active: true } })
        const customers = await this.customerRepo.count({ where: { is_active: true } })
        const machines = await this.machineRepo.count({ where: { is_active: true } })
        const pendingOrders = await this.orderConfirmationRepository.createQueryBuilder('o')
            .where('o.status IN (:...status)', { status: ['In-Progress', 'Assembly Completed'] })
            .getCount()

        const completedOrders = await this.orderConfirmationRepository.count({ where: { status: 'Order Closed' } })
        const machinePartGraphQuery = await this.productionMachinePartRepo.createQueryBuilder('pmp')
            .innerJoinAndSelect(MachineEntity, 'machine', 'pmp.machine_id::VARCHAR = machine.id::VARCHAR')
            .innerJoinAndSelect(OrderConfirmationEntity, 'od', 'pmp.order_id::VARCHAR = od.id::VARCHAR')
            .innerJoinAndSelect(MachineQuotationEntity, 'mq', 'od.quotation_id::VARCHAR = mq.id::VARCHAR')
            .select(['pmp.status', 'pmp.order_id', 'machine.machine_name', 'mq.quotation_no', 'COUNT(*) AS count'])
            .groupBy('pmp.status')
            .addGroupBy('pmp.order_id')
            .addGroupBy('machine.machine_name')
            .addGroupBy('mq.quotation_no')
            .where('od.status NOT IN (:...status)', { status: ['Order Closed'] })
            .getRawMany();
        const machineBOGraphQuery = await this.productionMachineBoughtoutRepo.createQueryBuilder('pmb')
            .innerJoinAndSelect(MachineEntity, 'machine', 'pmb.machine_id::VARCHAR = machine.id::VARCHAR')
            .innerJoinAndSelect(OrderConfirmationEntity, 'od', 'pmb.order_id::VARCHAR = od.id::VARCHAR')
            .innerJoinAndSelect(MachineQuotationEntity, 'mq', 'od.quotation_id::VARCHAR = mq.id::VARCHAR')
            .select(['pmb.status', 'pmb.order_id', 'machine.machine_name', 'mq.quotation_no', 'COUNT(*) AS count'])
            .groupBy('pmb.status')
            .addGroupBy('pmb.order_id')
            .addGroupBy('machine.machine_name')
            .addGroupBy('mq.quotation_no')
            .where('od.status NOT IN (:...status)', { status: ['Order Closed'] })
            .getRawMany();

        const partArray: any[] = []
        await machinePartGraphQuery.map((p: any) => {
            const ex_p = partArray.find((a: any) => a.order === p.pmp_order_id)
            if (ex_p) {
                const index = partArray.find((a: any) => a.order === p.pmp_order_id)
                const values = ex_p['values']
                values.push({
                    status: p.pmp_status,
                    count: p.count
                })
                partArray[index] = {
                    order: p.pmp_order_id,
                    machine: p.machine_machine_name,
                    quotation_no: p.mq_quotation_no,
                    values: values
                }
            } else {
                partArray.push({
                    order: p.pmp_order_id,
                    machine: p.machine_machine_name,
                    quotation_no: p.mq_quotation_no,
                    values: [{
                        status: p.pmp_status,
                        count: p.count
                    }]
                })
            }
        })

        const BOArray: any[] = []
        await machineBOGraphQuery.map((p: any) => {
            const ex_p = BOArray.find((a: any) => a.order === p.pmb_order_id)
            if (ex_p) {
                const index = BOArray.find((a: any) => a.order === p.pmb_order_id)
                const values = ex_p['values']
                values.push({
                    status: p.pmb_status,
                    count: p.count
                })
                BOArray[index] = {
                    order: p.pmb_order_id,
                    machine: p.machine_machine_name,
                    quotation_no: p.mq_quotation_no,
                    values: values
                }
            } else {
                BOArray.push({
                    order: p.pmb_order_id,
                    machine: p.machine_machine_name,
                    quotation_no: p.mq_quotation_no,
                    values: [{
                        status: p.pmb_status,
                        count: p.count
                    }]
                })
            }
        })

        return { vendors, customers, machines, pendingOrders, completedOrders, partArray, BOArray }
    }

    async orderPartBO() {
        let queryBuilder = this.orderConfirmationRepository
            .createQueryBuilder('o')
            .innerJoin(ProductionMachinePartEntity, 'pm', 'o.id = pm.order_id')
            .innerJoin(PartEntity, 'p', 'p.id::VARCHAR = pm.part_id::VARCHAR')
            .innerJoin(MachineQuotationEntity, 'q', 'q.id = o.quotation_id')
            .leftJoin(VendorEntity, 'v', 'pm.vendor_id = v.id::VARCHAR')
            .select([
                'pm.order_id',
                'q.quotation_no',
                'pm.part_name',
                'pm.part_code',
                'pm.order_qty',
                'pm.required_qty',
                'p.available_aty',
                'o.machine_name',
                'pm.vendor_name',
                'v.vendor_mobile_no1'
            ])
            .distinct(true)
            // .where(`pm.status='Vendor process completed'`)
            .where(`pm.status='In-Stores'`)

        const result = await queryBuilder.getRawMany();

        let queryBuilderBO = this.orderConfirmationRepository
            .createQueryBuilder('o')
            .innerJoin(ProductionMachineBoughtoutEntity, 'bo', 'o.id = bo.order_id')
            .innerJoin(MachineQuotationEntity, 'q', 'q.id = o.quotation_id')
            .innerJoin(SupplierEntity, 's', 'bo.supplier_id = s.id::VARCHAR')
            .select([
                'bo.order_id',
                'bo.id',
                'q.quotation_no',
                'bo.bought_out_name',
                'bo.order_qty',
                'o.machine_name',
                'bo.supplier_name',
                's.supplier_mobile_no1'
            ])
            // .where(`bo.status='In-Progress'`)
            .where(`bo.status='In-Stores'`)

        const result_bo = await queryBuilderBO.getRawMany();

        return { parts: result, bo: result_bo };
    }

    async closeAssembly(closeOrderDto: CloseOrderDto) {
        const subTotalCount = await this.assemblySubRepo.count({ where: { order: { id: closeOrderDto.order_id } } })
        const subClosedCount = await this.assemblySubRepo.count({ where: { order: { id: closeOrderDto.order_id }, status: 'Assembly Completed' } })

        const mainTotalCount = await this.assemblyMainRepo.count({ where: { order: { id: closeOrderDto.order_id } } })
        const mainClosedCount = await this.assemblyMainRepo.count({ where: { order: { id: closeOrderDto.order_id }, status: 'Assembly Completed' } })

        const sectionTotalCount = await this.assemblySectionRepo.count({ where: { order: { id: closeOrderDto.order_id } } })
        const sectionClosedCount = await this.assemblySectionRepo.count({ where: { order: { id: closeOrderDto.order_id }, status: 'Assembly Completed' } })

        const assemblyCompleted =
            subTotalCount === subClosedCount &&
            mainTotalCount === mainClosedCount &&
            sectionTotalCount === sectionClosedCount

        if (!assemblyCompleted) {
            return { message: 'Assembly not completed' }
        } else {
            await this.productionMachinePartRepo.createQueryBuilder()
                .update(ProductionMachinePartEntity)
                .set({ status: 'Assembly Completed' })
                .where('order_id=:order_id', { order_id: closeOrderDto.order_id })
                .execute()

            await this.productionMachineBoughtoutRepo.createQueryBuilder()
                .update(ProductionMachineBoughtoutEntity)
                .set({ status: 'Assembly Completed' })
                .where('order_id=:order_id', { order_id: closeOrderDto.order_id })
                .execute()

            const existingOrder = await this.orderConfirmationRepository.findOne({ where: { id: closeOrderDto.order_id } })
            await this.orderConfirmationRepository.createQueryBuilder()
                .update(OrderConfirmationEntity)
                .set({ status: 'Assembly Completed' })
                .where('id=:id', { id: closeOrderDto.order_id })
                .execute()
            await this.historyRepo.save({
                parent_id: existingOrder.id,
                type: 'Order',
                type_id: existingOrder.id,
                type_name: existingOrder.id,
                data: { action: 'Completed Assembly' },
                remarks: closeOrderDto.remarks,
                from_status: existingOrder.status,
                to_status: 'Assembly Completed',
                order: existingOrder,
                changed_by: closeOrderDto.created_by
            })
            return { message: 'Assembly Completed successfully' }
        }
    }

    async closeOrder(closeOrderDto: CloseOrderDto) {
        const isOrderAssembled = await this.orderConfirmationRepository.findOne({ where: { id: closeOrderDto.order_id, status: 'Assembly Completed' } })
        if (isOrderAssembled) {
            await this.orderConfirmationRepository.createQueryBuilder()
                .update(OrderConfirmationEntity)
                .set({ status: 'Order Closed' })
                .where('id=:id', { id: closeOrderDto.order_id })
                .execute()
            await this.historyRepo.save({
                parent_id: isOrderAssembled.id,
                type: 'Order',
                type_id: isOrderAssembled.id,
                type_name: isOrderAssembled.id,
                data: { action: 'Closed Order' },
                remarks: closeOrderDto.remarks,
                from_status: isOrderAssembled.status,
                to_status: 'Order Closed',
                order: isOrderAssembled,
                changed_by: closeOrderDto.created_by
            })

            return { message: 'Order Closed successfully' }
        }
    }

    async getOrderHistory(orderId: UUID) {
        const result = await this.historyRepo.createQueryBuilder('o')
            .where('o.order_id=:id', { id: orderId })
            .orderBy('o.created_at', 'ASC')
            .getMany()
        return result;
    }

    async getOrderDetails(orderId: UUID) {
        return await this.orderConfirmationRepository.createQueryBuilder('orders')
            .leftJoinAndSelect('orders.machine', 'machine')
            .leftJoinAndSelect('orders.customer', 'customer')
            .leftJoinAndSelect('orders.quotation', 'quotation')
            .leftJoinAndSelect('orders.spares_quotation', 'spares_quotation')
            .select(['orders.id', 'orders.machine_name', 'machine.id', 'customer.id',
                'customer.customer_name', 'quotation.id', 'quotation.quotation_no', 'quotation.qty',
                'spares_quotation.id', 'spares_quotation.quotation_no', 'spares_quotation.qty'
            ])
            .where('orders.id=:id', { id: orderId })
            .getOne()
    }

    async generateDeliveryChallan(dto: GenerateDeliveryChallanDto) {
        const pendingParts = await this.productionMachinePartRepo.createQueryBuilder('production_part')
            .where('production_part.order_id = :order_id', { order_id: dto.order_id })
            .andWhere('production_part.part_id = :part_id', { part_id: dto.part_id })
            .andWhere('production_part.vendor_id = :vendor_id', { vendor_id: dto.vendor_id })
            .andWhere('production_part.status = :status', { status: 'Vendor In-Progress' })
            .andWhere('production_part.challan_no IS NULL')
            .getMany()

        if (pendingParts.length == 0) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'No pending vendor processes found to generate a delivery challan for'
            }, HttpStatus.BAD_REQUEST)
        }

        const vendor = await this.vendorRepo.findOne({ where: { id: dto.vendor_id } })
        const order = await this.orderConfirmationRepository.findOne({ where: { id: dto.order_id } })

        const count = await this.deliveryChallanRepo.count()
        const challan_no = `CE/DC/${String(count + 1).padStart(3, '0')}`

        const vendor_address = [vendor?.vendor_address1, vendor?.vendor_address2, vendor?.vendor_city,
            vendor?.vendor_state, vendor?.vendor_pincode].filter((v) => v && v.length > 0).join(', ')

        const line_items = pendingParts.map((p) => ({
            production_part_id: p.id,
            process_name: p.process_name,
            qty: p.order_qty,
            remarks: `Sending For ${p.process_name} Process`
        }))

        const savedChallan = await this.deliveryChallanRepo.save({
            challan_no,
            order_id: dto.order_id,
            order: order,
            part_id: dto.part_id,
            part_name: pendingParts[0].part_name,
            part_code: pendingParts[0].part_code,
            vendor_id: dto.vendor_id,
            vendor_name: vendor?.vendor_name,
            vendor_address,
            vendor_gst: vendor?.vendor_gst,
            challan_date: dto.challan_date,
            dispatch_mode: dto.dispatch_mode,
            vehicle_no: dto.vehicle_no,
            total_value: dto.total_value,
            line_items,
            created_by: dto.created_by
        })

        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({ challan_no, dc_id: savedChallan.id })
            .where('id IN (:...ids)', { ids: pendingParts.map((p) => p.id) })
            .execute()

        await this.historyRepo.save({
            parent_id: savedChallan.id,
            type: 'DeliveryChallan',
            type_id: dto.part_id,
            type_name: pendingParts[0].part_name,
            data: { action: 'Delivery Challan Generated', challan_no, line_items },
            from_status: 'Vendor In-Progress',
            to_status: 'DC Generated',
            order: order,
            changed_by: dto.created_by
        })

        return { message: 'Delivery Challan generated successfully', id: savedChallan.id, challan_no }
    }

    async getDeliveryChallanList(order_id: string) {
        const list = await this.deliveryChallanRepo.find({
            where: { order_id },
            order: { created_at: 'DESC' }
        })
        return { list }
    }

    async getDeliveryChallanDoc(id: UUID) {
        const challan = await this.deliveryChallanRepo.findOne({ where: { id } })
        if (!challan) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Delivery Challan not found'
            }, HttpStatus.NOT_FOUND)
        }

        const vendor = await this.vendorRepo.findOne({ where: { id: challan.vendor_id as UUID } })

        let rows = ''
        challan.line_items?.forEach((item: any, index: number) => {
            rows = rows + `<tr>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${index + 1}</td>
                <td style='border:1px solid #000;padding:6px;'>${item.process_name}</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>NOS</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${item.qty}</td>
                <td style='border:1px solid #000;padding:6px;'>${item.remarks}</td>
            </tr>`
        })

        const html = `<html>
        ${template_head}
        <body style='font-family:Arial,sans-serif;font-size:12px;'>
        <div style='width:750px;margin:auto;'>
            <table style='width:100%;border-collapse:collapse;border:1px solid #000;'>
                <tr>
                    <td style='border:1px solid #000;padding:6px;' colspan='2'>
                        <div style='display:flex;flex-direction:row;align-items:center;justify-content:space-between;'>
                            <img style='padding:3px;height:70px;' src='data:image/png;base64,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' />
                            <div style='font-size:11px;text-align:right;'>
                                <div><b>Confident Engineering</b></div>
                                <div>SF.465, Vattamalaipalayam, Near Kongu residency,</div>
                                <div>Ganga nursing college backside, Vellakinar, Coimbatore-641022.</div>
                                <div>Contact No: 9894611003 | Confidentengineering@gmail.Com | GSTIN:33ASOPM6527E1ZN</div>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;text-align:center;font-size:16px;font-weight:bold;' colspan='2'>
                        DELIVERY CHALLAN
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;width:60%;'>
                        <b>To</b><br/>
                        ${challan.vendor_name}<br/>
                        ${challan.vendor_address}<br/>
                        ${challan.vendor_gst ? `GST : ${challan.vendor_gst}` : ''}
                    </td>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;width:40%;'>
                        Challan No: ${challan.challan_no}<br/>
                        Challan Date: ${challan.challan_date}<br/>
                        Dispatch Mode: ${challan.dispatch_mode}<br/>
                        Vehicle No: ${challan.vehicle_no || ''}
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;' colspan='2'>
                        Dear Sir/Madam,<br/>
                        We have dispatched the following materials. Kindly acknowledge the same.<br/>
                        <i>Only For Job Work Purpose &mdash; Not For Sale</i>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:0;' colspan='2'>
                        <table style='width:100%;border-collapse:collapse;'>
                            <tr>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>S.No</td>
                                <td style='border:1px solid #000;padding:6px;'>Description</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>UOM</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>Qty</td>
                                <td style='border:1px solid #000;padding:6px;'>Remarks</td>
                            </tr>
                            ${rows}
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;text-align:right;' colspan='2'>
                        <b>Approximate Value: Rs. ${challan.total_value}/-</b>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;width:60%;font-size:11px;'>
                        Received the above goods in good condition.<br/>
                        Customer's Seal &amp; Signature.<br/><br/>
                        <b>Terms &amp; condition:</b><br/>
                        The above listed goods has been received without any damage and function issues.
                        Any shortage or damage of goods must be notified within 72 hours of receipt of goods.
                        Complaints can only be accepted if made in writing within 3 days of receipt of goods.
                    </td>
                    <td style='border:1px solid #000;padding:6px;vertical-align:bottom;text-align:center;width:40%;'>
                        <b>CONFIDENT ENGINEERING</b><br/>
                        Authorized Signature
                    </td>
                </tr>
            </table>
        </div>
        </body>
        </html>`

        return { html, vendor_mobile_no1: vendor?.vendor_mobile_no1 }
    }

    async uploadChallanPdf(file: Express.Multer.File) {
        return { message: 'File uploaded successfully', file_name: file.filename }
    }

    async generatePurchaseOrder(dto: GeneratePurchaseOrderDto) {
        const pendingBoughtouts = await this.productionMachineBoughtoutRepo.createQueryBuilder('production_boughtout')
            .where('production_boughtout.order_id = :order_id', { order_id: dto.order_id })
            .andWhere('production_boughtout.supplier_id = :supplier_id', { supplier_id: dto.supplier_id })
            .andWhere(`production_boughtout.supplier_accept_status = 'accepted'`)
            .andWhere('production_boughtout.po_id IS NULL')
            .getMany()

        if (pendingBoughtouts.length == 0) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'No accepted boughtout items found to generate a purchase order for'
            }, HttpStatus.BAD_REQUEST)
        }

        const supplier = await this.supplierRepository.findOne({ where: { id: dto.supplier_id } })
        const order = await this.orderConfirmationRepository.findOne({ where: { id: dto.order_id } })

        const now = new Date()
        const yy = now.getFullYear() % 100
        const fy = now.getMonth() >= 3 ? `${yy}-${yy + 1}` : `${yy - 1}-${yy}`
        const count = await this.purchaseOrderRepo.count()
        const po_no = `CE/PO/${fy}/${String(count + 1).padStart(3, '0')}`

        const supplier_address = [supplier?.supplier_address1, supplier?.supplier_address2, supplier?.supplier_city,
            supplier?.supplier_state, supplier?.supplier_pincode].filter((v) => v && v.length > 0).join(', ')

        const subtotal = dto.line_items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.rate)), 0)
        const gst_amount = subtotal * (Number(dto.gst_percent) / 100)
        const net_total = subtotal + gst_amount
        const amount_in_words = amountToWordsIndian(net_total)

        const line_items = dto.line_items.map((item) => ({
            ...item,
            amount: Number(item.qty) * Number(item.rate)
        }))

        const savedPo = await this.purchaseOrderRepo.save({
            po_no,
            order_id: dto.order_id,
            order,
            supplier_id: dto.supplier_id,
            supplier_name: supplier?.supplier_name,
            supplier_address,
            supplier_gst: supplier?.supplier_gst,
            po_date: dto.po_date,
            reference_doc_no: dto.reference_doc_no,
            payment_terms: dto.payment_terms,
            delivery_schedule: dto.delivery_schedule,
            line_items,
            subtotal: String(subtotal),
            gst_percent: String(dto.gst_percent),
            gst_amount: String(gst_amount),
            net_total: String(net_total),
            amount_in_words,
            terms: dto.terms,
            created_by: dto.created_by
        })

        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({ po_no, po_id: savedPo.id })
            .where('id IN (:...ids)', { ids: pendingBoughtouts.map((bo) => bo.id) })
            .execute()

        await this.historyRepo.save({
            parent_id: savedPo.id,
            type: 'PurchaseOrder',
            type_id: dto.supplier_id,
            type_name: supplier?.supplier_name,
            data: { action: 'Purchase Order Generated', po_no, line_items },
            from_status: 'Supplier Accepted',
            to_status: 'PO Generated',
            order: order,
            changed_by: dto.created_by
        })

        return { message: 'Purchase Order generated successfully', id: savedPo.id, po_no }
    }

    async getPurchaseOrderList(order_id: string) {
        const list = await this.purchaseOrderRepo.find({
            where: { order_id },
            order: { created_at: 'DESC' }
        })
        return { list }
    }

    async getPurchaseOrderDoc(id: UUID) {
        const po = await this.purchaseOrderRepo.findOne({ where: { id } })
        if (!po) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Purchase Order not found'
            }, HttpStatus.NOT_FOUND)
        }

        const supplier = await this.supplierRepository.findOne({ where: { id: po.supplier_id as UUID } })

        let rows = ''
        po.line_items?.forEach((item: any, index: number) => {
            rows = rows + `<tr>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${index + 1}</td>
                <td style='border:1px solid #000;padding:6px;'>${item.description}</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${item.qty}</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${item.uom || 'NOS'}</td>
                <td style='border:1px solid #000;padding:6px;text-align:right;'>${item.rate}</td>
                <td style='border:1px solid #000;padding:6px;text-align:right;'>${item.amount}</td>
                <td style='border:1px solid #000;padding:6px;'>${item.remarks || ''}</td>
            </tr>`
        })

        let termsRows = ''
        po.terms?.forEach((term: string) => {
            termsRows = termsRows + `<li>${term}</li>`
        })

        const html = `<html>
        ${template_head}
        <body style='font-family:Arial,sans-serif;font-size:12px;'>
        <div style='width:750px;margin:auto;'>
            <table style='width:100%;border-collapse:collapse;border:1px solid #000;'>
                <tr>
                    <td style='border:1px solid #000;padding:6px;' colspan='2'>
                        <div style='display:flex;flex-direction:row;align-items:center;justify-content:space-between;'>
                            <img style='padding:3px;height:70px;' src='data:image/png;base64,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' />
                            <div style='font-size:11px;text-align:right;'>
                                <div><b>Confident Engineering</b></div>
                                <div>Siteno:11, S.M.Nagar, NGGO Colony (P.O), Coimbatore</div>
                                <div>Contact No: 9894611003, 9489411001 | bava@confi.in | www.confi.in</div>
                                <div>GSTIN: 33ASOPM6527E1ZN</div>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;text-align:center;font-size:16px;font-weight:bold;' colspan='2'>
                        PURCHASE ORDER
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;width:60%;'>
                        <b>To</b><br/>
                        ${po.supplier_name}<br/>
                        ${po.supplier_address}<br/>
                        ${po.supplier_gst ? `GSTIN: ${po.supplier_gst}` : ''}
                    </td>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;width:40%;'>
                        PO No: ${po.po_no}<br/>
                        PO Date: ${po.po_date}<br/>
                        Ref Doc No: ${po.reference_doc_no || ''}<br/>
                        Payment Terms: ${po.payment_terms || ''}<br/>
                        Delivery Schedule: ${po.delivery_schedule || ''}
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:0;' colspan='2'>
                        <table style='width:100%;border-collapse:collapse;'>
                            <tr>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>S.No</td>
                                <td style='border:1px solid #000;padding:6px;'>Description</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>Qty</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>UOM</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;'>Rate</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;'>Amount</td>
                                <td style='border:1px solid #000;padding:6px;'>Remarks</td>
                            </tr>
                            ${rows}
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;text-align:right;' colspan='2'>
                        Subtotal: Rs. ${po.subtotal}<br/>
                        GST @${po.gst_percent}%: Rs. ${po.gst_amount}<br/>
                        <b>Net Total: Rs. ${po.net_total}</b>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;' colspan='2'>
                        <b>Amount in Words:</b> ${po.amount_in_words}
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;font-size:11px;' colspan='2'>
                        <b>Terms &amp; Conditions:</b>
                        <ol style='margin:4px 0 0 16px;padding:0;'>
                            ${termsRows}
                        </ol>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;text-align:right;font-size:11px;' colspan='2'>
                        For M/s. Confident Engineering<br/><br/><br/>
                        Authorized Signatory
                    </td>
                </tr>
            </table>
        </div>
        </body>
        </html>`

        return { html, supplier_mobile_no1: supplier?.supplier_mobile_no1 }
    }

    async uploadPoPdf(file: Express.Multer.File) {
        return { message: 'File uploaded successfully', file_name: file.filename }
    }

    async generateInvoice(dto: GenerateInvoiceDto) {
        const order = await this.orderConfirmationRepository.findOne({ where: { id: dto.order_id } })
        if (!order) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Order not found'
            }, HttpStatus.NOT_FOUND)
        }

        if (order.invoice_id) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Invoice already generated for this order'
            }, HttpStatus.BAD_REQUEST)
        }

        if (!['Assembly Completed', 'Order Closed'].includes(order.status)) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'Order must be ready to close or closed to generate an invoice'
            }, HttpStatus.BAD_REQUEST)
        }

        const now = new Date()
        const yy = now.getFullYear() % 100
        const fy = now.getMonth() >= 3 ? `${yy}/${yy + 1}` : `${yy - 1}/${yy}`
        const count = await this.invoiceRepo.count()
        const invoice_no = `NO-CE-${fy}-${String(count + 1).padStart(3, '0')}`

        const line_items = dto.line_items.map((item) => ({
            ...item,
            amount: Number(item.qty) * Number(item.rate)
        }))

        const subtotal = line_items.reduce((sum, item) => sum + item.amount, 0)
        const insurance_charges = Number(dto.insurance_charges) || 0
        const igst_amount = subtotal * (Number(dto.igst_percent) / 100)
        const total = subtotal + insurance_charges + igst_amount
        const amount_in_words = `INR ${amountToWordsIndian(total).replace('Rupees ', '')}`
        const tax_amount_in_words = `INR ${amountToWordsIndian(igst_amount).replace('Rupees ', '')}`

        const savedInvoice = await this.invoiceRepo.save({
            invoice_no,
            order_id: dto.order_id,
            order,
            customer_name: dto.customer_name,
            customer_address: dto.customer_address,
            customer_gst: dto.customer_gst,
            customer_state: dto.customer_state,
            invoice_date: dto.invoice_date,
            delivery_note: dto.delivery_note,
            delivery_note_date: dto.delivery_note_date,
            dispatch_doc_no: dto.dispatch_doc_no,
            dispatched_through: dto.dispatched_through,
            bill_of_lading_no: dto.bill_of_lading_no,
            bill_of_lading_date: dto.bill_of_lading_date,
            destination: dto.destination,
            vehicle_no: dto.vehicle_no,
            terms_of_delivery: dto.terms_of_delivery,
            mode_of_payment: dto.mode_of_payment,
            line_items,
            insurance_charges: String(insurance_charges),
            igst_percent: String(dto.igst_percent),
            subtotal: String(subtotal),
            igst_amount: String(igst_amount),
            total: String(total),
            amount_in_words,
            tax_amount_in_words,
            created_by: dto.created_by
        })

        await this.orderConfirmationRepository.createQueryBuilder()
            .update(OrderConfirmationEntity)
            .set({ invoice_id: savedInvoice.id, invoice_no })
            .where('id=:id', { id: dto.order_id })
            .execute()

        await this.historyRepo.save({
            parent_id: order.id,
            type: 'Order',
            type_id: order.id,
            type_name: order.id,
            data: { action: 'Invoice Generated', invoice_no },
            from_status: order.status,
            to_status: order.status,
            order,
            changed_by: dto.created_by
        })

        return { message: 'Invoice generated successfully', id: savedInvoice.id, invoice_no }
    }

    async getInvoiceList(order_id: string) {
        const list = await this.invoiceRepo.find({
            where: { order_id },
            order: { created_at: 'DESC' }
        })
        return { list }
    }

    async getInvoiceDoc(id: UUID) {
        const invoice = await this.invoiceRepo.findOne({ where: { id } })
        if (!invoice) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Invoice not found'
            }, HttpStatus.NOT_FOUND)
        }

        let rows = ''
        invoice.line_items?.forEach((item: any, index: number) => {
            rows = rows + `<tr>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${index + 1}</td>
                <td style='border:1px solid #000;padding:6px;'>${item.description}</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${item.hsn_sac || ''}</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${item.qty} ${item.unit || 'nos'}</td>
                <td style='border:1px solid #000;padding:6px;text-align:right;'>${item.rate}</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${item.unit || 'nos'}</td>
                <td style='border:1px solid #000;padding:6px;text-align:right;'>${Number(item.amount).toFixed(2)}</td>
            </tr>`
        })

        const igst_percent = Number(invoice.igst_percent) || 0
        const hsnGroups: { [key: string]: number } = {}
        invoice.line_items?.forEach((item: any) => {
            const key = item.hsn_sac || ''
            hsnGroups[key] = (hsnGroups[key] || 0) + Number(item.amount)
        })

        let hsnRows = ''
        Object.keys(hsnGroups).forEach((hsn) => {
            const taxable = hsnGroups[hsn]
            const tax = taxable * (igst_percent / 100)
            hsnRows = hsnRows + `<tr>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${hsn}</td>
                <td style='border:1px solid #000;padding:6px;text-align:right;'>${taxable.toFixed(2)}</td>
                <td style='border:1px solid #000;padding:6px;text-align:center;'>${igst_percent}%</td>
                <td style='border:1px solid #000;padding:6px;text-align:right;'>${tax.toFixed(2)}</td>
                <td style='border:1px solid #000;padding:6px;text-align:right;'>${tax.toFixed(2)}</td>
            </tr>`
        })

        const html = `<html>
        ${template_head}
        <body style='font-family:Arial,sans-serif;font-size:12px;'>
        <div style='width:750px;margin:auto;'>
            <table style='width:100%;border-collapse:collapse;border:1px solid #000;'>
                <tr>
                    <td style='border:1px solid #000;padding:6px;text-align:center;font-size:16px;font-weight:bold;' colspan='2'>
                        Tax Invoice
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;width:60%;'>
                        <div style='display:flex;flex-direction:row;align-items:center;'>
                            <img style='padding:3px;height:60px;' src='data:image/png;base64,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' />
                            <div style='font-size:11px;'>
                                <div style='font-weight:bold;'>CONFIDENT ENGINEERING</div>
                                <div>SF.No 465, Vattamalai Palayam, Near Kongu residency,</div>
                                <div>Vellakinar, Coimbatore - 641022.</div>
                                <div>GSTIN/UIN: 33ASOPM6527E1ZN</div>
                                <div>State Name: Tamil Nadu, Code: 33</div>
                                <div>E-Mail: Confidentengineering@gmail.com</div>
                            </div>
                        </div>
                    </td>
                    <td style='border:1px solid #000;padding:0;vertical-align:top;width:40%;'>
                        <table style='width:100%;border-collapse:collapse;'>
                            <tr>
                                <td style='border:1px solid #000;padding:4px;'>Invoice No.<br/><b>${invoice.invoice_no}</b></td>
                                <td style='border:1px solid #000;padding:4px;'>Dated<br/><b>${invoice.invoice_date}</b></td>
                            </tr>
                            <tr>
                                <td style='border:1px solid #000;padding:4px;'>Delivery Note<br/>${invoice.delivery_note || ''}</td>
                                <td style='border:1px solid #000;padding:4px;'>Mode/Terms of Payment<br/>${invoice.mode_of_payment || ''}</td>
                            </tr>
                            <tr>
                                <td style='border:1px solid #000;padding:4px;'>Dispatch Doc No.<br/>${invoice.dispatch_doc_no || ''}</td>
                                <td style='border:1px solid #000;padding:4px;'>Delivery Note Date<br/>${invoice.delivery_note_date || ''}</td>
                            </tr>
                            <tr>
                                <td style='border:1px solid #000;padding:4px;'>Dispatched through<br/>${invoice.dispatched_through || ''}</td>
                                <td style='border:1px solid #000;padding:4px;'>Destination<br/>${invoice.destination || ''}</td>
                            </tr>
                            <tr>
                                <td style='border:1px solid #000;padding:4px;'>Bill of Lading/LR-RR No.<br/>${invoice.bill_of_lading_no || ''} ${invoice.bill_of_lading_date ? `dt. ${invoice.bill_of_lading_date}` : ''}</td>
                                <td style='border:1px solid #000;padding:4px;'>Motor Vehicle No.<br/>${invoice.vehicle_no || ''}</td>
                            </tr>
                            <tr>
                                <td style='border:1px solid #000;padding:4px;' colspan='2'>Terms of Delivery<br/>${invoice.terms_of_delivery || ''}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;' colspan='2'>
                        <b>Consignee (Ship to) / Buyer (Bill to)</b><br/>
                        M/s ${invoice.customer_name}<br/>
                        ${invoice.customer_address || ''}<br/>
                        ${invoice.customer_gst ? `GSTIN/UIN: ${invoice.customer_gst}<br/>` : ''}
                        ${invoice.customer_state ? `State Name: ${invoice.customer_state}` : ''}
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:0;' colspan='2'>
                        <table style='width:100%;border-collapse:collapse;'>
                            <tr>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>Sl No.</td>
                                <td style='border:1px solid #000;padding:6px;'>Description of Goods</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>HSN/SAC</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>Quantity</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;'>Rate</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>per</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;'>Amount</td>
                            </tr>
                            ${rows}
                            <tr>
                                <td colspan='6' style='border:1px solid #000;padding:6px;text-align:right;'>Subtotal</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;'>${Number(invoice.subtotal).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan='6' style='border:1px solid #000;padding:6px;text-align:right;font-style:italic;'>Insurance Charges</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;'>${Number(invoice.insurance_charges).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan='6' style='border:1px solid #000;padding:6px;text-align:right;font-style:italic;'>Output Tax IGST@ ${invoice.igst_percent}%</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;'>${Number(invoice.igst_amount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan='6' style='border:1px solid #000;padding:6px;text-align:right;font-weight:bold;'>Total</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;font-weight:bold;'>Rs. ${Number(invoice.total).toFixed(2)}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;' colspan='2'>
                        <b>Amount Chargeable (in words):</b> ${invoice.amount_in_words}
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:0;' colspan='2'>
                        <table style='width:100%;border-collapse:collapse;'>
                            <tr>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>HSN/SAC</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>Taxable Value</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>IGST Rate</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>IGST Amount</td>
                                <td style='border:1px solid #000;padding:6px;text-align:center;'>Total Tax Amount</td>
                            </tr>
                            ${hsnRows}
                            <tr>
                                <td style='border:1px solid #000;padding:6px;text-align:right;font-weight:bold;'>Total</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;font-weight:bold;'>${Number(invoice.subtotal).toFixed(2)}</td>
                                <td style='border:1px solid #000;padding:6px;'></td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;font-weight:bold;'>${Number(invoice.igst_amount).toFixed(2)}</td>
                                <td style='border:1px solid #000;padding:6px;text-align:right;font-weight:bold;'>${Number(invoice.igst_amount).toFixed(2)}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;' colspan='2'>
                        <b>Tax Amount (in words):</b> ${invoice.tax_amount_in_words}
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;vertical-align:top;font-size:11px;width:60%;'>
                        <b>Declaration</b><br/>
                        We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                    </td>
                    <td style='border:1px solid #000;padding:6px;text-align:right;font-size:11px;width:40%;'>
                        for CONFIDENT ENGINEERING<br/><br/><br/>
                        Authorised Signatory
                    </td>
                </tr>
                <tr>
                    <td style='border:1px solid #000;padding:6px;text-align:center;font-size:11px;' colspan='2'>
                        SUBJECT TO COIMBATORE JURISDICTION<br/>
                        This is a Computer Generated Invoice
                    </td>
                </tr>
            </table>
        </div>
        </body>
        </html>`

        return { html }
    }

    async recordVendorProcessPayment(dto: RecordVendorProcessPaymentDto) {
        const productionPart = await this.productionMachinePartRepo.findOne({ where: { id: dto.production_part_id } })
        if (!productionPart) {
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: 'Production part not found'
            }, HttpStatus.NOT_FOUND)
        }

        const totalValue = Number(productionPart.cost) || 0
        const remaining = Math.max(0, totalValue - Number(dto.paid_amount))

        if (productionPart.vendor_id) {
            const vendor = await this.vendorRepo.findOne({ where: { id: productionPart.vendor_id as UUID } })
            if (vendor) {
                await this.vendorRepo.createQueryBuilder()
                    .update(VendorEntity)
                    .set({ pending_payment: String((Number(vendor.pending_payment) || 0) + remaining) })
                    .where('id = :id', { id: vendor.id })
                    .execute()
            }
        }

        if (Number(dto.paid_amount) > 0) {
            await this.vendorPaymentRepo.save({
                vendor_id: productionPart.vendor_id,
                order_id: productionPart.order_id,
                machine_id: productionPart.machine_id,
                part_id: productionPart.part_id,
                process: productionPart.process_name,
                paid_amount: String(dto.paid_amount),
                mode: dto.mode,
                remarks: dto.remarks,
                paid_by: dto.paid_by
            })
        }

        return { message: 'Vendor payment recorded successfully' }
    }

    async uploadVendorInvoice(file: Express.Multer.File, dto: UploadVendorInvoiceDto) {
        await this.vendorInvoiceRepo.save({
            order_id: dto.order_id,
            vendor_id: dto.vendor_id,
            machine_id: dto.machine_id,
            part_id: dto.part_id,
            process: dto.process,
            file_name: file.filename,
            file_type: file.mimetype,
            file_size: String(file.size),
            uploaded_by: dto.uploaded_by
        })

        return { message: 'Invoice uploaded successfully', file_name: file.filename }
    }
}
