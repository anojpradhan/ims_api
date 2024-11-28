// import { PartialType } from '@nestjs/mapped-types'; If partial type is used , rules aren't imported or say validation logic is not extended , so no partial type .
// import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

// export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
export class UpdateRoleDto extends (CreateRoleDto) {}
