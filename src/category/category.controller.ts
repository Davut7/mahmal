import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryEntity } from './entities/category.entity';
import { AdminAuthGuard } from 'src/guards/adminAuth.guard';

@ApiTags('category')
@SkipThrottle()
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiCreatedResponse({
    type: CategoryEntity,
    description: 'Category created successfully',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Category with this data already exists',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoryService.createCategory(dto);
  }

  @ApiOkResponse({
    type: [CategoryEntity],
    description: 'Categories returned successfully',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @Get()
  async getCategories() {
    return await this.categoryService.getCategories();
  }

  @ApiOkResponse({
    type: CategoryEntity,
    description: 'Category returned successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Categories not found',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiParam({ type: String, name: 'id', description: 'Category id' })
  @Get(':id')
  async getOneCategory(@Param('id', ParseUUIDPipe) categoryId: string) {
    return await this.categoryService.getOneCategory(categoryId);
  }

  @ApiOkResponse({
    type: CategoryEntity,
    description: 'Category updated successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category with this id not found',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiParam({ type: String, name: 'id', description: 'Category id' })
  @Patch(':id')
  async updateCategory(
    @Body() dto: UpdateCategoryDto,
    @Param('id', ParseUUIDPipe) categoryId: string,
  ) {
    return await this.categoryService.updateOneCategory(categoryId, dto);
  }

  @ApiOkResponse({
    type: CategoryEntity,
    description: 'Category deleted successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Category with this id not found',
  })
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiParam({ type: String, name: 'id', description: 'Category id' })
  @Delete(':id')
  async deleteCategory(@Param('id', ParseUUIDPipe) categoryId: string) {
    return await this.categoryService.deleteCategory(categoryId);
  }
}
