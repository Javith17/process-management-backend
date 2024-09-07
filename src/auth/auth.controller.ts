import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignIn } from 'src/dto/auth.dto';
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
}