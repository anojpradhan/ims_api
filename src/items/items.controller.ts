import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Request } from 'express';
interface JwtPayload extends Request{
  payload:{
    user_id: number;
    role_id: number;
    organization_id: number;
  }
}

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create( @Req() request:JwtPayload, @Body() createItemDto: CreateItemDto) {
    createItemDto.organization_id= request.payload.organization_id;
    return this.itemsService.create(createItemDto);
  }
  // @Get()
  // findAll(@Req() request: JwtPayload) {
  //   return this.itemsService.findAll(request.payload.organization_id);
  // }
  @Get()
  findAll(@Req() requests: JwtPayload) {
    return this.itemsService.findAll(requests.payload.organization_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() requests:JwtPayload) {
    return this.itemsService.findOne(+id, requests.payload.organization_id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @Req() requests:JwtPayload) {
    // console.log("controller");
    updateItemDto.organization_id=requests.payload.organization_id;
    return this.itemsService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request:JwtPayload) {
    return this.itemsService.remove(+id, request.payload.organization_id);
  }
}
