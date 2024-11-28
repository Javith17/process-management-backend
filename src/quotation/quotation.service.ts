import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Pagination } from 'src/dto/pagination.dto';
import { ApproveQuotationDto, CreateMachineQuotationDto, DeliverProductionMachinePartDto, MoveProductionMachinePartToVendorDto, RescheduleProductionMachinePartDto, SupplierQuotationDto, UpdateProductionMachineBODto, UpdateProductionMachinePartDto, VendorQuotationDto } from 'src/dto/quotation.dto';
import { BoughtOutEntity } from 'src/model/bought_out.entity';
import { BoughtOutSuppliertEntity } from 'src/model/bought_out_supplier.entity';
import { CustomerEntity } from 'src/model/customer.entity';
import { MachineEntity } from 'src/model/machine.entity';
import { MachineQuotationEntity } from 'src/model/machine_quotation.entity';
import { OrderConfirmationEntity } from 'src/model/order_confirmation.entity';
import { PartEntity } from 'src/model/part.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { PartProcessVendorEntity } from 'src/model/part_process_vendor.entity';
import { ProductionMachineBoughtoutEntity } from 'src/model/production_machine_boughtout.entity';
import { ProductionMachinePartEntity } from 'src/model/production_machine_part.entity';
import { SectionAssemblyEntity } from 'src/model/section_assembly.entity';
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
        @InjectRepository(BoughtOutSuppliertEntity) private boughoutSupplierRepo: Repository<BoughtOutSuppliertEntity>
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
                initial_cost: machineQuotation.cost.toString(),
                status: 'Pending Approval'
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
                'machine.id',
                'machine.machine_name',
                'customer.id',
                'customer.customer_name',
                'user.id',
                'user.emp_name',
                'machine_quotation.initial_cost',
                'machine_quotation.status'
            ])

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

                    if (approveDto.status.includes('Approved')) {
                        await this.addOrderConfirmation(approvedQuotation)
                    }
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
            machine_name: machineObj.machine_name
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
                    status: 'Pending',
                    machine_id: approvedQuotation.machine_id,
                    order: orderConfirmation
                })
            })
        })
    }
}
