import { isNotEmpty, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  name: string;
}
export class CodeAuthDto {
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;

  @IsNotEmpty({ message: 'Code không được để trống' })
  code: string;
}

export class ChangePassDto {
  @IsNotEmpty({ message: '_id không được để trống' })
  _id: string;

  @IsNotEmpty({ message: 'Code không được để trống' })
  code: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}
