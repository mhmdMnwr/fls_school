import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEnrollmentDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
