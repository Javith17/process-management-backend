import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Pagination } from 'src/dto/pagination.dto';
import { ApproveQuotationDto, CreateMachineQuotationDto, DeliverProductionMachinePartDto, MoveProductionMachinePartToVendorDto, RescheduleProductionMachinePartDto, SupplierQuotationDto, UpdateBoughtoutPaymentDto, UpdateProductionMachineBODto, UpdateProductionMachinePartDto, VendorQuotationDto } from 'src/dto/quotation.dto';
import { BoughtOutSuppliertEntity } from 'src/model/bought_out_supplier.entity';
import { MachineQuotationEntity } from 'src/model/machine_quotation.entity';
import { OrderConfirmationEntity } from 'src/model/order_confirmation.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { ProductionMachineBoughtoutEntity } from 'src/model/production_machine_boughtout.entity';
import { ProductionMachineHistoryEntity } from 'src/model/production_machine_history.entity';
import { ProductionMachinePartEntity } from 'src/model/production_machine_part.entity';
import { ProductionPartRescheduleEntity } from 'src/model/production_part_reschedule.entity';
import { UserEntity } from 'src/model/user.entity';
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
        @InjectRepository(ProductionMachineHistoryEntity) private historyRepo: Repository<ProductionMachineHistoryEntity>
    ) { }

    async getOrdersList(pagination: Pagination) {
        let query = await this.orderConfirmationRepository.createQueryBuilder('orders')
            .leftJoinAndSelect('orders.machine', 'machine')
            .leftJoinAndSelect('orders.customer', 'customer')
            .leftJoinAndSelect('orders.quotation', 'quotation')
            .select(['orders.id', 'orders.machine_name', 'customer.id',
                'customer.customer_name',
                'quotation.id',
                'quotation.quotation_no',
                'quotation.approved_cost'])
        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(machine.machine_name) LIKE :machineName', { machineName: `%${pagination.search.toLowerCase()}%` })
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
                status: 'Delivered'
            })
            .where('id=:id', { id: deliverProductionMachinePart.production_part_id })
            .returning('*')
            .execute()
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

    async getOrderDetail(order_id: string) {
        const result = await this.productionMachinePartRepo.createQueryBuilder('production_part')
            .leftJoinAndSelect('production_part.order', 'order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.quotation', 'quotation')
            .select([
                'production_part.id',
                'production_part.part_id',
                'order.id',
                'order.machine_name',
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
    }

    async getOrderDetailBoughtout(order_id: string) {
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
                'COUNT(pm.part_name) AS part_name_count',
                'SUM(CASE WHEN pm.status = :status THEN 1 ELSE 0 END) AS completed_count',
            ])
            .groupBy('q.quotation_no')
            .addGroupBy('pm.part_name')
            .addGroupBy('pm.order_qty')
            .addGroupBy('o.machine_name')
            .having('COUNT(pm.part_name) = SUM(CASE WHEN pm.status = :status THEN 1 ELSE 0 END)')
            .orderBy('q.quotation_no', 'ASC')
            .setParameters({
                status: 'Vendor process completed',
            });

        const result = await queryBuilder.getRawMany();

        return result;
    }
}
