import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ItemsService {
  constructor(private readonly prismaService:PrismaService){}
  async create(createItemDto: CreateItemDto) {
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
                        let item = await this.prismaService.item.findFirst({
                          where:{name:createItemDto.name},
                        });
                        return this.prismaService.$transaction(async(tx)=>{
                          if(!item){
                            item = await tx.item.create({data:createItemDto});
                          }
                          const item_Organization=await tx.item_Organization.findFirst({
                            where:{
                              item_id:item.id,
                              organization_id:createItemDto.organization_id,
                            },
                          });
                          if(item_Organization){
                            throw new BadRequestException(`Item already exist.`);
                          }
                          await tx.item_Organization.create({
                            data:{
                              item_id:item.id,
                              organization_id:createItemDto.organization_id,
                              ...(createItemDto.quantity && {
                                quantity:createItemDto.quantity,
                              }),
                            },
                          });
                          return item;
                        });
  }
  // async create(createItemDto: CreateItemDto) {
  //   const itemName = createItemDto.name;
  //   const existingItem = await this.prismaService.item.findFirst({
  //     where: { name: itemName },
  //   });
  //   const itemId: number;
  //   if (existingItem) {
  //     itemId = existingItem.id;
  //   } else {
  //     const newItem = await this.prismaService.item.create({
  //       data: {
  //         name: itemName,
  //         ...(createItemDto.description && { description: createItemDto.description }),
  //       },
  //     });
  //     itemId = newItem.id;
  //   }
  //   const existRelation = await this.prismaService.item_Organization.findFirst({
  //     where: {
  //       item_id: itemId,
  //       organization_id: createItemDto.organization_id,
  //     },
  //   });
  
  //   if (existRelation) {
  //     throw new BadRequestException(`Item ${itemName} already exists.`);
  //   }
  //   return this.prismaService.item_Organization.create({
  //     data: {
  //       item_id: itemId,
  //       organization_id: createItemDto.organization_id,
  //       ...(createItemDto.quantity && { quantity: createItemDto.quantity }),
  //     },
  //   });
  // }
  findAll(organization_id:number) {
    return this.prismaService.item_Organization.findMany({where:{organization_id,},include:{item:true,},});
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  update(id: number, updateItemDto: UpdateItemDto) {
    return `This action updates a #${id} item`;
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }}