import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, CreateVendorProcess, UpdateUserPassword } from 'src/dto/admin.dto';
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
    ){}
    
    async createRole(roleDto: CreateRole){
        const newRole = await this.roleRepository.create(roleDto)
        await this.roleRepository.save(newRole)
        return newRole
    }

    async getAllRoles(){
        return { roles: await this.roleRepository.find({ select:['id','roleName', 'roleCode', 'screens'], where: {isActive: true} }) }
    }

    async getRoleById(id:UUID){
        const role = await this.roleRepository.find({ select:['id','roleName', 'roleCode', 'screens'], where: {isActive: true, id: id} })
        if(role.length > 0){
            return { role: role.at(0) };
        }
        throw new HttpException("No role found", HttpStatus.NOT_FOUND)
    }

    async createNewUser(userDto: CreateUser){
        const newUser = await this.userRepository.create(userDto)
        await this.userRepository.save(newUser)
        return {
            empCode: newUser.empCode,
            empName: newUser.empName,
            id: newUser.id,
            roleId: newUser.roleId
        }
    }

    async getAllUsers(){
        return { users: await this.userRepository.find({ select:['id','empCode', 'empName', 'roleId'], where: {isActive: true} }) }
    }

    async getUserById(id:UUID){
        const user = await this.userRepository.find({ select:['id','empCode', 'empName', 'roleId'], where: {isActive: true, id: id} })
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
        const process = await this.processRepository.find({ select:['id','processName'], where: {isActive: true, processName: processDto.processName} })
        if(process.length > 0){
            return { message: "Process already exists" }    
        }
        const newProcess = await this.processRepository.create(processDto)
        await this.processRepository.save(newProcess)
        return { message: "Process created successfully" }    
    }

    async getAllProcess(){
        return { process: await this.processRepository.find({ select:['id','processName'], where: {isActive: true} }) }
    }

    async createNewVendor(vendorDto: CreateVendor){
        // const newVendor = await this.vendorRepository.create()
        const vendor = await this.vendorRepository.save({
            vendorName: vendorDto.vendorName,
            vendorCode: vendorDto.vendorCode,
            vendorAccountNo: vendorDto.vendorAccountNo,
            vendorAddress: vendorDto.vendorAddress,
            vendorGST: vendorDto.vendorGST,
            vendorLocation: vendorDto.vendorLocation,
            vendorMobileNo1: vendorDto.vendorMobileNo1,
            vendorMobileNo2: vendorDto.vendorMobileNo2
        })
        vendorDto.vendorProcessList?.map(async (process) => {
            await this.vendorProcessRepository.save({
                vendorId: vendor.id,
                processId: process.processId,
                processName: process.processName
            })
        })

        return { message: "Vendor created successfully" }
    }

    async getVendorsList(){
        return { vendors: await this.vendorRepository.find({ select:['id','vendorCode', 'vendorName', 'vendorAddress',
        'vendorAccountNo', 'vendorGST', 'vendorLocation', 'vendorMobileNo1', 'vendorMobileNo2'], where: {isActive: true} }) }
    }

    async createNewSupplier(supplierDto: CreateSupplier){
        await this.supplierRepository.save(supplierDto)
        return { message: "Supplier created successfully" }
    }

    async getSuppliers(){
        return { suppliers: await this.supplierRepository.find({ select:['id','supplierName', 'supplierCode', 'supplierAddress',
        'supplierLocation', 'supplierMobileNo1', 'supplierMobileNo2', 'supplierAccountNo'], where: {isActive: true} }) }
    }
}
