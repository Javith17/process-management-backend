import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { UUID } from 'crypto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { AuthInterceptor } from 'src/auth/middleware/interceptor.middleware';
import { CreateCustomer, CreateProcess, CreateRole, CreateSupplier, CreateUser, CreateVendor, UpdateUserPassword } from 'src/dto/admin.dto';
import { Pagination } from 'src/dto/pagination.dto';
import { AdminService } from './admin.service';

@UseGuards(AuthGuard)
@UseInterceptors(AuthInterceptor)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  
    @Get("/check")
    checkController(){
        return 'Connected successfully'
    }

    @Post('/createRole')
    createRole(@Body() createRole: CreateRole){
        return this.adminService.createRole(createRole);
    }

    @Get('/roles')
    getRoles(@Query() pagination: Pagination){
        return this.adminService.getAllRoles(pagination)
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
    getUsers(@Query() pagination: Pagination){
        return this.adminService.getAllUsers(pagination)
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
    getProcessList(@Query() pagination: Pagination){
        return this.adminService.getAllProcess(pagination)
    }

    @Post('/createVendor')
    createVendor(@Body() createVendor: CreateVendor){
        return this.adminService.createNewVendor(createVendor)
    }

    @Post('/updateVendor')
    updateVendor(@Body() createVendor: CreateVendor){
        return this.adminService.updateVendor(createVendor)
    }

    @Get('/vendor/:id')
    getVendorById(@Param('id') id:UUID){
        return this.adminService.getVendorById(id)
    }

    @Get('/vendorsList')
    getVendors(@Query() pagination: Pagination){
        return this.adminService.getVendorsList(pagination)
    }

    @Post('/createSupplier')
    createSupplier(@Body() createSupplier: CreateSupplier){
        return this.adminService.createNewSupplier(createSupplier)
    }

    @Get('/suppliersList')
    getSuppliers(@Query() pagination: Pagination){
        return this.adminService.getSuppliers(pagination)
    }

    @Get('/supplier/:id')
    getSupplierById(@Param('id') id:UUID){
        return this.adminService.getSupplierById(id)
    }

    @Post('/updateSupplier')
    updateSupplier(@Body() createSupplier: CreateSupplier){
        return this.adminService.updateSupplier(createSupplier)
    }

    @Post('/createCustomer')
    createCustomer(@Body() createCustomer: CreateCustomer){
        return this.adminService.createNewCustomer(createCustomer)
    }

    @Get('/customersList')
    getCustomers(@Query() pagination: Pagination){
        return this.adminService.getCustomers(pagination)
    }

    @Get('/customer/:id')
    getCustomerDetail(@Param('id') id:UUID){
        return this.adminService.getCustomerById(id)
    }

    @Post('/updateCustomer')
    updateCustomer(@Body() createCustomer: CreateCustomer){
        return this.adminService.updateCustomer(createCustomer)
    }

    @Get('/vendorsHistory')    
    getVendorsHistory(@Query() pagination: Pagination){
        return this.adminService.getVendorHistory(pagination)
    }

    @Get('/suppliersHistory')    
    getSuppliersHistory(@Query() pagination: Pagination){
        return this.adminService.getSupplierHistory(pagination)
    }

    @Get('/customersHistory')
    getCUstomersHistory(@Query() pagination: Pagination){
        return this.adminService.getCustomerHistory(pagination)
    }
}
