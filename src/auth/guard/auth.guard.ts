import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Observable } from "rxjs";
const jwt = require('jsonwebtoken')

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private configService: ConfigService){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request)
    }

    async validateRequest(request:Request){
        try{
            let reqUrl = request.url;
            if(reqUrl.includes("prodImage")){
                return true
            }else{
                const token = request.headers.authorization.replace('Bearer ',"");
                let secret = this.configService.get('JWT_SECRET')
                await jwt.verify(token, secret)
                return true
            }
        }catch(err){
            console.log(err)
            return false
        }
    }
}