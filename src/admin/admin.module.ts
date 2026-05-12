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
import { ProductionMachinePartEntity } from "src/model/production_machine_part.entity";
import { ProductionMachineBoughtoutEntity } from "src/model/production_machine_boughtout.entity";
import { OrderConfirmationEntity } from "src/model/order_confirmation.entity";
import { EnquiryEntity } from "src/model/enquiry.entity";
import { QuotationModule } from "src/quotation/quotation.module";
import { NotificationService } from "src/common/notification.service";
import { FirebaseProvider } from "src/common/firebase.provider";

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity, UserEntity, ProcessEntity, VendorEntity, 
        VendorProcessEntity, SupplierEntity, CustomerEntity, PartProcessEntity, PartProcessVendorEntity,
        PartEntity, ProductionMachinePartEntity, ProductionMachineBoughtoutEntity, OrderConfirmationEntity,
        EnquiryEntity]), QuotationModule],
    controllers: [AdminController],
    providers: [AdminService, FirebaseProvider, NotificationService]
  })
  export class AdminModule {}