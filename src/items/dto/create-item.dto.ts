import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsNumber()
  organization_id?: number;
}
