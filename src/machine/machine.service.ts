import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { CreateCustomer, CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, CreateVendorProcess, UpdateUserPassword } from 'src/dto/admin.dto';
import { CreatePart } from 'src/dto/machine.dto';
import { Pagination } from 'src/dto/pagination.dto';
import { CustomerEntity } from 'src/model/customer.entity';
import { PartEntity } from 'src/model/part.entity';
import { PartProcessEntity } from 'src/model/part_process.entity';
import { PartProcessVendorEntity } from 'src/model/part_process_vendor.entity';
import { ProcessEntity } from 'src/model/process.entity';
import { VendorEntity } from 'src/model/vendor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MachineService {
    constructor(
        @InjectRepository(PartEntity) private partRepository: Repository<PartEntity>,
        @InjectRepository(PartProcessEntity) private partProcessRepository: Repository<PartProcessEntity>,
        @InjectRepository(PartProcessVendorEntity) private partProcessVendorRepository: Repository<PartProcessVendorEntity>,
        @InjectRepository(VendorEntity) private vendorRepository: Repository<VendorEntity>,
        @InjectRepository(ProcessEntity) private processRepository: Repository<ProcessEntity>
    ){}
    

    async createNewPart(createPartDto: CreatePart){
        const existingPart = await this.partRepository.find({ select:['id','part_name'], where: {is_active: true, part_name: createPartDto.part_name} })

        if(existingPart.length > 0){
            return { message: "Part already exists" }   
        }
        const partObj = await this.partRepository.save({
            part_name: createPartDto.part_name,
            minimum_stock_qty: createPartDto.minimum_stock_qty,
            available_aty: createPartDto.available_qty
        })

        createPartDto.part_process_list?.map(async (partProcessDto)=>{
            const processObj = await this.processRepository.findOneBy({id: partProcessDto.process_id})
            const partProcessObj = await this.partProcessRepository.save({
                part: partObj,
                process: processObj,
                process_cost: partProcessDto.process_cost,
                process_time: partProcessDto.process_time
            })

            partProcessDto.part_process_vendor_list?.map(async (partProcessVendorDto) => {
                const vendor = await this.vendorRepository.findOne({ where: {id: partProcessVendorDto.vendor_id}})
                    await this.partProcessVendorRepository.save({
                    part_process: partProcessObj,
                    part_process_vendor_price: partProcessVendorDto.part_process_vendor_price,
                    vendor: vendor
                })
            })
        })

        return { message: "Part created successfully" }
    }

    async getPartsList(pagination: Pagination){
        let query = await this.partRepository.createQueryBuilder('parts')
            .leftJoinAndSelect('parts.part_process_list','part_process')
            .leftJoinAndSelect('part_process.part_process_vendor_list', 'part_process_vendor')
            .leftJoinAndSelect('part_process.process', 'process')
            .leftJoinAndSelect('part_process_vendor.vendor', 'vendor')
            .select([
                'parts.id',
                'parts.part_name',
                'parts.minimum_stock_qty',
                'parts.available_aty',
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
        
        if(pagination?.page){
            query = query
            .limit(pagination.limit)
            .offset((pagination.page - 1) * pagination.limit)    
        }

        if(pagination?.search){
            query = query.andWhere('LOWER(part.part_name) LIKE :vendorName', { vendorName: `%${pagination.search.toLowerCase()}%` })
        }
        
        const [list, count] = await query.getManyAndCount()
        return { list, count }
    }
}
