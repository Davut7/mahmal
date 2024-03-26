import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { UserPostsOrderBy } from 'src/helpers/constants';



export class GetUsersPosts extends PageOptionsDto {
  @IsOptional()
  @IsEnum(UserPostsOrderBy)
  orderBy: UserPostsOrderBy;
}
