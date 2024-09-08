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
        const user =  await this.userRepo.createQueryBuilder('user')
            .select(['user.id','user.emp_name','user.emp_code', 'roles.role_code','roles.role_name', 'roles.screens'])
            .innerJoinAndSelect(RoleEntity, 'roles', 'user.role_id = roles.id::text')
            .where('user.emp_code=:empCode', {empCode:signInDto.emp_code})
            .andWhere('password=:password',{password: signInDto.password})
            .getRawOne()
            
        if(user){
            return { message: "Success", user:{
              userId: user.user_id,
              empName: user.user_emp_name,
              empCode: user.user_emp_code,
              roleCode: user.role_code,
              roleName: user.role_name,
              screens: user.screens,
              roleId: user.roles_id
            } };
        }else{
            return { message: "Invalid login credentials" }
        }
    }

}