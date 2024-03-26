import { UserEntity } from 'src/client/user/entities/user.entity';
import { CityEnum } from 'src/helpers/constants/user/enums/cityEnum.enum';
import { GenderEnum } from 'src/helpers/constants/user/enums/genderEnum.enum';

export class TokenDto {
  id: string;
  isVerified: boolean;
  nickName: string;
  firstName: string;
  phoneNumber: string;
  gender: GenderEnum;
  city: CityEnum;

  constructor(entity: UserEntity) {
    this.id = entity.id;
    this.isVerified = entity.isVerified;
  }
}
