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

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity, UserEntity, ProcessEntity, VendorEntity, 
        VendorProcessEntity, SupplierEntity, CustomerEntity])],
    controllers: [AdminController],
    providers: [AdminService]
  })
  export class AdminModule {}