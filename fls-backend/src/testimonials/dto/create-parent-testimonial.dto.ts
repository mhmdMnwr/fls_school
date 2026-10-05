import {
  IsInt,
  Min,
  Max,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  Equals,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParentTestimonialDto {
  @ApiPropertyOptional({ example: 'Mme. Belkacem' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  parentName?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ minLength: 20, maxLength: 500 })
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  message!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @Equals(true, {
    message: 'Vous devez accepter la publication de votre avis',
  })
  consent!: boolean;
}
