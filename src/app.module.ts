import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CustomerEntity } from './model/customer.entity';
import { ProcessEntity } from './model/process.entity';
import { RoleEntity } from './model/role.entity';
import { SupplierEntity } from './model/supplier.entity';
import { UserEntity } from './model/user.entity';
import { VendorEntity } from './model/vendor.entity';
import { VendorProcessEntity } from './model/vendorProcess.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'process_mgnt_1',
      entities: [ UserEntity, RoleEntity, ProcessEntity, VendorEntity, VendorProcessEntity, 
        SupplierEntity, CustomerEntity ],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal:true
    }),
    AdminModule, AuthModule,
    UserModule]
})
export class AppModule {}
