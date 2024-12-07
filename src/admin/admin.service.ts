import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CreateCustomer, CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, CreateVendorProcess, UpdateUserPassword } from 'src/dto/admin.dto';
import { Pagination } from 'src/dto/pagination.dto';
import { CustomerEntity } from 'src/model/customer.entity';
import { PartEntity } from 'src/model/part.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { PartProcessVendorEntity } from 'src/model/part_process_vendor.entity';
import { ProcessEntity } from 'src/model/process.entity';
import { RoleEntity } from 'src/model/role.entity';
import { SupplierEntity } from 'src/model/supplier.entity';
import { UserEntity } from 'src/model/user.entity';
import { VendorEntity } from 'src/model/vendor.entity';
import { VendorProcessEntity } from 'src/model/vendorProcess.entity';
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
        @InjectRepository(PartEntity) private partsRepo: Repository<PartEntity>
    ){}
    
    async createRole(roleDto: CreateRole){
        const newRole = await this.roleRepository.create(roleDto)
        await this.roleRepository.save(newRole)
        return newRole
    }

    async getAllRoles(pagination: Pagination){
        let query = this.roleRepository.createQueryBuilder('roles')
        .select(['roles.role_code', 'roles.role_name', 
            'roles.screens','roles.id'])
        .where({is_active : true})

        if(pagination?.page){
            query = query
            .limit(pagination.limit)
            .offset((pagination.page - 1) * pagination.limit)
        }

        if(pagination?.search) {
            query = query.andWhere('LOWER(roles.role_name) LIKE :roleName', { roleName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async getRoleById(id:UUID){
        const role = await this.roleRepository.find({ select:['id','role_name', 'role_code', 'screens'], where: {is_active: true, id: id} })
        if(role.length > 0){
            return { role: role.at(0) };
        }
        throw new HttpException("No role found", HttpStatus.NOT_FOUND)
    }

    async createNewUser(userDto: CreateUser){
        const newUser = await this.userRepository.create(userDto)
        await this.userRepository.save(newUser)
        return {
            empCode: newUser.emp_code,
            empName: newUser.emp_name,
            id: newUser.id,
            roleId: newUser.role_id
        }
    }

    async getAllUsers(pagination: Pagination){
        let query = this.userRepository.createQueryBuilder('user')
        .select(['user.id', 'user.emp_code', 'user.emp_name'])
        .where({is_active : true})

        if(pagination?.page){
            query = query
            .limit(pagination.limit)
            .offset((pagination.page - 1) * pagination.limit)
        }

        if(pagination?.search) {
            query = query.andWhere('LOWER(user.emp_name) LIKE :empName', { empName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async getUserById(id:UUID){
        const user = await this.userRepository.find({ select:['id','emp_code', 'emp_name', 'role_id'], where: {is_active: true, id: id} })
        if(user.length > 0){
            return { user: user.at(0) };
        }
        throw new HttpException("No role found", HttpStatus.NOT_FOUND)
    }

    async changePassword(updatePassword:UpdateUserPassword){
        const user = await (await this.userRepository.find({ where: {id:updatePassword.userId} })).at(0)
        user.password = updatePassword.password
        await this.userRepository.update(updatePassword.userId, user)
        return { userId: updatePassword.userId, message: "Password changed successfully" }
    }

    async createProcess(processDto: CreateProcess){
        const process = await this.processRepository.find({ select:['id','process_name'], where: {is_active: true, process_name: processDto.process_name} })
        if(process.length > 0){
            return { message: "Process already exists" }    
        }
        const newProcess = await this.processRepository.create(processDto)
        await this.processRepository.save(newProcess)
        return { message: "Process created successfully" }    
    }

    async getAllProcess(pagination: Pagination){
        let query = this.processRepository.createQueryBuilder('process')
        .select(['process.id', 'process.process_name'])
        .where({is_active : true})

        if(pagination?.page){
            query = query
            .limit(pagination.limit)
            .offset((pagination.page - 1) * pagination.limit)
        }

        if(pagination?.search) {
            query = query.andWhere('LOWER(process.process_name) LIKE :processName', { processName: `%${pagination.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async createNewVendor(vendorDto: CreateVendor){
        const existingVendor = await this.vendorRepository.find({ select:['id','vendor_name'], where: {is_active: true, vendor_name: vendorDto.vendor_name} })

        if(existingVendor.length > 0){
            return { message: "Vendor already exists" }   
        }
        const vendor = await this.vendorRepository.save({
            vendor_name: vendorDto.vendor_name,
            vendor_account_no: vendorDto.vendor_account_no,
            vendor_address1: vendorDto.vendor_address1,
            vendor_address2 : vendorDto.vendor_address2,
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
            var vendorProcessObj = { vendor: vendor, process_id: process.process_id, process_name: process.process_name, vendor_id: vendor.id}
            await this.vendorProcessRepository.save(vendorProcessObj)
        })

        return { message: "Vendor created successfully" }
    }

    async updateVendor(vendorDto: CreateVendor){
        const existingVendor = await this.vendorRepository.findOne({ 
            where: {is_active: true, vendor_name: vendorDto.vendor_name, } })

        if(existingVendor.id != vendorDto.vendor_id){
            return { message: "Vendor name already exists" }
        }
        
        const vendor = await this.vendorRepository.update({id: vendorDto.vendor_id},{
            vendor_name: vendorDto.vendor_name,
            vendor_account_no: vendorDto.vendor_account_no,
            vendor_address1: vendorDto.vendor_address1,
            vendor_address2 : vendorDto.vendor_address2,
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
            where: {vendor_id: vendorDto.vendor_id } })

        vendorDto.vendor_process_list?.map(async (process) => {
            if(vendorProcessList.filter((vp:any) => vp.process_id == process.process_id)?.length == 0){
                var vendorProcessObj = { vendor: existingVendor, process_id: process.process_id, process_name: process.process_name, vendor_id: vendorDto.vendor_id}
                await this.vendorProcessRepository.save(vendorProcessObj)
            }
        })

        vendorProcessList?.map(async (process: any) => {
            if(vendorDto.vendor_process_list.filter((vpl:any) => process.process_id == vpl.process_id)?.length == 0){
                await this.vendorProcessRepository.remove(process)
                const currentProcess = await this.processRepo.findOne({where: {id: process.process_id}})
                const partProcessList = await this.partProcessRepo.createQueryBuilder('part_process')
                    .leftJoinAndSelect('part_process.process', 'process')
                    .leftJoinAndSelect('part_process.part', 'part')
                    .where('process.id= :process_id', { process_id: process.process_id})
                    .getMany()
                partProcessList?.map(async (pp:any) => {
                    await this.partProcessVendorRepo.delete({vendor: existingVendor, part_process: pp })
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

    async getVendorsList(pagination: Pagination){
        try{
            let id_query = this.vendorRepository.createQueryBuilder('vendor')
            .select(['vendor.id'])
       
            if(pagination?.page){
                id_query = id_query
                .take(pagination.limit)
                .skip((pagination.page - 1) * pagination.limit)    
            }
    
            if(pagination?.search){
                id_query = id_query.andWhere('LOWER(vendor.vendor_name) LIKE :vendorName', { vendorName: `%${pagination.search.toLowerCase()}%` })
            }
        const ids = await id_query.getMany()
        const count = await id_query.getCount()

        let query = this.vendorRepository.createQueryBuilder('vendor')
            .innerJoinAndSelect('vendor.process_list','process')
            .select(['vendor.id','vendor.vendor_name',
            'vendor.vendor_address1','vendor.vendor_address2',
            'vendor.vendor_gst', 'vendor.vendor_account_no','vendor.vendor_bank_name',
            'vendor.vendor_ifsc', 'vendor.vendor_city', 'vendor.vendor_state', 'vendor.vendor_pincode',
            'vendor.vendor_mobile_no1','vendor.vendor_mobile_no2',
            'vendor.vendor_location','process.process_id','process.process_name'])

            if(ids.length > 0){
                query = query.where("vendor.id IN (:...ids)", { ids: ids.map((id) => id.id) })
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

    async getVendorById(id:UUID){
        const vendor = await this.vendorRepository.findOne({ where: {is_active: true, id: id} })
        if(vendor){
            const vendorProcess = await this.vendorProcessRepository.find({ where: {vendor_id: vendor.id }})
            return { vendor: vendor, vendorProcess };
        }
        throw new HttpException("No supplier found", HttpStatus.NOT_FOUND)
    }

    async createNewSupplier(supplierDto: CreateSupplier){
        const supplier = await this.supplierRepository.find({ select:['id','supplier_name'], where: {is_active: true, supplier_name: supplierDto.supplier_name} })
        if(supplier.length > 0){
            return { message: "Supplier already exists" }    
        }
        await this.supplierRepository.save(supplierDto)
        return { message: "Supplier created successfully" }
    }

    async getSuppliers(input: { page?:number, limit?:number, search?:string }){
        let query = this.supplierRepository.createQueryBuilder('suppliers')
        .select(['suppliers.id','suppliers.supplier_name', 'suppliers.supplier_address1', 
            'suppliers.supplier_address2','suppliers.supplier_mobile_no1',
            'suppliers.supplier_mobile_no2','suppliers.supplier_account_no', 
            'suppliers.supplier_bank_name', 'suppliers.supplier_ifsc',  
            'suppliers.supplier_location', 'suppliers.supplier_city',
            'suppliers.supplier_state', 'suppliers.supplier_pincode'])
        .where({is_active : true})

        if(input?.page){
            query = query
            .limit(input.limit)
            .offset((input.page - 1) * input.limit)
        }

        if(input?.search) {
            query = query.andWhere('LOWER(suppliers.supplier_name) LIKE :supplierName', { supplierName: `%${input.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async updateSupplier(supplierDto: CreateSupplier){
        const existingSupplier = await this.supplierRepository.findOne({ 
            where: {is_active: true, supplier_name: supplierDto.supplier_name, } })

        if(existingSupplier.id != supplierDto.supplier_id){
            return { message: "Supplier name already exists" }
        }
        
        await this.supplierRepository.update({id: supplierDto.supplier_id},{
            supplier_name: supplierDto.supplier_name,
            supplier_account_no: supplierDto.supplier_account_no,
            supplier_address1: supplierDto.supplier_address1,
            supplier_address2 : supplierDto.supplier_address2,
            supplier_city: supplierDto.supplier_city,
            supplier_state: supplierDto.supplier_state,
            supplier_pincode: supplierDto.supplier_pincode,
            supplier_location: supplierDto.supplier_location,
            supplier_mobile_no1: supplierDto.supplier_mobile_no1,
            supplier_mobile_no2: supplierDto.supplier_mobile_no2,
            supplier_bank_name: supplierDto.supplier_bank_name,
            supplier_ifsc: supplierDto.supplier_ifsc
        })

        return { message: "Supplier updated successfully" }
    }

    async getSupplierById(id:UUID){
        const supplier = await this.supplierRepository.findOne({ where: {is_active: true, id: id} })
        if(supplier){
            return { supplier };
        }
        throw new HttpException("No supplier found", HttpStatus.NOT_FOUND)
    }

    async createNewCustomer(customerDto: CreateCustomer){
        const customer = await this.customerRepository.find({ select:['id','customer_name'], where: {is_active: true, customer_name: customerDto.customer_name} })
        if(customer.length > 0){
            return { message: "Customer already exists" }    
        }
        await this.customerRepository.save(customerDto)
        return { message: "Customer created successfully" }
    }

    async getCustomers(input: { page?:number, limit?:number, search?:string }){
        let query = this.customerRepository.createQueryBuilder('customers')
        .where({is_active : true})

        if(input?.page){
            query = query
            .limit(input.limit)
            .offset((input.page - 1) * input.limit)
        }

        if(input?.search) {
            query = query.andWhere('LOWER(customers.customer_name) LIKE :customerName', { customerName: `%${input.search.toLowerCase()}%` })
        }

        const [list, count] = await query.getManyAndCount()
        return {
            list, count
        }
    }

    async getCustomerById(id:UUID){
        const customer = await this.customerRepository.findOne({ where: {is_active: true, id: id} })
        if(customer){
            return { customer };
        }
        throw new HttpException("No customer found", HttpStatus.NOT_FOUND)
    }

    async updateCustomer(customerDto: CreateCustomer){
        const existingCustomer = await this.customerRepository.findOne({ 
            where: {is_active: true, customer_name: customerDto.customer_name, } })

        if(existingCustomer.id != customerDto.customer_id){
            return { message: "Customer name already exists" }
        }
        
        await this.customerRepository.update({id: customerDto.customer_id},{
            customer_name: customerDto.customer_name,
            customer_account_no: customerDto.customer_account_no,
            customer_address1: customerDto.customer_address1,
            customer_address2 : customerDto.customer_address2,
            customer_city: customerDto.customer_city,
            customer_state: customerDto.customer_state,
            customer_pincode: customerDto.customer_pincode,
            customer_mobile_no1: customerDto.customer_mobile_no1,
            customer_mobile_no2: customerDto.customer_mobile_no2,
            customer_bank_name: customerDto.customer_bank_name,
            customer_ifsc: customerDto.customer_ifsc,
            is_machine: customerDto.is_machine,
            is_spares: customerDto.is_spares,
            is_spm: customerDto.is_spm
        })

        return { message: "Customer updated successfully" }
    }
}
