import { IsNotEmpty } from 'class-validator';

export class ConvertToNamedAccountReqDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
