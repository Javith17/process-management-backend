import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
const moment = require('moment');
import { quotation_terms, template_head } from 'src/common/constants';
import { Pagination } from 'src/dto/pagination.dto';
import { ApproveQuotationDto, CreateMachineQuotationDto, DeliverProductionMachinePartDto, MoveProductionMachinePartToVendorDto, RescheduleProductionMachinePartDto, SupplierQuotationDto, UpdateProductionMachineBODto, UpdateProductionMachinePartDto, VendorQuotationDto } from 'src/dto/quotation.dto';
import { BoughtOutEntity } from 'src/model/bought_out.entity';
import { BoughtOutSuppliertEntity } from 'src/model/bought_out_supplier.entity';
import { CustomerEntity } from 'src/model/customer.entity';
import { MachineEntity } from 'src/model/machine.entity';
import { MachineQuotationEntity } from 'src/model/machine_quotation.entity';
import { MainAssemblyEntity } from 'src/model/main_assembly.entity';
import { OrderConfirmationEntity } from 'src/model/order_confirmation.entity';
import { PartEntity } from 'src/model/part.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { PartProcessVendorEntity } from 'src/model/part_process_vendor.entity';
import { ProductionMachineBoughtoutEntity } from 'src/model/production_machine_boughtout.entity';
import { ProductionMachineHistoryEntity } from 'src/model/production_machine_history.entity';
import { ProductionMachinePartEntity } from 'src/model/production_machine_part.entity';
import { SectionAssemblyEntity } from 'src/model/section_assembly.entity';
import { SparesQuotationEntity } from 'src/model/spares_quotation.entity';
import { SubAssemblyEntity } from 'src/model/sub_assembly.entity';
import { SupplierEntity } from 'src/model/supplier.entity';
import { SupplierQuotationEntity } from 'src/model/supplier_quotation.entity';
import { UserEntity } from 'src/model/user.entity';
import { VendorEntity } from 'src/model/vendor.entity';
import { VendorQuotationEntity } from 'src/model/vendor_quotation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuotationService {
    constructor(
        @InjectRepository(MachineQuotationEntity) private machineQuotationRepository: Repository<MachineQuotationEntity>,
        @InjectRepository(MachineEntity) private machineRepository: Repository<MachineEntity>,
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(OrderConfirmationEntity) private orderConfirmationRepository: Repository<OrderConfirmationEntity>,
        @InjectRepository(SectionAssemblyEntity) private sectionAssemblyRepo: Repository<SectionAssemblyEntity>,
        @InjectRepository(MainAssemblyEntity) private mainAssemblyRepo: Repository<MainAssemblyEntity>,
        @InjectRepository(SubAssemblyEntity) private subAssemblyRepo: Repository<SubAssemblyEntity>,
        @InjectRepository(ProductionMachinePartEntity) private productionMachinePartRepo: Repository<ProductionMachinePartEntity>,
        @InjectRepository(ProductionMachineBoughtoutEntity) private productionMachineBoughtoutRepo: Repository<ProductionMachineBoughtoutEntity>,
        @InjectRepository(PartProcessEntity) private partProcessRepo: Repository<PartProcessEntity>,
        @InjectRepository(PartEntity) private partRepo: Repository<PartEntity>,
        @InjectRepository(VendorQuotationEntity) private vendorQuotationRepo: Repository<VendorQuotationEntity>,
        @InjectRepository(VendorEntity) private vendorRepo: Repository<VendorEntity>,
        @InjectRepository(PartProcessVendorEntity) private partProcessVendorRepo: Repository<PartProcessVendorEntity>,
        @InjectRepository(SupplierEntity) private supplierRepo: Repository<SupplierEntity>,
        @InjectRepository(BoughtOutEntity) private boughtoutRepo: Repository<BoughtOutEntity>,
        @InjectRepository(SupplierQuotationEntity) private supplierQuotationRepo: Repository<SupplierQuotationEntity>,
        @InjectRepository(BoughtOutSuppliertEntity) private boughoutSupplierRepo: Repository<BoughtOutSuppliertEntity>,
        @InjectRepository(ProductionMachineHistoryEntity) private historyRepo: Repository<ProductionMachineHistoryEntity>,
        @InjectRepository(SparesQuotationEntity) private sparesRepo: Repository<SparesQuotationEntity>
    ) { }

    async createMachineQuotation(machineQuotation: CreateMachineQuotationDto) {
        const machineObj = await this.machineRepository.findOne({ where: { id: machineQuotation.machine_id } })
        const customerObj = await this.customerRepository.findOne({ where: { id: machineQuotation.customer_id } })
        const followUpUserObj = await this.userRepository.findOne({ where: { id: machineQuotation.user_id } })

        if (machineQuotation.type.includes('Add')) {
            const createdByObj = await this.userRepository.findOne({ where: { id: machineQuotation.created_by } })
            await this.machineQuotationRepository.save({
                quotation_no: `MC-${new Date().getTime()}`,
                quotation_date: machineQuotation.quotation_date,
                reminder_date: machineQuotation.reminder_date,
                qty: machineQuotation.qty,
                machine: machineObj,
                customer: customerObj,
                user: followUpUserObj,
                created_by: createdByObj,
                remarks: machineQuotation.remarks,
                quotation_terms: machineQuotation.quotation_terms,
                initial_cost: machineQuotation.cost.toString(),
                status: 'Pending Verification'
            })
            return { message: 'Quotation created successfully' }
        } else {
            const existingMachine = await this.machineQuotationRepository.find({ select: ['id'], where: { id: machineQuotation.quotation_id } })
            if (existingMachine.length > 0) {
                await this.machineQuotationRepository.createQueryBuilder()
                    .update(MachineQuotationEntity)
                    .set({
                        quotation_date: machineQuotation.quotation_date,
                        reminder_date: machineQuotation.reminder_date,
                        qty: machineQuotation.qty,
                        machine: machineObj,
                        customer: customerObj,
                        user: followUpUserObj,
                        remarks: machineQuotation.remarks,
                        quotation_terms: machineQuotation.quotation_terms,
                        initial_cost: machineQuotation.cost.toString()
                    })
                    .where('id=:id', { id: machineQuotation.quotation_id })
                    .execute()
                return { message: 'Quotation updated successfully' }
            } else {
                return { message: 'Quotation not exists' }
            }
        }
    }

    async createSparesQuotation(sparesQuotation: CreateMachineQuotationDto) {
        const customerObj = await this.customerRepository.findOne({ where: { id: sparesQuotation.customer_id } })
        const followUpUserObj = await this.userRepository.findOne({ where: { id: sparesQuotation.user_id } })
        const machineObj = await this.machineRepository.findOne({ where: { id: sparesQuotation.machine_id } })

        if (sparesQuotation.type.includes('Add')) {
            const createdByObj = await this.userRepository.findOne({ where: { id: sparesQuotation.created_by } })
            await this.sparesRepo.save({
                quotation_no: `SP-${new Date().getTime()}`,
                quotation_date: sparesQuotation.quotation_date,
                reminder_date: sparesQuotation.reminder_date,
                qty: sparesQuotation.qty,
                spares: sparesQuotation.spares,
                customer: customerObj,
                user: followUpUserObj,
                machine: machineObj,
                created_by: createdByObj,
                remarks: sparesQuotation.remarks,
                quotation_terms: sparesQuotation.quotation_terms,
                initial_cost: sparesQuotation.cost.toString(),
                status: 'Pending Verification'
            })
            return { message: 'Quotation created successfully' }
        }
        // else {
        //     const existingMachine = await this.machineQuotationRepository.find({ select: ['id'], where: { id: machineQuotation.quotation_id } })
        //     if (existingMachine.length > 0) {
        //         await this.machineQuotationRepository.createQueryBuilder()
        //             .update(MachineQuotationEntity)
        //             .set({
        //                 quotation_date: machineQuotation.quotation_date,
        //                 reminder_date: machineQuotation.reminder_date,
        //                 qty: machineQuotation.qty,
        //                 machine: machineObj,
        //                 customer: customerObj,
        //                 user: followUpUserObj,
        //                 remarks: machineQuotation.remarks,
        //                 quotation_terms: machineQuotation.quotation_terms,
        //                 initial_cost: machineQuotation.cost.toString()
        //             })
        //             .where('id=:id', { id: machineQuotation.quotation_id })
        //             .execute()
        //         return { message: 'Quotation updated successfully' }
        //     } 
        else {
            return { message: 'Quotation not exists' }
        }
        // }
    }

    async deleteQuotation(id: UUID, type: string) {
        if (type == "vendor") {
            await this.vendorQuotationRepo.delete({ id: id })
            return { message: 'Quotation removed successfully' }
        } else {
            await this.supplierQuotationRepo.delete({ id: id })
            return { message: 'Quotation removed successfully' }
        }
    }

    async createVendorQuotation(vendorMachineQuotationDto: VendorQuotationDto) {
        const vendor = await this.vendorRepo.findOne({ where: { id: vendorMachineQuotationDto.vendor_id } })
        const part = await this.partRepo.findOne({ where: { id: vendorMachineQuotationDto.part_id } })

        const partProcessData: any = []
        vendorMachineQuotationDto.process_list.map((pl: any) => {
            partProcessData.push({
                process_id: pl.process_id,
                cost: pl.cost,
                process_name: pl.process_name,
                delivery_time: pl.delivery_time
            })
        })

        if (vendorMachineQuotationDto.type.includes('Add')) {
            const createdByObj = await this.userRepository.findOne({ where: { id: vendorMachineQuotationDto.created_by } })

            await this.vendorQuotationRepo.save({
                quotation_no: `VQ-${new Date().getTime()}`,
                quotation_date: vendorMachineQuotationDto.quotation_date,
                status: 'Pending Approval',
                remarks: vendorMachineQuotationDto.remarks,
                vendor: vendor,
                part: part,
                data: partProcessData,
                created_by: createdByObj
            })
            return { message: 'Quotation created successfully' }
        } else {
            const existingQuotation = await this.vendorQuotationRepo.findOne({ select: ['id'], where: { id: vendorMachineQuotationDto.quotation_id } })
            if (existingQuotation) {
                await this.machineQuotationRepository.createQueryBuilder()
                    .update(VendorQuotationEntity)
                    .set({
                        quotation_date: vendorMachineQuotationDto.quotation_date,
                        quotation_no: existingQuotation.quotation_no,
                        remarks: vendorMachineQuotationDto.remarks,
                        vendor: vendor,
                        part: part,
                        data: partProcessData,
                        status: existingQuotation.status
                    })
                    .where('id=:id', { id: vendorMachineQuotationDto.quotation_id })
                    .execute()
                return { message: 'Quotation updated successfully' }
            } else {
                return { message: 'Quotation not exists' }
            }
        }
    }

    async createSupplierQuotation(supplierQuotationDto: SupplierQuotationDto) {
        const supplier = await this.supplierRepo.findOne({ where: { id: supplierQuotationDto.supplier_id } })
        const bought_out = await this.boughtoutRepo.findOne({ where: { id: supplierQuotationDto.boughtout_id } })

        if (supplierQuotationDto.type.includes('Add')) {
            const createdByObj = await this.userRepository.findOne({ where: { id: supplierQuotationDto.created_by } })

            await this.supplierQuotationRepo.save({
                quotation_no: `SQ-${new Date().getTime()}`,
                quotation_date: supplierQuotationDto.quotation_date,
                status: 'Pending Approval',
                remarks: supplierQuotationDto.remarks,
                supplier: supplier,
                boughtout: bought_out,
                created_by: createdByObj,
                cost: supplierQuotationDto.cost,
                delivery_time: supplierQuotationDto.delivery_time
            })
            return { message: 'Quotation created successfully' }
        } else {
            const existingQuotation = await this.supplierQuotationRepo.findOne({ select: ['id'], where: { id: supplierQuotationDto.quotation_id } })
            if (existingQuotation) {
                await this.supplierQuotationRepo.createQueryBuilder()
                    .update(SupplierQuotationEntity)
                    .set({
                        quotation_date: supplierQuotationDto.quotation_date,
                        quotation_no: existingQuotation.quotation_no,
                        remarks: supplierQuotationDto.remarks,
                        supplier: supplier,
                        boughtout: bought_out,
                        status: existingQuotation.status,
                        cost: supplierQuotationDto.cost,
                        delivery_time: supplierQuotationDto.delivery_time
                    })
                    .where('id=:id', { id: supplierQuotationDto.quotation_id })
                    .execute()
                return { message: 'Quotation updated successfully' }
            } else {
                return { message: 'Quotation not exists' }
            }
        }
    }

    async machineQuotationList(pagination: Pagination) {
        let query = this.machineQuotationRepository.createQueryBuilder('machine_quotation')
            .leftJoinAndSelect('machine_quotation.machine', 'machine')
            .leftJoinAndSelect('machine_quotation.customer', 'customer')
            .leftJoinAndSelect('machine_quotation.user', 'user')
            .select([
                'machine_quotation.id',
                'machine_quotation.quotation_no',
                'machine_quotation.quotation_date',
                'machine_quotation.reminder_date',
                'machine_quotation.qty',
                'machine_quotation.remarks',
                'machine_quotation.approved_cost',
                'machine_quotation.quotation_terms',
                'machine.id',
                'machine.machine_name',
                'customer.id',
                'customer.customer_name',
                'customer.customer_address1',
                'customer.customer_address2',
                'customer.customer_mobile_no1',
                'customer.customer_city',
                'customer.customer_state',
                'customer.customer_pincode',
                'user.id',
                'user.emp_name',
                'machine_quotation.initial_cost',
                'machine_quotation.status'
            ])
            .orderBy('machine_quotation.created_at', 'DESC')

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

    async sparesQuotationList(pagination: Pagination) {
        let query = this.sparesRepo.createQueryBuilder('spares_quotation')
            .leftJoinAndSelect('spares_quotation.machine', 'machine')
            .leftJoinAndSelect('spares_quotation.customer', 'customer')
            .leftJoinAndSelect('spares_quotation.user', 'user')
            .select([
                'spares_quotation.id',
                'spares_quotation.quotation_no',
                'spares_quotation.quotation_date',
                'spares_quotation.reminder_date',
                'spares_quotation.qty',
                'spares_quotation.remarks',
                'spares_quotation.approved_cost',
                'spares_quotation.quotation_terms',
                'spares_quotation.spares',
                'machine.id',
                'machine.machine_name',
                'customer.id',
                'customer.customer_name',
                'customer.customer_address1',
                'customer.customer_address2',
                'customer.customer_mobile_no1',
                'customer.customer_city',
                'customer.customer_state',
                'customer.customer_pincode',
                'user.id',
                'user.emp_name',
                'spares_quotation.initial_cost',
                'spares_quotation.status'
            ])
            .orderBy('spares_quotation.created_at', 'DESC')

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(spares_quotation.spares) LIKE :name', { name: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }

    async machineQuotationListReminder(pagination: Pagination, date: string) {
        let query = this.machineQuotationRepository.createQueryBuilder('machine_quotation')
            .leftJoinAndSelect('machine_quotation.machine', 'machine')
            .leftJoinAndSelect('machine_quotation.customer', 'customer')
            .leftJoinAndSelect('machine_quotation.user', 'user')
            .select([
                'machine_quotation.id',
                'machine_quotation.quotation_no',
                'machine_quotation.quotation_date',
                'machine_quotation.reminder_date',
                'machine_quotation.qty',
                'machine_quotation.remarks',
                'machine.id',
                'machine.machine_name',
                'customer.id',
                'customer.customer_name',
                'user.id',
                'user.emp_name',
                'machine_quotation.initial_cost',
                'machine_quotation.status'
            ])
            .where(`to_char(machine_quotation.reminder_date, 'dd-MM-YYYY')=:date`, { date })

        let spare_query = this.sparesRepo.createQueryBuilder('spare_quotation')
            .leftJoinAndSelect('spare_quotation.machine', 'machine')
            .leftJoinAndSelect('spare_quotation.customer', 'customer')
            .leftJoinAndSelect('spare_quotation.user', 'user')
            .select([
                'spare_quotation.id',
                'spare_quotation.quotation_no',
                'spare_quotation.quotation_date',
                'spare_quotation.reminder_date',
                'spare_quotation.qty',
                'spare_quotation.remarks',
                'machine.id',
                'machine.machine_name',
                'customer.id',
                'customer.customer_name',
                'user.id',
                'user.emp_name',
                'spare_quotation.initial_cost',
                'spare_quotation.status',
                'spare_quotation.spares'
            ])
            .where(`to_char(spare_quotation.reminder_date, 'dd-MM-YYYY')=:date`, { date })

        // if (pagination?.page) {
        //     query = query
        //         .limit(pagination.limit)
        //         .offset((pagination.page - 1) * pagination.limit)
        // }

        if (pagination?.search) {
            query = query.andWhere('LOWER(machine.machine_name) LIKE :machineName', { machineName: `%${pagination.search.toLowerCase()}%` })
        }
        if (pagination?.search) {
            spare_query = spare_query.andWhere('LOWER(machine.machine_name) LIKE :machineName', { machineName: `%${pagination.search.toLowerCase()}%` })
            spare_query = spare_query.orWhere('LOWER(spare_quotation.spares) LIKE :spares', { spares: `%${pagination.search.toLowerCase()}%` })
        }

        const [machine_quotation, count] = await query.getManyAndCount();
        const [spare_quotation, spare_count] = await spare_query.getManyAndCount();
        const list = [];
        for (const mq of machine_quotation){
            list.push({
                id: mq.id,
                customer_name: mq.customer.customer_name,
                machine_name: mq.machine.machine_name,
                user: mq.user.emp_name,
                initial_cost: mq.initial_cost,
                quotation_date: mq.quotation_date,
                quotation_no: mq.quotation_no,
                reminder_date: mq.reminder_date,
                qty: mq.qty,
                status: mq.status,
                quotation_type: 'Machine',
                spares: []
            })
        }
        for (const sq of spare_quotation){
            list.push({
                id: sq.id,
                customer_name: sq.customer.customer_name,
                machine_name: sq.machine.machine_name,
                user: sq.user.emp_name,
                initial_cost: sq.initial_cost,
                quotation_date: sq.quotation_date,
                quotation_no: sq.quotation_no,
                reminder_date: sq.reminder_date,
                qty: sq.qty,
                status: sq.status,
                quotation_type: 'Spare',
                spares: sq.spares
            })
        }
        // const [list, count] = await query.getManyAndCount()
        return { list, count: count + spare_count }
    }

    async vendorQuotationList(pagination: Pagination) {
        let query = this.vendorQuotationRepo.createQueryBuilder('vendor_quotation')
            .leftJoinAndSelect('vendor_quotation.vendor', 'vendor')
            .leftJoinAndSelect('vendor_quotation.part', 'part')
            .select([
                'vendor_quotation.id',
                'vendor_quotation.quotation_no',
                'vendor_quotation.quotation_date',
                'vendor_quotation.remarks',
                'vendor.id',
                'vendor.vendor_name',
                'part.id',
                'part.part_name',
                'vendor_quotation.data',
                'vendor_quotation.status'
            ])

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        // if (pagination?.search) {
        //     query = query.andWhere('LOWER(machine.machine_name) LIKE :machineName', { machineName: `%${pagination.search.toLowerCase()}%` })
        // }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }

    async supplierQuotationList(pagination: Pagination) {
        let query = this.supplierQuotationRepo.createQueryBuilder('supplier_quotation')
            .leftJoinAndSelect('supplier_quotation.supplier', 'supplier')
            .leftJoinAndSelect('supplier_quotation.boughtout', 'boughtout')
            .select([
                'supplier_quotation.id',
                'supplier_quotation.quotation_no',
                'supplier_quotation.quotation_date',
                'supplier_quotation.remarks',
                'supplier.id',
                'supplier.supplier_name',
                'boughtout.id',
                'boughtout.bought_out_name',
                'supplier_quotation.cost',
                'supplier_quotation.delivery_time',
                'supplier_quotation.status'
            ])

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        // if (pagination?.search) {
        //     query = query.andWhere('LOWER(machine.machine_name) LIKE :machineName', { machineName: `%${pagination.search.toLowerCase()}%` })
        // }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }

    async approveRejectQuotation(approveDto: ApproveQuotationDto) {
        if (approveDto.quotation_type.includes('machine')) {
            const existingMachine = await this.machineQuotationRepository.find({ select: ['id'], where: { id: approveDto.quotation_id } })
            if (existingMachine.length > 0) {
                if (approveDto.quotation_type.includes('machine')) {
                    const updateObj = approveDto.status.includes('Approved') ? {
                        status: approveDto.status,
                        approval_remarks: approveDto.approval_reject_remarks,
                        approved_by: approveDto.approved_rejected_by,
                        approved_cost: approveDto.approved_cost.toString()
                    } : approveDto.status.includes('Verified') ? {
                        status: 'Pending Approval',
                        verification_remarks: approveDto.approval_reject_remarks,
                        verified_by: approveDto.approved_rejected_by,
                        approved_cost: approveDto.approved_cost?.toString()
                    } : {
                        status: approveDto.status,
                        reason: approveDto.approval_reject_remarks,
                        approved_by: approveDto.approved_rejected_by,
                        approved_cost: approveDto.approved_cost.toString()
                    }
                    const approvedQuotation = (await this.machineQuotationRepository.createQueryBuilder()
                        .update(MachineQuotationEntity)
                        .set(updateObj)
                        .where('id=:id', { id: approveDto.quotation_id })
                        .returning('*')
                        .execute())
                        .raw[0]

                    this.historyRepo.save({
                        parent_id: approveDto.quotation_id,
                        type: 'Quotation',
                        type_id: approveDto.quotation_id,
                        type_name: existingMachine[0].quotation_no,
                        data: { action: `${approveDto.status} Quotation` },
                        remarks: '',
                        from_status: '',
                        to_status: `${approveDto.status} Quotation`,
                        order: null
                    })

                    if (approveDto.status.includes('Approved')) {
                        await this.addOrderConfirmation(approvedQuotation)
                    }
                }
                return { message: `Quotation ${approveDto.status} successfully` }
            } else {
                return { message: 'Unable to update quotation status' }
            }
        }else if(approveDto.quotation_type.includes('spares')){
            const existingMachine = await this.sparesRepo.find({ select: ['id'], where: { id: approveDto.quotation_id } })
            if (existingMachine.length > 0) {
                    const updateObj = approveDto.status.includes('Approved') ? {
                        status: approveDto.status,
                        approval_remarks: approveDto.approval_reject_remarks,
                        approved_by: approveDto.approved_rejected_by,
                        approved_cost: approveDto.approved_cost.toString()
                    } : approveDto.status.includes('Verified') ? {
                        status: 'Pending Approval',
                        verification_remarks: approveDto.approval_reject_remarks,
                        verified_by: approveDto.approved_rejected_by,
                        approved_cost: approveDto.approved_cost.toString()
                    } : {
                        status: approveDto.status,
                        reason: approveDto.approval_reject_remarks,
                        approved_by: approveDto.approved_rejected_by,
                        approved_cost: approveDto.approved_cost.toString()
                    }
                    const approvedQuotation = (await this.sparesRepo.createQueryBuilder()
                        .update(SparesQuotationEntity)
                        .set(updateObj)
                        .where('id=:id', { id: approveDto.quotation_id })
                        .returning('*')
                        .execute())
                        .raw[0]

                    this.historyRepo.save({
                        parent_id: approveDto.quotation_id,
                        type: 'Quotation',
                        type_id: approveDto.quotation_id,
                        type_name: existingMachine[0].quotation_no,
                        data: { action: `${approveDto.status} Quotation` },
                        remarks: '',
                        from_status: '',
                        to_status: `${approveDto.status} Quotation`,
                        order: null
                    })

                    if (approveDto.status.includes('Approved')) {
                        await this.addSparesOrderConfirmation(approvedQuotation)
                    }
                

                return { message: `Quotation ${approveDto.status} successfully` }
            } else {
                return { message: 'Unable to update quotation status' }
            }
        } else if (approveDto.quotation_type.includes('vendor')) {
            const existingVendor = await this.vendorQuotationRepo.find({ select: ['id'], where: { id: approveDto.quotation_id } })
            if (existingVendor.length > 0) {
                const updateObj = approveDto.status.includes('Approved') ? {
                    status: approveDto.status,
                    approval_remarks: approveDto.approval_reject_remarks,
                    approved_by: approveDto.approved_rejected_by
                } : {
                    status: approveDto.status,
                    reason: approveDto.approval_reject_remarks,
                    approved_by: approveDto.approved_rejected_by
                }
                const approvedQuotation = (await this.vendorQuotationRepo.createQueryBuilder()
                    .update(VendorQuotationEntity)
                    .set(updateObj)
                    .where('id=:id', { id: approveDto.quotation_id })
                    .returning('*')
                    .execute())
                    .raw[0]

                if (approveDto.status.includes('Approved')) {
                    await this.addVendorQuotationConfirmatioin(approvedQuotation)
                }
                return { message: `Quotation ${approveDto.status} successfully` }
            } else {
                return { message: 'Unable to update quotation status' }
            }
        } else if (approveDto.quotation_type.includes('supplier')) {
            const existingSupplier = await this.supplierQuotationRepo.find({ select: ['id'], where: { id: approveDto.quotation_id } })
            if (existingSupplier.length > 0) {
                const updateObj = approveDto.status.includes('Approved') ? {
                    status: approveDto.status,
                    approval_remarks: approveDto.approval_reject_remarks,
                    approved_by: approveDto.approved_rejected_by
                } : {
                    status: approveDto.status,
                    reason: approveDto.approval_reject_remarks,
                    approved_by: approveDto.approved_rejected_by
                }
                const approvedQuotation = (await this.supplierQuotationRepo.createQueryBuilder()
                    .update(SupplierQuotationEntity)
                    .set(updateObj)
                    .where('id=:id', { id: approveDto.quotation_id })
                    .returning('*')
                    .execute())
                    .raw[0]

                if (approveDto.status.includes('Approved')) {
                    await this.addSupplierQuotationConfirmatioin(approvedQuotation)
                }
                return { message: `Quotation ${approveDto.status} successfully` }
            } else {
                return { message: 'Unable to update quotation status' }
            }
        }
    }

    async addVendorQuotationConfirmatioin(approvedQuotation: any) {
        const vendorObj = await this.vendorRepo.findOne({ where: { id: approvedQuotation.vendor_id } })
        approvedQuotation?.data?.forEach(async data => {
            const partProcessObj = await this.partProcessRepo.createQueryBuilder('part_process')
                .leftJoinAndSelect('part_process.process', 'process')
                .leftJoinAndSelect('part_process.part', 'part')
                .where('process.id=:id', { id: data.process_id })
                .andWhere('part.id=:part_id', { part_id: approvedQuotation.part_id })
                .getOne()
            const partProcessVendorObj = await this.partProcessVendorRepo.createQueryBuilder('part_process_vendor')
                .leftJoinAndSelect('part_process_vendor.part_process', 'part_process')
                .leftJoinAndSelect('part_process_vendor.vendor', 'vendor')
                .where('part_process.id=:id', { id: partProcessObj.id })
                .andWhere('vendor.id=:vendor_id', { vendor_id: approvedQuotation.vendor_id })
                .getOne()
            if (partProcessVendorObj) {
                await this.partProcessVendorRepo.createQueryBuilder()
                    .update(PartProcessVendorEntity)
                    .set({
                        part_process_vendor_price: data.cost,
                        part_process_vendor_delivery_time: data.delivery_time
                    })
                    .where('id=:id', { id: partProcessVendorObj.id })
                    .returning('*')
                    .execute()
            } else {
                const v = await this.partProcessVendorRepo.save({
                    part_process: partProcessObj,
                    part_process_vendor_price: data.cost,
                    part_process_vendor_delivery_time: data.delivery_time,
                    vendor: vendorObj
                })
            }
            await this.updatePartDays(approvedQuotation.part_id)
        })
    }

    async addSupplierQuotationConfirmatioin(approvedQuotation: any) {
        console.log(approvedQuotation)
        const supplierObj = await this.supplierRepo.findOne({ where: { id: approvedQuotation.supplier_id } })
        const boughoutSupplierObj = await this.boughoutSupplierRepo.createQueryBuilder('bought_out_supplier')
            .leftJoinAndSelect('bought_out_supplier.supplier', 'supplier')
            .leftJoinAndSelect('bought_out_supplier.bought_out', 'bought_out')
            .where('supplier.id=:id', { id: approvedQuotation.supplier_id })
            .andWhere('bought_out.id=:part_id', { part_id: approvedQuotation.bought_out_id })
            .getOne()
        if (boughoutSupplierObj) {
            await this.boughoutSupplierRepo.createQueryBuilder()
                .update(BoughtOutSuppliertEntity)
                .set({
                    cost: approvedQuotation.cost,
                    delivery_time: approvedQuotation.delivery_time
                })
                .where('id=:id', { id: boughoutSupplierObj.id })
                .returning('*')
                .execute()
        } else {
            const boughtoutObj = await this.boughtoutRepo.findOne({ where: { id: approvedQuotation.bought_out_id } })
            await this.boughoutSupplierRepo.save({
                bought_out: boughtoutObj,
                cost: approvedQuotation.cost,
                delivery_time: approvedQuotation.delivery_time,
                supplier: supplierObj
            })
        }
    }

    async updatePartDays(part_id: string) {
        const daysQuery = await this.partProcessVendorRepo.createQueryBuilder('v')
            .leftJoinAndSelect('v.part_process', 'part_process')
            .leftJoinAndSelect('part_process.part', 'part')
            .select(['min(v.part_process_vendor_delivery_time::int) as vl', 'part_process.id'])
            .groupBy('part_process.id')
            .where('part.id::VARCHAR=:id', { id: part_id })
            .getRawMany()
        const days = daysQuery.reduce((n, { vl }) => n + vl, 0)

        await this.partRepo.createQueryBuilder()
            .update(PartEntity).set({ days: days })
            .where('id::VARCHAR=:id', { id: part_id })
            .execute()
    }

    async addOrderConfirmation(approvedQuotation: any) {
        const machineObj = await this.machineRepository.findOne({ where: { id: approvedQuotation.machine_id } })
        const customerObj = await this.customerRepository.findOne({ where: { id: approvedQuotation.customer_id } })

        const parts: Array<{ id: string, name: string, qty: number, process?: any }> = []
        const boughtouts: Array<{ id: string, name: string, qty: number }> = []

        const orderConfirmation = await this.orderConfirmationRepository.save({
            machine: machineObj,
            customer: customerObj,
            quotation: approvedQuotation,
            machine_name: machineObj.machine_name,
            order_type: 'machine',
            status: 'Initiated'
        })

        const query = await this.sectionAssemblyRepo.createQueryBuilder('section_assembly')
            .leftJoinAndSelect('section_assembly.section_assembly_detail', 'section_assembly_detail')
            .leftJoinAndSelect('section_assembly_detail.part', 'section_part')
            .leftJoinAndSelect('section_assembly_detail.bought_out', 'section_bought_out')
            .leftJoinAndSelect('section_assembly_detail.sub_assembly', 'section_sub_assembly')
            .leftJoinAndSelect('section_assembly_detail.main_assembly', 'section_main_assembly')

            .leftJoinAndSelect('section_part.part_process_list', 'section_part_process_list')
            .leftJoinAndSelect('section_part_process_list.process', 'section_part_process')

            .leftJoinAndSelect('section_sub_assembly.sub_assembly_detail', 'sub_assembly_detail')

            .leftJoinAndSelect('sub_assembly_detail.part', 'sub_assembly_part')
            .leftJoinAndSelect('sub_assembly_part.part_process_list', 'sub_assembly_part_process_list')
            .leftJoinAndSelect('sub_assembly_part_process_list.process', 'sub_assembly_part_process')

            .leftJoinAndSelect('sub_assembly_detail.bought_out', 'sub_assembly_bought_out')

            .leftJoinAndSelect('section_main_assembly.main_assembly_detail', 'main_assembly_detail')

            .leftJoinAndSelect('main_assembly_detail.part', 'main_assembly_part')
            .leftJoinAndSelect('main_assembly_part.part_process_list', 'main_assembly_part_process_list')
            .leftJoinAndSelect('main_assembly_part_process_list.process', 'main_assembly_part_process')

            .leftJoinAndSelect('main_assembly_detail.bought_out', 'main_assembly_bought_out')

            .leftJoinAndSelect('main_assembly_detail.sub_assembly', 'main_assembly_sub')
            .leftJoinAndSelect('main_assembly_sub.sub_assembly_detail', 'main_assembly_sub_detail')

            .leftJoinAndSelect('main_assembly_sub_detail.part', 'main_assembly_sub_part')
            .leftJoinAndSelect('main_assembly_sub_part.part_process_list', 'main_assembly_sub_detail_part_process_list')
            .leftJoinAndSelect('main_assembly_sub_detail_part_process_list.process', 'main_assembly_sub_detail_part_process')

            .leftJoinAndSelect('main_assembly_sub_detail.bought_out', 'main_assembly_sub_bought_out')

            .select([
                'section_assembly.id',
                'section_assembly.section_assembly_name',

                'section_assembly_detail.id',
                'section_assembly_detail.qty',

                'section_part.id',
                'section_part.part_name',

                'section_part_process_list.id',
                'section_part_process.id',
                'section_part_process.process_name',

                'section_bought_out.id',
                'section_bought_out.bought_out_name',
                'section_sub_assembly.id',
                'section_sub_assembly.sub_assembly_name',
                'section_main_assembly.id',
                'section_main_assembly.main_assembly_name',

                'sub_assembly_detail.id',
                'sub_assembly_detail.qty',

                'sub_assembly_part.id',
                'sub_assembly_part.part_name',

                'sub_assembly_part_process_list.id',
                'sub_assembly_part_process.id',
                'sub_assembly_part_process.process_name',

                'sub_assembly_bought_out.id',
                'sub_assembly_bought_out.bought_out_name',

                'main_assembly_detail.id',
                'main_assembly_detail.qty',

                'main_assembly_part.id',
                'main_assembly_part.part_name',

                'main_assembly_part_process_list.id',
                'main_assembly_part_process.id',
                'main_assembly_part_process.process_name',

                'main_assembly_bought_out.id',
                'main_assembly_bought_out.bought_out_name',
                'main_assembly_sub.id',
                'main_assembly_sub.sub_assembly_name',

                'main_assembly_sub_detail.id',
                'main_assembly_sub_detail.qty',

                'main_assembly_sub_part.id',
                'main_assembly_sub_part.part_name',

                'main_assembly_sub_detail_part_process_list.id',
                'main_assembly_sub_detail_part_process.id',
                'main_assembly_sub_detail_part_process.process_name',

                'main_assembly_sub_bought_out.id',
                'main_assembly_sub_bought_out.bought_out_name'
            ])
            .where('section_assembly.machine_id=:machine_id', { machine_id: machineObj.id })
            .getMany()


        query[0].section_assembly_detail?.map((sd: any) => {
            if (sd.sub_assembly) {
                const sd_qty = sd.qty;
                sd.sub_assembly.sub_assembly_detail.map((sb: any) => {
                    if (sb.part) {
                        const p = parts.findIndex((f) => f.id == sb.part.id)
                        if (p < 0) {
                            parts.push({
                                id: sb.part.id, name: sb.part.part_name, qty: sb.qty * sd_qty, process: sb.part.part_process_list.map((pl: any) => {
                                    return { id: pl.process.id, process: pl.process.process_name }
                                })
                            })
                        } else {
                            parts[p] = { id: sb.part.id, name: sb.part.part_name, qty: (sb.qty * sd_qty) + parts[p].qty, process: parts[p].process }
                        }
                    } else if (sb.bought_out) {
                        const b = boughtouts.findIndex((f) => f.id == sb.bought_out.id)
                        if (b < 0) {
                            boughtouts.push({ id: sb.bought_out.id, name: sb.bought_out.bought_out_name, qty: sb.qty * sd_qty })
                        } else {
                            boughtouts[b] = { id: sb.bought_out.id, name: sb.bought_out.bought_out_name, qty: (sb.qty * sd_qty) + boughtouts[b].qty }
                        }
                    }
                })
            } else if (sd.main_assembly) {
                const sdm_qty = sd.qty;
                sd.main_assembly.main_assembly_detail.map((sdb: any) => {
                    if (sdb.sub_assembly) {
                        const sds_qty = sdb.qty * sdm_qty
                        sdb.sub_assembly.sub_assembly_detail.map((msb: any) => {
                            if (msb.part) {
                                const p = parts.findIndex((f) => f.id == msb.part.id)
                                if (p < 0) {
                                    parts.push({
                                        id: msb.part.id, name: msb.part.part_name, qty: msb.qty * sds_qty, process: msb.part.part_process_list.map((pl: any) => {
                                            return { id: pl.process.id, process: pl.process.process_name }
                                        })
                                    })
                                } else {
                                    parts[p] = { id: msb.part.id, name: msb.part.part_name, qty: (msb.qty * sds_qty) + parts[p].qty, process: parts[p].process }
                                }
                            } else if (msb.bought_out) {
                                const b = boughtouts.findIndex((f) => f.id == msb.bought_out.id)
                                if (b < 0) {
                                    boughtouts.push({ id: msb.bought_out.id, name: msb.bought_out.bought_out_name, qty: msb.qty * sds_qty })
                                } else {
                                    boughtouts[b] = { id: msb.bought_out.id, name: msb.bought_out.bought_out_name, qty: (msb.qty * sds_qty) + boughtouts[b].qty }
                                }
                            }
                        })
                    } else {
                        if (sdb.part) {
                            const p = parts.findIndex((f) => f.id == sdb.part.id)
                            if (p < 0) {
                                parts.push({
                                    id: sdb.part.id, name: sdb.part.part_name, qty: sdb.qty * sdm_qty, process: sdb.part.part_process_list.map((pl: any) => {
                                        return { id: pl.process.id, process: pl.process.process_name }
                                    })
                                })
                            } else {
                                parts[p] = { id: sdb.part.id, name: sdb.part.part_name, qty: (sdb.qty * sdm_qty) + parts[p].qty, process: parts[p].process }
                            }
                        } else if (sdb.bought_out) {
                            const b = boughtouts.findIndex((f) => f.id == sdb.bought_out.id)
                            if (b < 0) {
                                boughtouts.push({ id: sdb.bought_out.id, name: sdb.bought_out.bought_out_name, qty: sdb.qty * sdm_qty })
                            } else {
                                boughtouts[b] = { id: sdb.bought_out.id, name: sdb.bought_out.bought_out_name, qty: (sdb.qty * sdm_qty) + boughtouts[b].qty }
                            }
                        }
                    }
                })
            } else if (sd.part) {
                const p = parts.findIndex((f) => f.id == sd.part.id)
                if (p < 0) {
                    parts.push({
                        id: sd.part.id, name: sd.part.part_name, qty: sd.qty, process: sd.part.part_process_list.map((pl: any) => {
                            return { id: pl.process.id, process: pl.process.process_name }
                        })
                    })
                } else {
                    parts[p] = { id: sd.part.id, name: sd.part.part_name, qty: sd.qty + parts[p].qty, process: parts[p].process }
                }
            } else if (sd.bought_out) {
                const b = boughtouts.findIndex((f) => f.id == sd.bought_out.id)
                if (b < 0) {
                    boughtouts.push({ id: sd.bought_out.id, name: sd.bought_out.bought_out_name, qty: sd.qty })
                } else {
                    boughtouts[b] = { id: sd.bought_out.id, name: sd.bought_out.bought_out_name, qty: sd.qty + boughtouts[b].qty }
                }
            }
        })

        boughtouts.map(async (boughtout: any) => {
            await this.productionMachineBoughtoutRepo.save({
                bought_out_id: boughtout.id,
                bought_out_name: boughtout.name,
                required_qty: boughtout.qty,
                order_qty: boughtout.qty,
                status: 'Pending',
                machine_id: approvedQuotation.machine_id,
                order: orderConfirmation
            })
        })

        parts.map(async (part: any) => {
            const partDetail = await this.partRepo.findOne({ where: { id: part.id } })
            let orderQty = part.qty
            if (part.qty < partDetail.available_aty) {
                orderQty = '0'
            } else {
                if (part.qty > partDetail.minimum_stock_qty) {
                    orderQty = part.qty
                } else {
                    orderQty = partDetail.minimum_stock_qty
                }
            }
            part.process.map(async (process: any) => {
                await this.productionMachinePartRepo.save({
                    part_id: part.id,
                    part_name: part.name,
                    process_id: process.id,
                    process_name: process.process,
                    required_qty: part.qty,
                    order_qty: orderQty,
                    available_aty: partDetail.available_aty,
                    status: orderQty == '0' ? 'In-Stores' : 'Pending',
                    machine_id: approvedQuotation.machine_id,
                    order: orderConfirmation
                })
            })
        })

        this.historyRepo.save({
            parent_id: orderConfirmation.id,
            type: 'Order',
            type_id: orderConfirmation.id,
            type_name: orderConfirmation.machine_name,
            data: { action: 'Approved Order' },
            remarks: '',
            from_status: '',
            to_status: 'Approved order',
            order: orderConfirmation
        })
    }

    async addSparesOrderConfirmation(approvedQuotation: any) {
        const machineObj = await this.machineRepository.findOne({ where: { id: approvedQuotation.machine_id } })
        const customerObj = await this.customerRepository.findOne({ where: { id: approvedQuotation.customer_id } })

        const parts: Array<{ id: string, name: string, qty: number, process?: any }> = []
        const boughtouts: Array<{ id: string, name: string, qty: number }> = []
        
        const spares = JSON.parse(approvedQuotation.spares)
        
        const orderConfirmation = await this.orderConfirmationRepository.save({
            machine: machineObj,
            customer: customerObj,
            spares_quotation: approvedQuotation,
            machine_name: machineObj.machine_name,
            order_type: 'spares',
            status: 'Initiated'
        })
        
        spares.forEach(spare => {
            if (spare.spare_type == 'bought_out') {
                const b = boughtouts.findIndex((f) => f.id == spare.spare_id)
                if (b < 0) {
                    boughtouts.push({ id: spare.spare_id, name: spare.spare_name, qty: Number(spare.spare_qty) })
                } else {
                    boughtouts[b] = { id: spare.spare_id, name: spare.spare_name, qty: Number(spare.spare_qty) + Number(boughtouts[b].qty) }
                }
            }
        });

        if(spares.filter((spare:any) => spare.spare_type == 'part').length > 0){
            let partsQuery = await this.partRepo.createQueryBuilder('part')
            .leftJoinAndSelect('part.part_process_list', 'part_process_list')
            .leftJoinAndSelect('part_process_list.process', 'part_process')
            .where('part.id in (:...ids)', { ids: spares.filter((spare:any) => spare.spare_type == 'part').map((spare:any) => spare.spare_id)})
            .getMany()
            
            partsQuery.map((part:any) => {
                const subSpare = spares.filter((sp:any) => sp.spare_id == part.id && sp.spare_type == 'part')[0]
                const p = parts.findIndex((f) => f.id == part.id)
                    if (p < 0) {
                        parts.push({
                            id: part.id, name: part.part_name, qty: Number(subSpare.spare_qty), process: part.part_process_list.map((pl: any) => {
                                return { id: pl.process.id, process: pl.process.process_name }
                            })
                        })
                    } else {
                        parts[p] = { id: part.id, name: part.part_name, qty: Number(subSpare.spare_qty) + Number(parts[p].qty), process: parts[p].process }
                    }
            })
        }

        if(spares.filter((spare:any) => spare.spare_type == 'sub_assembly').length > 0){
            let subAssemblyQuery = await this.subAssemblyRepo.createQueryBuilder('sub')
            .leftJoinAndSelect('sub.sub_assembly_detail', 'sub_detail')
            .leftJoinAndSelect('sub_detail.part', 'sub_part')
            .leftJoinAndSelect('sub_part.part_process_list', 'sub_part_process_list')
            .leftJoinAndSelect('sub_part_process_list.process', 'sub_part_process')
            .leftJoinAndSelect('sub_detail.bought_out', 'sub_bought_out')
            .where('sub.id in (:...ids)', { ids: spares.filter((spare:any) => spare.spare_type == 'sub_assembly').map((spare:any) => spare.spare_id)})
            .getMany()

            subAssemblyQuery.map((sub:any) => {
                const subSpare = spares.filter((sp:any) => sp.spare_id == sub.id && sp.spare_type == 'sub_assembly')[0]
                sub.sub_assembly_detail?.map((sd: any) => {
                    if(sd.part){
                        const p = parts.findIndex((f) => f.id == sd.part.id)
                        if (p < 0) {
                            parts.push({
                                id: sd.part.id, name: sd.part.part_name, qty: Number(sd.qty) * Number(subSpare.spare_qty), process: sd.part.part_process_list.map((pl: any) => {
                                    return { id: pl.process.id, process: pl.process.process_name }
                                })
                            })
                        } else {
                            parts[p] = { id: sd.part.id, name: sd.part.part_name, qty: (Number(sd.qty) * Number(subSpare.spare_qty)) + Number(parts[p].qty), process: parts[p].process }
                        }
                    }else if(sd.bought_out){
                        const b = boughtouts.findIndex((f) => f.id == sd.bought_out.id)
                        if (b < 0) {
                            boughtouts.push({ id: sd.bought_out.id, name: sd.bought_out.bought_out_name, qty: Number(sd.qty) * Number(subSpare.spare_qty) })
                        } else {
                            boughtouts[b] = { id: sd.bought_out.id, name: sd.bought_out.bought_out_name, qty: (Number(sd.qty) * Number(subSpare.spare_qty)) + Number(boughtouts[b].qty) }
                        }
                    }
                })
            })
        }

        if(spares.filter((spare:any) => spare.spare_type == 'main_assembly').length > 0){
            let mainAssemblyQuery: any = await this.mainAssemblyRepo.createQueryBuilder('main')
            .leftJoinAndSelect('main.main_assembly_detail', 'main_detail')

            .leftJoinAndSelect('main_detail.part', 'main_part')
            .leftJoinAndSelect('main_part.part_process_list', 'main_part_process_list')
            .leftJoinAndSelect('main_part_process_list.process', 'main_part_process')

            .leftJoinAndSelect('main_detail.bought_out', 'main_bought_out')
            .leftJoinAndSelect('main_detail.sub_assembly', 'main_sub')

            .leftJoinAndSelect('main_sub.sub_assembly_detail', 'sub_detail')
            .leftJoinAndSelect('sub_detail.part', 'sub_part')
            .leftJoinAndSelect('sub_part.part_process_list', 'sub_part_process_list')
            .leftJoinAndSelect('sub_part_process_list.process', 'sub_part_process')
            .leftJoinAndSelect('sub_detail.bought_out', 'sub_bought_out')
            .where('main.id in (:...ids)', { ids: spares.filter((spare:any) => spare.spare_type == 'main_assembly').map((spare:any) => spare.spare_id)})
            .getMany()

            mainAssemblyQuery.map((main:any) => {
                const subSpare = spares.filter((sp:any) => sp.spare_id == main.id && sp.spare_type == 'main_assembly')[0]
                main.main_assembly_detail?.map((sd: any) => {
                    if(sd.part){
                        const p = parts.findIndex((f) => f.id == sd.part.id)
                        if (p < 0) {
                            parts.push({
                                id: sd.part.id, name: sd.part.part_name, qty: Number(sd.qty) * Number(subSpare.spare_qty), process: sd.part.part_process_list.map((pl: any) => {
                                    return { id: pl.process.id, process: pl.process.process_name }
                                })
                            })
                        } else {
                            parts[p] = { id: sd.part.id, name: sd.part.part_name, qty: (Number(sd.qty) * Number(subSpare.spare_qty)) + Number(parts[p].qty), process: parts[p].process }
                        }
                    }else if(sd.bought_out){
                        const b = boughtouts.findIndex((f) => f.id == sd.bought_out.id)
                        if (b < 0) {
                            boughtouts.push({ id: sd.bought_out.id, name: sd.bought_out.bought_out_name, qty: Number(sd.qty) * Number(subSpare.spare_qty) })
                        } else {
                            boughtouts[b] = { id: sd.bought_out.id, name: sd.bought_out.bought_out_name, qty: (Number(sd.qty) * Number(subSpare.spare_qty)) + Number(boughtouts[b].qty) }
                        }
                    }else if(sd.sub_assembly){
                        sd.sub_assembly.sub_assembly_detail.map((sad:any) => {
                            if(sad.part){
                                const p = parts.findIndex((f) => f.id == sad.part.id)
                                if (p < 0) {
                                    parts.push({
                                        id: sad.part.id, name: sad.part.part_name, 
                                        qty: Number(sad.qty) * Number(sd.qty) * Number(subSpare.spare_qty), 
                                        process: sad.part.part_process_list.map((pl: any) => {
                                            return { id: pl.process.id, process: pl.process.process_name }
                                        })
                                    })
                                } else {
                                    parts[p] = { id: sad.part.id, name: sad.part.part_name, 
                                        qty: (Number(sad.qty) * Number(sd.qty) * Number(subSpare.spare_qty)) + Number(parts[p].qty), 
                                        process: parts[p].process }
                                }
                            }else if(sad.bought_out){
                                const b = boughtouts.findIndex((f) => f.id == sad.bought_out.id)
                                if (b < 0) {
                                    boughtouts.push({ id: sad.bought_out.id, name: sad.bought_out.bought_out_name, 
                                        qty: Number(sad.qty) * Number(sd.qty) * Number(subSpare.spare_qty) })
                                } else {
                                    boughtouts[b] = { id: sad.bought_out.id, name: sad.bought_out.bought_out_name, 
                                        qty: (Number(sad.qty) * Number(sd.qty) * Number(subSpare.spare_qty)) + Number(boughtouts[b].qty) }
                                }
                            }
                        })
                    }
                })
            })
        }

        boughtouts.map(async (boughtout: any) => {
            await this.productionMachineBoughtoutRepo.save({
                bought_out_id: boughtout.id,
                bought_out_name: boughtout.name,
                required_qty: boughtout.qty,
                order_qty: boughtout.qty,
                status: 'Pending',
                machine_id: approvedQuotation.machine_id,
                order: orderConfirmation
            })
        })

        parts.map(async (part: any) => {
            const partDetail = await this.partRepo.findOne({ where: { id: part.id } })
            let orderQty = part.qty
            if (part.qty < partDetail.available_aty) {
                orderQty = '0'
            } else {
                if (part.qty > partDetail.minimum_stock_qty) {
                    orderQty = part.qty
                } else {
                    orderQty = partDetail.minimum_stock_qty
                }
            }
            part.process.map(async (process: any) => {
                await this.productionMachinePartRepo.save({
                    part_id: part.id,
                    part_name: part.name,
                    process_id: process.id,
                    process_name: process.process,
                    required_qty: part.qty,
                    order_qty: orderQty,
                    available_aty: partDetail.available_aty,
                    status: orderQty == '0' ? 'In-Stores' : 'Pending',
                    machine_id: approvedQuotation.machine_id,
                    order: orderConfirmation
                })
            })
        })

        this.historyRepo.save({
            parent_id: orderConfirmation.id,
            type: 'Order',
            type_id: orderConfirmation.id,
            type_name: orderConfirmation.machine_name,
            data: { action: 'Approved Order' },
            remarks: '',
            from_status: '',
            to_status: 'Approved order',
            order: orderConfirmation
        })
    }

    async generateInvoiceDocument(id: UUID, type: string) {
        var converter = require('number-to-words');
        let quotation;
        let machines = ''

        let cost = 0
        let gst = 0
        let total = 0

        if (type == "machine") {
            quotation = await this.machineQuotationRepository.createQueryBuilder('q')
                .innerJoinAndSelect('q.customer', 'customer')
                .innerJoinAndSelect('q.machine', 'machine')
                .where('q.id=:id', { id })
                .getOne()

            cost = Number(quotation.initial_cost)
            gst = (Number(quotation.initial_cost) / 100) * 18
            total = gst + Number(quotation.initial_cost)

            machines = `<tr style='mso-yfti-irow:5;height:44.5pt'>
                <td width=51 style='width:38.0pt;border:solid windowtext 1.0pt;border-top:
                none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
                mso-border-left-alt:solid windowtext 1.0pt;padding:5.65pt 0cm 0cm 5.65pt;
                height:44.5pt'>
                <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
                "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
                major-latin'>1.<o:p></o:p></span></p>
                </td>
                <td width=337 style='width:253.0pt;border:none;border-bottom:solid windowtext 1.0pt;
                mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
                mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
                mso-border-bottom-alt:solid windowtext .5pt;padding:5.65pt 0cm 0cm 5.65pt;
                height:44.5pt'>
                <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
                "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
                major-latin'>${quotation.machine.machine_name}<o:p></o:p></span></p>
                </td>
                <td width=239 colspan=2 style='width:179.0pt;border:solid windowtext 1.0pt;
                border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
                padding:5.65pt 0cm 0cm 5.65pt;height:44.5pt'>
                <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
                "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
                major-latin'>${quotation.qty}<o:p></o:p></span></p>
                </td>
                <td width=253 colspan=2 style='width:190.0pt;border-top:none;border-left:
                none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
                mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
                mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt;height:44.5pt'>
                <p class=MsoNormal align=right style='text-align:right'><span
                style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
                mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>${cost.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}<o:p></o:p></span></p>
                </td>
                </tr>`
        } else if (type == "spares") {
            quotation = await this.sparesRepo.createQueryBuilder('q')
                .innerJoinAndSelect('q.customer', 'customer')
                .innerJoinAndSelect('q.machine', 'machine')
                .where('q.id=:id', { id })
                .getOne()

            quotation.spares.forEach((spare: any, index: number) => {
                cost += Number(spare.spare_cost)
                gst = (Number(cost) / 100) * 18
                total = gst + Number(cost)

                machines = machines + `<tr style='mso-yfti-irow:5;height:44.5pt'>
                <td width=51 style='width:38.0pt;border:solid windowtext 1.0pt;border-top:
                none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
                mso-border-left-alt:solid windowtext 1.0pt;padding:5.65pt 0cm 0cm 5.65pt;
                height:44.5pt'>
                <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
                "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
                major-latin'>${index + 1}.<o:p></o:p></span></p>
                </td>
                <td width=337 style='width:253.0pt;border:none;border-bottom:solid windowtext 1.0pt;
                mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
                mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
                mso-border-bottom-alt:solid windowtext .5pt;padding:5.65pt 0cm 0cm 5.65pt;
                height:44.5pt'>
                <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
                "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
                major-latin'>${spare.spare_name}<o:p></o:p></span></p>
                </td>
                <td width=239 colspan=2 style='width:179.0pt;border:solid windowtext 1.0pt;
                border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
                padding:5.65pt 0cm 0cm 5.65pt;height:44.5pt'>
                <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
                "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
                major-latin'>${spare.spare_qty}<o:p></o:p></span></p>
                </td>
                <td width=253 colspan=2 style='width:190.0pt;border-top:none;border-left:
                none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
                mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
                mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt;height:44.5pt'>
                <p class=MsoNormal align=right style='text-align:right'><span
                style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
                mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>${Number(spare.spare_cost).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}<o:p></o:p></span></p>
                </td>
                </tr>`
            })
        }

        let conditions = ''
        quotation.quotation_terms?.forEach((term: string) => {
            conditions = conditions + `<p class=MsoListParagraphCxSpFirst style='text-indent:-18.0pt;line-height:
            150%;mso-list:l1 level1 lfo2'><![if !supportLists]><span style='font-size:
            9.0pt;line-height:150%;font-family:Symbol;mso-fareast-font-family:Symbol;
            mso-bidi-font-family:Symbol'><span style='mso-list:Ignore'>·<span
            style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><![endif]><span
            style='font-size:9.0pt;line-height:150%;font-family:"Aptos Display",sans-serif;
            mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>${term}<o:p></o:p></span></p>`
        })

        return `<html xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-com:office:word"
        xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
        xmlns="http://www.w3.org/TR/REC-html40">

        ${template_head}

        <body lang=EN-IN style='tab-interval:36.0pt;word-wrap:break-word'>

        <div class=WordSection1>

        <table class=MsoNormalTable border=0 cellspacing=0 cellpadding=0
        style='margin-left:.25pt;border-collapse:collapse;mso-yfti-tbllook:1184;
        mso-padding-alt:5.65pt 0cm 0cm 5.65pt'>
        <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes;height:16.65pt'>
        <td width=880 colspan=6 style='width:660.0pt;border:solid windowtext 1.0pt;
        padding:0cm 5.4pt 0cm 5.4pt;height:16.65pt'>
            <div style='display:flex; flex-direction:row;'>
                    <img style='padding:3px;' src='data:image/png;base64,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' />
                    <img style='padding:3px; margin-left:auto;' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWIAAABVCAMAAABEih7pAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHmUExURcF9btxxZ/FiW/tdVv9eUf5eSfljSPllR/tjSP5hSf9gSvxhS/lhTPdiSvZiSPtgSP9dR/1eSftfSfpeSPldR/hcRvdbRfZaRPVZQ/RYQvNXQfJWQPFVP/BUPu9TPe5SPO1RO+xQOutPOepOOOlNN+hMNudLNeZKNOVJM+RIMuNHMeJGMOFFL+BELt9DLd5CLN1BK9xAKts/Kdo+KNk9J9g8Jtc7Jdc7JNY6I9U5ItQ4IdM3INI2H9E1HtA0Hc8zHM4yG80xGswwGcsvGMouF8ktFsgsFccrFMYqE8UpEsQoEcMnEMImD8ElDsAkDb8jDL4iC70hCrwgCbsfCLoeB7kdBrgcBbcbBLYaA7UZArQYAdY6JNU5I9Q4ItM3IfxkSP9iSv9hS/1iTPpiTfhjS/djSfxhSf9eSP5eSNtxZ/hlR/djS8F9bdpxZ/BiXPteVf9fUP5eSvdmR/tkSP5iSv5iS/ZkS/ZjSvtgSf9eScF+bdpyZ/tfVv9gUP5fSvlkSP1iSvZkTMF+btpyaPBjXf9hUf5gSflkR/plSPxjSv1jS/xiTPliTfZjS/phSf5fSf9fSfxgSsF/btpzaPBkXftgV/ZkTdpzZ+9lXPthVv9hUvZnRvllSP1jSvVjS/lhSu9lW/ZnRcMs6H8AAAAJcEhZcwAADsQAAA7EAZUrDhsAAAJGSURBVHhe7dDrW8thHMfxOTVzzGYmk8xMksxMNsnKZJJkZmZrGsr5EJZTJELOTM7nw3/qvu/v72EPcLXryuX9fvD5PH/ZbFOmTps+o8I+0zFr9py58+ZXVi5wOl0u10LJ7V4keTyLraqqlkhe71Kpurp6mVRTs1zy+XwrJL9/pRQIBFZJtbWrpbq6NVb19WulhoZ1UjAYXC+FQhukcDi8UWps3KSKRCLRaHSz1NS0RWpu3irFYrEWqbV1mxSPx7dLbW07pEQisVNqb98ldXTsturs3CN1de2VksnkPimV2i+l0+kDUiZzUMpmszmpuxtiiCGGGGKILWGIIYYYYoghhhhiiCGGWAUxxBBDDDHEZSFWqw5iiCGGGGKILWGIIYYYYoghhhhiiCGGWAUxxBBDDPE/SqzK5/OHpJ6eQqEAMcQQQwwxxBBDDLEVxBBDDDHEEEMMMcQQQwwxxJOX+PCRo719x46fOHlqHGK3Po9qHGKvOUsZYlXGnPaFGGKIIYYYYoghVkEMMcQQQwwxxBBD/N8QnzbEZwzxWYjLQHzufP+Fi5cqigOXr/T2Xb12fXAQ4gkmvnGzf+jW8O3iwB1FPAJxGYjv3rs/NPrgYfHR4ydPn408f1F6OTw25jTKOo1sEmKdRjZpZNNvEPvNWcp/QKxWXUg1qYjVqktJoqzTyCYhzplsr16/eTvqsAvxO4jLQfz+w8dPDvvnL1818bfvpRLEE078QxP/hBhiiCGGGGKIIYYYYoghhhhiiCGGGGKI/5o4l/sFyUEap3jQAVYAAAAASUVORK5CYII=' />
            </div>
        </td>
        </tr>
        <tr style='mso-yfti-irow:0;mso-yfti-firstrow:yes;height:16.65pt'>
        <td width=880 colspan=6 style='width:660.0pt;border:solid windowtext 1.0pt;
        padding:0cm 5.4pt 0cm 5.4pt;height:16.65pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>QUOTATION<o:p></o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:1;height:21.0pt'>
        <td width=627 colspan=4 style='width:470.0pt;border:solid windowtext 1.0pt;
        border-top:none;padding:0cm 5.4pt 0cm 5.4pt;height:21.0pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>DETAILS OF
        RECIEVER<o:p></o:p></span></p>
        </td>
        <td width=83 style='width:62.5pt;border-top:none;border-left:none;border-bottom:
        solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;padding:0cm 5.4pt 0cm 5.4pt;
        height:21.0pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>DATE<o:p></o:p></span></p>
        </td>
        <td width=170 style='width:127.5pt;border-top:none;border-left:none;
        border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        padding:0cm 5.4pt 0cm 5.4pt;height:21.0pt'>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'>${moment(new Date(quotation?.created_at)).format('DD-MM-YYYY')}<o:p></o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:2;height:20.0pt'>
        <td width=627 colspan=4 rowspan=2 valign=top style='width:470.0pt;border:
        solid windowtext 1.0pt;border-top:none;mso-border-left-alt:solid windowtext 1.0pt;
        mso-border-bottom-alt:solid windowtext .5pt;mso-border-right-alt:solid windowtext .5pt;
        padding:0cm 5.4pt 0cm 5.4pt;height:20.0pt'>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin'><br>
        To<o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin;margin-left:10pt;'>${quotation.customer.customer_name} <br><o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin;margin-left:10pt;'>
        ${quotation.customer.customer_address1} ${quotation.customer.customer_address2} <br> <o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin;margin-left:10pt;'>
        ${quotation.customer.customer_city} - ${quotation.customer.customer_pincode}<br><o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin;margin-left:10pt;'>
        ${quotation.customer.customer_state} <br> <o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin;margin-left:10pt;'>
        GST:${quotation.customer.customer_gst} <o:p></o:p></span></p>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'>&nbsp;<o:p></o:p></span></p>
        </td>
        <td width=83 style='width:62.5pt;border-top:none;border-left:none;border-bottom:
        solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;mso-border-left-alt:
        solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt;height:20.0pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>QUOTE NO.<o:p></o:p></span></p>
        </td>
        <td width=170 style='width:127.5pt;border-top:none;border-left:none;
        border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        padding:0cm 5.4pt 0cm 5.4pt;height:20.0pt'>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'>${quotation.quotation_no}<o:p></o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:3;height:55.0pt'>
        <td width=253 colspan=2 valign=top style='width:190.0pt;border-top:none;
        border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        mso-border-left-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-bottom-alt:solid windowtext .5pt;mso-border-right-alt:solid windowtext .5pt;
        padding:0cm 5.4pt 0cm 5.4pt;height:55.0pt'>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'><o:p>&nbsp;</o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:4;height:16.5pt'>
        <td width=51 style='width:38.0pt;border:solid windowtext 1.0pt;border-top:
        none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
        mso-border-left-alt:solid windowtext 1.0pt;padding:5.65pt 0cm 0cm 5.65pt;
        height:16.5pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>SI.NO<o:p></o:p></span></p>
        </td>
        <td width=337 style='width:253.0pt;border:none;border-bottom:solid windowtext 1.0pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-bottom-alt:solid windowtext .5pt;padding:5.65pt 0cm 0cm 5.65pt;
        height:16.5pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>DESCRIPTION<o:p></o:p></span></p>
        </td>
        <td width=239 colspan=2 style='width:179.0pt;border:solid windowtext 1.0pt;
        border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
        padding:5.65pt 0cm 0cm 5.65pt;height:16.5pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>QTY/SPINDLE<o:p></o:p></span></p>
        </td>
        <td width=253 colspan=2 style='width:190.0pt;border-top:none;border-left:
        none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt;height:16.5pt'>
        <p class=MsoNormal align=center style='text-align:center'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>AMOUNT<o:p></o:p></span></p>
        </td>
        </tr>
        ${machines}
        <tr style='mso-yfti-irow:6;height:19.5pt'>
        <td colspan=4 style='border:solid windowtext 1.0pt;border-top:none;
        mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
        mso-border-left-alt:solid windowtext 1.0pt;padding:5.65pt 0cm 0cm 5.65pt;
        height:19.5pt'>
        <p class=MsoNormal align=right style='text-align:right'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>GST @18%<o:p></o:p></span></p>
        </td>
        <td width=253 colspan=2 style='width:190.0pt;border-top:none;border-left:
        none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt;height:19.5pt'>
        <p class=MsoNormal align=right style='text-align:right'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>${gst.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}<o:p></o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:7;height:18.5pt'>
        <td colspan=4 style='border:solid windowtext 1.0pt;border-top:none;
        mso-border-top-alt:solid windowtext .5pt;mso-border-alt:solid windowtext .5pt;
        mso-border-left-alt:solid windowtext 1.0pt;padding:5.65pt 0cm 0cm 5.65pt;
        height:18.5pt'>
        <p class=MsoNormal align=right style='text-align:right'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>GRAND TOTAL<o:p></o:p></span></p>
        </td>
        <td width=253 colspan=2 style='width:190.0pt;border-top:none;border-left:
        none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-alt:solid windowtext .5pt;padding:0cm 5.4pt 0cm 5.4pt;height:18.5pt'>
        <p class=MsoNormal align=right style='text-align:right'><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>${total.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}<o:p></o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:8;height:24.5pt'>
        <td colspan=4 style='border-top:none;border-left:solid windowtext 1.0pt;
        border-bottom:solid windowtext 1.0pt;border-right:none;mso-border-top-alt:
        solid windowtext .5pt;mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:
        solid windowtext 1.0pt;mso-border-bottom-alt:solid windowtext .5pt;
        padding:5.65pt 0cm 0cm 5.65pt;height:24.5pt'>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'>AMOUNT IN WORDS: ${converter.toWords(total).replace(/\b[a-z]/g, match => match.toUpperCase())} Only<o:p></o:p></span></p>
        </td>
        <td width=253 colspan=2 valign=top style='width:190.0pt;border-top:none;
        border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-top-alt:solid windowtext .5pt;
        mso-border-bottom-alt:solid windowtext .5pt;mso-border-right-alt:solid windowtext .5pt;
        padding:0cm 5.4pt 0cm 5.4pt;height:24.5pt'>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'><o:p>&nbsp;</o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:9;height:101.6pt'>
        <td width=564 colspan=3 rowspan=2 valign=top style='width:423.0pt;border:
        solid windowtext 1.0pt;border-top:none;mso-border-top-alt:solid windowtext .5pt;
        mso-border-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext 1.0pt;
        padding:5.65pt 0cm 0cm 5.65pt;height:101.6pt'>
        <p class=MsoNormal><b><span style='font-size:9.0pt;line-height:106%;
        font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;
        mso-hansi-theme-font:major-latin'>Terms &amp; Conditions<o:p></o:p></span></b></p>
        
        ${conditions}
        
        <p class=MsoListParagraphCxSpLast align=center style='text-align:center;
        line-height:150%'><span style='font-size:7.0pt;line-height:150%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'>*Conditions Apply<o:p></o:p></span></p>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'><o:p>&nbsp;</o:p></span></p>
        </td>
        <td width=316 colspan=3 valign=top style='width:237.0pt;border-top:none;
        border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-alt:solid windowtext .5pt;padding:5.65pt 0cm 0cm 5.65pt;
        height:101.6pt'>
        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'>BANK A/C DETAILS:<o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin'>A/C Name: Confident Engineering<o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin'>A/c Bank: AXIS Bank<o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin'>A/c No: 919020017679038<o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin'>IFSC Code: UTIB0003300<o:p></o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:10;height:235.4pt'>
        <td width=316 colspan=3 valign=top style='width:237.0pt;border-top:none;
        border-left:none;border-bottom:solid windowtext 1.0pt;border-right:solid windowtext 1.0pt;
        mso-border-top-alt:solid windowtext .5pt;mso-border-left-alt:solid windowtext .5pt;
        mso-border-alt:solid windowtext .5pt;padding:5.65pt 0cm 0cm 5.65pt;
        height:235.4pt'>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin'>For M/s. Confident Engineering<o:p></o:p></span></p>
        <p class=MsoNormal style='margin-bottom:0cm'><span style='font-size:9.0pt;
        line-height:106%;font-family:"Aptos Display",sans-serif;mso-ascii-theme-font:
        major-latin;mso-hansi-theme-font:major-latin'>Authorized Signatory<o:p></o:p></span></p>
        </td>
        </tr>
        <tr style='mso-yfti-irow:11;mso-yfti-lastrow:yes;height:24.35pt'>
        <td width=880 colspan=6 style='width:660.0pt;border:solid windowtext 1.0pt;
        border-top:none;mso-border-top-alt:solid windowtext .5pt;mso-border-top-alt:
        .5pt;mso-border-left-alt:1.0pt;mso-border-bottom-alt:1.0pt;mso-border-right-alt:
        .5pt;mso-border-color-alt:windowtext;mso-border-style-alt:solid;padding:5.65pt 0cm 0cm 5.65pt;
        height:24.35pt'>
        <p class=MsoNormal align=center style='margin-bottom:0cm;text-align:center'><b><span
        style='font-size:9.0pt;line-height:106%;font-family:"Aptos Display",sans-serif;
        mso-ascii-theme-font:major-latin;mso-hansi-theme-font:major-latin'>RECEIVED WITH
        THANKS<o:p></o:p></span></b></p>
        </td>
        </tr>
        <![if !supportMisalignedColumns]>
        <tr height=0>
        <td width=42 style='border:none'></td>
        <td width=135 style='border:none'></td>
        <td width=84 style='border:none'></td>
        <td width=23 style='border:none'></td>
        <td width=57 style='border:none'></td>
        <td width=110 style='border:none'></td>
        </tr>
        <![endif]>
        </table>

        <p class=MsoNormal><span style='font-size:9.0pt;line-height:106%;font-family:
        "Aptos Display",sans-serif;mso-ascii-theme-font:major-latin;mso-hansi-theme-font:
        major-latin'>&nbsp;<o:p></o:p></span></p>

        </div>

        </body>

        </html>
        `
    }
}
