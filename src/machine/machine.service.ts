import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateCustomer, CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, CreateVendorProcess, UpdateUserPassword } from 'src/dto/admin.dto';
import { AddSubAssemblyMachine, CreateBoughtOut, CreateMachine, CreateMainAssembly, CreatePart, CreateSectionAssembly, CreateSubAssembly, FileDetailsDto, FileDto, PartsByMachines, UpdateAssemblyDetail, UpdateBoughtoutDto, UpdatePartDto, VendorAttachmentDto } from 'src/dto/machine.dto';
import { CheckNameDto, Pagination, RemoveAttachmentDto } from 'src/dto/pagination.dto';
import { BoughtOutEntity } from 'src/model/bought_out.entity';
import { BoughtOutSuppliertEntity } from 'src/model/bought_out_supplier.entity';
import { CustomerEntity } from 'src/model/customer.entity';
import { MachineEntity } from 'src/model/machine.entity';
import { MainAssemblyDetailEntity } from 'src/model/main_assembly_detail.entity';
import { MainAssemblyEntity } from 'src/model/main_assembly.entity';
import { PartEntity } from 'src/model/part.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { PartProcessVendorEntity } from 'src/model/part_process_vendor.entity';
import { ProcessEntity } from 'src/model/process.entity';
import { SubAssemblyEntity } from 'src/model/sub_assembly.entity';
import { SubAssemblyDetailEntity } from 'src/model/sub_assembly_detail.entity';
import { SupplierEntity } from 'src/model/supplier.entity';
import { VendorEntity } from 'src/model/vendor.entity';
import { Repository } from 'typeorm';
import { SectionAssemblyEntity } from 'src/model/section_assembly.entity';
import { SectionAssemblyDetailEntity } from 'src/model/section_assembly_detail.entity';
import { MachineSubAssemblyEntity } from 'src/model/machine_sub_assembly.entity';
import { SubAssemblyMachineEntity } from 'src/model/sub_assembly_machines.entity';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { AttachmentEntity } from 'src/model/attachment.entity';
import { join } from 'path';
import { PartMachineEntity } from 'src/model/part_machine.entity';
import { BoughtoutMachineEntity } from 'src/model/bought_out_machine.entity';

@Injectable()
export class MachineService {
    constructor(
        @InjectRepository(PartEntity) private partRepository: Repository<PartEntity>,
        @InjectRepository(PartProcessEntity) private partProcessRepository: Repository<PartProcessEntity>,
        @InjectRepository(PartProcessVendorEntity) private partProcessVendorRepository: Repository<PartProcessVendorEntity>,
        @InjectRepository(VendorEntity) private vendorRepository: Repository<VendorEntity>,
        @InjectRepository(ProcessEntity) private processRepository: Repository<ProcessEntity>,
        @InjectRepository(BoughtOutEntity) private boughtOutRepository: Repository<BoughtOutEntity>,
        @InjectRepository(BoughtOutSuppliertEntity) private boughtOutSupplierRepository: Repository<BoughtOutSuppliertEntity>,
        @InjectRepository(SupplierEntity) private supplierRepository: Repository<SupplierEntity>,
        @InjectRepository(MachineEntity) private machineRepository: Repository<MachineEntity>,
        @InjectRepository(SubAssemblyEntity) private subAssemblyRepository: Repository<SubAssemblyEntity>,
        @InjectRepository(SubAssemblyDetailEntity) private subAssemblyDetailRepository: Repository<SubAssemblyDetailEntity>,
        @InjectRepository(MainAssemblyEntity) private mainAssemblyRepository: Repository<MainAssemblyEntity>,
        @InjectRepository(MainAssemblyDetailEntity) private mainAssemblyDetailRepository: Repository<MainAssemblyDetailEntity>,
        @InjectRepository(SectionAssemblyEntity) private sectionAssemblyRepository: Repository<SectionAssemblyEntity>,
        @InjectRepository(SectionAssemblyDetailEntity) private sectionAssemblyDetailRepository: Repository<SectionAssemblyDetailEntity>,
        @InjectRepository(MachineSubAssemblyEntity) private machineSubAssemblyRepository: Repository<MachineSubAssemblyEntity>,
        @InjectRepository(SubAssemblyMachineEntity) private subAssemblyMachineRepository: Repository<SubAssemblyMachineEntity>,
        @InjectRepository(AttachmentEntity) private attachmentRepository: Repository<AttachmentEntity>,
        @InjectRepository(PartMachineEntity) private partMachineRepo: Repository<PartMachineEntity>,
        @InjectRepository(BoughtoutMachineEntity) private boughtOutMachineRepo: Repository<BoughtoutMachineEntity>
    ) { }


    async createNewPart(createPartDto: CreatePart) {
        const existingPart = await this.partRepository.find({ select: ['id', 'part_name'], where: { is_active: true, part_name: createPartDto.part_name } })

        if (existingPart.length > 0) {
            return { message: "Part already exists" }
        }
        const partObj = await this.partRepository.save({
            part_name: createPartDto.part_name,
            minimum_stock_qty: createPartDto.minimum_stock_qty,
            available_aty: createPartDto.available_qty,
            part_category: createPartDto.part_category,
            is_machine: createPartDto.is_machine,
            is_spare: createPartDto.is_spare,
            is_spm: createPartDto.is_spm
        })

        let partDays = 0

        createPartDto.machines?.map(async (machine:any) => {
            const machineObj = await this.machineRepository.findOne({where: {id: machine}})
            await this.partMachineRepo.save({
                part: partObj,
                machine: machineObj
            })            
        })

        createPartDto.part_process_list?.map(async (partProcessDto) => {
            const processObj = await this.processRepository.findOneBy({ id: partProcessDto.process_id })
            partDays = partDays + Number(partProcessDto.process_time)
            const partProcessObj = await this.partProcessRepository.save({
                part: partObj,
                process: processObj,
                process_cost: partProcessDto.process_cost,
                process_time: partProcessDto.process_time
            })

            partProcessDto.part_process_vendor_list?.map(async (partProcessVendorDto) => {
                const vendor = await this.vendorRepository.findOne({ where: { id: partProcessVendorDto.vendor_id } })
                await this.partProcessVendorRepository.save({
                    part_process: partProcessObj,
                    part_process_vendor_price: partProcessVendorDto.part_process_vendor_price,
                    part_process_vendor_delivery_time: partProcessVendorDto.part_process_vendor_delivery_time,
                    vendor: vendor
                })
            })

            await this.partRepository.createQueryBuilder()
                .update(PartEntity)
                .set({ days: partDays })
                .where("id=:id", { id: partObj.id })
                .execute()
        })
        return { message: "Part created successfully", id: partObj.id }
    }

    async getPartDetail(id: string) {
        let query = await this.partRepository.createQueryBuilder('parts')
            .leftJoinAndSelect('parts.part_process_list', 'part_process')
            .leftJoinAndSelect('part_process.part_process_vendor_list', 'part_process_vendor')
            .leftJoinAndSelect('part_process.process', 'process')
            .leftJoinAndSelect('part_process_vendor.vendor', 'vendor')
            .select([
                'parts.id',
                'parts.part_name',
                'parts.minimum_stock_qty',
                'parts.available_aty',
                'parts.is_machine',
                'parts.is_spm',
                'parts.is_spare',
                'parts.days',
                'part_process.id',
                'part_process.process_cost',
                'part_process.process_time',
                'process.id',
                'process.process_name',
                'part_process_vendor.part_process_vendor_price',
                'part_process_vendor.id',
                'vendor.id',
                'vendor.vendor_name',
                'part_process_vendor.part_process_vendor_delivery_time'
            ]).where('parts.id::VARCHAR=:id', { id })

        let attachments_query = await this.attachmentRepository.createQueryBuilder('attachment')
            .select(['attachment.id', 'attachment.parent_id', 'attachment.file_name', 'attachment.file_type'])
            .where('parent_id::VARCHAR=:id', { id })
            .andWhere('parent_type=:type', { type: 'part' })
        const attachments = await attachments_query.getMany()

        let machines_query = await this.partMachineRepo.createQueryBuilder('part_machine')
            .leftJoinAndSelect('part_machine.machine', 'machine')
            .select(['part_machine.id','machine.id', 'machine.machine_name'])
            .where('part_machine.part_id::VARCHAR=:part_id', { part_id: id })
        const machines = await machines_query.getMany()

        return { part_detail: await query.getOne(), attachments, machines }
    }

