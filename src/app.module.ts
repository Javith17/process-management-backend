import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { MachineModule } from './machine/machine.module';
import { BoughtOutEntity } from './model/bought_out.entity';
import { BoughtOutSuppliertEntity } from './model/bought_out_supplier.entity';
import { CustomerEntity } from './model/customer.entity';
import { MachineEntity } from './model/machine.entity';
import { MainAssemblyDetailEntity } from './model/main_assembly_detail.entity';
import { MainAssemblyEntity } from './model/main_assembly.entity';
import { PartEntity } from './model/part.entity';
import { PartProcessEntity } from './model/part_process.entity';
import { PartProcessVendorEntity } from './model/part_process_vendor.entity';
import { ProcessEntity } from './model/process.entity';
import { RoleEntity } from './model/role.entity';
import { SubAssemblyEntity } from './model/sub_assembly.entity';
import { SubAssemblyDetailEntity } from './model/sub_assembly_detail.entity';
import { SupplierEntity } from './model/supplier.entity';
import { UserEntity } from './model/user.entity';
import { VendorEntity } from './model/vendor.entity';
import { VendorProcessEntity } from './model/vendorProcess.entity';
import { UserModule } from './user/user.module';
import { SectionAssemblyEntity } from './model/section_assembly.entity';
import { SectionAssemblyDetailEntity } from './model/section_assembly_detail.entity';
import { MachineSubAssemblyEntity } from './model/machine_sub_assembly.entity';
import { MulterModule } from '@nestjs/platform-express';
import { QuotationModule } from './quotation/quotation.module';
import { MachineQuotationEntity } from './model/machine_quotation.entity';
import { SubAssemblyMachineEntity } from './model/sub_assembly_machines.entity';
import { AttachmentEntity } from './model/attachment.entity';
import { OrderConfirmationEntity } from './model/order_confirmation.entity';
import { ProductionMachinePartEntity } from './model/production_machine_part.entity';
import { VendorQuotationEntity } from './model/vendor_quotation.entity';
import { SupplierQuotationEntity } from './model/supplier_quotation.entity';
import { ProductionPartRescheduleEntity } from './model/production_part_reschedule.entity';
import { ProductionMachineBoughtoutEntity } from './model/production_machine_boughtout.entity';
import { ProductionMachineHistoryEntity } from './model/production_machine_history.entity';
import { OrderModule } from './order/order.module';
import { PartMachineEntity } from './model/part_machine.entity';
import { BoughtoutMachineEntity } from './model/bought_out_machine.entity';
ConfigModule.forRoot()

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      entities: [ UserEntity, RoleEntity, ProcessEntity, VendorEntity, VendorProcessEntity, 
        SupplierEntity, CustomerEntity, PartEntity, PartProcessEntity, PartProcessVendorEntity,
        BoughtOutEntity, BoughtOutSuppliertEntity, MachineEntity, SubAssemblyEntity, SubAssemblyDetailEntity,
        MainAssemblyEntity, MainAssemblyDetailEntity, SectionAssemblyEntity, SectionAssemblyDetailEntity,
        MachineSubAssemblyEntity, MachineQuotationEntity, SubAssemblyMachineEntity, AttachmentEntity,
        OrderConfirmationEntity, ProductionMachinePartEntity, VendorQuotationEntity, SupplierQuotationEntity,
        ProductionPartRescheduleEntity, ProductionMachineBoughtoutEntity, ProductionMachineHistoryEntity,
        PartMachineEntity, BoughtoutMachineEntity],
      synchronize: true,
    }),
    MulterModule.register({
      dest:'./uploads'
    }),
    ConfigModule.forRoot({
      isGlobal:true
    }),
    AdminModule, AuthModule, MachineModule,
    UserModule, QuotationModule, OrderModule]
})
export class AppModule {}
