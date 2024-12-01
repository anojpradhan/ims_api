import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createOrganizationDto: CreateOrganizationDto) {
    await this.checkOrganizationExists(createOrganizationDto.name);
    return this.prismaService.organization.create({data:createOrganizationDto,});
    // return this.prismaService.organization.create({
    //   data: {
    //     name: createOrganizationDto.name,
    //     type: createOrganizationDto.type,
    //     address: createOrganizationDto.address || 'Default Address',
    //     phone: createOrganizationDto.phone,
    //   },
    // });
    
  }
  async findAll() {
    return this.prismaService.organization.findMany();
  }

  async findOne(id: number) {
    return this.getOrganization(id);
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    await this.getOrganization(id);
    await this.checkOrganizationExists(updateOrganizationDto.name, id);
    return this.prismaService.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });
  }

  async remove(id: number) {
    await this.getOrganization(id);

    return this.prismaService.organization.delete({ where: { id } });
  }
  // this function is to check if organization id exists or not and used in delete and update
  private async getOrganization(id: number) {
    const existOrganization = await this.prismaService.organization.findFirst({
      where: { id },
    });
    if (!existOrganization) {
      throw new NotFoundException(`Id ${id} Not Found`);
    }
    return existOrganization;
  }
  // this function is to check if organization already exists or not in create and in update
  private async checkOrganizationExists(name: string, id?: number) {
    const doesOrganizationExists =
      await this.prismaService.organization.findFirst({
        where: { name },
      });
    if (doesOrganizationExists) {
      if (id && doesOrganizationExists.id !== id) {
        // this is update case
        throw new BadRequestException(`Organization ${name} already exists `);
        // throw new BadRequestException("Role "+name+" already exists");
      } else if (!id) {
        throw new BadRequestException(`Organization ${name} already exists `);
        // this is create case
      }
    }
  }
}
