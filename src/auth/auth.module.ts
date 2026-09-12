import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductionMachinePartEntity } from "src/model/production_machine_part.entity";
import { RoleEntity } from "src/model/role.entity";
import { UserEntity } from "src/model/user.entity";
import { QuotationService } from "src/quotation/quotation.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { VendorEntity } from "src/model/vendor.entity";
import { ProductionMachineBoughtoutEntity } from "src/model/production_machine_boughtout.entity";
import { SupplierEntity } from "src/model/supplier.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, ProductionMachinePartEntity, VendorEntity, ProductionMachineBoughtoutEntity, SupplierEntity])],
    providers: [AuthService],
    controllers: [AuthController]
  })
  export class AuthModule {}