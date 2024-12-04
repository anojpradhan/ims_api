import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'bcrypt';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly organizationService: OrganizationsService,
    private readonly rolesService: RolesService
  ) {}
  async create(createUserDto: CreateUserDto) {
    const roleObj = await this.prismaService.role.findFirst({
      where:{ name:createUserDto.role},
    });
    if(!roleObj){
      throw  new BadRequestException(`Role ${createUserDto.role}
         not found`);
    }
    createUserDto.role_id= roleObj.id;
    await this.organizationService.findOne(createUserDto.organization_id);
    // if (org.users.find(u => u.role.id === roleObj.id)) {
    //   throw new ConflictException("An admin already exists for this org");
    // }
    await this.checkUserEmailExists(createUserDto.email);
    await this.checkUserMobileExists(createUserDto.mobile);
    createUserDto.password= await hash(createUserDto.password,10);
    const{role, ...userObj}=createUserDto;
    // role is extracted(destructured) here from createUserDto and kept in role and all other remaining properties are kept in rest as a object with spread operator...
    return this.prismaService.user.create({ data:userObj });
  }

  findAll() {
    return this.prismaService.user.findMany();
  }

  findOne(id: number) {
    return this.getUser(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.getUser(id);
    if (updateUserDto.role_id){
      await this.rolesService.findOne(updateUserDto.role_id);
    } 
    if (updateUserDto.organization_id){
      await this.organizationService.findOne(updateUserDto.organization_id);
    } 
    if (updateUserDto.email){
      await this.checkUserEmailExists(updateUserDto.email, id);
    } 
    if (updateUserDto.mobile){
      await this.checkUserMobileExists(updateUserDto.mobile, id); 
    } 
    if(updateUserDto.password && user.password !== updateUserDto.password){
      updateUserDto.password= await hash(updateUserDto.password,10);
    }
    return this.prismaService.user.update({
      where:{id},
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    await this.getUser(id);

    return this.prismaService.user.delete({ where: { id } });
  }
  private async getUser(id: number) {
    const existUser = await this.prismaService.user.findFirst({
      where: { id },
    });
    if (!existUser) {
      throw new NotFoundException(`Id ${id} Not Found`);
    }
    return existUser;
  }
  private async checkUserMobileExists(mobile: string, id?: number) {
    const doesUserExist = await this.prismaService.user.findFirst({
      where: { mobile },
    });
    if (doesUserExist) {
      if (id && doesUserExist.id !== id) {
        // this is update case
        throw new BadRequestException(`User with ${mobile} already exists `);
        // throw new BadRequestException("Role "+name+" already exists");
      } else if (!id) {
        throw new BadRequestException(`User with ${mobile} already exists `);
        // this is create case
      }
    }
  }
  private async checkUserEmailExists(email: string, id?: number) {
    const doesUserExist = await this.prismaService.user.findFirst({
      where: { email },
    });
    if (doesUserExist) {
      if (id && doesUserExist.id !== id) {
        // this is update case
        throw new BadRequestException(`User with ${email} already exists `);
        // throw new BadRequestException("Role "+name+" already exists");
      } else if (!id) {
        throw new BadRequestException(`User with ${email} already exists `);
        // this is create case
      }
    }
  }
}
