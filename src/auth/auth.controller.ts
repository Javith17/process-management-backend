import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AcceptByVendorDto, SignIn } from 'src/dto/auth.dto';
import { QuotationService } from 'src/quotation/quotation.service';
import { AuthService } from './auth.service';
const jwt = require('jsonwebtoken');

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService,
        private configService:ConfigService){}

    @Post('/signIn')
    async signIn(@Body() signIn:SignIn){
        const user = await this.authService.signIn(signIn)
        if(user.message == "Success"){
            let secret = this.configService.get('JWT_SECRET')
            let data = {
                userId: user.user.userId,
                roleId: user.user.roleId,
                roleName: user.user.roleName,
                userName: user.user.empName
            }
            const token = await jwt.sign(data, secret)
            return { user: user.user, accessToken: token}
        }else{
            throw new HttpException("Invalid credentials", HttpStatus.FORBIDDEN)
        }
    }

    @Get('/productionPartDetail/:id')
    async getProductionPartDetail(@Param('id') id: string){
        return await this.authService.getProductionPartDetail(id)
    }

    @Post('/vendorAcceptStatus')
    async acceptByVendor(@Body() acceptVendor: AcceptByVendorDto){
        return await this.authService.acceptVendor(acceptVendor)
    }
}