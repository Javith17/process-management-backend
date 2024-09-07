import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthInterceptor } from 'src/auth/middleware/interceptor.middleware';
import { CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, UpdateUserPassword } from 'src/dto/admin.dto';
import { AdminService } from './admin.service';

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  
    @Post('/createRole')
    createRole(@Body() createRole: CreateRole){
        return this.adminService.createRole(createRole);
    }

    @Get('/roles')
    getRoles(){
        return this.adminService.getAllRoles()
    }

    @Get('/roles/:id')
    getRoleById(@Param('id') id:UUID){
        return this.adminService.getRoleById(id)
    }
    
    @Post('/createUser')
    createUser(@Body() createUser: CreateUser){
        return this.adminService.createNewUser(createUser)
    }
    
    @Get('/users')
    getUsers(){
        return this.adminService.getAllUsers()
    }

    @Get('/users/:id')
    getUserById(@Param('id') id:UUID){
        return this.adminService.getUserById(id)
    }

    @Post('/changePassword')
    changePassword(@Body() updatePassword: UpdateUserPassword){
        return this.adminService.changePassword(updatePassword)
    }

    @Post('/createProcess')
    createProcess(@Body() createProcess: CreateProcess){
        return this.adminService.createProcess(createProcess)
    }

    @Get('/processList')
    getProcessList(){
        return this.adminService.getAllProcess()
    }

    @Post('/createVendor')
    createVendor(@Body() createVendor: CreateVendor){
        return this.adminService.createNewVendor(createVendor)
    }

    @Get('/vendorsList')
    getVendors(){
        return this.adminService.getVendorsList()
    }

    @Post('/createSupplier')
    createSupplier(@Body() createSupplier: CreateSupplier){
        return this.adminService.createNewSupplier(createSupplier)
    }

    @Get('/suppliersList')
    getSuppliers(){
        return this.adminService.getSuppliers()
    }
}
