import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SignIn } from "src/dto/auth.dto";
import { RoleEntity } from "src/model/role.entity";
import { UserEntity } from "src/model/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>){}

    async signIn(signInDto: SignIn){
        const user = await this.userRepo.createQueryBuilder('user')
            .select(['user.id','user.empName','user.empCode', 'roles.roleCode','roles.roleName', 'roles.screens'])
            .innerJoinAndSelect(RoleEntity, 'roles', 'user.roleId = roles.id')
            .where('user.empCode=:empCode', {empCode:signInDto.empCode})
            .andWhere('password=:password',{password: signInDto.password})
            .getRawOne()
        if(user){
            return { message: "Success", user:{
              userId: user.user_id,
              empName: user.user_empName,
              empCode: user.user_empCode,
              roleCode: user.roleCode,
              roleName: user.roleName,
              screens: user.screens,
              roleId: user.roles_id
            } };
        }else{
            return { message: "Invalid login credentials" }
        }
    }

}