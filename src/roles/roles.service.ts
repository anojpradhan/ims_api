import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createRoleDto: CreateRoleDto) {
    await this.checkRoleExists(createRoleDto.name);
    return this.prismaService.role.create({ data: createRoleDto });
  }
  async findAll() {
    return this.prismaService.role.findMany();
  }

  async findOne(id: number) {
    return this.getRole(id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.getRole(id);
    await this.checkRoleExists(updateRoleDto.name, id);
    return this.prismaService.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: number) {
    await this.getRole(id);

    return this.prismaService.role.delete({ where: { id } });
  }
  private async getRole(id: number) {
    const existRole = await this.prismaService.role.findFirst({
      where: { id },
    });
    if (!existRole) {
      throw new NotFoundException(`Id ${id} Not Found`);
    }
    return existRole;
  }

  private async checkRoleExists(name: string, id?: number) {
    const doesRoleExist = await this.prismaService.role.findFirst({
      where: { name },
    });
    if(doesRoleExist){

      if(id && doesRoleExist.id!==id){ 
        // this is update case 
        throw new BadRequestException(`Role ${name} already exists `);
        // throw new BadRequestException("Role "+name+" already exists");
      }
      else if(!id){
        throw new BadRequestException(`Role ${name} already exists `);
        // this is create case 
        
      }
    }
  }
}
