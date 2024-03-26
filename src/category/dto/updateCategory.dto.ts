import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './createCategory.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
