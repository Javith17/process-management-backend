import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerEntity } from "src/model/customer.entity";
import { ProcessEntity } from "src/model/process.entity";
import { RoleEntity } from "src/model/role.entity";
import { SupplierEntity } from "src/model/supplier.entity";
import { UserEntity } from "src/model/user.entity";
import { VendorEntity } from "src/model/vendor.entity";
import { VendorProcessEntity } from "src/model/vendorProcess.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { PartProcessEntity } from "src/model/part_process.entity";
import { PartProcessVendorEntity } from "src/model/part_process_vendor.entity";
import { PartEntity } from "src/model/part.entity";

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity, UserEntity, ProcessEntity, VendorEntity, 
        VendorProcessEntity, SupplierEntity, CustomerEntity, PartProcessEntity, PartProcessVendorEntity,
        PartEntity])],
    controllers: [AdminController],
    providers: [AdminService]
  })
  export class AdminModule {}