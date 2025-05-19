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
import { AttachmentEntity } from 'src/model/attachment.entity';
import { join } from 'path';
import { PartMachineEntity } from 'src/model/part_machine.entity';
import { BoughtoutMachineEntity } from 'src/model/bought_out_machine.entity';
import { UUID } from 'crypto';
import { AssemblyMachineSubEntity } from 'src/model/assembly_machine_sub.entity';
import { AssemblyMachineMainEntity } from 'src/model/assembly_machine_main.entity';
import { OrderConfirmationEntity } from 'src/model/order_confirmation.entity';
import { AssemblyMachineSectionEntity } from 'src/model/assembly_machine_section.entity';
import { UpdateAssemblyDto } from 'src/dto/assembly.dto';
import { ProductionMachineHistoryEntity } from 'src/model/production_machine_history.entity';
import { UserEntity } from 'src/model/user.entity';
import { SparesQuotationEntity } from 'src/model/spares_quotation.entity';

@Injectable()
export class AssemblyService {
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
        @InjectRepository(BoughtoutMachineEntity) private boughtOutMachineRepo: Repository<BoughtoutMachineEntity>,
        @InjectRepository(AssemblyMachineSubEntity) private assemblySubRepo: Repository<AssemblyMachineSubEntity>,
        @InjectRepository(AssemblyMachineMainEntity) private assemblyMainRepo: Repository<AssemblyMachineMainEntity>,
        @InjectRepository(AssemblyMachineSectionEntity) private assemblySectionRepo: Repository<AssemblyMachineSectionEntity>,
        @InjectRepository(OrderConfirmationEntity) private orderRepo: Repository<OrderConfirmationEntity>,
        @InjectRepository(ProductionMachineHistoryEntity) private historyRepo: Repository<ProductionMachineHistoryEntity>,
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(SparesQuotationEntity) private sparesQuotationRepo: Repository<SparesQuotationEntity>
    ) { }

    async configureSparesAssemblies(machineId: string, orderId: UUID) {
        const order = await this.orderRepo.createQueryBuilder('order')
            .leftJoinAndSelect('order.spares_quotation', 'quotation')
            .where('order.id = :id', { id: orderId })
            .getOne()
        const quotation = await this.sparesQuotationRepo.findOne({where: { id: order.spares_quotation.id }})
        const spares = quotation.spares

        let assembly_sub: any = []
        let sub_part: any = []
        let sub_bo: any = []

        const spare_parts: any = []
        const spare_bos: any = []
        const spare_sub_assembly: any = []
        
        const spare_main_assembly: any = []
        let main_assembly_sub: any = []
        let main_assembly_bo: any = []
        let main_assembly_part: any = []
        
        for(const spare of spares){
             if(spare.spare_type == 'part'){
                // Parts of spares - insert to the section
                spare_parts.push({
                    section_assembly_id: '',
                    section_assembly_name: '',
                    part_id: spare.spare_id,
                    part_name: spare.spare_name,
                    qty: spare.spare_qty
                })
            }else if(spare.spare_type == 'bought_out'){
                // Boughtout of spares - insert to the section
                spare_bos.push({
                    section_assembly_id: '',
                    section_assembly_name: '',
                    bought_out_id: spare.spare_id,
                    bought_out_name: spare.spare_name,
                    qty: spare.spare_qty
                })
            }else if(spare.spare_type == 'sub_assembly'){
                // Sub Assembly of spares - insert to the section
                spare_sub_assembly.push({
                    section_assembly_id: '',
                    section_assembly_name: '',
                    sub_assembly_id: spare.spare_id,
                    sub_assembly_name: spare.spare_name,
                    qty: spare.spare_qty
                })

              const spare_sub_assembly_detail =  await this.subAssemblyRepository.createQueryBuilder('sub_assembly')
                .innerJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_detail')
                .leftJoinAndSelect('sub_detail.part', 'part')
                .leftJoinAndSelect('sub_detail.bought_out', 'bought_out')
                .select([
                    'sub_assembly.id',
                    'sub_assembly.sub_assembly_name',
                    'sub_detail.id',
                    'sub_detail.qty',
                    'part.id',
                    'part.part_name',
                    'bought_out.id',
                    'bought_out.bought_out_name'
                ])
                .where('sub_assembly.id=:id', { id: spare.spare_id })
                .getMany()

                if (assembly_sub.filter((as: any) => as.uid == spare.spare_id)?.length > 0) {
                    const existing = assembly_sub.filter((asb: any) => asb.uid == `${spare.spare_id}`)[0]
                    const update = assembly_sub.filter((asb: any) => asb.uid != `${spare.spare_id}`)
                    update.push({
                        uid: `${spare.spare_id}`,
                        sub_assembly_name: spare.spare_name,
                        qty: Number(spare.spare_qty) + Number(existing.qty)
                    })
                    assembly_sub = update
                } else {
                    assembly_sub.push({
                        uid: `${spare.spare_id}`,
                        sub_assembly_name: spare.spare_name,
                        qty: spare.spare_qty
                    })
                }

                for(const sub of spare_sub_assembly_detail){
                    for(const detail of sub.sub_assembly_detail){
                        if (detail.part) {
                            if (sub_part.filter((sp: any) => sp.uid == `${sub.id}_${detail.part.id}`)?.length == 0) {
                                sub_part.push({
                                    uid: `${sub.id}_${detail.part.id}`,
                                    sub_assembly_id: sub.id,
                                    sub_assembly_name: sub.sub_assembly_name,
                                    part_id: detail.part.id,
                                    part_name: detail.part.part_name,
                                    qty: detail.qty
                                })
                            }
                        }

                        if (detail.bought_out) {
                            if (sub_bo.filter((sp: any) => sp.uid == `${sub.id}_${detail.bought_out.id}`)?.length == 0) {
                                sub_bo.push({
                                    uid: `${sub.id}_${detail.bought_out.id}`,
                                    sub_assembly_id: sub.id,
                                    sub_assembly_name: sub.sub_assembly_name,
                                    bought_out_id: detail.bought_out.id,
                                    bought_out_name: detail.bought_out.bought_out_name,
                                    qty: detail.qty
                                })
                            }

                        }
                    }
                }
            }else if(spare.spare_type == 'main_assembly'){
                // Main Assembly of spares - insert to the section
                spare_main_assembly.push({
                    section_assembly_id: '',
                    section_assembly_name: '',
                    main_assembly_id: spare.spare_id,
                    main_assembly_name: spare.spare_name,
                    qty: spare.spare_qty
                })

                const mainAssemblyDetail = await this.mainAssemblyRepository.createQueryBuilder('main')
                .leftJoinAndSelect('main.main_assembly_detail', 'main_detail')
                .leftJoinAndSelect('main_detail.part', 'main_part')
                .leftJoinAndSelect('main_detail.bought_out', 'main_bought_out')
                .leftJoinAndSelect('main_detail.sub_assembly', 'sub_assembly')
                .leftJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_detail')
                .leftJoinAndSelect('sub_detail.part', 'part')
                .leftJoinAndSelect('sub_detail.bought_out', 'bought_out')
                .select([
                    'main.id',
                    'main.main_assembly_name',
                    'main_detail.id',
                    'main_detail.qty',
                    'main_part.id',
                    'main_part.part_name',
                    'main_bought_out.id',
                    'main_bought_out.bought_out_name',
                    'sub_assembly.id',
                    'sub_assembly.sub_assembly_name',
                    'sub_detail.id',
                    'sub_detail.qty',
                    'part.id',
                    'part.part_name',
                    'bought_out.id',
                    'bought_out.bought_out_name'
                ])
                .where('main.id=:id', { id: spare.spare_id })
                .getMany();

                for(const detail of mainAssemblyDetail){
                    for(const main_detail of detail.main_assembly_detail){
                        if (main_detail.part) {
                            main_assembly_part.push({
                                main_assembly_id: detail.id,
                                main_assembly_name: detail.main_assembly_name,
                                part_id: main_detail.part.id,
                                part_name: main_detail.part.part_name,
                                qty: spare.spare_qty * main_detail.qty,
                                main_assembly_qty: spare.spare_qty
                            })
                        }
                        if (main_detail.bought_out) {
                            main_assembly_bo.push({
                                main_assembly_id: detail.id,
                                main_assembly_name: detail.main_assembly_name,
                                bought_out_id: main_detail.bought_out.id,
                                bought_out_name: main_detail.bought_out.bought_out_name,
                                qty: spare.spare_qty * main_detail.qty,
                                main_assembly_qty: spare.spare_qty
                            })
                        }
                        if (main_detail.sub_assembly) {
                            main_assembly_sub.push({
                                main_assembly_id: detail.id,
                                main_assembly_name: detail.main_assembly_name,
                                sub_assembly_id: main_detail.sub_assembly.id,
                                sub_assembly_name: main_detail.sub_assembly.sub_assembly_name,
                                qty: spare.spare_qty * main_detail.qty,
                                main_assembly_qty: spare.spare_qty
                            })

                            main_detail.sub_assembly.sub_assembly_detail.forEach((sb_detail: any) => {
                                if (sb_detail.part) {
                                    if (sub_part.filter((sp: any) => sp.uid == `${main_detail.sub_assembly.id}_${sb_detail.part.id}`)?.length == 0) {
                                        sub_part.push({
                                            uid: `${main_detail.sub_assembly.id}_${sb_detail.part.id}`,
                                            sub_assembly_id: main_detail.sub_assembly.id,
                                            sub_assembly_name: main_detail.sub_assembly.sub_assembly_name,
                                            part_id: sb_detail.part.id,
                                            part_name: sb_detail.part.part_name,
                                            qty: sb_detail.qty
                                        })
                                    }
                                }

                                if (sb_detail.bought_out) {
                                    if (sub_bo.filter((sp: any) => sp.uid == `${main_detail.sub_assembly.id}_${sb_detail.bought_out.id}`)?.length == 0) {
                                        sub_bo.push({
                                            uid: `${main_detail.sub_assembly.id}_${sb_detail.bought_out.id}`,
                                            sub_assembly_id: main_detail.sub_assembly.id,
                                            sub_assembly_name: main_detail.sub_assembly.sub_assembly_name,
                                            bought_out_id: sb_detail.bought_out.id,
                                            bought_out_name: sb_detail.bought_out.bought_out_name,
                                            qty: sb_detail.qty
                                        })
                                    }

                                }
                            })
                        }
                    }
                }
            }
        }

       const subAssemblyConsolidatedQty = {};

        await Object.keys(subAssemblyConsolidatedQty).forEach(async (key: string) => {
            if (assembly_sub.filter((as: any) => as.uid == key.split('~')[0]).length == 0) {
                assembly_sub.push({
                    uid: key.split('~')[0],
                    sub_assembly_name: key.split('~')[1],
                    qty: subAssemblyConsolidatedQty[key]
                })
            } else {
                const existing = assembly_sub.filter((as: any) => as.uid == key.split('~')[0])[0]
                assembly_sub = assembly_sub.filter((as: any) => as.uid != key.split('~')[0])
                assembly_sub.push({
                    uid: key.split('~')[0],
                    sub_assembly_name: key.split('~')[1],
                    qty: subAssemblyConsolidatedQty[key] + existing.qty
                })
            }
        })

        sub_part.forEach((sub: any) => {
            this.assemblySubRepo.save({
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                part_id: sub.part_id,
                part_name: sub.part_name,
                qty: sub.qty * assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                sub_assembly_qty:
                    assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                order
            })
        })

        sub_bo.forEach((sub: any) => {
            this.assemblySubRepo.save({
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                bought_out_id: sub.bought_out_id,
                bought_out_name: sub.bought_out_name,
                qty: sub.qty * assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                sub_assembly_qty: assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                order
            })
        })

        main_assembly_part.forEach((sub: any) => {
            this.assemblyMainRepo.save({
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                part_id: sub.part_id,
                part_name: sub.part_name,
                qty: sub.qty,
                main_assembly_qty: sub.main_assembly_qty,
                order
            })
        })

        main_assembly_bo.forEach((sub: any) => {
            this.assemblyMainRepo.save({
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                bought_out_id: sub.bought_out_id,
                bought_out_name: sub.bought_out_name,
                qty: sub.qty,
                main_assembly_qty: sub.main_assembly_qty,
                order
            })
        })

        main_assembly_sub.forEach((sub: any) => {
            this.assemblyMainRepo.save({
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                qty: sub.qty,
                main_assembly_qty: sub.main_assembly_qty,
                order
            })
        })

        spare_parts.forEach((sub: any) => {
            this.assemblySectionRepo.save({
                part_id: sub.part_id,
                part_name: sub.part_name,
                qty: sub.qty,
                order
            })
        })

        spare_bos.forEach((sub: any) => {
            this.assemblySectionRepo.save({
                bought_out_id: sub.bought_out_id,
                bought_out_name: sub.bought_out_name,
                qty: sub.qty,
                order
            })
        })

        spare_main_assembly.forEach((sub: any) => {
            this.assemblySectionRepo.save({
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                qty: sub.qty,
                order
            })
        })

        spare_sub_assembly.forEach((sub: any) => {
            this.assemblySectionRepo.save({
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                qty: sub.qty,
                order
            })
        })
        
        await this.orderRepo.createQueryBuilder()
            .update(OrderConfirmationEntity)
            .set({
                status: 'In-Progress'
            })
            .where('id=:id', { id: orderId })
            .execute()
        return { messag: 'Assembly configuration completed successfully' }
    }

    async configureMachineAssemblies(machineId: string, orderId: UUID) {
        const mainSubAssemblyList = await this.machineRepository.createQueryBuilder('machine')
            .leftJoinAndSelect('machine.main_assembly', 'main')
            .leftJoinAndSelect('main.main_assembly_detail', 'main_detail')
            .leftJoinAndSelect('main_detail.part', 'main_part')
            .leftJoinAndSelect('main_detail.bought_out', 'main_bought_out')
            .leftJoinAndSelect('main_detail.sub_assembly', 'sub_assembly')
            .leftJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_detail')
            .leftJoinAndSelect('sub_detail.part', 'part')
            .leftJoinAndSelect('sub_detail.bought_out', 'bought_out')
            .select([
                'machine.id',
                'machine.machine_name',
                'machine.spindles',
                'machine.side_type',
                'main.id',
                'main.main_assembly_name',
                'main_detail.id',
                'main_detail.qty',
                'main_part.id',
                'main_part.part_name',
                'main_bought_out.id',
                'main_bought_out.bought_out_name',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'sub_detail.id',
                'sub_detail.qty',
                'part.id',
                'part.part_name',
                'bought_out.id',
                'bought_out.bought_out_name'
            ])
            .where('machine.id=:id', { id: machineId })
            // .andWhere('main_detail.sub_assembly is not null')
            .getMany()

        const sectionSubAssemblyList = await this.machineRepository.createQueryBuilder('machine')
            .innerJoinAndSelect('machine.section_assembly', 'section')
            .innerJoinAndSelect('section.section_assembly_detail', 'section_detail')
            .innerJoinAndSelect('section_detail.sub_assembly', 'sub_assembly')
            .innerJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_detail')
            .leftJoinAndSelect('sub_detail.part', 'part')
            .leftJoinAndSelect('sub_detail.bought_out', 'bought_out')
            .select([
                'machine.id',
                'machine.machine_name',
                'machine.spindles',
                'machine.side_type',
                'section.id',
                'section.section_assembly_name',
                'section_detail.id',
                'section_detail.qty',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'sub_detail.id',
                'sub_detail.qty',
                'part.id',
                'part.part_name',
                'bought_out.id',
                'bought_out.bought_out_name'
            ])
            .where('machine.id=:id', { id: machineId })
            .andWhere('section_detail.sub_assembly is not null')
            .getMany()

        const sectionMainAssemblyList = await this.machineRepository.createQueryBuilder('machine')
            .innerJoinAndSelect('machine.section_assembly', 'section')
            .innerJoinAndSelect('section.section_assembly_detail', 'section_detail')
            .leftJoinAndSelect('section_detail.main_assembly', 'main_assembly')
            .leftJoinAndSelect('main_assembly.main_assembly_detail', 'main_detail')
            .leftJoinAndSelect('section_detail.sub_assembly', 'section_sub')
            .leftJoinAndSelect('section_detail.part', 'section_part')
            .leftJoinAndSelect('section_detail.bought_out', 'section_bought_out')
            .leftJoinAndSelect('main_detail.sub_assembly', 'sub_assembly')
            .leftJoinAndSelect('main_detail.part', 'main_part')
            .leftJoinAndSelect('main_detail.bought_out', 'main_bought_out')
            .leftJoinAndSelect('sub_assembly.sub_assembly_detail', 'sub_detail')
            .leftJoinAndSelect('sub_detail.part', 'part')
            .leftJoinAndSelect('sub_detail.bought_out', 'bought_out')
            .select([
                'machine.id',
                'machine.machine_name',
                'machine.spindles',
                'machine.side_type',
                'section.id',
                'section.section_assembly_name',
                'section_detail.id',
                'section_detail.qty',
                'section_sub.id',
                'section_sub.sub_assembly_name',
                'section_part.id',
                'section_part.part_name',
                'section_bought_out.id',
                'section_bought_out.bought_out_name',
                'main_assembly.id',
                'main_assembly.main_assembly_name',
                'main_detail.id',
                'main_detail.qty',
                'main_part.id',
                'main_part.part_name',
                'main_bought_out.id',
                'main_bought_out.bought_out_name',
                'sub_assembly.id',
                'sub_assembly.sub_assembly_name',
                'part.id',
                'part.part_name',
                'bought_out.id',
                'bought_out.bought_out_name'
            ])
            .where('machine.id=:id', { id: machineId })
            // .andWhere('section_detail.main_assembly is not null')
            // .andWhere('main_detail.sub_assembly is not null')
            .getMany()

        let assembly_sub: any = []
        let sub_part: any = []
        let sub_bo: any = []

        let main_assembly_sub: any = []
        let main_assembly_bo: any = []
        let main_assembly_part: any = []

        let section_assembly_main: any = []
        let section_assembly_sub: any = []
        let section_assembly_bo: any = []
        let section_assembly_part: any = []

        const subAssemblyConsolidatedQty = {};

        sectionMainAssemblyList.forEach((mainAssembly) => {
            mainAssembly.section_assembly.forEach((sectionAssembly) => {
                sectionAssembly.section_assembly_detail.forEach((sectionDetail) => {
                    if (sectionDetail.main_assembly) {
                        section_assembly_main.push({
                            section_assembly_id: sectionAssembly.id,
                            section_assembly_name: sectionAssembly.section_assembly_name,
                            main_assembly_id: sectionDetail.main_assembly.id,
                            main_assembly_name: sectionDetail.main_assembly.main_assembly_name,
                            qty: sectionDetail.qty
                        })
                        const mainQty = sectionDetail.qty;
                        sectionDetail.main_assembly.main_assembly_detail.forEach((mainDetail) => {
                            if (mainDetail.sub_assembly) {
                                main_assembly_sub.push({
                                    main_assembly_id: sectionDetail.main_assembly.id,
                                    main_assembly_name: sectionDetail.main_assembly.main_assembly_name,
                                    sub_assembly_id: mainDetail.sub_assembly.id,
                                    sub_assembly_name: mainDetail.sub_assembly.sub_assembly_name,
                                    qty: mainQty * mainDetail.qty,
                                    main_assembly_qty: sectionDetail.qty
                                })

                                const subQty = mainDetail.qty;
                                const id = `${mainDetail.sub_assembly.id}~${mainDetail.sub_assembly.sub_assembly_name}`;

                                const totalQty = mainQty * subQty;
                                subAssemblyConsolidatedQty[id] =
                                    (subAssemblyConsolidatedQty[id] || 0) + totalQty;
                            } else if (mainDetail.part) {
                                main_assembly_part.push({
                                    main_assembly_id: sectionDetail.main_assembly.id,
                                    main_assembly_name: sectionDetail.main_assembly.main_assembly_name,
                                    part_id: mainDetail.part.id,
                                    part_name: mainDetail.part.part_name,
                                    qty: mainQty * mainDetail.qty,
                                    main_assembly_qty: sectionDetail.qty
                                })
                            } else if (mainDetail.bought_out) {
                                main_assembly_bo.push({
                                    main_assembly_id: sectionDetail.main_assembly.id,
                                    main_assembly_name: sectionDetail.main_assembly.main_assembly_name,
                                    bought_out_id: mainDetail.bought_out.id,
                                    bought_out_name: mainDetail.bought_out.bought_out_name,
                                    qty: mainQty * mainDetail.qty,
                                    main_assembly_qty: sectionDetail.qty
                                })
                            }
                        });
                    } else if (sectionDetail.sub_assembly) {
                        section_assembly_sub.push({
                            section_assembly_id: sectionAssembly.id,
                            section_assembly_name: sectionAssembly.section_assembly_name,
                            sub_assembly_id: sectionDetail.sub_assembly.id,
                            sub_assembly_name: sectionDetail.sub_assembly.sub_assembly_name,
                            qty: sectionDetail.qty
                        })
                    } else if (sectionDetail.part) {
                        section_assembly_part.push({
                            section_assembly_id: sectionAssembly.id,
                            section_assembly_name: sectionAssembly.section_assembly_name,
                            part_id: sectionDetail.part.id,
                            part_name: sectionDetail.part.part_name,
                            qty: sectionDetail.qty
                        })
                    } else if (sectionDetail.bought_out) {
                        section_assembly_bo.push({
                            section_assembly_id: sectionAssembly.id,
                            section_assembly_name: sectionAssembly.section_assembly_name,
                            bought_out_id: sectionDetail.bought_out.id,
                            bought_out_name: sectionDetail.bought_out.bought_out_name,
                            qty: sectionDetail.qty
                        })
                    }
                });
            });
        });

        mainSubAssemblyList.map((main: any) => {
            main.main_assembly.map((mad: any) => {
                mad.main_assembly_detail.map((sub: any) => {
                    if (sub.sub_assembly) {
                        sub.sub_assembly.sub_assembly_detail.map((detail: any) => {
                            if (detail.part) {
                                if (sub_part.filter((sp: any) => sp.uid == `${sub.sub_assembly.id}_${detail.part.id}`)?.length == 0) {
                                    sub_part.push({
                                        uid: `${sub.sub_assembly.id}_${detail.part.id}`,
                                        sub_assembly_id: sub.sub_assembly.id,
                                        sub_assembly_name: sub.sub_assembly.sub_assembly_name,
                                        part_id: detail.part.id,
                                        part_name: detail.part.part_name,
                                        qty: detail.qty
                                    })
                                }
                            }

                            if (detail.bought_out) {
                                if (sub_bo.filter((sp: any) => sp.uid == `${sub.sub_assembly.id}_${detail.bought_out.id}`)?.length == 0) {
                                    sub_bo.push({
                                        uid: `${sub.sub_assembly.id}_${detail.bought_out.id}`,
                                        sub_assembly_id: sub.sub_assembly.id,
                                        sub_assembly_name: sub.sub_assembly.sub_assembly_name,
                                        bought_out_id: detail.bought_out.id,
                                        bought_out_name: detail.bought_out.bought_out_name,
                                        qty: detail.qty
                                    })
                                }

                            }
                        })
                    }
                })
            })
        })

        sectionSubAssemblyList.map((section: any) => {
            section.section_assembly.map((sad: any) => {
                sad.section_assembly_detail.map((sub: any) => {
                    if (assembly_sub.filter((as: any) => as.uid == sub.sub_assembly.id)?.length > 0) {
                        const existing = assembly_sub.filter((asb: any) => asb.uid == `${sub.sub_assembly.id}`)[0]
                        const update = assembly_sub.filter((asb: any) => asb.uid != `${sub.sub_assembly.id}`)
                        update.push({
                            uid: `${sub.sub_assembly.id}`,
                            sub_assembly_name: sub.sub_assembly.sub_assembly_name,
                            qty: Number(sub.qty) + Number(existing.qty)
                        })
                        assembly_sub = update
                    } else {
                        assembly_sub.push({
                            uid: `${sub.sub_assembly.id}`,
                            sub_assembly_name: sub.sub_assembly.sub_assembly_name,
                            qty: sub.qty
                        })
                    }

                    sub.sub_assembly.sub_assembly_detail.map((detail: any) => {
                        if (detail.part) {
                            if (sub_part.filter((sp: any) => sp.uid == `${sub.sub_assembly.id}_${detail.part.id}`)?.length == 0) {
                                sub_part.push({
                                    uid: `${sub.sub_assembly.id}_${detail.part.id}`,
                                    sub_assembly_id: sub.sub_assembly.id,
                                    sub_assembly_name: sub.sub_assembly.sub_assembly_name,
                                    part_id: detail.part.id,
                                    part_name: detail.part.part_name,
                                    qty: detail.qty
                                })
                            }
                        }

                        if (detail.bought_out) {
                            if (sub_bo.filter((sp: any) => sp.uid == `${sub.sub_assembly.id}_${detail.bought_out.id}`)?.length == 0) {
                                sub_bo.push({
                                    uid: `${sub.sub_assembly.id}_${detail.bought_out.id}`,
                                    sub_assembly_id: sub.sub_assembly.id,
                                    sub_assembly_name: sub.sub_assembly.sub_assembly_name,
                                    bought_out_id: detail.bought_out.id,
                                    bought_out_name: detail.bought_out.bought_out_name,
                                    qty: detail.qty
                                })
                            }

                        }
                    })
                })
            })
        })

        Object.keys(subAssemblyConsolidatedQty).map((key: string) => {
            if (assembly_sub.filter((as: any) => as.uid == key.split('~')[0]).length == 0) {
                assembly_sub.push({
                    uid: key.split('~')[0],
                    sub_assembly_name: key.split('~')[1],
                    qty: subAssemblyConsolidatedQty[key]
                })
            } else {
                const existing = assembly_sub.filter((as: any) => as.uid == key.split('~')[0])[0]
                assembly_sub = assembly_sub.filter((as: any) => as.uid != key.split('~')[0])
                assembly_sub.push({
                    uid: key.split('~')[0],
                    sub_assembly_name: key.split('~')[1],
                    qty: subAssemblyConsolidatedQty[key] + existing.qty
                })
            }
        })
        const order = await this.orderRepo.findOne({ where: { id: orderId } })

        sub_part.map((sub: any) => {
            this.assemblySubRepo.save({
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                part_id: sub.part_id,
                part_name: sub.part_name,
                qty: sub.qty * assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                sub_assembly_qty:
                    assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                order
            })
        })

        sub_bo.map((sub: any) => {
            this.assemblySubRepo.save({
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                bought_out_id: sub.bought_out_id,
                bought_out_name: sub.bought_out_name,
                qty: sub.qty * assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                sub_assembly_qty: assembly_sub.filter((as: any) => as.uid == sub.sub_assembly_id)[0].qty,
                order
            })
        })

        main_assembly_part.map((sub: any) => {
            this.assemblyMainRepo.save({
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                part_id: sub.part_id,
                part_name: sub.part_name,
                qty: sub.qty,
                main_assembly_qty: sub.main_assembly_qty,
                order
            })
        })

        main_assembly_bo.map((sub: any) => {
            this.assemblyMainRepo.save({
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                bought_out_id: sub.bought_out_id,
                bought_out_name: sub.bought_out_name,
                qty: sub.qty,
                main_assembly_qty: sub.main_assembly_qty,
                order
            })
        })

        main_assembly_sub.map((sub: any) => {
            this.assemblyMainRepo.save({
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                qty: sub.qty,
                main_assembly_qty: sub.main_assembly_qty,
                order
            })
        })

        section_assembly_part.map((sub: any) => {
            this.assemblySectionRepo.save({
                section_assembly_id: sub.section_assembly_id,
                section_assembly_name: sub.section_assembly_name,
                part_id: sub.part_id,
                part_name: sub.part_name,
                qty: sub.qty,
                order
            })
        })

        section_assembly_bo.map((sub: any) => {
            this.assemblySectionRepo.save({
                section_assembly_id: sub.section_assembly_id,
                section_assembly_name: sub.section_assembly_name,
                bought_out_id: sub.bought_out_id,
                bought_out_name: sub.bought_out_name,
                qty: sub.qty,
                order
            })
        })

        section_assembly_main.map((sub: any) => {
            this.assemblySectionRepo.save({
                section_assembly_id: sub.section_assembly_id,
                section_assembly_name: sub.section_assembly_name,
                main_assembly_id: sub.main_assembly_id,
                main_assembly_name: sub.main_assembly_name,
                qty: sub.qty,
                order
            })
        })

        section_assembly_sub.map((sub: any) => {
            this.assemblySectionRepo.save({
                section_assembly_id: sub.section_assembly_id,
                section_assembly_name: sub.section_assembly_name,
                sub_assembly_id: sub.sub_assembly_id,
                sub_assembly_name: sub.sub_assembly_name,
                qty: sub.qty,
                order
            })
        })

        await this.orderRepo.createQueryBuilder()
            .update(OrderConfirmationEntity)
            .set({
                status: 'In-Progress'
            })
            .where('id=:id', { id: orderId })
            .execute()
        return { messag: 'Assembly configuration completed successfully' }
    }

    async machineSubAssemblies(machineId: string, orderId: UUID) {
        return await this.assemblySubRepo.createQueryBuilder()
            .where('order_id=:orderId', { orderId })
            .orderBy('id')
            .getMany()
    }

    async machineMainAssemblies(machineId: string, orderId: UUID) {
        return await this.assemblyMainRepo.createQueryBuilder()
            .where('order_id=:orderId', { orderId })
            .orderBy('id')
            .getMany()
    }

    async machineSectionAssemblies(machineId: string, orderId: UUID) {
        return await this.assemblySectionRepo.createQueryBuilder()
            .where('order_id=:orderId', { orderId })
            .orderBy('id')
            .getMany()
    }

    async updateAssemblyStatus(cmd: UpdateAssemblyDto) {
        const user = await this.userRepo.findOne({where: { id: cmd.assembled_by }})
        if (cmd.assembly_type == 'sub_assembly') {            
            await this.assemblySubRepo.createQueryBuilder()
                .update(AssemblyMachineSubEntity)
                .set({
                    status: cmd.status,
                    assembled_by: user
                })
                .where('id=:id', { id: cmd.id })
                .execute()

            const subAssemblyStatus = this.assemblySubRepo
                .createQueryBuilder('s')
                .select([
                    's.sub_assembly_id',
                    'COUNT(s.sub_assembly_id) AS sm_id',
                    'SUM(CASE WHEN s.status = :status THEN 1 ELSE 0 END) AS completed_count',
                ])
                .where('s.sub_assembly_id=:subId', { subId: cmd.assembly_id })
                .groupBy('s.sub_assembly_id')
                .having('COUNT(s.sub_assembly_id) = SUM(CASE WHEN s.status = :status THEN 1 ELSE 0 END)')
                .setParameters({
                    status: 'Assembly Completed',
                });

            await subAssemblyStatus.execute().then(async (res: any) => {
                if (res?.length > 0) {
                    await this.assemblyMainRepo.createQueryBuilder()
                        .update(AssemblyMachineMainEntity)
                        .set({
                            status: 'Ready to Assemble'
                        })
                        .where('sub_assembly_id=:id', { id: cmd.assembly_id })
                        .andWhere('order_id=:orderId', { orderId: cmd.order_id })
                        .execute()

                    await this.assemblySectionRepo.createQueryBuilder()
                        .update(AssemblyMachineSectionEntity)
                        .set({
                            status: 'Ready to Assemble'
                        })
                        .where('sub_assembly_id=:id', { id: cmd.assembly_id })
                        .andWhere('order_id=:orderId', { orderId: cmd.order_id })
                        .execute()
                }
            })

            const order = await this.orderRepo.findOne({where: { id: cmd.order_id}})
            await this.historyRepo.save({
                parent_id: cmd.assembly_id,
                type: 'Sub Assembly',
                type_id: cmd.id,
                type_name: cmd.name,
                data: { action: cmd.status },
                remarks: '',
                from_status: '',
                to_status: cmd.status,
                order: order,
                changed_by: cmd.assembled_by
            })

            return { message: 'Status updated successfully' }
            
        } else if (cmd.assembly_type == 'main_assembly') {            
            await this.assemblyMainRepo.createQueryBuilder()
                .update(AssemblyMachineMainEntity)
                .set({
                    status: cmd.status,
                    assembled_by: user
                })
                .where('id=:id', { id: cmd.id })
                .execute()

            const mainAssemblyStatus = this.assemblyMainRepo
                .createQueryBuilder('m')
                .select([
                    'm.main_assembly_id',
                    'COUNT(m.main_assembly_id) AS m_id',
                    'SUM(CASE WHEN m.status = :status THEN 1 ELSE 0 END) AS completed_count',
                ])
                .where('m.main_assembly_id=:mainId', { mainId: cmd.assembly_id })
                .groupBy('m.main_assembly_id')
                .having('COUNT(m.main_assembly_id) = SUM(CASE WHEN m.status = :status THEN 1 ELSE 0 END)')
                .setParameters({
                    status: 'Assembly Completed',
                });

            await mainAssemblyStatus.execute().then(async (res: any) => {
                if (res?.length > 0) {
                    await this.assemblySectionRepo.createQueryBuilder()
                        .update(AssemblyMachineSectionEntity)
                        .set({
                            status: 'Ready to Assemble'
                        })
                        .where('main_assembly_id=:id', { id: cmd.assembly_id })
                        .andWhere('order_id=:orderId', { orderId: cmd.order_id })
                        .execute()
                }
            })

            const order = await this.orderRepo.findOne({where: { id: cmd.order_id}})
            await this.historyRepo.save({
                parent_id: cmd.assembly_id,
                type: 'Main Assembly',
                type_id: cmd.id,
                type_name: cmd.name,
                data: { action: cmd.status },
                remarks: '',
                from_status: '',
                to_status: cmd.status,
                order: order,
                changed_by: cmd.assembled_by
            })

            return { message: 'Status updated successfully' }
        }
    }
}
