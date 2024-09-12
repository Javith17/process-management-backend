import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PartEntity } from "src/model/part.entity";
import { PartProcessEntity } from "src/model/part_process.entity";
import { PartProcessVendorEntity } from "src/model/part_process_vendor.entity";
import { ProcessEntity } from "src/model/process.entity";
import { VendorEntity } from "src/model/vendor.entity";
import { MachineController } from "./machine.controller";
import { MachineService } from "./machine.service";

@Module({
    imports: [TypeOrmModule.forFeature([PartEntity, PartProcessEntity, PartProcessVendorEntity, 
        VendorEntity, ProcessEntity])],
    controllers: [MachineController],
    providers: [MachineService]
  })
  export class MachineModule {}