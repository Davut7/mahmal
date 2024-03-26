import { PageOptionsDto } from 'src/helpers/common/dto/page.dto';
import { SavedPostsOrderBy } from 'src/helpers/constants';

export class SavedPostsQuery extends PageOptionsDto {
  orderBy: SavedPostsOrderBy;
}
