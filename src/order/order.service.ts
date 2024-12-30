import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Pagination } from 'src/dto/pagination.dto';
import { ApproveQuotationDto, CloseOrderDto, CreateMachineQuotationDto, DeliverProductionMachinePartDto, MoveProductionMachinePartToVendorDto, RescheduleProductionMachinePartDto, SupplierQuotationDto, UpdateBoughtoutPaymentDto, UpdateProductionMachineBODto, UpdateProductionMachinePartDto, VendorQuotationDto } from 'src/dto/quotation.dto';
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
import { Repository } from 'typeorm';

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
        @InjectRepository(BoughtOutEntity) private boughtoutRepo: Repository<BoughtOutEntity>
    ) { }

    async getOrdersList(pagination: Pagination) {
        let query = await this.orderConfirmationRepository.createQueryBuilder('orders')
            .leftJoinAndSelect('orders.machine', 'machine')
            .leftJoinAndSelect('orders.customer', 'customer')
            .leftJoinAndSelect('orders.quotation', 'quotation')
            .select(['orders.id', 'orders.machine_name', 'customer.id',
                'customer.customer_name',
                'quotation.id',
                'orders.status',
                'quotation.quotation_no',
                'quotation.approved_cost'])
        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(machine.machine_name) LIKE :machineName', { machineName: `%${pagination.search.toLowerCase()}%` })
                .orWhere('LOWER(orders.status) LIKE :status', { status: `%${pagination.search.toLowerCase()}%` })
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
                // delivery_date: updateProductionMachinePart.delivery_date,
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
            type_id: currentObj.part_id,
            type_name: currentObj.part_name,
            data: { action: 'Order process completed by vendor' },
            remarks: deliverProductionMachinePart.remarks,
            from_status: currentObj.status,
            to_status: 'Completed',
            order: currentObj.order,
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
                type_id: productionPart.part_id,
                type_name: productionPart.part_name,
                data: { action: `Order process delivery rescheduled from ${productionPart.delivery_date} to ${rescheduleDto.reschedule_delivery_date}` },
                remarks: rescheduleDto.remarks,
                from_status: productionPart.status,
                to_status: productionPart.status,
                order: productionPart.order,
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
                    'production_part.part_name',
                    'production_part.vendor_id',
                    'production_part.vendor_name',
                    'production_part.process_id',
                    'production_part.process_name',
                    'production_part.order_qty',
                    'production_part.cost',
                    'production_part.delivery_date',
                    'production_part.reminder_date',
                    'production_part.status'
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
                    'production_part.part_name',
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
                    'production_boughtout.delivery_date',
                    'production_boughtout.reminder_date',
                    'production_boughtout.status'
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
                // delivery_date: updateProductionMachinePart.delivery_date,
                // reminder_date: updateProductionMachinePart.reminder_date,
                status: updateProductionMachineBO.status
            })
            .where('id=:id', { id: updateProductionMachineBO.production_part_id })
            .returning('*')
            .execute()

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

    async deliveryPendingParts() {
        const queryBuilder = this.orderConfirmationRepository
            .createQueryBuilder('o')
            .innerJoin(ProductionMachinePartEntity, 'pm', 'o.id = pm.order_id')
            .innerJoin(MachineQuotationEntity, 'q', 'q.id = o.quotation_id')
            .select([
                'q.quotation_no',
                'pm.part_name',
                'pm.order_qty',
                'o.machine_name',
                'pm.order_id',
                'COUNT(pm.part_name) AS part_name_count',
                'SUM(CASE WHEN pm.status = :status THEN 1 ELSE 0 END) AS completed_count',
            ])
            .groupBy('q.quotation_no')
            .addGroupBy('pm.part_name')
            .addGroupBy('pm.order_qty')
            .addGroupBy('o.machine_name')
            .addGroupBy('pm.order_id')
            .having('COUNT(pm.part_name) = SUM(CASE WHEN pm.status = :status THEN 1 ELSE 0 END)')
            .orderBy('q.quotation_no', 'ASC')
            .setParameters({
                status: 'Vendor process completed',
            });

        const result = await queryBuilder.getRawMany();

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
                'bo.order_id'
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
            .where('od.status NOT IN (:...status)', { status: ['Order Closed']})
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
            .where('od.status NOT IN (:...status)', { status: ['Order Closed']})
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
            .innerJoin(VendorEntity, 'v', 'pm.vendor_id = v.id::VARCHAR')
            .select([
                'pm.order_id',
                'q.quotation_no',
                'pm.part_name',
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
        const partsTotalCount = await this.productionMachinePartRepo.count({ where: { order_id: closeOrderDto.order_id } })
        const partsClosedCount = await this.productionMachinePartRepo.count({ where: { order_id: closeOrderDto.order_id, status: 'Assembly Completed' } })

        const boTotalCount = await this.productionMachineBoughtoutRepo.count({ where: { order_id: closeOrderDto.order_id } })
        const boClosedCount = await this.productionMachineBoughtoutRepo.count({ where: { order_id: closeOrderDto.order_id, status: 'Assembly Completed' } })

        let partsClosed = false
        let boClosed = false
        if (partsClosedCount == partsTotalCount) {
            partsClosed = true
        }
        if (boClosedCount == boTotalCount) {
            boClosed = true
        }

        if (!partsClosed) {
            return { message: 'Parts assembly not completed' }
        } else if (!boClosed) {
            return { message: 'Boughtout assembly not completed' }
        } else {
            const existingOrder = await this.orderConfirmationRepository.findOne({where: {id: closeOrderDto.order_id}})
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

    async getOrderHistory(orderId: UUID){
        const result = await this.historyRepo.createQueryBuilder('o')
                .where('o.order_id=:id', { id: orderId })
                .orderBy('o.created_at','ASC')
                .getMany()
        return result;
    }
}
