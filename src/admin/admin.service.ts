import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { quotation_terms } from 'src/common/constants';
import { NotificationService } from 'src/common/notification.service';
import { CreateCustomer, CreateEnquiry, CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, CreateVendorProcess, UpdateEnquiryStatus, UpdateNotificationToken, UpdateUserPassword } from 'src/dto/admin.dto';
import { Pagination } from 'src/dto/pagination.dto';
import { BoughtOutEntity } from 'src/model/bought_out.entity';
import { BoughtOutSuppliertEntity } from 'src/model/bought_out_supplier.entity';
import { CustomerEntity } from 'src/model/customer.entity';
import { EnquiryEntity } from 'src/model/enquiry.entity';
import { OrderConfirmationEntity } from 'src/model/order_confirmation.entity';
import { PartEntity } from 'src/model/part.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { PartProcessVendorEntity } from 'src/model/part_process_vendor.entity';
import { ProcessEntity } from 'src/model/process.entity';
import { ProductionMachineBoughtoutEntity } from 'src/model/production_machine_boughtout.entity';
import { ProductionMachinePartEntity } from 'src/model/production_machine_part.entity';
import { RoleEntity } from 'src/model/role.entity';
import { SupplierEntity } from 'src/model/supplier.entity';
import { UserEntity } from 'src/model/user.entity';
import { VendorEntity } from 'src/model/vendor.entity';
import { VendorProcessEntity } from 'src/model/vendorProcess.entity';
import { QuotationService } from 'src/quotation/quotation.service';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(RoleEntity) private roleRepository: Repository<RoleEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        @InjectRepository(ProcessEntity) private processRepository: Repository<ProcessEntity>,
        @InjectRepository(VendorEntity) private vendorRepository: Repository<VendorEntity>,
        @InjectRepository(VendorProcessEntity) private vendorProcessRepository: Repository<VendorProcessEntity>,
        @InjectRepository(PartProcessVendorEntity) private partProcessVendorRepo: Repository<PartProcessVendorEntity>,
        @InjectRepository(PartProcessEntity) private partProcessRepo: Repository<PartProcessEntity>,
        @InjectRepository(ProcessEntity) private processRepo: Repository<ProcessEntity>,
        @InjectRepository(SupplierEntity) private supplierRepository: Repository<SupplierEntity>,
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>,
        @InjectRepository(PartEntity) private partsRepo: Repository<PartEntity>,
        @InjectRepository(ProductionMachinePartEntity) private vendorPartRepo: Repository<ProductionMachinePartEntity>,
        @InjectRepository(ProductionMachineBoughtoutEntity) private supplierBORepo: Repository<ProductionMachineBoughtoutEntity>,
        @InjectRepository(OrderConfirmationEntity) private orderConfimationRepo: Repository<OrderConfirmationEntity>,
        @InjectRepository(EnquiryEntity) private enquiryRepo: Repository<EnquiryEntity>,
        private quotationService: QuotationService,
        private notificationService: NotificationService
    ) { }

    async createRole(roleDto: CreateRole) {
        const role = await this.roleRepository.findOne({ where: { role_name: roleDto.role_name }});
        if (role) {
            return { message: "Role name already exists" }
        }
        const newRole = await this.roleRepository.create({
            role_code: roleDto.role_code,
            role_name: roleDto.role_name,
            screens: roleDto.screens
        })
        await this.roleRepository.save(newRole)
        return newRole
    }

     async updateRole(roleDto: CreateRole) {
        const role = await this.roleRepository.findOne({ where: { id: roleDto.id }});
        if (!role) {
            return { message: "Invalid Role" }
        }
        role.screens = roleDto.screens;
        await this.roleRepository.update(roleDto.id, role);
        return { roleId: role.id, message: "Role updated successfully" }
    }

    async getAllRoles(pagination: Pagination) {
        let query = this.roleRepository.createQueryBuilder('roles')
            .select(['roles.role_code', 'roles.role_name',
                'roles.screens', 'roles.id'])
            .where({ is_active: true })

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(roles.role_name) LIKE :roleName', { roleName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async getRoleById(id: UUID) {
        const role = await this.roleRepository.find({ select: ['id', 'role_name', 'role_code', 'screens'], where: { is_active: true, id: id } })
        if (role.length > 0) {
            return { role: role.at(0) };
        }
        throw new HttpException("No role found", HttpStatus.NOT_FOUND)
    }

    async createNewUser(userDto: CreateUser) {
        const newUser = await this.userRepository.create(userDto)
        await this.userRepository.save(newUser)
        return {
            empCode: newUser.emp_code,
            empName: newUser.emp_name,
            id: newUser.id,
            roleId: newUser.role_id
        }
    }

    async getAllUsers(pagination: Pagination) {
        let query = this.userRepository.createQueryBuilder('user')
        .leftJoin(RoleEntity, 'role', `"user"."role_id"::text = "role"."id"::text`)
            .select(['user.id as id', 'user.emp_code as emp_code', 'user.emp_name as emp_name', 
                'user.category as category', 'user.details as details', 'user.salary as salary', 
                'user.insurance_details as insurance_details', 'user.role_id as role_id', 'role.role_name as role_name'])
            .where({ is_active: true })

        const count = await query.getCount();
        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(user.emp_name) LIKE :empName', { empName: `%${pagination.search.toLowerCase()}%` })
        }

        const list = await query.getRawMany()
        return {
            list, count
        }
    }

    async getUserById(id: UUID) {
        const user = await this.userRepository.find({ select: ['id', 'emp_code', 'emp_name', 'role_id', 'category', 'details', 'insurance_details', 'salary'], where: { is_active: true, id: id } })
        if (user.length > 0) {
            return { user: user.at(0) };
        }
        throw new HttpException("No role found", HttpStatus.NOT_FOUND)
    }

    async changePassword(updatePassword: UpdateUserPassword) {
        const user = await (await this.userRepository.find({ where: { id: updatePassword.userId } })).at(0)
        user.password = updatePassword.password
        await this.userRepository.update(updatePassword.userId, user)
        return { userId: updatePassword.userId, message: "Password changed successfully" }
    }

    async createProcess(processDto: CreateProcess) {
        const process = await this.processRepository.find({ select: ['id', 'process_name'], where: { is_active: true, process_name: processDto.process_name } })
        if (process.length > 0) {
            return { message: "Process already exists" }
        }
        const newProcess = await this.processRepository.create(processDto)
        await this.processRepository.save(newProcess)
        return { message: "Process created successfully" }
    }

    async getAllProcess(pagination: Pagination) {
        let query = this.processRepository.createQueryBuilder('process')
            .select(['process.id', 'process.process_name'])
            .where({ is_active: true })

        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        if (pagination?.search) {
            query = query.andWhere('LOWER(process.process_name) LIKE :processName', { processName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async createNewVendor(vendorDto: CreateVendor) {
        const existingVendor = await this.vendorRepository.find({ select: ['id', 'vendor_name'], where: { is_active: true, vendor_name: vendorDto.vendor_name } })

        if (existingVendor.length > 0) {
            return { message: "Vendor already exists" }
        }
        const vendor = await this.vendorRepository.save({
            vendor_name: vendorDto.vendor_name,
            vendor_account_no: vendorDto.vendor_account_no,
            vendor_address1: vendorDto.vendor_address1,
            vendor_address2: vendorDto.vendor_address2,
            vendor_gst: vendorDto.vendor_gst,
            vendor_city: vendorDto.vendor_city,
            vendor_state: vendorDto.vendor_state,
            vendor_pincode: vendorDto.vendor_pincode,
            vendor_location: vendorDto.vendor_location,
            vendor_mobile_no1: vendorDto.vendor_mobile_no1,
            vendor_mobile_no2: vendorDto.vendor_mobile_no2,
            vendor_bank_name: vendorDto.vendor_bank_name,
            vendor_ifsc: vendorDto.vendor_ifsc
        })

        vendorDto.vendor_process_list?.map(async (process) => {
            var vendorProcessObj = { vendor: vendor, process_id: process.process_id, process_name: process.process_name, vendor_id: vendor.id }
            await this.vendorProcessRepository.save(vendorProcessObj)
        })

        return { message: "Vendor created successfully" }
    }

    async updateVendor(vendorDto: CreateVendor) {
        const existingVendor = await this.vendorRepository.findOne({
            where: { is_active: true, vendor_name: vendorDto.vendor_name, }
        })

        if (existingVendor.id != vendorDto.vendor_id) {
            return { message: "Vendor name already exists" }
        }

        const vendor = await this.vendorRepository.update({ id: vendorDto.vendor_id }, {
            vendor_name: vendorDto.vendor_name,
            vendor_account_no: vendorDto.vendor_account_no,
            vendor_address1: vendorDto.vendor_address1,
            vendor_address2: vendorDto.vendor_address2,
            vendor_gst: vendorDto.vendor_gst,
            vendor_city: vendorDto.vendor_city,
            vendor_state: vendorDto.vendor_state,
            vendor_pincode: vendorDto.vendor_pincode,
            vendor_location: vendorDto.vendor_location,
            vendor_mobile_no1: vendorDto.vendor_mobile_no1,
            vendor_mobile_no2: vendorDto.vendor_mobile_no2,
            vendor_bank_name: vendorDto.vendor_bank_name,
            vendor_ifsc: vendorDto.vendor_ifsc
        })

        const vendorProcessList = await this.vendorProcessRepository.find({
            where: { vendor_id: vendorDto.vendor_id }
        })

        vendorDto.vendor_process_list?.map(async (process) => {
            if (vendorProcessList.filter((vp: any) => vp.process_id == process.process_id)?.length == 0) {
                var vendorProcessObj = { vendor: existingVendor, process_id: process.process_id, process_name: process.process_name, vendor_id: vendorDto.vendor_id }
                await this.vendorProcessRepository.save(vendorProcessObj)
            }
        })

        vendorProcessList?.map(async (process: any) => {
            if (vendorDto.vendor_process_list.filter((vpl: any) => process.process_id == vpl.process_id)?.length == 0) {
                await this.vendorProcessRepository.remove(process)
                const currentProcess = await this.processRepo.findOne({ where: { id: process.process_id } })
                const partProcessList = await this.partProcessRepo.createQueryBuilder('part_process')
                    .leftJoinAndSelect('part_process.process', 'process')
                    .leftJoinAndSelect('part_process.part', 'part')
                    .where('process.id= :process_id', { process_id: process.process_id })
                    .getMany()
                partProcessList?.map(async (pp: any) => {
                    await this.partProcessVendorRepo.delete({ vendor: existingVendor, part_process: pp })
                    await this.updatePartDays(pp.part.id)
                })
            }
        })

        return { message: "Vendor updated successfully" }
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

        await this.partsRepo.createQueryBuilder()
            .update(PartEntity).set({ days: days })
            .where('id::VARCHAR=:id', { id: part_id })
            .execute()
    }

    // async getVendorsList(pagination: Pagination) {
    //     try {
    //         if (pagination.type == 'vendor') {
    //             let id_query = this.vendorRepository.createQueryBuilder('vendor')
    //                 .select(['vendor.id'])

    //             if (pagination?.page) {
    //                 id_query = id_query
    //                     .take(pagination.limit)
    //                     .skip((pagination.page - 1) * pagination.limit)
    //             }

    //             if (pagination?.search) {
    //                 id_query = id_query.andWhere('LOWER(vendor.vendor_name) LIKE :vendorName', { vendorName: `%${pagination.search.toLowerCase()}%` })
    //             }
    //             const ids = await id_query.getMany()
    //             const count = await id_query.getCount()

    //             let query = this.vendorRepository.createQueryBuilder('vendor')
    //                 .innerJoinAndSelect('vendor.process_list', 'process')
    //                 .select(['vendor.id', 'vendor.vendor_name',
    //                     'vendor.vendor_address1', 'vendor.vendor_address2',
    //                     'vendor.vendor_gst', 'vendor.vendor_account_no', 'vendor.vendor_bank_name',
    //                     'vendor.vendor_ifsc', 'vendor.vendor_city', 'vendor.vendor_state', 'vendor.vendor_pincode',
    //                     'vendor.vendor_mobile_no1', 'vendor.vendor_mobile_no2',
    //                     'vendor.vendor_location', 'process.process_id', 'process.process_name'])

    //             if (ids.length > 0) {
    //                 query = query.where("vendor.id IN (:...ids)", { ids: ids.map((id) => id.id) })
    //             }

    //             const list = await query.getMany()
    //             return { list, count }
    //         } else {
    //             let query = this.vendorRepository.createQueryBuilder('vendor')
    //                 .innerJoinAndSelect('vendor.process_list', 'process')
    //                 .select(['vendor.id', 'vendor.vendor_name',
    //                     'vendor.vendor_address1', 'vendor.vendor_address2',
    //                     'vendor.vendor_gst', 'vendor.vendor_account_no', 'vendor.vendor_bank_name',
    //                     'vendor.vendor_ifsc', 'vendor.vendor_city', 'vendor.vendor_state', 'vendor.vendor_pincode',
    //                     'vendor.vendor_mobile_no1', 'vendor.vendor_mobile_no2',
    //                     'vendor.vendor_location', 'process.process_id', 'process.process_name'])

    //                     if (pagination?.page) {
    //                         query = query
    //                             .take(pagination.limit)
    //                             .skip((pagination.page - 1) * pagination.limit)
    //                     }

    //                     if (pagination?.search) {
    //                         query = query.andWhere('LOWER(process.process_name) LIKE :processName', { processName: `%${pagination.search.toLowerCase()}%` })
    //                     }
    //             const [list, count] = await query.getManyAndCount()
    //             return { list, count }
    //         }

    //     } catch (err) {
    //         throw new HttpException({
    //             status: HttpStatus.FORBIDDEN,
    //             error: err.message,
    //         }, HttpStatus.FORBIDDEN, {
    //             cause: err.message
    //         });
    //     }
    // }

    async getVendorsList(pagination: Pagination) {
        try {
            let query = this.vendorRepository.createQueryBuilder('vendor')
                .innerJoinAndSelect('vendor.process_list', 'process')
                .select(['vendor.id', 'vendor.vendor_name',
                    'vendor.vendor_address1', 'vendor.vendor_address2',
                    'vendor.vendor_gst', 'vendor.vendor_account_no', 'vendor.vendor_bank_name',
                    'vendor.vendor_ifsc', 'vendor.vendor_city', 'vendor.vendor_state', 'vendor.vendor_pincode',
                    'vendor.vendor_mobile_no1', 'vendor.vendor_mobile_no2',
                    'vendor.vendor_location'])

            if (pagination?.page) {
                query = query
                    .take(pagination.limit)
                    .skip((pagination.page - 1) * pagination.limit)
            }

            if (pagination?.search) {
                query = query.andWhere('LOWER(vendor.vendor_name) LIKE :vendorName', { vendorName: `%${pagination.search.toLowerCase()}%` })
                query = query.orWhere('LOWER(process.process_name) LIKE :processName', { processName: `%${pagination.search.toLowerCase()}%` })
            }
            const [list, count] = await query.getManyAndCount()
            return { list, count }

        } catch (err: any) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err?.message,
            }, HttpStatus.FORBIDDEN, {
                cause: err?.message
            });
        }
    }

    async getVendorById(id: UUID) {
        const vendor = await this.vendorRepository.findOne({ where: { is_active: true, id: id } })
        if (vendor) {
            const vendorProcess = await this.vendorProcessRepository.find({ where: { vendor_id: vendor.id } })
            return { vendor: vendor, vendorProcess };
        }
        throw new HttpException("No supplier found", HttpStatus.NOT_FOUND)
    }

    async createNewSupplier(supplierDto: CreateSupplier) {
        const supplier = await this.supplierRepository.find({ select: ['id', 'supplier_name'], where: { is_active: true, supplier_name: supplierDto.supplier_name } })
        if (supplier.length > 0) {
            return { message: "Supplier already exists" }
        }
        await this.supplierRepository.save(supplierDto)
        return { message: "Supplier created successfully" }
    }

    async getSuppliers(input: { page?: number, limit?: number, search?: string }) {
        let query = this.supplierRepository.createQueryBuilder('suppliers')
            .leftJoin(BoughtOutSuppliertEntity, 'boughtout_supplier', 'boughtout_supplier.supplier_id = suppliers.id ')
            .leftJoin(BoughtOutEntity, 'boughtout', 'boughtout.id = boughtout_supplier.bought_out_id')
            .select(['suppliers.id', 'suppliers.supplier_name', 'suppliers.supplier_address1',
                'suppliers.supplier_address2', 'suppliers.supplier_mobile_no1',
                'suppliers.supplier_mobile_no2', 'suppliers.supplier_account_no',
                'suppliers.supplier_bank_name', 'suppliers.supplier_ifsc',
                'suppliers.supplier_location', 'suppliers.supplier_city',
                'suppliers.supplier_state', 'suppliers.supplier_pincode',
                'suppliers.supplier_gst'])
            .where({ is_active: true })

        if (input?.page) {
            query = query
                .limit(input.limit)
                .offset((input.page - 1) * input.limit)
        }

        if (input?.search) {
            query = query.andWhere('LOWER(suppliers.supplier_name) LIKE :supplierName', { supplierName: `%${input.search.toLowerCase()}%` })
            query = query.orWhere('LOWER(boughtout.bought_out_name) LIKE :boughtoutName', { boughtoutName: `%${input.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async updateSupplier(supplierDto: CreateSupplier) {
        const existingSupplier = await this.supplierRepository.findOne({
            where: { is_active: true, supplier_name: supplierDto.supplier_name, }
        })

        if (existingSupplier.id != supplierDto.supplier_id) {
            return { message: "Supplier name already exists" }
        }

        await this.supplierRepository.update({ id: supplierDto.supplier_id }, {
            supplier_name: supplierDto.supplier_name,
            supplier_account_no: supplierDto.supplier_account_no,
            supplier_address1: supplierDto.supplier_address1,
            supplier_address2: supplierDto.supplier_address2,
            supplier_city: supplierDto.supplier_city,
            supplier_state: supplierDto.supplier_state,
            supplier_pincode: supplierDto.supplier_pincode,
            supplier_location: supplierDto.supplier_location,
            supplier_mobile_no1: supplierDto.supplier_mobile_no1,
            supplier_mobile_no2: supplierDto.supplier_mobile_no2,
            supplier_bank_name: supplierDto.supplier_bank_name,
            supplier_gst: supplierDto.supplier_gst,
            supplier_ifsc: supplierDto.supplier_ifsc
        })

        return { message: "Supplier updated successfully" }
    }

    async getSupplierById(id: UUID) {
        const supplier = await this.supplierRepository.findOne({ where: { is_active: true, id: id } })
        if (supplier) {
            return { supplier };
        }
        throw new HttpException("No supplier found", HttpStatus.NOT_FOUND)
    }

    async createNewCustomer(customerDto: CreateCustomer) {
        const customer = await this.customerRepository.find({ select: ['id', 'customer_name'], where: { is_active: true, customer_name: customerDto.customer_name } })
        if (customer.length > 0) {
            return { message: "Customer already exists" }
        }
        let newCustomer = await this.customerRepository.save(customerDto);
        return { message: "Customer created successfully", id: newCustomer.id }
    }

    async getCustomers(input: { page?: number, limit?: number, search?: string }) {
        let query = this.customerRepository.createQueryBuilder('customers')
            .where({ is_active: true })

        if (input?.page) {
            query = query
                .limit(input.limit)
                .offset((input.page - 1) * input.limit)
        }

        if (input?.search) {
            query = query.andWhere('LOWER(customers.customer_name) LIKE :customerName', { customerName: `%${input.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async getCustomerById(id: UUID) {
        const customer = await this.customerRepository.findOne({ where: { is_active: true, id: id } })
        if (customer) {
            return { customer };
        }
        throw new HttpException("No customer found", HttpStatus.NOT_FOUND)
    }

    async updateCustomer(customerDto: CreateCustomer) {
        const existingCustomer = await this.customerRepository.findOne({
            where: { is_active: true, customer_name: customerDto.customer_name, }
        })

        if (existingCustomer != null) {
            if (existingCustomer?.id != customerDto.customer_id) {
                return { message: "Customer name already exists" }
            }
        }

        await this.customerRepository.update({ id: customerDto.customer_id }, {
            customer_name: customerDto.customer_name,
            customer_account_no: customerDto.customer_account_no,
            customer_address1: customerDto.customer_address1,
            customer_address2: customerDto.customer_address2,
            customer_city: customerDto.customer_city,
            customer_state: customerDto.customer_state,
            customer_pincode: customerDto.customer_pincode,
            customer_mobile_no1: customerDto.customer_mobile_no1,
            customer_mobile_no2: customerDto.customer_mobile_no2,
            customer_bank_name: customerDto.customer_bank_name,
            customer_gst: customerDto.customer_gst,
            customer_ifsc: customerDto.customer_ifsc,
            is_machine: customerDto.is_machine,
            is_spares: customerDto.is_spares,
            is_spm: customerDto.is_spm
        })

        return { message: "Customer updated successfully" }
    }

    async getVendorHistory(pagination: Pagination) {
        let query = this.vendorPartRepo.createQueryBuilder('vp')
            .select(['vp.id', 'order.machine_name', 'vp.part_name',
                'vp.process_name', 'quotation.quotation_no', 'vp.status', 'order.status'])
            .innerJoin('vp.order', 'order')
            .innerJoin('order.quotation', 'quotation')
            .where('vp.vendor_id=:id', { id: pagination.search })
            .orderBy('vp.updated_at', 'DESC')
        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count };
    }

    async getSupplierHistory(pagination: Pagination) {
        let query = this.supplierBORepo.createQueryBuilder('sbo')
            .select(['sbo.id', 'order.machine_name', 'sbo.bought_out_name',
                'quotation.quotation_no', 'sbo.status', 'order.status'])
            .innerJoin('sbo.order', 'order')
            .innerJoin('order.quotation', 'quotation')
            .where('sbo.supplier_id=:id', { id: pagination.search })
        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count };
    }

    async getCustomerHistory(pagination: Pagination) {
        let query = this.orderConfimationRepo.createQueryBuilder('order')
            .select(['customer.customer_name', 'quotation.quotation_no',
                'order.machine_name', 'order.status', 'quotation.approved_cost',
                'order.created_at'
            ])
            .innerJoin('order.quotation', 'quotation')
            .innerJoin('order.customer', 'customer')
            .where('customer.id=:id', { id: pagination.search })
            .orderBy('order.created_at', 'DESC')
        if (pagination?.page) {
            query = query
                .limit(pagination.limit)
                .offset((pagination.page - 1) * pagination.limit)
        }

        const [list, count] = await query.getManyAndCount()
        return { list, count };
    }

    async createEnquiry(enquiryDto: CreateEnquiry) {
        const enquiry = await this.enquiryRepo.find({ where: { customer_name: enquiryDto.customer_name, enquiry_status: 'Open' } });
        if (enquiry?.length > 0) {
            return { message: "Enquiry already exists" }
        }

        const newEnquiry = await this.enquiryRepo.create({
            ...enquiryDto,
            level1_user: { id: enquiryDto.level1_user },
            quotation_terms: quotation_terms,
            enquiry_status: 'Open'
        })
        await this.enquiryRepo.save(newEnquiry)
        this.notificationService.send([], 'New Enquiry', `New enquiry - ${enquiryDto.customer_name}`, {
            id: newEnquiry.id,
            type: 'enquiry'
        });
        return { message: "Enquiry created successfully" }
    }

    async getEnquiries(input: { page?: number, limit?: number, search?: string, status?: string, user?: string }) {
        let query = this.enquiryRepo.createQueryBuilder('enquiry')
            .select(['enquiry.id', 'enquiry.machine_name', 'enquiry.customer_name',
                'enquiry.contact_no', 'enquiry.address', 'enquiry.enquiry_resource',
                'enquiry.gst_no', 'enquiry.remarks', 'level1_user.emp_name', 'level2_user.emp_name',
                'level2_user.id', 'enquiry.quotation_terms'])
            .innerJoin('enquiry.level1_user', 'level1_user')
            .leftJoin('enquiry.level2_user', 'level2_user')

        if (input?.page) {
            query = query
                .limit(input.limit)
                .offset((input.page - 1) * input.limit)
        }

        if (input?.status) {
            query = query.andWhere('LOWER(enquiry.enquiry_status)=:status', { status: input.status.toLowerCase() })
        }

        if (input?.search) {
            query = query.andWhere('LOWER(enquiry.customer_name) LIKE :name', { name: `%${input.search.toLowerCase()}%` })
        }

        if (input?.user) {
            query = query.andWhere('enquiry.level2_user::VARCHAR =:user', { user: input.user })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async updateEnquiryStatus(cmd: UpdateEnquiryStatus) {
        try {
            const enquiry = await this.enquiryRepo.createQueryBuilder('enquiry')
                .innerJoinAndSelect('enquiry.level2_user', 'followup_user')
                .innerJoinAndSelect('enquiry.level1_user', 'created_user')
                .where("enquiry.id =:enquiry_id", { enquiry_id: cmd.enquiry_id })
                .getOne();

            if (!enquiry) {
                throw new HttpException("No enquiry found", HttpStatus.NOT_FOUND)
            }
            if (cmd.status == 'Start') {
                const user2 = await this.userRepository.findOne({ where: { id: cmd.level2_user } });
                await this.enquiryRepo.createQueryBuilder()
                    .update(EnquiryEntity).set({ level2_user: user2, enquiry_status: 'In Progress' })
                    .where('id=:id', { id: cmd.enquiry_id })
                    .execute()
                this.notificationService.send([], 'Follow-up Started', `${user2.emp_name} started enquiry for ${enquiry.customer_name} `, {
                    id: cmd.enquiry_id,
                    type: 'followup'
                });
            } else if (cmd.status == 'Reject') {
                await this.enquiryRepo.createQueryBuilder()
                    .update(EnquiryEntity).set({ enquiry_status: 'Rejected', remarks: cmd.remarks })
                    .where('id=:id', { id: cmd.enquiry_id })
                    .execute()
                this.notificationService.send([], 'Enquiry Rejected', `Rejected enquiry for ${enquiry.customer_name} `, {
                    id: cmd.enquiry_id,
                    type: 'enquiry_rejected'
                });
            } else if (cmd.status == 'Approve') {
                const approval_detail = {
                    quotation_date: cmd.quotation_date,
                    reminder_date: cmd.reminder_date,
                    cost: cmd.cost,
                    quantity: cmd.qty,
                    approved_by: cmd.approved_by
                }
                await this.enquiryRepo.createQueryBuilder()
                    .update(EnquiryEntity).set({ enquiry_status: 'Approved', approval_detail: approval_detail, quotation_terms: cmd.quotation_terms })
                    .where('id=:id', { id: cmd.enquiry_id })
                    .execute()

                let existing_customer_id;
                if (enquiry.existing_customer_id) {
                    existing_customer_id = enquiry.existing_customer_id;
                } else {
                    const customer = await this.createNewCustomer({
                        customer_address1: enquiry.address?.address_1,
                        customer_name: enquiry.customer_name,
                        customer_city: enquiry.address?.city,
                        customer_state: enquiry.address?.state,
                        customer_pincode: enquiry.address?.postal_code,
                        customer_mobile_no1: enquiry.contact_no,
                        customer_gst: enquiry.gst_no,
                        is_machine:  true
                    })
                    existing_customer_id = customer.id;
                }
                
                const quotation = await this.quotationService.createMachineQuotation({
                    quotation_date: cmd.quotation_date,
                    reminder_date: cmd.reminder_date,
                    qty: cmd.qty,
                    machine_id: enquiry.existing_machine_id as any,
                    customer_id: existing_customer_id as any,
                    user_id: enquiry.level2_user.id as any,
                    created_by: enquiry.level1_user.id as any,
                    remarks: cmd.remarks,
                    quotation_terms: cmd.quotation_terms,
                    cost: cmd.cost,
                    type: 'Add',
                    status: 'Draft'
                });
                this.notificationService.send([], 'New quotation', `Quotation created for ${enquiry.customer_name} `, {
                    id: quotation.id,
                    type: 'new_quotation'
                });
            }
        } catch (err: any) {
            console.log("==========", err.stack);
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err?.message,
            }, HttpStatus.FORBIDDEN, {
                cause: err?.message
            });
        }
    }

    async updateNotificationToken(cmd: UpdateNotificationToken) {
        try {
            const user = await this.userRepository.findOne({ where: { id: cmd.user_id }});
            if(user && cmd.notification_token) {
                await this.userRepository.createQueryBuilder()
                .update(UserEntity).set({ notification_token: cmd.notification_token })
                .where('id::VARCHAR=:id', { id: cmd.user_id })
                .execute();
            }
            return { message: 'Updated' };
        } catch(err: any) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err?.message,
            }, HttpStatus.FORBIDDEN, {
                cause: err?.message
            });
        }
    }

    async getMarketingDashboardData(cmd: UpdateNotificationToken): Promise<{ enquiryCount: string, followUpCount: string, quotationCount: string }> {
        try {
            const enquiryCount = (await this.enquiryRepo.findAndCount({where: { enquiry_status: 'Open' }}))?.[1];
            const followUps = await this.enquiryRepo.createQueryBuilder('enquiry')
                .innerJoinAndSelect('enquiry.level2_user', 'user')
                .where("enquiry.enquiry_status='In Progress'")
                .andWhere("user.id =:userId", { userId: cmd.user_id })
                .getManyAndCount();
            const followUpCount = followUps?.[1];
            const quotationRepo = await this.quotationService.getQuotationRepo();
            const draftQuotations = await quotationRepo.createQueryBuilder('quotation')
                .innerJoinAndSelect('quotation.user', 'user')
                .where("quotation.status='Draft'")
                .andWhere("user.id =:followUpUserId", { followUpUserId: cmd.user_id })
                .getManyAndCount();
            const quotationCount = draftQuotations?.[1];
            return {
                enquiryCount: enquiryCount?.toString() || '0',
                followUpCount: followUpCount?.toString() || '0',
                quotationCount: quotationCount?.toString() || '0',
            }
        } catch(err:any) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err?.message,
            }, HttpStatus.FORBIDDEN, {
                cause: err?.message
            });
        }
    }
}
