import {
  IsString,
  MinLength,
  MaxLength,
  IsDateString,
  IsIn,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicRegistrationDto {
  @ApiProperty({ example: 'Adam' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName!: string;

  @ApiProperty({ example: 'El Fassi' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName!: string;

  @ApiProperty({ example: '2012-05-15' })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({ enum: ['MALE', 'FEMALE'] })
  @IsIn(['MALE', 'FEMALE'])
  gender!: 'MALE' | 'FEMALE';

  @ApiProperty({ example: '0612345678' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone!: string;

  @ApiPropertyOptional({ example: 'adam@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email doit être une adresse email valide' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  email?: string;

  // Honeypot field - must be empty
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;
}
