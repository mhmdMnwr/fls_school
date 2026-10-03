import { IsOptional, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryEnrollmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  studentId?: string;
}
