import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { map, Observable } from "rxjs";
const jwt = require('jsonwebtoken')

export class AuthInterceptor implements NestInterceptor{
    constructor(private configService:ConfigService){}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        let request = context.switchToHttp().getRequest()
        const token = request.headers.authorization
        if(token == undefined || token.length == 0){
            request.createdBy = ""
            return next.handle()
        }else{
            try{
                let secret = 'prcs-mgmt-jwt-secret-000J1' //await this.configService.get('JWT_SECRET')
                let authToken = token.replace('Bearer ','')
                let decoded = await jwt.verify(authToken, secret)
                if(request?.route?.path?.includes('createMachineQoutation') || request?.route?.path?.includes('createVendorQoutation')  
                || request?.route?.path?.includes('createSupplierQuotation') || request?.route?.path?.includes('rescheduleProductionPartProcess')
                || request?.route?.path?.includes('updateProductionMachineBO') || request?.route?.path?.includes('updateProductionMachinePart')
                || request?.route?.path?.includes('moveProductionMachinePartToVendor') || request?.route?.path?.includes('completeProductionPartProcess')
                || request?.route?.path?.includes('deliverProductionMachineBO') || request?.route?.path?.includes('deliverProductionMachinePart')
                || request?.route?.path?.includes('movePartsToAssembly') || request?.route?.path?.includes('moveBoughtoutsToAssembly')
                || request?.route?.path?.includes('closeAssemblyBoughtout') || request?.route?.path?.includes('closeAssemblyPart')
                || request?.route?.path?.includes('closeOrder') || request?.route?.path?.includes('closeAssembly')){                    
                    request.body.created_by = decoded.userId
                }else if(request?.route?.path?.includes('approveRejectQuotation')){
                    request.body.approved_rejected_by = decoded.userId
                }else if(request?.route?.path?.includes('updateAssembly')){
                    request.body.assembled_by = decoded.userId
                }
                return next.handle()
            }catch(err){
                console.log(err)
                // request.createdBy = ""
                return next.handle()
            }
        }
    }

}