import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsDateString,
  IsIn,
  IsMongoId,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  firstName!: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  lastName!: string;

  @ApiProperty({ example: '2010-05-15' })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE'], example: 'FEMALE' })
  @IsIn(['MALE', 'FEMALE'])
  gender!: 'MALE' | 'FEMALE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  schoolClassId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
