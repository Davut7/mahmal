import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { likedPostsOrderBy } from 'src/helpers/constants';



export class GetLikedPosts extends PageOptionsDto {
  orderBy: likedPostsOrderBy;
}
