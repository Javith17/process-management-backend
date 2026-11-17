import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AcceptByVendorDto, AcceptBySupplierDto, SendVendorOTPDto, SignIn } from "src/dto/auth.dto";
import { ProductionMachinePartEntity } from "src/model/production_machine_part.entity";
import { ProductionMachineBoughtoutEntity } from "src/model/production_machine_boughtout.entity";
import { RoleEntity } from "src/model/role.entity";
import { UserEntity } from "src/model/user.entity";
import { VendorEntity } from "src/model/vendor.entity";
import { SupplierEntity } from "src/model/supplier.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        @InjectRepository(ProductionMachinePartEntity) private productionMachinePartRepo: Repository<ProductionMachinePartEntity>,
        @InjectRepository(VendorEntity) private vendorRepo: Repository<VendorEntity>,
        @InjectRepository(ProductionMachineBoughtoutEntity) private productionMachineBoughtoutRepo: Repository<ProductionMachineBoughtoutEntity>,
        @InjectRepository(SupplierEntity) private supplierRepo: Repository<SupplierEntity>) { }

    async signIn(signInDto: SignIn) {
        const user = await this.userRepo.createQueryBuilder('user')
            .select(['user.id', 'user.emp_name', 'user.emp_code', 'roles.role_code', 'roles.role_name', 'roles.screens', 'roles.dashboard'])
            .innerJoinAndSelect(RoleEntity, 'roles', 'user.role_id = roles.id::text')
            .where('user.emp_code=:empCode', { empCode: signInDto.emp_code })
            .andWhere('user.password=:password', { password: signInDto.password })
            .andWhere('user.is_active=:isActive', { isActive: true })
            .getRawOne()

        if (user) {
            return {
                message: "Success", user: {
                    userId: user.user_id,
                    empName: user.user_emp_name,
                    empCode: user.user_emp_code,
                    roleCode: user.role_code,
                    roleName: user.role_name,
                    screens: user.screens,
                    dashboard: user.dashboard,
                    roleId: user.roles_id
                }
            };
        } else {
            return { message: "Invalid login credentials" }
        }
    }

    async getProductionPartDetail(id: string) {
        const result = await this.productionMachinePartRepo.createQueryBuilder('production_part')
            .select([
                'production_part.part_name',
                'production_part.part_code',
                'production_part.process_name',
                'production_part.vendor_name',
                'production_part.order_qty',
                'production_part.part_id',
                'production_part.vendor_id',
                'production_part.order_id',
                'production_part.delivery_date',
                'production_part.vendor_accept_status'
            ]).where('production_part.id = :id', { id })
            .getOne()

        const vendorParts = await this.productionMachinePartRepo.createQueryBuilder('production_part')
            .select([
                'production_part.id',
                'production_part.part_name',
                'production_part.part_code',
                'production_part.process_name',
                'production_part.vendor_name',
                'production_part.order_qty',
                'production_part.part_id',
                'production_part.vendor_id',
                'production_part.order_id',
                'production_part.delivery_date',
                'production_part.vendor_accept_status'
            ])
            .where('production_part.part_id = :part_id', { part_id: result.part_id })
            .andWhere('production_part.order_id = :order_id', { order_id: result.order_id })
            .andWhere('production_part.vendor_id = :vendor_id', { vendor_id: result.vendor_id })
            .getMany()
        return { productionPart: vendorParts }
    }

    async acceptVendor(acceptByVendor: AcceptByVendorDto) {
        await this.productionMachinePartRepo.createQueryBuilder()
            .update(ProductionMachinePartEntity)
            .set({
                vendor_accept_at: new Date(),
                vendor_accept_remarks: acceptByVendor.remarks,
                vendor_accept_status: acceptByVendor.status,
                status: acceptByVendor.status == "accepted" ? 'Vendor In-Progress' : 'Vendor Rejected'
            })
            .where('id IN (:...id)', { id: acceptByVendor.id })
            .execute()
        return { message: 'Order Accepted Successfully' }
    }

    async getProductionBoughtoutDetail(id: string) {
        // Unlike parts (which have a process dimension and multiple sibling rows per
        // vendor+part+order), a boughtout order line is a single row — no sibling
        // aggregation is needed here.
        const bo = await this.productionMachineBoughtoutRepo.createQueryBuilder('production_boughtout')
            .where('production_boughtout.id = :id', { id })
            .getOne()
        return { productionBoughtout: bo }
    }

    async acceptSupplier(acceptBySupplier: AcceptBySupplierDto) {
        await this.productionMachineBoughtoutRepo.createQueryBuilder()
            .update(ProductionMachineBoughtoutEntity)
            .set({
                supplier_accept_at: new Date(),
                supplier_accept_remarks: acceptBySupplier.remarks,
                supplier_accept_status: acceptBySupplier.status,
                status: acceptBySupplier.status == "accepted" ? 'Payment Pending' : 'Supplier Rejected'
            })
            .where('id = :id', { id: acceptBySupplier.id })
            .execute()
        return { message: 'Order Accepted Successfully' }
    }

    async sendVendorOTP(sendOtp: SendVendorOTPDto) {
        try {
            const vendor = await this.vendorRepo.findOne({ where: { vendor_mobile_no1: sendOtp.phone_number } });
            if (!vendor) {
                return { message: "Vendor not registered" }   
            } else {
                
            }
        } catch (err: any) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: err?.message,
            }, HttpStatus.FORBIDDEN, {
                cause: err?.message
            });
        }
    }
}