    async getPartsList(pagination: Pagination) {
        try{
            let ids_query = this.partRepository.createQueryBuilder('parts')
            .select(['parts.id'])

        if (pagination?.page) {
            ids_query = ids_query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            ids_query = ids_query.andWhere('LOWER(part.part_name) LIKE :vendorName', { vendorName: `%${pagination.search.toLowerCase()}%` })
        }

        const ids = await ids_query.getMany()
        const count = await ids_query.getCount()

        let query = await this.partRepository.createQueryBuilder('parts')
            .leftJoinAndSelect('parts.part_process_list', 'part_process')
            .leftJoinAndSelect('part_process.part_process_vendor_list', 'part_process_vendor')
            .leftJoinAndSelect('part_process.process', 'process')
            .leftJoinAndSelect('part_process_vendor.vendor', 'vendor')
            .select([
                'parts.id',
                'parts.part_name',
                'parts.minimum_stock_qty',
                'parts.available_aty',
                'parts.days',
                'part_process.id',
                'part_process.process_cost',
                'part_process.process_time',
                'process.id',
                'process.process_name',
                'part_process_vendor.part_process_vendor_price',
                'part_process_vendor.id',
                'vendor.id',
                'vendor.vendor_name'
            ])
            if(ids.length > 0){
                query = query.where("parts.id IN (:...ids)", { ids: ids.map((id) => id.id) })
            }

        const list = await query.getMany()
        return { list, count }
        }catch(err){
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err.message,
              }, HttpStatus.FORBIDDEN, {
                cause: err.message
              }); 
        }
    }

    async getPartsListByMachine(partsByMachineDto: PartsByMachines) {
        try{
        let query = await this.partRepository.createQueryBuilder('parts')
            .leftJoin(PartMachineEntity, 'part_machine', 'part_machine.part_id = parts.id')
            .select([
                'parts.id',
                'parts.part_name',
                'parts.minimum_stock_qty',
                'parts.available_aty',
                'parts.days'
            ])
            .where('part_machine.machine_id IN (:...ids)', { ids: partsByMachineDto.machines })
            

        const list = await query.getMany()
        return { list  }
        }catch(err){
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err.message,
              }, HttpStatus.FORBIDDEN, {
                cause: err.message
              }); 
        }
    }

    async getPartsListInStore(pagination: Pagination) {
        try{
            let query = this.partRepository.createQueryBuilder('parts')
            .select([
                'parts.id',
                'parts.part_name',
                'parts.minimum_stock_qty',
                'parts.available_aty',
                'parts.days'
            ])
            .where('parts.available_aty > 0')

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(part.part_name) LIKE :partName', { partName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
        }catch(err){
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err.message,
              }, HttpStatus.FORBIDDEN, {
                cause: err.message
              }); 
        }
    }

    async createNewBoughtOut(createBoughtOutDto: CreateBoughtOut) {
        const existingBoughtOut = await this.boughtOutRepository.find({ select: ['id', 'bought_out_name'], where: { is_active: true, bought_out_name: createBoughtOutDto.bought_out_name } })

        if (existingBoughtOut.length > 0) {
            return { message: "Bought Out already exists" }
        }
        const boughtOutObj = await this.boughtOutRepository.save({
            bought_out_name: createBoughtOutDto.bought_out_name,
            bought_out_category: createBoughtOutDto.bought_out_category,
            is_machine: createBoughtOutDto.is_machine,
            is_spare: createBoughtOutDto.is_spare,
            is_spm: createBoughtOutDto.is_spm
        })

        createBoughtOutDto?.machines?.map(async (machine:any) => {
            const machineObj = await this.machineRepository.findOne({where:{id: machine}})
            await this.boughtOutMachineRepo.save({
                bought_out: boughtOutObj,
                machine: machineObj
            })
        })

        let boughtoutDays : number[] = createBoughtOutDto?.bought_out_supplier_list?.map((sup:any) => Number(sup.delivery_time))

        createBoughtOutDto?.bought_out_supplier_list?.map(async (supplierDto) => {
            const supplier = await this.supplierRepository.findOne({ where: { id: supplierDto.supplier_id } })
            
            await this.boughtOutSupplierRepository.save({
                supplier: supplier,
                bought_out: boughtOutObj,
                cost: supplierDto.cost,
                delivery_time: supplierDto.delivery_time
            })
        })

        await this.boughtOutRepository.createQueryBuilder()
        .update(BoughtOutEntity)
        .set({ days: boughtoutDays.length == 0 ? 0 : Math.min(...boughtoutDays) })
        .where("id=:id", { id: boughtOutObj.id })
        .execute()

        return { message: "Bought Out created successfully", id: boughtOutObj.id }
    }

    async getSupplierBoughtouts(id: string) {
        let result = await this.boughtOutSupplierRepository.createQueryBuilder('bs')
            .leftJoinAndSelect('bs.bought_out', 'bo')
            .select(['bs.id', 'bs.cost', 'bs.delivery_time', 'bo.bought_out_name'])
            .where('bs.supplier_id=:id', {id})
            .getMany()
        return { supplierBoughtouts: result }
    }

    async getBoughtoutDetail(id: string) {
        let query = await this.boughtOutRepository.createQueryBuilder('boughtout')
            .leftJoinAndSelect('boughtout.bought_out_suppliers', 'bought_out_suppliers')
            .leftJoinAndSelect('bought_out_suppliers.supplier', 'supplier')
            .select([
                'boughtout.id',
                'boughtout.bought_out_name',
                'boughtout.bought_out_category',
                'boughtout.days',
                'boughtout.is_machine',
                'boughtout.is_spm',
                'boughtout.is_spare',
                'bought_out_suppliers.id',
                'bought_out_suppliers.cost',
                'bought_out_suppliers.delivery_time',
                'supplier.id',
                'supplier.supplier_name'
            ]).where('boughtout.id::VARCHAR=:id', { id })

        let attachments_query = await this.attachmentRepository.createQueryBuilder('attachment')
            .select(['attachment.id', 'attachment.parent_id', 'attachment.file_name', 'attachment.file_type'])
            .where('parent_id::VARCHAR=:id', { id })
            .andWhere('parent_type=:type', { type: 'boughtout' })
        const attachments = await attachments_query.getMany()

        let machines_query = await this.boughtOutMachineRepo.createQueryBuilder('bought_out_machine')
            .leftJoinAndSelect('bought_out_machine.machine', 'machine')
            .select(['bought_out_machine.id','machine.id', 'machine.machine_name'])
            .where('bought_out_machine.bought_out_id::VARCHAR=:bought_out_id', { bought_out_id: id })
        const machines = await machines_query.getMany()

        return { boughtout_detail: await query.getOne(), attachments, machines }
    }

    async getBoughtOutList(pagination: Pagination) {
        if(pagination.type == 'map'){
            let query = await this.boughtOutRepository.createQueryBuilder('bought_out')
            .leftJoinAndSelect('bought_out.bought_out_suppliers', 'bought_out_supplier')
            .leftJoinAndSelect('bought_out_supplier.supplier', 'supplier')
            .select([
                'bought_out.id',
                'bought_out.bought_out_name'
            ])

            if (pagination?.page) {
                query = query
                    .limit(pagination.limit)
                    .offset((pagination.page - 1) * pagination.limit)
            }

            if (pagination?.search) {
                query = query.andWhere('LOWER(bought_out.bought_out_name) LIKE :boughtOutName', { boughtOutName: `%${pagination.search.toLowerCase()}%` })
                query = query.andWhere('supplier.id NOT IN (:...id)', { id: [pagination?.type_id]}).orWhere('supplier.id IS NULL')
            }

            const [list, count] = await query.getManyAndCount()
            return { list, count }
        }else{
            let query = await this.boughtOutRepository.createQueryBuilder('bought_out')
            .leftJoinAndSelect('bought_out.bought_out_suppliers', 'bought_out_supplier')
            .leftJoinAndSelect('bought_out_supplier.supplier', 'supplier')
            .select([
                'bought_out.id',
                'bought_out.bought_out_name',
                'bought_out.days',
                'bought_out.bought_out_category',
                'bought_out_supplier.cost',
                'bought_out_supplier.delivery_time',
                'supplier.id',
                'supplier.supplier_name'
            ])

            if (pagination?.page) {
                query = query
                    .limit(pagination.limit)
                    .offset((pagination.page - 1) * pagination.limit)
            }

            if (pagination?.search) {
                query = query.andWhere('LOWER(bought_out.bought_out_name) LIKE :boughtOutName', { boughtOutName: `%${pagination.search.toLowerCase()}%` })
                query = query.orWhere('LOWER(supplier.supplier_name) LIKE :supplierName', { supplierName: `%${pagination.search.toLowerCase()}%` })
            }

            const [list, count] = await query.getManyAndCount()
            return { list, count }
        }
        
    }

    async getBoughtoutListByMachine(boughtoutByMachineDto: PartsByMachines) {
        try{
        let query = await this.boughtOutRepository.createQueryBuilder('bo')
            .leftJoin(BoughtoutMachineEntity, 'boughtout_machine', 'boughtout_machine.bought_out_id = bo.id')
            .select([
                'bo.id',
                'bo.bought_out_name'
            ])
            .where('boughtout_machine.machine_id IN (:...ids)', { ids: boughtoutByMachineDto.machines })
            

        const list = await query.getMany()
        return { list  }
        }catch(err){
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err.message,
              }, HttpStatus.FORBIDDEN, {
                cause: err.message
              }); 
        }
    }

    async createSubAssembly(createSubAssemblyDto: CreateSubAssembly) {
        const existingSubAssembly = await this.subAssemblyRepository.find({ select: ['id', 'sub_assembly_name'], where: { is_active: true, sub_assembly_name: createSubAssemblyDto.sub_assembly_name } })

        if (existingSubAssembly.length > 0) {
            return { message: "Sub Assembly already exists" }
        }
        // let partDays = 0

        const subAssemblyObj = await this.subAssemblyRepository.save({
            sub_assembly_name: createSubAssemblyDto.sub_assembly_name,
            serial_no: createSubAssemblyDto.serial_no
        })

        createSubAssemblyDto.machine_list.map((machine: any) => {
            this.subAssemblyMachineRepository.save({
                machine_id: machine,
                sub_assembly_id: subAssemblyObj.id
            })
        })

        createSubAssemblyDto.sub_assembly_detail.map(async (detail) => {
            if (detail.part_id) {
                const part = await this.partRepository.findOne({ where: { id: detail.part_id } })
                // partDays += Number(part.days)

                if (part) {
                    await this.subAssemblyDetailRepository.save({
                        sub_assembly: subAssemblyObj,
                        part: part,
                        qty: detail.qty
                    })
                }
            } else {
                const boughtOut = await this.boughtOutRepository.findOne({ where: { id: detail.bought_out_id } })
                if (boughtOut) {
                    await this.subAssemblyDetailRepository.save({
                        sub_assembly: subAssemblyObj,
                        bought_out: boughtOut,
                        qty: detail.qty
                    })
                }
            }

            // await this.subAssemblyRepository.createQueryBuilder()
            //     .update(SubAssemblyEntity)
            //     .set({ days: partDays })
            //     .where("id=:id", { id: subAssemblyObj.id })
            //     .execute()
        })

        return { message: "Sub Assembly created successfully", id: subAssemblyObj.id }
    }

    async createMainAssembly(createMainAssemblyDto: CreateMainAssembly) {
        const existingMainAssembly = await this.mainAssemblyRepository.find({ select: ['id', 'main_assembly_name'], where: { is_active: true, main_assembly_name: createMainAssemblyDto.main_assembly_name } })

        if (existingMainAssembly.length > 0) {
            return { message: "Main Assembly already exists" }
        }

        // let partDays = 0

        const machineObj = await this.machineRepository.findOne({ where: { id: createMainAssemblyDto.machine_id } })
        const mainAssemblyObj = await this.mainAssemblyRepository.save({
            main_assembly_name: createMainAssemblyDto.main_assembly_name,
            serial_no: createMainAssemblyDto.serial_no,
            machine: machineObj
        })

        createMainAssemblyDto.main_assembly_detail.map(async (detail) => {
            if (detail.part_id) {
                const part = await this.partRepository.findOne({ where: { id: detail.part_id } })
                // partDays += Number(part.days)
                if (part) {
                    await this.mainAssemblyDetailRepository.save({
                        main_assembly: mainAssemblyObj,
                        part: part,
                        qty: detail.qty
                    })
                }
            } else if (detail.bought_out_id) {
                const boughtOut = await this.boughtOutRepository.findOne({ where: { id: detail.bought_out_id } })
                if (boughtOut) {
                    await this.mainAssemblyDetailRepository.save({
                        main_assembly: mainAssemblyObj,
                        bought_out: boughtOut,
                        qty: detail.qty
                    })
                }
            } else if (detail.sub_assembly_id) {
                const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: detail.sub_assembly_id } })
                if (subAssembly) {
                    // partDays += Number(subAssembly.days)
                    await this.mainAssemblyDetailRepository.save({
                        main_assembly: mainAssemblyObj,
                        sub_assembly: subAssembly,
                        qty: detail.qty
                    })
                }
            }
        })

        return { message: "Main Assembly created successfully", id: mainAssemblyObj.id }
    }

    async createSectionAssembly(createSectionAssemblyDto: CreateSectionAssembly) {
        const existingSectionAssembly = await this.sectionAssemblyRepository.find({ select: ['id', 'section_assembly_name'], where: { is_active: true, section_assembly_name: createSectionAssemblyDto.section_assembly_name } })

        if (existingSectionAssembly.length > 0) {
            return { message: "Section Assembly already exists" }
        }

        // let partDays = 0

        const machineObj = await this.machineRepository.findOne({ where: { id: createSectionAssemblyDto.machine_id } })
        const sectionAssemblyObj = await this.sectionAssemblyRepository.save({
            section_assembly_name: createSectionAssemblyDto.section_assembly_name,
            serial_no: createSectionAssemblyDto.serial_no,
            machine: machineObj
        })

        createSectionAssemblyDto.section_assembly_detail.map(async (detail) => {
            if (detail.part_id) {
                const part = await this.partRepository.findOne({ where: { id: detail.part_id } })
                if (part) {
                    // partDays += Number(part.days)
                    await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        part: part,
                        qty: detail.qty
                    })
                }
            } else if (detail.bought_out_id) {
                const boughtOut = await this.boughtOutRepository.findOne({ where: { id: detail.bought_out_id } })
                if (boughtOut) {
                    await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        bought_out: boughtOut,
                        qty: detail.qty
                    })
                }
            } else if (detail.sub_assembly_id) {
                const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: detail.sub_assembly_id } })
                if (subAssembly) {
                    // partDays += Number(subAssembly.days)
                    await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        sub_assembly: subAssembly,
                        qty: detail.qty
                    })
                }
            } else if (detail.main_assembly_id) {
                const mainAssembly = await this.mainAssemblyRepository.findOne({ where: { id: detail.main_assembly_id } })
                if (mainAssembly) {
                    // partDays += Number(mainAssembly.days)
                    await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        main_assembly: mainAssembly,
                        qty: detail.qty
                    })
                }
            }

            // await this.sectionAssemblyRepository.createQueryBuilder()
            //     .update(SectionAssemblyEntity)
            //     .set({ days: partDays })
            //     .where("id=:id", { id: sectionAssemblyObj.id })
            //     .execute()
        })

        return { message: "Section Assembly created successfully", id: sectionAssemblyObj.id }
    }

    async getSubAssemblyList(pagination: Pagination) {
        let query = await this.subAssemblyRepository.createQueryBuilder('sub_assembly')
            .leftJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_assembly_detail')
            .leftJoinAndSelect('sub_assembly_detail.part', 'parts')
            .leftJoinAndSelect('sub_assembly_detail.bought_out', 'bought_out')
            .select([
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'sub_assembly.serial_no',
                'sub_assembly_detail.id',
                'sub_assembly_detail.qty',
                'parts.id',
                'parts.part_name',
                'parts.days',
                'bought_out.id',
                'bought_out.bought_out_name',
                'bought_out.days'
            ])

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(sub_assembly.sub_assembly_name) LIKE :subAssemblyName', { subAssemblyName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }

    async getSubAssemblyDetail(id: string) {
        let query = await this.subAssemblyRepository.createQueryBuilder('sub_assembly')
            .leftJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_assembly_detail')
            .leftJoinAndSelect('sub_assembly_detail.part', 'parts')
            .leftJoinAndSelect('sub_assembly_detail.bought_out', 'bought_out')
            .select([
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'sub_assembly.serial_no',
                'sub_assembly_detail.id',
                'sub_assembly_detail.qty',
                'parts.id',
                'parts.part_name',
                'bought_out.id',
                'bought_out.bought_out_name'
            ]).where('sub_assembly.id::VARCHAR=:id', { id })

        const sub_assembly_detail = await query.getOne()

        let machines_query = await this.subAssemblyMachineRepository.createQueryBuilder('sub_assembly_machine')
            .leftJoinAndSelect(MachineEntity, 'machine', 'machine.id::VARCHAR = sub_assembly_machine.machine_id::VARCHAR')
            .select(['machine.id', 'machine.machine_name as machine_name'])
            .where('sub_assembly_machine.sub_assembly_id::VARCHAR = :sub_assembly_id', { sub_assembly_id: sub_assembly_detail.id })

        const machine_list = await machines_query.getRawMany()

        let attachments_query = await this.attachmentRepository.createQueryBuilder('attachment')
            .select(['attachment.id', 'attachment.parent_id', 'attachment.file_name', 'attachment.file_type'])
            .where('parent_id::VARCHAR=:id', { id })
            .andWhere('parent_type=:type', { type: 'sub_asssembly' })
        const attachments = await attachments_query.getMany()

        return { sub_assembly_detail, machine_list, attachments }
    }

    async getSubAssemblyListByMachine(machine_id: string) {
        let query = await this.subAssemblyMachineRepository.createQueryBuilder('sub_assembly_machine')
            .leftJoinAndSelect(SubAssemblyEntity, 'sub_assembly', 'sub_assembly_machine.sub_assembly_id = sub_assembly.id::VARCHAR')
            .select(['sub_assembly.id', 'sub_assembly.sub_assembly_name as sub_assembly_name'])
            .where('sub_assembly_machine.machine_id = :machine_id', { machine_id })

        const list = await query.getRawMany()
        return { list }
    }

    async getMainAssemblyList(pagination: Pagination) {
        let query = await this.mainAssemblyRepository.createQueryBuilder('main_assembly')
            .leftJoinAndSelect('main_assembly.main_assembly_detail', 'main_assembly_detail')
            .leftJoinAndSelect('main_assembly.machine', 'machine')
            .leftJoinAndSelect('main_assembly_detail.part', 'parts')
            .leftJoinAndSelect('main_assembly_detail.bought_out', 'bought_out')
            .leftJoinAndSelect('main_assembly_detail.sub_assembly', 'sub_assembly')
            .leftJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_assembly_detail')
            .leftJoinAndSelect('sub_assembly_detail.part', 'sub_part')
            .select([
                'main_assembly.id',
                'main_assembly.main_assembly_name',
                'main_assembly.serial_no',
                // 'main_assembly.days',
                'main_assembly_detail.id',
                'main_assembly_detail.qty',
                'parts.id',
                'parts.part_name',
                'parts.days',
                'bought_out.id',
                'bought_out.bought_out_name',
                'bought_out.days',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'sub_assembly_detail.id',
                'sub_part.id',
                'sub_part.days',
                'machine.id',
                'machine.machine_name'
            ])

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(main_assembly.main_assembly_name) LIKE :mainAssemblyName', { mainAssemblyName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }

    async getMainAssemblyDetail(id: string) {
        let query = await this.mainAssemblyRepository.createQueryBuilder('main_assembly')
            .leftJoinAndSelect('main_assembly.main_assembly_detail', 'main_assembly_detail')
            .leftJoinAndSelect('main_assembly.machine', 'machine')
            .leftJoinAndSelect('main_assembly_detail.part', 'parts')
            .leftJoinAndSelect('main_assembly_detail.bought_out', 'bought_out')
            .leftJoinAndSelect('main_assembly_detail.sub_assembly', 'sub_assembly')
            .select([
                'main_assembly.id',
                'main_assembly.main_assembly_name',
                'main_assembly.serial_no',
                'main_assembly_detail.id',
                'main_assembly_detail.qty',
                'parts.id',
                'parts.part_name',
                'bought_out.id',
                'bought_out.bought_out_name',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'machine.id',
                'machine.machine_name'
            ]).where("main_assembly.id::VARCHAR=:id", { id })

        let attachments_query = await this.attachmentRepository.createQueryBuilder('attachment')
            .select(['attachment.id', 'attachment.parent_id', 'attachment.file_name', 'attachment.file_type'])
            .where('parent_id::VARCHAR=:id', { id })
            .andWhere('parent_type=:type', { type: 'main_asssembly' })
        const attachments = await attachments_query.getMany()

        return { main_assembly_detail: await query.getOne(), attachments }
    }

    async getSectionAssemblyList(pagination: Pagination) {
        let query = await this.sectionAssemblyRepository.createQueryBuilder('section_assembly')
            .leftJoinAndSelect('section_assembly.section_assembly_detail', 'section_assembly_detail')
            .leftJoinAndSelect('section_assembly.machine', 'machine')
            .leftJoinAndSelect('section_assembly_detail.part', 'parts')
            .leftJoinAndSelect('section_assembly_detail.bought_out', 'bought_out')

            .leftJoinAndSelect('section_assembly_detail.sub_assembly', 'sub_assembly')
            .leftJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_assembly_detail')
            .leftJoinAndSelect('sub_assembly_detail.part', 'sub_part')

            .leftJoinAndSelect('section_assembly_detail.main_assembly', 'main_assembly')
            .leftJoinAndSelect('main_assembly.main_assembly_detail', 'main_assembly_detail')
            .leftJoinAndSelect('main_assembly_detail.part', 'main_part')

            .leftJoinAndSelect('main_assembly_detail.sub_assembly', 'main_sub_assembly')
            .leftJoinAndSelect('main_sub_assembly.sub_assembly_detail', 'main_sub_assembly_detail')
            .leftJoinAndSelect('main_sub_assembly_detail.part', 'main_sub_part')

            .select([
                'section_assembly.id',
                'section_assembly.section_assembly_name',
                'section_assembly.serial_no',
                'section_assembly_detail.id',
                'section_assembly_detail.qty',
                'parts.id',
                'parts.part_name',
                'parts.days',
                'bought_out.id',
                'bought_out.bought_out_name',
                'bought_out.days',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'sub_assembly_detail.id',
                'sub_part.id',
                'sub_part.days',
                'main_assembly.id',
                'main_assembly.main_assembly_name',
                'main_assembly_detail.id',
                'main_part.id',
                'main_part.days',
                'main_sub_assembly.id',
                'main_sub_assembly_detail.id',
                'main_sub_part.id',
                'main_sub_part.days',
                'machine.id',
                'machine.machine_name'
            ])

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(section_assembly.section_assembly_name) LIKE :sectionAssemblyName', { sectionAssemblyName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }

    async getSectionAssemblyDetail(id: string) {
        let query = await this.sectionAssemblyRepository.createQueryBuilder('section_assembly')
            .leftJoinAndSelect('section_assembly.section_assembly_detail', 'section_assembly_detail')
            .leftJoinAndSelect('section_assembly.machine', 'machine')
            .leftJoinAndSelect('section_assembly_detail.part', 'parts')
            .leftJoinAndSelect('section_assembly_detail.bought_out', 'bought_out')
            .leftJoinAndSelect('section_assembly_detail.sub_assembly', 'sub_assembly')
            .leftJoinAndSelect('section_assembly_detail.main_assembly', 'main_assembly')
            .select([
                'section_assembly.id',
                'section_assembly.section_assembly_name',
                'section_assembly.serial_no',
                'section_assembly_detail.id',
                'section_assembly_detail.qty',
                'parts.id',
                'parts.part_name',
                'bought_out.id',
                'bought_out.bought_out_name',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'main_assembly.id',
                'main_assembly.main_assembly_name',
                'machine.id',
                'machine.machine_name'
            ]).where('section_assembly.id::VARCHAR = :id', { id })

        let attachments_query = await this.attachmentRepository.createQueryBuilder('attachment')
            .select(['attachment.id', 'attachment.parent_id', 'attachment.file_name', 'attachment.file_type'])
            .where('parent_id::VARCHAR=:id', { id })
            .andWhere('parent_type=:type', { type: 'section_asssembly' })
        const attachments = await attachments_query.getMany()

        return { section_assembly_detail: await query.getOne(), attachments }
    }

    async getMainAssemblyListByMachine(machine_id: string) {
        let query = await this.mainAssemblyRepository.createQueryBuilder('main_assembly')
            .select(['main_assembly.id', 'main_assembly.main_assembly_name'])
            .where('main_assembly.machine_id = :machine_id', { machine_id })

        const list = await query.getMany()
        return { list }
    }

    async updateAssemblyDetail(updateAssemblyDetail: UpdateAssemblyDetail) {
        if (updateAssemblyDetail.update_type.includes('delete')) {
            if (updateAssemblyDetail.assembly_type.includes('main_assembly')) {
                await this.mainAssemblyDetailRepository.delete({ id: updateAssemblyDetail.id })
            } else if (updateAssemblyDetail.assembly_type.includes('section_assembly')) {
                await this.sectionAssemblyDetailRepository.delete({ id: updateAssemblyDetail.id })
            } else if (updateAssemblyDetail.assembly_type.includes('sub_assembly')) {
                await this.subAssemblyDetailRepository.delete({ id: updateAssemblyDetail.id })
            }

            return { message: `${updateAssemblyDetail.assembly_udpate_type} removed successfully` }
        } else if (updateAssemblyDetail.update_type.includes('update')) {
            if (updateAssemblyDetail.assembly_type.includes('main_assembly')) {
                await this.mainAssemblyDetailRepository.createQueryBuilder()
                    .update(MainAssemblyDetailEntity)
                    .set({ qty: updateAssemblyDetail.qty })
                    .where('id=:id', { id: updateAssemblyDetail.id })
                    .execute()
                return { message: 'Main Assembly updated successfully' }
            } else if (updateAssemblyDetail.assembly_type.includes('section_assembly')) {
                await this.sectionAssemblyDetailRepository.createQueryBuilder()
                    .update(SectionAssemblyDetailEntity)
                    .set({ qty: updateAssemblyDetail.qty })
                    .where('id=:id', { id: updateAssemblyDetail.id })
                    .execute()
                return { message: 'Section Assembly updated successfully' }
            } else if (updateAssemblyDetail.assembly_type.includes('sub_assembly')) {
                await this.subAssemblyDetailRepository.createQueryBuilder()
                    .update(SubAssemblyDetailEntity)
                    .set({ qty: updateAssemblyDetail.qty })
                    .where('id=:id', { id: updateAssemblyDetail.id })
                    .execute()
                return { message: 'Sub Assembly updated successfully' }
            } else if(updateAssemblyDetail.assembly_type.includes('sub_detail')) {
                const subObj = await this.subAssemblyRepository.findOneBy({ id: updateAssemblyDetail.assembly_type_id })
                const subNameObj = await this.subAssemblyRepository.findOneBy({ sub_assembly_name: updateAssemblyDetail.assembly_type_name})
                if(subNameObj && subNameObj.id != subObj.id){
                    return { message: 'Sub Assembly name already exists' }
                }
                
                await this.partRepository.createQueryBuilder()
                .update(SubAssemblyEntity).set({ sub_assembly_name: updateAssemblyDetail.assembly_type_name})
                .where('id::VARCHAR=:id', { id: updateAssemblyDetail.assembly_type_id })
                .execute()
                
                await this.subAssemblyMachineRepository.delete({sub_assembly_id: updateAssemblyDetail.assembly_type_id})
                console.log("----------------", updateAssemblyDetail.machines)
                updateAssemblyDetail.machines?.map(async (machine:any) => {
                    await this.subAssemblyMachineRepository.save({
                        sub_assembly_id: updateAssemblyDetail.assembly_type_id,
                        machine_id: machine
                    })            
                })

                return { message: 'Part updated successfully' }
            }
        } else if (updateAssemblyDetail.update_type.includes('add')) {
            let id = ""

            if (updateAssemblyDetail.assembly_type.includes('sub_assembly')) {
                const subAssemblyObj = await this.subAssemblyRepository.findOne({ where: { id: updateAssemblyDetail.assembly_type_id } })

                if (updateAssemblyDetail.assembly_udpate_type.includes('Part')) {
                    const part = await this.partRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.subAssemblyDetailRepository.save({
                        sub_assembly: subAssemblyObj,
                        part: part,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                } else if (updateAssemblyDetail.assembly_udpate_type.includes('Boughtout')) {
                    const boughtOut = await this.boughtOutRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.subAssemblyDetailRepository.save({
                        sub_assembly: subAssemblyObj,
                        bought_out: boughtOut,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                }
            } else if (updateAssemblyDetail.assembly_type.includes('main_assembly')) {
                const mainAssemblyObj = await this.mainAssemblyRepository.findOne({ where: { id: updateAssemblyDetail.assembly_type_id } })

                if (updateAssemblyDetail.assembly_udpate_type.includes('Part')) {
                    const part = await this.partRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.mainAssemblyDetailRepository.save({
                        main_assembly: mainAssemblyObj,
                        part: part,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                } else if (updateAssemblyDetail.assembly_udpate_type.includes('Boughtout')) {
                    const boughtOut = await this.boughtOutRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.mainAssemblyDetailRepository.save({
                        main_assembly: mainAssemblyObj,
                        bought_out: boughtOut,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                } else if (updateAssemblyDetail.assembly_udpate_type.includes('Sub Assembly')) {
                    const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.mainAssemblyDetailRepository.save({
                        main_assembly: mainAssemblyObj,
                        sub_assembly: subAssembly,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                }
            } else if (updateAssemblyDetail.assembly_type.includes('section_assembly')) {
                const sectionAssemblyObj = await this.sectionAssemblyRepository.findOne({ where: { id: updateAssemblyDetail.assembly_type_id } })

                if (updateAssemblyDetail.assembly_udpate_type.includes('Part')) {
                    const part = await this.partRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        part: part,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                } else if (updateAssemblyDetail.assembly_udpate_type.includes('Boughtout')) {
                    const boughtOut = await this.boughtOutRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        bought_out: boughtOut,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                } else if (updateAssemblyDetail.assembly_udpate_type.includes('Sub Assembly')) {
                    const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        sub_assembly: subAssembly,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                } else if (updateAssemblyDetail.assembly_udpate_type.includes('Main Assembly')) {
                    const mainAssembly = await this.mainAssemblyRepository.findOne({ where: { id: updateAssemblyDetail.id } })
                    const result = await this.sectionAssemblyDetailRepository.save({
                        section_assembly: sectionAssemblyObj,
                        main_assembly: mainAssembly,
                        qty: updateAssemblyDetail.qty
                    })
                    id = result.id
                }
            }

            return { message: `${updateAssemblyDetail.assembly_udpate_type} added successfully`, id }
        }
    }

    async updateBoughtout(updateBoughtoutDto: UpdateBoughtoutDto) {
        if (updateBoughtoutDto.update_type.includes('delete')) {
            await this.boughtOutSupplierRepository.delete({ id: updateBoughtoutDto.id })
            this.updateBoughtoutDays(updateBoughtoutDto.boughtout_id)
            return { message: 'Boughout supplier removed successfully' }
        } else if (updateBoughtoutDto.update_type.includes('edit')) {
            if(updateBoughtoutDto.update_type_entity.includes('bought_out_detail')){
                const boughtoutObj = await this.boughtOutRepository.findOneBy({ id: updateBoughtoutDto.boughtout_id })
                const boughtoutNameObj = await this.boughtOutRepository.findOneBy({ bought_out_name: updateBoughtoutDto.boughtout_name})
                if(boughtoutNameObj && boughtoutNameObj.id != boughtoutObj.id){
                    return { message: 'Boughtout name already exists' }
                }
                
                await this.boughtOutRepository.createQueryBuilder()
                .update(BoughtOutEntity).set({ bought_out_name: updateBoughtoutDto.boughtout_name,
                    is_machine: updateBoughtoutDto.is_machine, is_spm: updateBoughtoutDto.is_spm,
                    is_spare: updateBoughtoutDto.is_spare
                 })
                .where('id::VARCHAR=:id', { id: updateBoughtoutDto.boughtout_id })
                .execute()

                // await this.boughtOutMachineRepo.delete({bought_out: boughtoutObj})

                // updateBoughtoutDto.machines?.map(async (machine:any) => {
                //     const machineObj = await this.machineRepository.findOne({where: {id: machine}})
                //     await this.boughtOutMachineRepo.save({
                //         bought_out: boughtoutObj,
                //         machine: machineObj
                //     })            
                // })

                return { message: 'Boughtout updated successfully' }
            }else if(updateBoughtoutDto.update_type_entity.includes('bought_out_machine_add')){
                const machineObj = await this.machineRepository.findOne({where: {id: updateBoughtoutDto.id}})
                const boughtoutObj = await this.boughtOutRepository.findOneBy({ id: updateBoughtoutDto.boughtout_id })
                await this.boughtOutMachineRepo.save({
                    bought_out: boughtoutObj,
                    machine: machineObj
                })
                return { message: 'Machine added to Boughtout successfully' }
            }else if(updateBoughtoutDto.update_type_entity.includes('bought_out_machine_delete')){
                await this.boughtOutMachineRepo.createQueryBuilder().delete().from(BoughtoutMachineEntity)
                .where('machine_id=:machineId', { machineId: updateBoughtoutDto.id})
                .andWhere('boughtout_id=:boughtoutId', { boughtoutId: updateBoughtoutDto.boughtout_id })
                return { message: 'Machine removed from Boughtout successfully' }
            }else{
                await this.boughtOutSupplierRepository.createQueryBuilder()
                .update(BoughtOutSuppliertEntity)
                .set({
                    delivery_time: updateBoughtoutDto.delivery_time,
                    cost: updateBoughtoutDto.cost
                })
                .where('id=:id', { id: updateBoughtoutDto.id })
                .execute()

                this.updateBoughtoutDays(updateBoughtoutDto.boughtout_id)
            return { message: 'Boughout supplier updated successfully' }
            }            
        } else if (updateBoughtoutDto.update_type.includes('add')) {
            const supplier = await this.supplierRepository.findOne({ where: { id: updateBoughtoutDto.id } })
            const boughtOutObj = await this.boughtOutRepository.findOne({ where: { id: updateBoughtoutDto.boughtout_id } })
            await this.boughtOutSupplierRepository.save({
                supplier: supplier,
                bought_out: boughtOutObj,
                cost: updateBoughtoutDto.cost,
                delivery_time: updateBoughtoutDto.delivery_time
            })
            this.updateBoughtoutDays(updateBoughtoutDto.boughtout_id)
            return { message: 'Supplier added to boughtout successfully' }
        }
    }

    async updatePart(updatePartDto: UpdatePartDto) {
        if (updatePartDto.update_type.includes('delete')) {
            if (updatePartDto.update_type_entity.includes('part_process')) {
                await this.partProcessVendorRepository.delete({ part_process: updatePartDto.id })
                await this.partProcessRepository.delete({ id: updatePartDto.id })
                return { message: 'Part process removed successfully' }
            } else if (updatePartDto.update_type_entity.includes('process_vendor')) {
                await this.partProcessVendorRepository.delete({ id: updatePartDto.id })
                this.updatePartDays(updatePartDto.part_id)
                return { message: 'Process vendor removed successfully' }
            }
        } else if (updatePartDto.update_type.includes('edit')) {
            if (updatePartDto.update_type_entity.includes('process_vendor')) {
                await this.partProcessVendorRepository.createQueryBuilder()
                    .update(PartProcessVendorEntity)
                    .set({
                        part_process_vendor_price: updatePartDto.cost,
                        part_process_vendor_delivery_time: updatePartDto.delivery_time
                    })
                    .where('id=:id', { id: updatePartDto.id })
                    .execute()

                this.updatePartDays(updatePartDto.part_id)
                return { message: 'Process vendor updated successfully' }
            } else if(updatePartDto.update_type_entity.includes('part_detail')){
                const partObj = await this.partRepository.findOneBy({ id: updatePartDto.part_id })
                const partNameObj = await this.partRepository.findOneBy({ part_name: updatePartDto.part_name})
                if(partNameObj && partNameObj.id != partObj.id){
                    return { message: 'Part name already exists' }
                }
                
                await this.partRepository.createQueryBuilder()
                .update(PartEntity).set({ part_name: updatePartDto.part_name, minimum_stock_qty: Number(updatePartDto.minimum_stock_qty),
                    available_aty: Number(updatePartDto.available_qty), is_machine: updatePartDto.is_machine, is_spm: updatePartDto.is_spm,
                    is_spare: updatePartDto.is_spare
                 })
                .where('id::VARCHAR=:id', { id: updatePartDto.part_id })
                .execute()
                
                // await this.partMachineRepo.delete({part: partObj})

                // updatePartDto.machines?.map(async (machine:any) => {
                //     const machineObj = await this.machineRepository.findOne({where: {id: machine}})
                //     await this.partMachineRepo.save({
                //         part: partObj,
                //         machine: machineObj
                //     })            
                // })

                return { message: 'Part updated successfully' }
            }else if(updatePartDto.update_type_entity.includes('part_machine_add')){
                const partObj = await this.partRepository.findOneBy({ id: updatePartDto.part_id })
                const machineObj = await this.machineRepository.findOne({where: {id: updatePartDto.id}})
                await this.partMachineRepo.save({
                    part: partObj,
                    machine: machineObj
                })
                return { message: 'Machine added to Part successfully' }
            }else if(updatePartDto.update_type_entity.includes('part_machine_delete')){
                await this.partMachineRepo.createQueryBuilder().delete().from(PartMachineEntity)
                    .where('machine_id=:machineId', { machineId: updatePartDto.id})
                    .andWhere('part_id=:partId', { partId: updatePartDto.part_id })
                return { message: 'Machine removed from Part successfully' }
            }
        } else if (updatePartDto.update_type.includes('add')) {
            if (updatePartDto.update_type_entity.includes('part_process')) {
                const processObj = await this.processRepository.findOneBy({ id: updatePartDto.process_id })
                const partObj = await this.partRepository.findOneBy({ id: updatePartDto.id })
                const partProcessObj = await this.partProcessRepository.save({
                    part: partObj,
                    process: processObj
                })
                return { message: 'Part process added successfully', id: partProcessObj.id }
            } else if (updatePartDto.update_type_entity.includes('process_vendor')) {
                const vendor = await this.vendorRepository.findOne({ where: { id: updatePartDto.vendor_id } })
                const partProcessObj = await this.partProcessRepository.findOne({ where: { id: updatePartDto.id } })
                const processVendorObj = await this.partProcessVendorRepository.save({
                    part_process: partProcessObj,
                    part_process_vendor_price: updatePartDto.cost,
                    part_process_vendor_delivery_time: updatePartDto.delivery_time,
                    vendor: vendor
                })
                this.updatePartDays(updatePartDto.part_id)
                return { message: 'Process vendor added successfully', id: processVendorObj.id }
            }
        }
    }

    async updatePartDays(part_id: string) {
        const daysQuery = await this.partProcessVendorRepository.createQueryBuilder('v')
            .leftJoinAndSelect('v.part_process', 'part_process')
            .leftJoinAndSelect('part_process.part', 'part')
            .select(['min(v.part_process_vendor_delivery_time::int) as vl', 'part_process.id'])
            .groupBy('part_process.id')
            .where('part.id::VARCHAR=:id', { id: part_id })
            .getRawMany()
        const days = daysQuery.reduce((n, { vl }) => n + vl, 0)

        await this.partRepository.createQueryBuilder()
            .update(PartEntity).set({ days: days })
            .where('id::VARCHAR=:id', { id: part_id })
            .execute()
    }

    async updateBoughtoutDays(boughtout_id: string) {
        const daysQuery = await this.boughtOutSupplierRepository.createQueryBuilder('v')
            .leftJoinAndSelect('v.bought_out', 'bought_out')
            .select(['min(v.delivery_time::int) as vl', 'bought_out.id'])
            .groupBy('bought_out.id')
            .where('bought_out.id::VARCHAR=:id', { id: boughtout_id })
            .getRawMany()
        const days = daysQuery.reduce((n, { vl }) => n + vl, 0)

        await this.boughtOutRepository.createQueryBuilder()
            .update(BoughtOutEntity).set({ days: days })
            .where('id::VARCHAR=:id', { id: boughtout_id })
            .execute()
    }

    async addSubAssemblyToMachine(addSubAssemblyToMachine: AddSubAssemblyMachine) {
        if (addSubAssemblyToMachine.type.includes('Add')) {
            const machineObj = await this.machineRepository.findOne({ where: { id: addSubAssemblyToMachine.machine_id } })
            const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: addSubAssemblyToMachine.sub_assembly_id } })

            const obj = await this.machineSubAssemblyRepository.save({
                machine: machineObj,
                qty: addSubAssemblyToMachine.qty,
                sub_assembly: subAssembly
            })
            return { message: 'Sub Assembly Added successfully', id: obj.id }
        } else if (addSubAssemblyToMachine.type.includes('Edit')) {
            await this.machineSubAssemblyRepository.createQueryBuilder()
                .update(MachineSubAssemblyEntity)
                .set({ qty: addSubAssemblyToMachine.qty })
                .where('id=:id', { id: addSubAssemblyToMachine.id })
                .execute()
            return { message: 'Sub Assembly updated successfully' }
        } else if (addSubAssemblyToMachine.type.includes('Delete')) {
            await this.machineSubAssemblyRepository.delete({ id: addSubAssemblyToMachine.id })
            return { message: 'Sub Assembly removed successfully' }
        }

    }

    async createNewMachine(createMachineDto: CreateMachine) {
        if (createMachineDto.type.includes('Add')) {
            const existingMachine = await this.machineRepository.find({ select: ['id', 'machine_name'], where: { is_active: true, machine_name: createMachineDto.machine_name } })

            if (existingMachine.length > 0) {
                return { message: "Machine already exists" }
            }
            const machineObj = await this.machineRepository.save({
                model_no: createMachineDto.model_no,
                machine_name: createMachineDto.machine_name,
                side_type: createMachineDto.side_type,
                spindles: createMachineDto.spindles,
                min_spindles: createMachineDto.min_spindles,
                max_spindles: createMachineDto.max_spindles
            })

            return { message: 'Machine created successfully' }
        } else {
            const existingMachine = await this.machineRepository.find({ select: ['id', 'machine_name'], where: { machine_name: createMachineDto.machine_name } })
            if (existingMachine.length == 0 || existingMachine[0].id.includes(createMachineDto.id)) {
                await this.machineRepository.createQueryBuilder()
                    .update(MachineEntity)
                    .set({
                        model_no: createMachineDto.model_no,
                        machine_name: createMachineDto.machine_name,
                        side_type: createMachineDto.side_type,
                        spindles: createMachineDto.spindles,
                        min_spindles: createMachineDto.min_spindles,
                        max_spindles: createMachineDto.max_spindles
                    })
                    .where('id=:id', { id: createMachineDto.id })
                    .execute()
                return { message: 'Machine updated successfully' }
            } else {
                return { message: 'Machine name already exists' }
            }
        }
    }

    async createMachine(createMachineDto: CreateMachine) {
        const existingMachine = await this.machineRepository.find({ select: ['id', 'machine_name'], where: { is_active: true, machine_name: createMachineDto.machine_name } })

        if (existingMachine.length > 0) {
            return { message: "Machine already exists" }
        }
        const machineObj = await this.machineRepository.save({
            model_no: createMachineDto.model_no,
            machine_name: createMachineDto.machine_name,
            side_type: createMachineDto.side_type,
            spindles: createMachineDto.spindles,
            min_spindles: createMachineDto.min_spindles,
            max_spindles: createMachineDto.max_spindles
        })

        createMachineDto.sub_assembly.map(async (machineSubAssembly: any) => {
            const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: machineSubAssembly.sub_assembly_id } })
            await this.machineSubAssemblyRepository.save({
                machine: machineObj,
                sub_assembly: subAssembly,
                qty: machineSubAssembly.qty
            })
        })

        createMachineDto.main_assembly.map(async (mainAssembly) => {
            const mainAssemblyObj = await this.mainAssemblyRepository.save({
                main_assembly_name: mainAssembly.main_assembly_name,
                serial_no: mainAssembly.serial_no,
                machine: machineObj
            })
            mainAssembly.main_assembly_detail.map(async (detail) => {
                if (detail.part_id) {
                    const part = await this.partRepository.findOne({ where: { id: detail.part_id } })
                    if (part) {
                        await this.mainAssemblyDetailRepository.save({
                            main_assembly: mainAssemblyObj,
                            part: part,
                            qty: detail.qty
                        })
                    }
                } else if (detail.bought_out_id) {
                    const boughtOut = await this.boughtOutRepository.findOne({ where: { id: detail.bought_out_id } })
                    if (boughtOut) {
                        await this.mainAssemblyDetailRepository.save({
                            main_assembly: mainAssemblyObj,
                            bought_out: boughtOut,
                            qty: detail.qty
                        })
                    }
                } else if (detail.sub_assembly_id) {
                    const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: detail.sub_assembly_id } })
                    if (subAssembly) {
                        await this.mainAssemblyDetailRepository.save({
                            main_assembly: mainAssemblyObj,
                            sub_assembly: subAssembly,
                            qty: detail.qty
                        })
                    }
                }
            })
        })

        createMachineDto.section_assembly.map(async (sectionAssembly) => {
            const sectionAssemblyObj = await this.sectionAssemblyRepository.save({
                section_assembly_name: sectionAssembly.section_assembly_name,
                serial_no: sectionAssembly.serial_no,
                machine: machineObj
            })
            sectionAssembly.section_assembly_detail.map(async (detail) => {
                if (detail.part_id) {
                    const part = await this.partRepository.findOne({ where: { id: detail.part_id } })
                    if (part) {
                        await this.sectionAssemblyDetailRepository.save({
                            section_assembly: sectionAssemblyObj,
                            part: part,
                            qty: detail.qty
                        })
                    }
                } else if (detail.bought_out_id) {
                    const boughtOut = await this.boughtOutRepository.findOne({ where: { id: detail.bought_out_id } })
                    if (boughtOut) {
                        await this.sectionAssemblyDetailRepository.save({
                            section_assembly: sectionAssemblyObj,
                            bought_out: boughtOut,
                            qty: detail.qty
                        })
                    }
                } else if (detail.sub_assembly_id) {
                    const subAssembly = await this.subAssemblyRepository.findOne({ where: { id: detail.sub_assembly_id } })
                    if (subAssembly) {
                        await this.sectionAssemblyDetailRepository.save({
                            section_assembly: sectionAssemblyObj,
                            sub_assembly: subAssembly,
                            qty: detail.qty
                        })
                    }
                } else if (detail.main_assembly_name) {
                    const mainAssembly = await this.mainAssemblyRepository.findOne({ where: { main_assembly_name: detail.main_assembly_name } })
                    if (mainAssembly) {
                        await this.sectionAssemblyDetailRepository.save({
                            section_assembly: sectionAssemblyObj,
                            main_assembly: mainAssembly,
                            qty: detail.qty
                        })
                    }
                }
            })
        })

        return { message: "Machine created successfully" }
    }

    async getMachineList(pagination: Pagination) {
        let query = this.machineRepository.createQueryBuilder('machine')
            .select([
                'machine.id',
                'machine.model_no',
                'machine.machine_name',
                'machine.side_type',
                'machine.spindles',
                'machine.min_spindles',
                'machine.max_spindles'
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

    async getMachineDetail(id: string) {
        let query = this.machineRepository.createQueryBuilder('machine')
            .leftJoinAndSelect('machine.machine_sub_assembly', 'machine_sub_assembly')
            .leftJoinAndSelect('machine_sub_assembly.sub_assembly', 'sub_assembly')
            .leftJoinAndSelect('machine.main_assembly', 'main_assembly')
            .leftJoinAndSelect('main_assembly.main_assembly_detail', 'main_assembly_detail')
            .leftJoinAndSelect('main_assembly_detail.part', 'main_assembly_part')
            .leftJoinAndSelect('main_assembly_detail.bought_out', 'main_assembly_bought_out')
            .leftJoinAndSelect('main_assembly_detail.sub_assembly', 'main_assembly_sub_assembly')
            .leftJoinAndSelect('machine.section_assembly', 'section_assembly')
            .leftJoinAndSelect('section_assembly.section_assembly_detail', 'section_assembly_detail')
            .leftJoinAndSelect('section_assembly_detail.part', 'section_assembly_part')
            .leftJoinAndSelect('section_assembly_detail.bought_out', 'section_assembly_bought_out')
            .leftJoinAndSelect('section_assembly_detail.sub_assembly', 'section_assembly_sub_assembly')
            .leftJoinAndSelect('section_assembly_detail.main_assembly', 'section_assembly_main_assembly')
            .select(['machine.id',
                'machine.model_no',
                'machine.machine_name',
                'machine.side_type',
                'machine.spindles',
                'machine.min_spindles',
                'machine.max_spindles',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'machine_sub_assembly.id',
                'machine_sub_assembly.qty',
                'main_assembly.id',
                'main_assembly.main_assembly_name',
                'main_assembly.serial_no',
                'main_assembly_detail.id',
                'main_assembly_detail.qty',
                'main_assembly_part.id',
                'main_assembly_part.part_name',
                'main_assembly_bought_out.id',
                'main_assembly_bought_out.bought_out_name',
                'main_assembly_sub_assembly.id',
                'main_assembly_sub_assembly.sub_assembly_name',

                'section_assembly.section_assembly_name',
                'section_assembly.serial_no',
                'section_assembly_detail.id',
                'section_assembly_detail.qty',
                'section_assembly_part.id',
                'section_assembly_part.part_name',
                'section_assembly_bought_out.id',
                'section_assembly_bought_out.bought_out_name',
                'section_assembly_sub_assembly.id',
                'section_assembly_sub_assembly.sub_assembly_name',
                'section_assembly_main_assembly.id',
                'section_assembly_main_assembly.main_assembly_name'])
            .where('machine.id=:id', { id })
        return await query.getOne()
    }

    async checkName(checkNameDto: CheckNameDto) {
        if (checkNameDto.type == 'Sub Assembly') {
            const existingSubAssembly = await this.subAssemblyRepository.find({ select: ['id', 'sub_assembly_name'], where: { is_active: true, sub_assembly_name: checkNameDto.checkName } })
            if (existingSubAssembly.length > 0) {
                return { message: 'Sub Assembly already exists' }
            } else {
                return { message: 'Success' }
            }
        } else if (checkNameDto.type == 'Main Assembly') {
            const existingMainAssembly = await this.mainAssemblyRepository.find({ select: ['id', 'main_assembly_name'], where: { is_active: true, main_assembly_name: checkNameDto.checkName } })
            if (existingMainAssembly.length > 0) {
                return { message: 'Main Assembly already exists' }
            } else {
                return { message: 'Success' }
            }
        } else if (checkNameDto.type == 'Section Assembly') {
            const existingSectionAssembly = await this.sectionAssemblyRepository.find({ select: ['id', 'section_assembly_name'], where: { is_active: true, section_assembly_name: checkNameDto.checkName } })
            if (existingSectionAssembly.length > 0) {
                return { message: 'Section Assembly already exists' }
            } else {
                return { message: 'Success' }
            }
        }
    }

    async createAttachment(fileDto: FileDto) {
        const s = JSON.parse(JSON.stringify(fileDto.file_list))
        JSON.parse(s)?.map(async (file) => {
            await this.attachmentRepository.save({
                parent_id: fileDto.type_id,
                parent_type: fileDto.type,
                file_name: file.file_name,
                file_type: file.file_type,
                file_size: file.file_size
            })
        })
        return { message: 'Files uploaded successfully' }
    }

    async removeAttachment(removeAttachmentDto: RemoveAttachmentDto) {
        await this.attachmentRepository.delete({ id: removeAttachmentDto.id })
        var fs = require('fs')
        fs.unlinkSync(join(process.cwd(), 'uploads/' + removeAttachmentDto.file_name))
        return { message: 'Attachment removed successfully' }
    }

    async vendorAttachment(vendorAttachmentDto: VendorAttachmentDto) {
        const vendor = await this.vendorRepository.findOne({where: { id: vendorAttachmentDto.vendor_id }})
        const attachments = await this.attachmentRepository.find({where : { parent_id: vendorAttachmentDto.part_id, parent_type: 'part'}})

        return { vendor, attachments }
    }
}
