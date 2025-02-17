import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoughtOutEntity } from "src/model/bought_out.entity";
import { BoughtOutSuppliertEntity } from "src/model/bought_out_supplier.entity";
import { CustomerEntity } from "src/model/customer.entity";
import { MachineEntity } from "src/model/machine.entity";
import { MachineQuotationEntity } from "src/model/machine_quotation.entity";
import { OrderConfirmationEntity } from "src/model/order_confirmation.entity";
import { PartEntity } from "src/model/part.entity";
import { PartProcessEntity } from "src/model/part_process.entity";
import { PartProcessVendorEntity } from "src/model/part_process_vendor.entity";
import { ProcessEntity } from "src/model/process.entity";
import { ProductionMachineBoughtoutEntity } from "src/model/production_machine_boughtout.entity";
import { ProductionMachinePartEntity } from "src/model/production_machine_part.entity";
import { ProductionPartRescheduleEntity } from "src/model/production_part_reschedule.entity";
import { SectionAssemblyEntity } from "src/model/section_assembly.entity";
import { SubAssemblyEntity } from "src/model/sub_assembly.entity";
import { SupplierEntity } from "src/model/supplier.entity";
import { SupplierQuotationEntity } from "src/model/supplier_quotation.entity";
import { UserEntity } from "src/model/user.entity";
import { VendorEntity } from "src/model/vendor.entity";
import { VendorQuotationEntity } from "src/model/vendor_quotation.entity";
import { QuotationController } from "./quotation.controller";
import { QuotationService } from "./quotation.service";
import { ProductionMachineHistoryEntity } from "src/model/production_machine_history.entity";
import { SparesQuotationEntity } from "src/model/spares_quotation.entity";
import { MainAssemblyEntity } from "src/model/main_assembly.entity";

@Module({
    imports: [TypeOrmModule.forFeature([MachineQuotationEntity, MachineEntity, CustomerEntity, 
      UserEntity, OrderConfirmationEntity, SectionAssemblyEntity,SubAssemblyEntity, ProductionMachinePartEntity,
      PartProcessEntity, PartEntity, VendorQuotationEntity, VendorEntity, PartProcessVendorEntity,
      SupplierEntity, BoughtOutEntity, SupplierQuotationEntity, BoughtOutSuppliertEntity,
      ProductionMachineBoughtoutEntity, ProductionMachineHistoryEntity, SparesQuotationEntity,
      MainAssemblyEntity ])],
    controllers: [QuotationController],
    providers: [QuotationService]
  })
  export class QuotationModule {}
  