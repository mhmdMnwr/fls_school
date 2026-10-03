import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParentLoginDto {
  @ApiProperty({ example: 'ahmed.benali' })
  @IsString()
  @MinLength(1)
  username!: string;

  @ApiProperty({ example: 'kX7mP9wQ' })
  @IsString()
  @MinLength(1)
  password!: string;
}
