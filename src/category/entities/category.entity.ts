import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseEntity } from 'src/helpers/entities/abstract.entity';
import { PostEntity } from 'src/posts/entities/posts.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'categories' })
export class CategoryEntity extends BaseEntity {
  @ApiProperty({
    name: 'ruTitle',
    title: 'ruTitle',
    description: 'Category title in russian for posts',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Column()
  ruTitle: string;

  @ApiProperty({
    name: 'tkmTitle',
    title: 'tkmTitle',
    description: 'Category title in turkmen for posts',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Column()
  tkmTitle: string;

  @ApiProperty({
    name: 'enTitle',
    title: 'enTitle',
    description: 'Category title in english for posts',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Column()
  enTitle: string;

  @OneToMany(() => PostEntity, (posts) => posts.category)
  posts: PostEntity[];
}
