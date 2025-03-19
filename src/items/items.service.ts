import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { retry } from 'rxjs';
@Injectable()
export class ItemsService {
  constructor(private readonly prismaService: PrismaService) {}
  // async create(createItemDto: CreateItemDto) {
    // return this .prismaService.item.upsert({
    //   where:{
    //     name:createItemDto.name,
    //   },
    //   update:{
    //     organizations:{
    //       create:{
    //         organization_id: createItemDto.organization_id,
    //         ...(createItemDto.quantity && {
    //           quantity: createItemDto.quantity,
    //         }),
    //       },
    //     },
    //   },
    //   create :{

    //     name:createItemDto.name,
    //     ...(createItemDto.description && {
    //       description: createItemDto.description,
    //     }),
    //     organizations:{
    //       create: {
    //         organization_id: createItemDto.organization_id,
    //         ...(createItemDto.quantity && {
    //           quantity: createItemDto.quantity,
    //         }),
    //       },
    //     },
    //   },
    // });
  //   let item = await this.prismaService.item.findFirst({
  //     where: { name: createItemDto.name },
  //   });
  //   return this.prismaService.$transaction(async (tx) => {
  //     if (!item) {
  //       item = await tx.item.create({ data: createItemDto });
  //     }
  //     const item_Organization = await tx.item_Organization.findFirst({
  //       where: {
  //         item_id: item.id,
  //         organization_id: createItemDto.organization_id,
  //       },
  //     });
  //     if (item_Organization) {
  //       throw new BadRequestException(`Item already exist.`);
  //     }
  //     await tx.item_Organization.create({
  //       data: {
  //         item_id: item.id,
  //         organization_id: createItemDto.organization_id,
  //         ...(createItemDto.quantity && {
  //           quantity: createItemDto.quantity,
  //         }),
  //       },
  //     });
  //     return item;
  //   });
  // }
  async create(createItemDto: CreateItemDto) {
    const itemName = createItemDto.name;
    const existingItem = await this.prismaService.item.findFirst({
      where: { name: itemName },
    });
    let itemId: number;
    if (existingItem) {
      itemId = existingItem.id;
    } else {
      const newItem = await this.prismaService.item.create({
        data: {
          name: itemName,
          ...(createItemDto.description && { description: createItemDto.description }),
        },
      });
      itemId = newItem.id;
    }
    const existRelation = await this.prismaService.item_Organization.findFirst({
      where: {
        item_id: itemId,
        organization_id: createItemDto.organization_id,
      },
    });

    if (existRelation) {
      throw new BadRequestException(`Item ${itemName} already exists.`);
    }
    return this.prismaService.item_Organization.create({
      data: {
        item_id: itemId,
        organization_id: createItemDto.organization_id,
        ...(createItemDto.quantity && { quantity: createItemDto.quantity }),
      },
    });
  }
async  findAll(organization_id: number) {
    return this.prismaService.item_Organization.findMany({
      where: { organization_id },
      include: { item: true },
    });
  }

  async findOne(item_id: number, organization_id:number) {
    const itemRelation = await this.prismaService.item_Organization.findMany({where:{organization_id}});
    if(itemRelation){
      const itemWithId = itemRelation.filter(item =>item.item_id==item_id);
      if(itemWithId.length){
        return this.prismaService.item.findFirst({where:{id:item_id}});
      }
      else{
        throw new BadRequestException(`Item Not Found`);
      }
    }
    else{
      throw new BadRequestException(`No Items Found`);
    }
  }

 async update(id: number, updateItemDto: UpdateItemDto) {
   const itemsOfOrg= await this.prismaService.item_Organization.findFirst({where:{organization_id:updateItemDto.organization_id}});
   if(itemsOfOrg){
     const itemWithId= await this.prismaService.item.findFirst({where:{id}});
     if(itemWithId){
        // console.log("yaha");
        return this.prismaService.item.update({where:{id},data:updateItemDto});
      }
      else{
        throw new BadRequestException(`This is not your Item`);
      }
    }
    else{
      throw new BadRequestException(`Item Not Found`);
    }
  }

  async remove(id: number, organization_id:number) {
    console.log(organization_id);
    const itemsOfOrg= await this.prismaService.item_Organization.findFirst({where:{organization_id}});
    if(itemsOfOrg){
      const itemWithId= await this. prismaService.item.findFirst({where:{id}});
      if(itemWithId){
        return this.prismaService.item.delete({where:{id}});
      }
      else{
        throw new BadRequestException(`Item with ${id} not found.`);
      }
    }
    else{
      throw new BadRequestException(`No Items Found`);
    }
  }
}
