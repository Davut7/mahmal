import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { CreateCategoryDto } from './dto/createCategory.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    await Promise.all([
      await this.isTitleExists(dto.enTitle, 'enTitle'),
      await this.isTitleExists(dto.ruTitle, 'ruTitle'),
      await this.isTitleExists(dto.tkmTitle, 'tkmTitle'),
    ]);

    const category = this.categoryRepository.create(dto);
    await this.categoryRepository.save(category);
    return {
      message: 'Category created successfully!',
      category: category,
    };
  }

  async getCategories() {
    const categories = await this.categoryRepository.findAndCount();
    return {
      categories,
    };
  }

  async getOneCategory(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException(`Category not found`);
    return category;
  }

  async updateOneCategory(categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.findCategoryById(categoryId);
    Object.assign(category, dto);
    await this.categoryRepository.save(category);
    return {
      message: 'Category updated successfully!',
      category: category,
    };
  }

  async deleteCategory(categoryId: string) {
    const category = await this.findCategoryById(categoryId);
    await this.categoryRepository.delete(category.id);
    return {
      message: 'Category deleted successfully!',
    };
  }

  async findCategoryById(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException(`Category not found!`);
    return category;
  }

  private async isTitleExists(title: string, titleLng: string) {
    const category = await this.categoryRepository.findOne({
      where: { [titleLng]: title },
    });

    if (category)
      throw new ConflictException(
        `Category in lang ${titleLng.slice(0, -5)} with title ${title} already exists!`,
      );
  }
}
