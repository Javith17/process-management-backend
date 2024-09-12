import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CreateCustomer, CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, CreateVendorProcess, UpdateUserPassword } from 'src/dto/admin.dto';
import { Pagination } from 'src/dto/pagination.dto';
import { CustomerEntity } from 'src/model/customer.entity';
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
        @InjectRepository(SupplierEntity) private supplierRepository: Repository<SupplierEntity>,
        @InjectRepository(CustomerEntity) private customerRepository: Repository<CustomerEntity>
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
        .select(['user.emp_code', 'user.emp_name'])
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

    async getAllProcess(){
        return { process: await this.processRepository.find({ select:['id','process_name'], where: {is_active: true} }) }
    }

    async createNewVendor(vendorDto: CreateVendor){
        const existingVendor = await this.vendorRepository.find({ select:['id','vendor_name'], where: {is_active: true, vendor_name: vendorDto.vendor_name} })

        if(existingVendor.length > 0){
            return { message: "Vendor already exists" }   
        }
        const vendor = await this.vendorRepository.save({
            vendor_name: vendorDto.vendor_name,
            vendor_code: vendorDto.vendor_code,
            vendor_account_no: vendorDto.vendor_account_no,
            vendor_address: vendorDto.vendor_address,
            vendor_gst: vendorDto.vendor_gst,
            vendor_location: vendorDto.vendor_location,
            vendor_mobile_no1: vendorDto.vendor_mobile_no1,
            vendor_mobile_no2: vendorDto.vendor_mobile_no2
        })

        vendorDto.vendor_process_list?.map(async (process) => {
            var vendorProcessObj = { vendor: vendor, process_id: process.process_id, process_name: process.process_name, vendor_id: vendor.id}
            await this.vendorProcessRepository.save(vendorProcessObj)
        })

        return { message: "Vendor created successfully" }
    }

    async getVendorsList(pagination: Pagination){
        let query = await this.vendorRepository.createQueryBuilder('vendor')
            .leftJoinAndSelect('vendor.process_list','process')
            .select(['vendor.id','vendor.vendor_name',
            'vendor.vendor_code','vendor.vendor_address',
            'vendor.vendor_gst', 'vendor.vendor_account_no',
            'vendor.vendor_mobile_no1','vendor.vendor_mobile_no2',
            'vendor.vendor_location','process.process_id','process.process_name'])
        
        if(pagination?.page){
            query = query
            .limit(pagination.limit)
            .offset((pagination.page - 1) * pagination.limit)    
        }

        if(pagination?.search){
            query = query.andWhere('LOWER(vendor.vendor_name) LIKE :vendorName', { vendorName: `%${pagination.search.toLowerCase()}%` })
        }
        
        const [list, count] = await query.getManyAndCount()
        return { list, count }
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
        .select(['suppliers.supplier_name', 'suppliers.supplier_code', 
            'suppliers.supplier_address','suppliers.supplier_mobile_no1',
            'suppliers.supplier_mobile_no2','suppliers.supplier_account_no', 
            'suppliers.supplier_location'])
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
}
