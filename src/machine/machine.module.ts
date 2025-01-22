import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BoughtOutEntity } from "src/model/bought_out.entity";
import { BoughtOutSuppliertEntity } from "src/model/bought_out_supplier.entity";
import { MachineEntity } from "src/model/machine.entity";
import { MainAssemblyDetailEntity } from "src/model/main_assembly_detail.entity";
import { MainAssemblyEntity } from "src/model/main_assembly.entity";
import { PartEntity } from "src/model/part.entity";
import { PartProcessEntity } from "src/model/part_process.entity";
import { PartProcessVendorEntity } from "src/model/part_process_vendor.entity";
import { ProcessEntity } from "src/model/process.entity";
import { SubAssemblyEntity } from "src/model/sub_assembly.entity";
import { SubAssemblyDetailEntity } from "src/model/sub_assembly_detail.entity";
import { SupplierEntity } from "src/model/supplier.entity";
import { VendorEntity } from "src/model/vendor.entity";
import { MachineController } from "./machine.controller";
import { MachineService } from "./machine.service";
import { SectionAssemblyEntity } from "src/model/section_assembly.entity";
import { SectionAssemblyDetailEntity } from "src/model/section_assembly_detail.entity";
import { MachineSubAssemblyEntity } from "src/model/machine_sub_assembly.entity";
import { SubAssemblyMachineEntity } from "src/model/sub_assembly_machines.entity";
import { AttachmentEntity } from "src/model/attachment.entity";
import { PartMachineEntity } from "src/model/part_machine.entity";
import { BoughtoutMachineEntity } from "src/model/bought_out_machine.entity";

@Module({
    imports: [TypeOrmModule.forFeature([PartEntity, PartProcessEntity, PartProcessVendorEntity, 
        VendorEntity, ProcessEntity, BoughtOutEntity, BoughtOutSuppliertEntity, SupplierEntity,
        MachineEntity, SubAssemblyEntity, SubAssemblyDetailEntity, MainAssemblyEntity, MainAssemblyDetailEntity,
        SectionAssemblyEntity, SectionAssemblyDetailEntity, MachineSubAssemblyEntity, SubAssemblyMachineEntity, AttachmentEntity,
        PartMachineEntity, BoughtoutMachineEntity])],
    controllers: [MachineController],
    providers: [MachineService]
  })
  export class MachineModule {}
  